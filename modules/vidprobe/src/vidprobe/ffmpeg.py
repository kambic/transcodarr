"""Thin wrappers around the ffmpeg/ffprobe binaries."""

from __future__ import annotations

import contextlib
import json
import os
import shutil
import subprocess
import time
from dataclasses import dataclass
from typing import Iterator, Sequence

from vidprobe.config import Build

NETWORK_SCHEMES = (
    "rtsp://",
    "rtmp://",
    "rtmps://",
    "http://",
    "https://",
    "udp://",
    "srt://",
    "rtp://",
    "tcp://",
    "hls+http://",
    "sctp://",
    "ftp://",
)


class FFmpegNotFound(RuntimeError):
    """Raised when the ffmpeg/ffprobe binaries cannot be located."""


class ProbeError(RuntimeError):
    """Raised when ffprobe/ffmpeg fails or times out on an input."""


# --------------------------------------------------------------------------- #
# active build
# --------------------------------------------------------------------------- #
# Every helper below resolves its binary through the *active* build, so a single
# `with using_build(b):` switches the whole tool over to another FFmpeg install.
_ACTIVE: Build = Build(name="system")


def set_active_build(build: Build) -> None:
    global _ACTIVE, _FILTER_CACHE
    _ACTIVE = build
    _FILTER_CACHE = None  # capabilities differ between builds


def active_build() -> Build:
    return _ACTIVE


@contextlib.contextmanager
def using_build(build: Build) -> Iterator[Build]:
    previous = _ACTIVE
    set_active_build(build)
    try:
        yield build
    finally:
        set_active_build(previous)


def _resolve(name: str, env_var: str) -> str:
    override = os.environ.get(env_var)
    if override:
        return override
    resolved = _ACTIVE.resolve(name)
    if resolved:
        return resolved
    configured = _ACTIVE.ffmpeg if name == "ffmpeg" else _ACTIVE.ffprobe
    fallback = shutil.which(name)
    if fallback and configured in {"ffmpeg", "ffprobe"}:
        return fallback
    raise FFmpegNotFound(
        f"'{configured}' (build '{_ACTIVE.name}') is not an executable file and was "
        f"not found on PATH. Fix the path in your config, install FFmpeg, or set "
        f"${env_var}."
    )


def ffprobe_bin() -> str:
    return _resolve("ffprobe", "VIDPROBE_FFPROBE")


def ffmpeg_bin() -> str:
    return _resolve("ffmpeg", "VIDPROBE_FFMPEG")


def build_env() -> dict[str, str] | None:
    if not _ACTIVE.env:
        return None
    merged = dict(os.environ)
    merged.update(_ACTIVE.env)
    return merged


def build_extra_args() -> list[str]:
    return list(_ACTIVE.extra_args)


def is_network(url: str) -> bool:
    return url.lower().startswith(NETWORK_SCHEMES)


def input_args(url: str, timeout: float = 15.0, analyze: float = 5.0) -> list[str]:
    """Input-side flags tuned for the transport behind `url`.

    Protocol private options are only emitted for network URLs, otherwise
    ffprobe rejects them when the input is a plain file.
    """
    args = [
        "-analyzeduration",
        str(int(analyze * 1_000_000)),
        "-probesize",
        str(int(analyze * 2_000_000)),
    ]
    low = url.lower()
    if low.startswith(("rtsp://",)):
        args += ["-rtsp_transport", "tcp"]
    if is_network(url):
        # microseconds; aborts a stalled socket instead of blocking forever
        args += ["-rw_timeout", str(int(timeout * 1_000_000))]
    return args


def run(
    cmd: Sequence[str], timeout: float | None = None
) -> subprocess.CompletedProcess:
    try:
        return subprocess.run(
            list(cmd),
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
            env=build_env(),
        )
    except subprocess.TimeoutExpired as exc:  # pragma: no cover - timing dependent
        raise ProbeError(
            f"timed out after {timeout:.0f}s: {' '.join(cmd[:3])} ..."
        ) from exc


def run_json(cmd: Sequence[str], timeout: float | None = None) -> dict:
    proc = run(cmd, timeout=timeout)
    if proc.returncode != 0 or not proc.stdout.strip():
        detail = (proc.stderr or "").strip().splitlines()
        tail = detail[-1] if detail else f"exit code {proc.returncode}"
        raise ProbeError(tail)
    try:
        return json.loads(proc.stdout)
    except json.JSONDecodeError as exc:
        raise ProbeError(f"could not parse ffprobe output: {exc}") from exc


