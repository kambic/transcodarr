"""Thin, dependency-free wrapper around ffprobe and ffmpeg.

Nothing here touches the database — the task layer owns persistence. Commands
are always built as argument lists, never shell strings.
"""

from __future__ import annotations

import json
import logging
import shlex
import signal
import subprocess
from collections.abc import Callable
from dataclasses import dataclass, field
from pathlib import Path

from django.conf import settings

logger = logging.getLogger(__name__)


class ProbeError(RuntimeError):
    pass


class TranscodeError(RuntimeError):
    pass


class Cancelled(RuntimeError):
    pass


@dataclass
class Probe:
    container: str = ""
    video_codec: str = ""
    audio_codec: str = ""
    width: int | None = None
    height: int | None = None
    duration_seconds: float | None = None
    bitrate_kbps: int | None = None
    size_bytes: int = 0


@dataclass
class Progress:
    percent: float = 0.0
    fps: float | None = None
    speed: float | None = None
    eta_seconds: int | None = None
    out_time_seconds: float = 0.0


@dataclass
class TranscodeResult:
    returncode: int
    log_tail: list[str] = field(default_factory=list)


# --------------------------------------------------------------------------
# Probing
# --------------------------------------------------------------------------
def probe(path: str | Path) -> Probe:
    cmd = [
        settings.FFPROBE_BIN,
        "-v", "error",
        "-print_format", "json",
        "-show_format",
        "-show_streams",
        str(path),
    ]
    try:
        completed = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    except FileNotFoundError as exc:
        raise ProbeError(f"{settings.FFPROBE_BIN} is not on PATH") from exc
    except subprocess.TimeoutExpired as exc:
        raise ProbeError("ffprobe timed out") from exc

    if completed.returncode != 0:
        raise ProbeError(completed.stderr.strip()[:500] or "ffprobe failed")

    try:
        data = json.loads(completed.stdout)
    except json.JSONDecodeError as exc:
        raise ProbeError("ffprobe returned invalid JSON") from exc

    fmt = data.get("format", {})
    streams = data.get("streams", [])
    video = next((s for s in streams if s.get("codec_type") == "video"), {})
    audio = next((s for s in streams if s.get("codec_type") == "audio"), {})

    result = Probe(
        container=(fmt.get("format_name") or "").split(",")[0],
        video_codec=video.get("codec_name", ""),
        audio_codec=audio.get("codec_name", ""),
        width=_as_int(video.get("width")),
        height=_as_int(video.get("height")),
        duration_seconds=_as_float(fmt.get("duration")),
        size_bytes=_as_int(fmt.get("size")) or 0,
    )
    bitrate = _as_int(fmt.get("bit_rate"))
    if bitrate:
        result.bitrate_kbps = bitrate // 1000
    elif result.duration_seconds and result.size_bytes:
        result.bitrate_kbps = int(result.size_bytes * 8 / result.duration_seconds / 1000)
    return result


# --------------------------------------------------------------------------
# Command building
# --------------------------------------------------------------------------
ENCODERS = {
    # (target codec, hw accel) -> ffmpeg encoder
    ("h264", "none"): "libx264",
    ("h264", "nvenc"): "h264_nvenc",
    ("h264", "qsv"): "h264_qsv",
    ("h264", "vaapi"): "h264_vaapi",
    ("hevc", "none"): "libx265",
    ("hevc", "nvenc"): "hevc_nvenc",
    ("hevc", "qsv"): "hevc_qsv",
    ("hevc", "vaapi"): "hevc_vaapi",
    ("av1", "none"): "libsvtav1",
    ("av1", "nvenc"): "av1_nvenc",
    ("av1", "qsv"): "av1_qsv",
    ("av1", "vaapi"): "av1_vaapi",
}


def encoder_for(codec: str, hw_accel: str) -> str:
    try:
        return ENCODERS[(codec, hw_accel)]
    except KeyError as exc:
        raise TranscodeError(f"No encoder for {codec} with {hw_accel}") from exc


