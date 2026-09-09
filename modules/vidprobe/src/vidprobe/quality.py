"""Full-reference objective quality metrics (VMAF / PSNR / SSIM)."""

from __future__ import annotations

import json
import os
import re
import tempfile
from dataclasses import dataclass, field

from vidprobe.ffmpeg import ProbeError, ffmpeg_bin, has_filter, input_args, run

ALL_METRICS = ("vmaf", "psnr", "ssim")


@dataclass
class QualityResult:
    distorted: str = ""
    reference: str = ""
    vmaf: float | None = None
    vmaf_min: float | None = None
    vmaf_harmonic: float | None = None
    psnr_y: float | None = None
    psnr_avg: float | None = None
    ssim_y: float | None = None
    ssim_all: float | None = None
    frames: int | None = None
    scaled: bool = False
    notes: list[str] = field(default_factory=list)

    @property
    def empty(self) -> bool:
        return all(
            getattr(self, name) is None
            for name in ("vmaf", "psnr_y", "psnr_avg", "ssim_y", "ssim_all")
        )


def vmaf_available() -> bool:
    return has_filter("libvmaf")


def _chain(
    idx: int, label: str, width: int | None, height: int | None, fps: float | None
) -> str:
    """Normalise one input so both legs are directly comparable."""
    steps = [f"[{idx}:v]settb=AVTB", "setpts=PTS-STARTPTS"]
    if fps:
        steps.append(f"fps={fps:g}")
    if width and height:
        steps.append(f"scale={width}:{height}:flags=bicubic")
    steps.append("format=yuv420p")
    return ",".join(steps) + f"[{label}]"


def measure(
    distorted: str,
    reference: str,
    metrics: tuple[str, ...] = ALL_METRICS,
    duration: float | None = 20.0,
    width: int | None = None,
    height: int | None = None,
    fps: float | None = None,
    threads: int = 0,
    timeout: float = 900.0,
    start: float = 0.0,
) -> QualityResult:
    """Compare `distorted` against `reference`, scaling the pair to a common grid.

    `width`/`height`/`fps` should normally be the reference's own geometry so the
    distorted encode is resampled up to it (the standard way of scoring a
    lower-resolution encode against its source).

    `start` seeks both inputs by the same amount, which is how a specific window
    (for example either side of an ABR switch) gets scored in isolation.
    """
    result = QualityResult(distorted=distorted, reference=reference)
    wanted = [m for m in metrics if m in ALL_METRICS]
    if not wanted:
        raise ValueError("no valid metrics requested")

    if "vmaf" in wanted and not vmaf_available():
        wanted.remove("vmaf")
        result.notes.append("libvmaf not in this ffmpeg build - VMAF skipped")
    if not wanted:
        return result

    result.scaled = bool(width and height)
    # normalise both legs, then fan the reference out once per metric filter
    filters = [
        _chain(0, "dist", width, height, fps),
        _chain(1, "refsrc", width, height, fps),
        "[refsrc]split=%d%s"
        % (len(wanted), "".join(f"[ref{i}]" for i in range(len(wanted)))),
    ]

    log_path = None
    prev = "dist"
    for i, metric in enumerate(wanted):
        out = "" if i == len(wanted) - 1 else f"[m{i}]"
        if metric == "vmaf":
            fd, log_path = tempfile.mkstemp(suffix=".json", prefix="vmaf_")
            os.close(fd)
            opts = f"log_path={log_path}:log_fmt=json"
            if threads:
                opts += f":n_threads={threads}"
            spec = f"libvmaf={opts}"
        else:
            spec = metric  # psnr / ssim take no options
        filters.append(f"[{prev}][ref{i}]{spec}{out}")
        prev = f"m{i}"

    graph = ";".join(filters)

    cmd = [ffmpeg_bin(), "-hide_banner", "-nostdin"]
    for path in (distorted, reference):
        if start:
            cmd += ["-ss", f"{start:.3f}"]
        if duration:
            cmd += ["-t", f"{duration:g}"]
        cmd += [*input_args(path, timeout=15, analyze=5), "-i", path]
    cmd += ["-lavfi", graph, "-an", "-sn", "-f", "null", "-"]

    proc = run(cmd, timeout=timeout)
    stderr = proc.stderr or ""
    if proc.returncode != 0:
        tail = [ln for ln in stderr.strip().splitlines() if ln.strip()][-1:]
        raise ProbeError(
            f"quality measurement failed: {tail[0] if tail else 'unknown error'}"
        )

    _parse_psnr(stderr, result)
    _parse_ssim(stderr, result)
    if log_path:
        _parse_vmaf(log_path, result)
        try:
            os.unlink(log_path)
        except OSError:
            pass

    counted = re.findall(r"frame=\s*(\d+)", stderr)
    if counted:
        result.frames = max(int(n) for n in counted)
    return result


def _parse_psnr(stderr: str, result: QualityResult) -> None:
    match = re.search(r"PSNR\s+y:([\d.]+|inf).*?average:([\d.]+|inf)", stderr)
    if not match:
        return
    result.psnr_y = _num(match.group(1))
    result.psnr_avg = _num(match.group(2))


def _parse_ssim(stderr: str, result: QualityResult) -> None:
    match = re.search(r"SSIM.*?Y:([\d.]+).*?All:([\d.]+)", stderr)
    if not match:
        return
    result.ssim_y = _num(match.group(1))
    result.ssim_all = _num(match.group(2))


def _parse_vmaf(path: str, result: QualityResult) -> None:
    try:
        with open(path, "r", encoding="utf-8") as handle:
            data = json.load(handle)
    except OSError, json.JSONDecodeError:
        result.notes.append("VMAF log could not be read")
        return
    pooled = (data.get("pooled_metrics") or {}).get("vmaf") or {}
    result.vmaf = pooled.get("mean")
    result.vmaf_min = pooled.get("min")
    result.vmaf_harmonic = pooled.get("harmonic_mean")
    if result.vmaf is None and data.get("frames"):
        scores = [
            f["metrics"]["vmaf"]
            for f in data["frames"]
            if "vmaf" in f.get("metrics", {})
        ]
        if scores:
            result.vmaf = sum(scores) / len(scores)
            result.vmaf_min = min(scores)


def _num(token: str) -> float:
    return float("inf") if token == "inf" else float(token)


def rate_vmaf(score: float | None) -> tuple[str, str]:
    """Map a VMAF score onto a plain-language band and a colour."""
    if score is None:
        return "-", "dim"
    if score >= 95:
        return "visually transparent", "bright_green"
    if score >= 90:
        return "excellent", "green"
    if score >= 80:
        return "good", "yellow"
    if score >= 70:
        return "fair", "dark_orange"
    return "poor", "red"


def rate_psnr(score: float | None) -> tuple[str, str]:
    if score is None:
        return "-", "dim"
    if score == float("inf"):
        return "identical", "bright_green"
    if score >= 45:
        return "excellent", "bright_green"
    if score >= 40:
        return "very good", "green"
    if score >= 35:
        return "good", "yellow"
    if score >= 30:
        return "fair", "dark_orange"
    return "poor", "red"