_FILTER_CACHE: set[str] | None = None


def available_filters() -> set[str]:
    global _FILTER_CACHE
    if _FILTER_CACHE is None:
        names: set[str] = set()
        try:
            proc = run([ffmpeg_bin(), "-hide_banner", "-filters"], timeout=30)
            for line in proc.stdout.splitlines():
                parts = line.split()
                if len(parts) >= 4 and not line.startswith("Filters:"):
                    names.add(parts[1])
        except FFmpegNotFound, ProbeError:
            pass
        _FILTER_CACHE = names
    return _FILTER_CACHE


def has_filter(name: str) -> bool:
    return name in available_filters()


def versions() -> dict[str, str]:
    out = {}
    for label, getter in (("ffmpeg", ffmpeg_bin), ("ffprobe", ffprobe_bin)):
        try:
            proc = run([getter(), "-version"], timeout=15)
            out[label] = proc.stdout.splitlines()[0].split(" Copyright")[0]
        except FFmpegNotFound, ProbeError, IndexError:
            out[label] = "not found"
    return out


def build_capabilities() -> dict[str, object]:
    """Version banner, configure flags and a few capability probes for a build."""
    info: dict[str, object] = {
        "version": "not found",
        "configuration": [],
        "hwaccels": [],
    }
    try:
        proc = run([ffmpeg_bin(), "-hide_banner", "-version"], timeout=15)
    except FFmpegNotFound, ProbeError:
        return info
    lines = proc.stdout.splitlines()
    if lines:
        info["version"] = lines[0].replace("ffmpeg version ", "").split(" Copyright")[0]
    for line in lines:
        if line.startswith("configuration:"):
            info["configuration"] = sorted(
                flag for flag in line.split()[1:] if flag.startswith("--enable-")
            )
    try:
        hw = run([ffmpeg_bin(), "-hide_banner", "-hwaccels"], timeout=15)
        info["hwaccels"] = [
            ln.strip() for ln in hw.stdout.splitlines()[1:] if ln.strip()
        ]
    except FFmpegNotFound, ProbeError:
        pass
    return info


# --------------------------------------------------------------------------- #
# ffmpeg execution with timing
# --------------------------------------------------------------------------- #
@dataclass
class RunResult:
    """Outcome of one ffmpeg transform, with the numbers `bench` needs."""

    cmd: list[str]
    returncode: int
    stderr: str
    wall_time: float
    build: str = "system"
    output: str | None = None
    output_size: int | None = None
    speed: float | None = None
    fps: float | None = None
    frames: int | None = None

    @property
    def ok(self) -> bool:
        return self.returncode == 0

    @property
    def error_tail(self) -> str:
        lines = [ln for ln in self.stderr.strip().splitlines() if ln.strip()]
        return lines[-1] if lines else f"exit code {self.returncode}"


def run_ffmpeg(
    args: Sequence[str],
    output: str | None = None,
    timeout: float | None = 3600.0,
    overwrite: bool = True,
) -> RunResult:
    """Run an ffmpeg transform and capture timing + progress statistics."""
    import re

    cmd = [ffmpeg_bin(), "-hide_banner", "-nostdin", "-y" if overwrite else "-n"]
    cmd += build_extra_args()
    cmd += list(args)

    started = time.perf_counter()
    proc = run(cmd, timeout=timeout)
    elapsed = time.perf_counter() - started

    result = RunResult(
        cmd=cmd,
        returncode=proc.returncode,
        stderr=proc.stderr or "",
        wall_time=elapsed,
        build=_ACTIVE.name,
        output=output,
    )
    if output and os.path.isfile(output):
        result.output_size = os.path.getsize(output)

    tail = result.stderr[-4000:]
    speeds = re.findall(r"speed=\s*([\d.]+)x", tail)
    if speeds:
        result.speed = float(speeds[-1])
    frames = re.findall(r"frame=\s*(\d+)", tail)
    if frames:
        result.frames = max(int(n) for n in frames)
    fps = re.findall(r"fps=\s*([\d.]+)", tail)
    if fps:
        result.fps = float(fps[-1])
    return result
