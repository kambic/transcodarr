"""Thin wrapper around ffmpeg and ffprobe.

Deliberately small and dependency-free. The parts that matter:

* **No shell.** Everything is an argv list, so filenames with spaces, quotes or
  semicolons are just filenames.
* **Progress without parsing stderr.** ``-progress pipe:1`` emits `key=value`
  lines on stdout, which is a stable interface; ffmpeg's human-readable status
  line on stderr is not.
* **stderr is drained on a thread.** ffmpeg blocks forever if it fills the
  stderr pipe while nobody reads it, which is the classic way a transcode job
  hangs at 40%.
* **Cancellation is cooperative.** The caller supplies a predicate that gets
  polled between progress updates; when it goes true the process is terminated,
  then killed if it ignores that.
"""

from __future__ import annotations

import json
import os
import shutil
import signal
import subprocess
import threading
import time
from collections import deque
from dataclasses import dataclass, field
from typing import Callable

from django.conf import settings


class FFmpegUnavailable(RuntimeError):
    """ffmpeg or ffprobe isn't installed or isn't executable."""


class TranscodeFailed(RuntimeError):
    def __init__(self, message: str, log: str = ""):
        super().__init__(message)
        self.log = log


class TranscodeCancelled(RuntimeError):
    pass


def config() -> dict:
    return settings.TRANSCODE


def binary(name: str) -> str:
    path = config().get(name.upper()) or shutil.which(name)
    if not path or not os.access(path, os.X_OK):
        raise FFmpegUnavailable(
            f"{name} was not found. Install ffmpeg, or set TRANSCODE[{name.upper()!r}]."
        )
    return path


def available() -> bool:
    try:
        binary("ffmpeg") and binary("ffprobe")
    except FFmpegUnavailable:
        return False
    return True


# --------------------------------------------------------------------------- #
#  Probing
# --------------------------------------------------------------------------- #
@dataclass
class Probe:
    duration: float = 0.0
    container: str = ""
    bitrate: int = 0
    size: int = 0
    width: int = 0
    height: int = 0
    fps: float = 0.0
    video_codec: str = ""
    audio_codec: str = ""

    @property
    def has_video(self) -> bool:
        return bool(self.video_codec)

    @property
    def has_audio(self) -> bool:
        return bool(self.audio_codec)


def probe(path: str, *, timeout: int = 60) -> Probe:
    """Read stream metadata. Raises TranscodeFailed if the file isn't media."""
    args = [
        binary("ffprobe"), "-v", "error", "-print_format", "json",
        "-show_format", "-show_streams", path,
    ]
    try:
        completed = subprocess.run(
            args, capture_output=True, text=True, timeout=timeout, stdin=subprocess.DEVNULL
        )
    except subprocess.TimeoutExpired as exc:
        raise TranscodeFailed(f"ffprobe timed out after {timeout}s") from exc

    if completed.returncode != 0:
        raise TranscodeFailed(
            f"ffprobe could not read the file: {completed.stderr.strip()[:400]}"
        )

    payload = json.loads(completed.stdout or "{}")
    fmt = payload.get("format", {})
    result = Probe(
        duration=float(fmt.get("duration") or 0),
        container=(fmt.get("format_name") or "").split(",")[0],
        bitrate=int(float(fmt.get("bit_rate") or 0)),
        size=int(float(fmt.get("size") or 0)),
    )
    for stream in payload.get("streams", []):
        if stream.get("codec_type") == "video" and not result.video_codec:
            result.video_codec = stream.get("codec_name", "")
            result.width = int(stream.get("width") or 0)
            result.height = int(stream.get("height") or 0)
            result.fps = parse_rate(stream.get("avg_frame_rate") or stream.get("r_frame_rate"))
            if not result.duration:
                result.duration = float(stream.get("duration") or 0)
        elif stream.get("codec_type") == "audio" and not result.audio_codec:
            result.audio_codec = stream.get("codec_name", "")
    return result


def parse_rate(value: str | None) -> float:
    """'30000/1001' -> 29.97"""
    if not value or "/" not in value:
        try:
            return round(float(value or 0), 3)
        except ValueError:
            return 0.0
    numerator, _, denominator = value.partition("/")
    try:
        den = float(denominator)
        return round(float(numerator) / den, 3) if den else 0.0
    except ValueError:
        return 0.0