def build_command(profile, source: Path, destination: Path, probe_data: Probe | None = None) -> list[str]:
    """Assemble the ffmpeg invocation for one file."""
    encoder = encoder_for(profile.video_codec, profile.hw_accel)
    cmd: list[str] = [settings.FFMPEG_BIN, "-hide_banner", "-nostdin", "-y"]

    # Decode-side acceleration has to be declared before the input.
    if profile.hw_accel == "nvenc":
        cmd += ["-hwaccel", "cuda"]
    elif profile.hw_accel == "qsv":
        cmd += ["-hwaccel", "qsv"]
    elif profile.hw_accel == "vaapi":
        cmd += ["-hwaccel", "vaapi", "-hwaccel_output_format", "vaapi"]

    cmd += ["-i", str(source), "-map", "0", "-c", "copy", "-c:v", encoder]

    # Quality knob differs per encoder family.
    if encoder.startswith(("libx26", "libsvt")):
        cmd += ["-crf", str(profile.quality), "-preset", profile.preset]
    elif encoder.endswith("_nvenc"):
        cmd += ["-rc", "vbr", "-cq", str(profile.quality), "-preset", "p5"]
    elif encoder.endswith("_qsv"):
        cmd += ["-global_quality", str(profile.quality), "-preset", profile.preset]
    elif encoder.endswith("_vaapi"):
        cmd += ["-rc_mode", "CQP", "-qp", str(profile.quality)]

    if profile.max_height and probe_data and probe_data.height and probe_data.height > profile.max_height:
        scaler = "scale_vaapi" if profile.hw_accel == "vaapi" else "scale"
        cmd += ["-vf", f"{scaler}=-2:{profile.max_height}"]

    if profile.audio_codec and profile.audio_codec != "copy":
        cmd += ["-c:a", profile.audio_codec]

    if profile.extra_args:
        cmd += shlex.split(profile.extra_args)

    # Machine-readable progress on stdout, human-readable noise on stderr.
    cmd += ["-progress", "pipe:1", "-nostats", str(destination)]
    return cmd


# --------------------------------------------------------------------------
# Running
# --------------------------------------------------------------------------
def run(
    cmd: list[str],
    duration_seconds: float | None,
    on_progress: Callable[[Progress], None] | None = None,
    should_cancel: Callable[[], bool] | None = None,
    poll_interval: float = 1.0,
) -> TranscodeResult:
    """Run ffmpeg, streaming `-progress` key=value pairs back to `on_progress`.

    `should_cancel` is consulted on every progress block; returning True sends
    SIGTERM so ffmpeg can close the container cleanly, then SIGKILL if it
    refuses to exit.
    """
    logger.info("running: %s", shlex.join(cmd))
    try:
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
        )
    except FileNotFoundError as exc:
        raise TranscodeError(f"{cmd[0]} is not on PATH") from exc

    fields: dict[str, str] = {}
    log_tail: list[str] = []
    cancelled = False

    assert proc.stdout is not None
    for line in proc.stdout:
        line = line.strip()
        if not line or "=" not in line:
            continue
        key, _, value = line.partition("=")
        fields[key.strip()] = value.strip()

        if key.strip() != "progress":  # end of one progress block
            continue

        if on_progress:
            on_progress(_parse_progress(fields, duration_seconds))
        if should_cancel and should_cancel():
            cancelled = True
            _terminate(proc)
            break
        fields.clear()

    stderr = proc.stderr.read() if proc.stderr else ""
    proc.wait()
    if stderr:
        log_tail = [ln for ln in stderr.splitlines() if ln.strip()][-40:]

    if cancelled:
        raise Cancelled("Cancelled by operator")
    if proc.returncode != 0:
        raise TranscodeError("\n".join(log_tail[-10:]) or f"ffmpeg exited {proc.returncode}")
    return TranscodeResult(returncode=proc.returncode, log_tail=log_tail)


def _terminate(proc: subprocess.Popen) -> None:
    proc.send_signal(signal.SIGTERM)
    try:
        proc.wait(timeout=15)
    except subprocess.TimeoutExpired:
        proc.kill()


def _parse_progress(fields: dict[str, str], duration_seconds: float | None) -> Progress:
    out_time = _as_float(fields.get("out_time_us"))
    out_seconds = (out_time / 1_000_000) if out_time else 0.0
    speed = _as_float((fields.get("speed") or "").rstrip("x"))
    percent = 0.0
    eta = None
    if duration_seconds:
        percent = min(out_seconds / duration_seconds * 100, 99.9)
        if speed and speed > 0:
            eta = int(max(duration_seconds - out_seconds, 0) / speed)
    return Progress(
        percent=round(percent, 1),
        fps=_as_float(fields.get("fps")),
        speed=speed,
        eta_seconds=eta,
        out_time_seconds=out_seconds,
    )


def _as_int(value) -> int | None:
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _as_float(value) -> float | None:
    try:
        result = float(value)
    except (TypeError, ValueError):
        return None
    return result if result == result else None  # drop NaN