# --------------------------------------------------------------------------- #
#  Transcoding
# --------------------------------------------------------------------------- #
def build_args(preset, source: str, destination: str) -> list[str]:
    """Turn a Preset row into an ffmpeg argv list."""
    args = [
        binary("ffmpeg"), "-nostdin", "-hide_banner", "-loglevel", "error",
        "-y", "-progress", "pipe:1", "-nostats",
    ]
    if preset.hardware_accel:
        args += ["-hwaccel", preset.hardware_accel]
    args += ["-i", source]

    if preset.threads:
        args += ["-threads", str(preset.threads)]

    filters = []
    if preset.video_codec == preset.NO_STREAM:
        args += ["-vn"]
    else:
        args += ["-c:v", preset.video_codec]
        if preset.video_codec != "copy":
            if preset.crf is not None:
                args += ["-crf", str(preset.crf)]
            if preset.speed:
                args += ["-preset", preset.speed]
            if preset.max_height:
                # Downscale only; never upscale. Escaped comma keeps the filter
                # parser from reading min(ih,720) as two filters.
                filters.append(f"scale=-2:min(ih\\,{preset.max_height})")
            if preset.fps_cap:
                args += ["-r", str(preset.fps_cap)]
    if filters:
        args += ["-vf", ",".join(filters)]

    if preset.audio_codec == preset.NO_STREAM:
        args += ["-an"]
    else:
        args += ["-c:a", preset.audio_codec]
        if preset.audio_codec != "copy" and preset.audio_bitrate:
            args += ["-b:a", preset.audio_bitrate]

    if preset.container == "mp4":
        args += ["-movflags", "+faststart"]

    args += list(preset.extra_args or [])
    args += [destination]
    return args


@dataclass
class Result:
    returncode: int
    log: str
    seconds: float


def run(
    args: list[str],
    *,
    duration: float = 0.0,
    on_progress: Callable[[float], None] | None = None,
    should_cancel: Callable[[], bool] | None = None,
    timeout: int | None = None,
    poll_seconds: float = 2.0,
) -> Result:
    """Run ffmpeg, reporting progress as a 0–100 float."""
    started = time.monotonic()
    tail: deque[str] = deque(maxlen=40)

    process = subprocess.Popen(
        args,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1,
        start_new_session=True,  # so we can signal ffmpeg without hitting the worker
    )

    def drain_stderr():
        assert process.stderr is not None
        for line in process.stderr:
            line = line.strip()
            if line:
                tail.append(line)

    stderr_thread = threading.Thread(target=drain_stderr, daemon=True)
    stderr_thread.start()

    last_poll = 0.0
    last_percent = -1.0
    cancelled = False
    timed_out = False

    try:
        assert process.stdout is not None
        for line in process.stdout:
            key, _, value = line.strip().partition("=")
            if key == "out_time_us" and duration > 0 and on_progress:
                try:
                    seconds = int(value) / 1_000_000
                except ValueError:
                    continue
                percent = max(0.0, min(99.0, seconds / duration * 100))
                if percent - last_percent >= 1.0:
                    last_percent = percent
                    on_progress(percent)

            now = time.monotonic()
            if now - last_poll >= poll_seconds:
                last_poll = now
                if should_cancel and should_cancel():
                    cancelled = True
                    break
                if timeout and now - started > timeout:
                    timed_out = True
                    break
    finally:
        if cancelled or timed_out:
            stop(process)
        returncode = process.wait()
        stderr_thread.join(timeout=5)

    log = "\n".join(tail)
    if cancelled:
        raise TranscodeCancelled("Cancelled while running.")
    if timed_out:
        raise TranscodeFailed(f"Exceeded the {timeout}s limit and was stopped.", log)
    if returncode != 0:
        raise TranscodeFailed(f"ffmpeg exited with code {returncode}.", log)

    if on_progress:
        on_progress(100.0)
    return Result(returncode=returncode, log=log, seconds=time.monotonic() - started)


def stop(process: subprocess.Popen, grace: float = 5.0) -> None:
    """Ask ffmpeg to stop, insist if it doesn't."""
    try:
        os.killpg(os.getpgid(process.pid), signal.SIGTERM)
    except (ProcessLookupError, PermissionError):
        process.terminate()
    try:
        process.wait(timeout=grace)
    except subprocess.TimeoutExpired:
        try:
            os.killpg(os.getpgid(process.pid), signal.SIGKILL)
        except (ProcessLookupError, PermissionError):
            process.kill()
