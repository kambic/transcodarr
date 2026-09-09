"""Thumbnail extraction and sprite-sheet generation."""

from __future__ import annotations

import glob
import math
import os
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path

from vidprobe.edit import ensure_parent, format_timecode
from vidprobe.ffmpeg import ProbeError, RunResult, ffprobe_bin, input_args, run_ffmpeg, run_json


class ThumbMode(str, Enum):
    QUICK = "quick"  # ffmpeg's thumbnail filter: representative, avoids black frames
    SCENE = "scene"  # scene-change detection
    INTERVAL = "interval"  # one frame every N seconds
    IFRAME = "iframe"  # keyframes only, cheapest possible decode
    SINGLE = "single"  # one frame at a given timestamp


@dataclass
class MediaGeometry:
    duration: float | None = None
    width: int | None = None
    height: int | None = None
    fps: float | None = None

    @property
    def aspect(self) -> float:
        if self.width and self.height:
            return self.width / self.height
        return 16 / 9


@dataclass
class ThumbResult:
    files: list[str] = field(default_factory=list)
    pattern: str = ""
    mode: str = ""
    run: RunResult | None = None
    notes: list[str] = field(default_factory=list)

    @property
    def count(self) -> int:
        return len(self.files)

    @property
    def total_bytes(self) -> int:
        return sum(os.path.getsize(f) for f in self.files if os.path.isfile(f))


@dataclass
class SpriteResult(ThumbResult):
    vtt: str | None = None
    tile_width: int = 0
    tile_height: int = 0
    columns: int = 0
    rows: int = 0
    interval: float = 0.0
    tiles: int = 0


def media_geometry(source: str, timeout: float = 20.0) -> MediaGeometry:
    cmd = [
        ffprobe_bin(),
        "-hide_banner",
        "-v",
        "error",
        *input_args(source, timeout=timeout, analyze=3),
        "-select_streams",
        "v:0",
        "-show_entries",
        "format=duration:stream=width,height,avg_frame_rate,duration",
        "-of",
        "json",
        source,
    ]
    data = run_json(cmd, timeout=timeout + 15)
    geometry = MediaGeometry()
    fmt = data.get("format") or {}
    streams = data.get("streams") or []
    try:
        geometry.duration = float(fmt.get("duration"))
    except TypeError, ValueError:
        geometry.duration = None
    if streams:
        stream = streams[0]
        geometry.width = stream.get("width")
        geometry.height = stream.get("height")
        if geometry.duration is None:
            try:
                geometry.duration = float(stream.get("duration"))
            except TypeError, ValueError:
                pass
        rate = stream.get("avg_frame_rate") or ""
        if "/" in rate:
            num, _, den = rate.partition("/")
            try:
                geometry.fps = float(num) / float(den) if float(den) else None
            except TypeError, ValueError, ZeroDivisionError:
                geometry.fps = None
    return geometry


def tile_size(width: int, geometry: MediaGeometry) -> tuple[int, int]:
    """Even dimensions for a tile of the requested width, keeping aspect ratio."""
    width = max(int(width) // 2 * 2, 2)
    height = int(round(width / geometry.aspect))
    height = max(height // 2 * 2, 2)
    return width, height


def _extension(fmt: str) -> str:
    fmt = fmt.lower().lstrip(".")
    return ".jpg" if fmt in {"jpg", "jpeg"} else f".{fmt}"


def _quality_args(fmt: str, quality: int) -> list[str]:
    if _extension(fmt) in {".jpg", ".jpeg", ".webp"}:
        return ["-qscale:v", str(max(1, min(31, quality)))]
    return []


# --------------------------------------------------------------------------- #
# thumbnails
# --------------------------------------------------------------------------- #
def generate_thumbnails(
    source: str,
    outdir: str,
    mode: ThumbMode = ThumbMode.QUICK,
    width: int = 320,
    count: int | None = None,
    interval: float | None = None,
    scene_threshold: float = 0.35,
    timestamp: float | None = None,
    quality: int = 3,
    image_format: str = "jpg",
    prefix: str = "thumb",
    geometry: MediaGeometry | None = None,
    overwrite: bool = True,
    timeout: float = 1800.0,
    dry_run: bool = False,
) -> ThumbResult:
    """Extract still frames using the selected strategy."""
    geometry = geometry or media_geometry(source)
    result = ThumbResult(mode=mode.value)
    ensure_parent(os.path.join(outdir, "x"))
    Path(outdir).mkdir(parents=True, exist_ok=True)

    ext = _extension(image_format)
    scale = f"scale={width}:-2"

    if mode is ThumbMode.SINGLE:
        target = os.path.join(outdir, f"{prefix}{ext}")
        args = [
            "-ss",
            f"{max(timestamp or 0, 0):.3f}",
            "-i",
            source,
            "-frames:v",
            "1",
            "-vf",
            scale,
            *_quality_args(image_format, quality),
            target,
        ]
        result.pattern = target
    else:
        pattern = os.path.join(outdir, f"{prefix}_%04d{ext}")
        result.pattern = pattern
        args = ["-i", source]

        if mode is ThumbMode.INTERVAL or (
            mode is ThumbMode.QUICK and count is None and interval is not None
        ):
            step = interval or 10.0
            args += ["-vf", f"fps=1/{step:g},{scale}"]
            result.notes.append(f"one frame every {step:g}s")

        elif mode is ThumbMode.QUICK:
            # Spread `count` frames evenly, but pick a *representative* frame in
            # each window rather than whatever lands on the boundary (often black
            # or a duplicate).
            #
            # Two stages: sub-sample each window down to `batch` candidates, then
            # let the thumbnail filter choose the best of each batch. This keeps
            # the filter's memory bounded however long the video is - feeding it a
            # whole window at native frame rate would not.
            wanted = count or 12
            if geometry.duration and wanted:
                step = max(geometry.duration / wanted, 0.04)
                source_fps = geometry.fps or 25.0
                batch = int(max(2, min(10, source_fps * step)))
                sample_rate = batch / step
                args += [
                    "-vf",
                    f"fps={sample_rate:g},thumbnail={batch},{scale}",
                    "-fps_mode",
                    "vfr",
                ]
                result.notes.append(
                    f"{wanted} representative frames, best of {batch} candidates "
                    f"per {step:.1f}s window"
                )
            else:
                args += ["-vf", f"thumbnail=100,{scale}", "-fps_mode", "vfr"]
                result.notes.append("duration unknown - sampling representative frames")
            args += ["-frames:v", str(wanted)]

        elif mode is ThumbMode.SCENE:
            args += [
                "-vf",
                f"select='gt(scene,{scene_threshold:g})',{scale}",
                "-fps_mode",
                "vfr",
            ]
            result.notes.append(f"scene cuts above {scene_threshold:g}")
            if count:
                args += ["-frames:v", str(count)]

        elif mode is ThumbMode.IFRAME:
            args = [
                "-skip_frame",
                "nokey",
                "-i",
                source,
                "-vf",
                scale,
                "-fps_mode",
                "vfr",
            ]
            result.notes.append("keyframes only (fastest decode)")
            if count:
                args += ["-frames:v", str(count)]

        args += [*_quality_args(image_format, quality), pattern]

    if dry_run:
        from vidprobe.ffmpeg import ffmpeg_bin

        result.run = RunResult(
            cmd=[ffmpeg_bin(), "-hide_banner", "-nostdin", "-y", *args],
            returncode=0,
            stderr="",
            wall_time=0.0,
        )
        return result

    result.run = run_ffmpeg(
        args, output=result.pattern, timeout=timeout, overwrite=overwrite
    )
    if result.run.ok:
        if mode is ThumbMode.SINGLE:
            result.files = [result.pattern] if os.path.isfile(result.pattern) else []
        else:
            result.files = sorted(glob.glob(os.path.join(outdir, f"{prefix}_*{ext}")))
        if not result.files:
            result.notes.append(
                "no frames matched - try a lower threshold or another mode"
            )
    return result


# --------------------------------------------------------------------------- #
# sprites
# --------------------------------------------------------------------------- #
def generate_sprite(
    source: str,
    outdir: str,
    width: int = 160,
    interval: float | None = None,
    count: int | None = None,
    columns: int = 5,
    rows: int = 5,
    quality: int = 4,
    image_format: str = "jpg",
    prefix: str = "sprite",
    vtt_name: str = "sprite.vtt",
    vtt_prefix: str = "",
    geometry: MediaGeometry | None = None,
    overwrite: bool = True,
    timeout: float = 3600.0,
    dry_run: bool = False,
) -> SpriteResult:
    """Build tiled sprite sheets plus a WebVTT index for player scrub previews."""
    geometry = geometry or media_geometry(source)
    if not geometry.duration:
        raise ProbeError("sprite generation needs a known duration (not a live stream)")

    per_sheet = max(columns * rows, 1)
    if interval is None:
        if count:
            interval = max(geometry.duration / count, 0.1)
        else:
            interval = max(geometry.duration / per_sheet, 1.0)
    tiles = max(int(math.floor(geometry.duration / interval)), 1)

    tile_w, tile_h = tile_size(width, geometry)
    ext = _extension(image_format)
    Path(outdir).mkdir(parents=True, exist_ok=True)
    pattern = os.path.join(outdir, f"{prefix}_%03d{ext}")

    args = [
        "-i",
        source,
        "-vf",
        f"fps=1/{interval:g},scale={tile_w}:{tile_h},tile={columns}x{rows}",
        "-fps_mode",
        "vfr",
        *_quality_args(image_format, quality),
        pattern,
    ]

    result = SpriteResult(
        pattern=pattern,
        mode="sprite",
        tile_width=tile_w,
        tile_height=tile_h,
        columns=columns,
        rows=rows,
        interval=interval,
        tiles=tiles,
    )
    result.notes.append(
        f"{tiles} tiles of {tile_w}x{tile_h} every {interval:.1f}s, "
        f"{columns}x{rows} per sheet"
    )

    if dry_run:
        from vidprobe.ffmpeg import ffmpeg_bin

        result.run = RunResult(
            cmd=[ffmpeg_bin(), "-hide_banner", "-nostdin", "-y", *args],
            returncode=0,
            stderr="",
            wall_time=0.0,
        )
        return result

    result.run = run_ffmpeg(args, output=pattern, timeout=timeout, overwrite=overwrite)
    if not result.run.ok:
        return result

    result.files = sorted(glob.glob(os.path.join(outdir, f"{prefix}_*{ext}")))
    if not result.files:
        result.notes.append("ffmpeg produced no sheets")
        return result

    vtt_path = os.path.join(outdir, vtt_name)
    result.vtt = write_vtt(
        vtt_path,
        sheets=[os.path.basename(f) for f in result.files],
        tiles=tiles,
        per_sheet=per_sheet,
        columns=columns,
        rows=rows,
        tile_w=tile_w,
        tile_h=tile_h,
        interval=interval,
        duration=geometry.duration,
        url_prefix=vtt_prefix,
    )
    return result


def write_vtt(
    path: str,
    sheets: list[str],
    tiles: int,
    per_sheet: int,
    columns: int,
    rows: int,
    tile_w: int,
    tile_h: int,
    interval: float,
    duration: float,
    url_prefix: str = "",
) -> str:
    """WebVTT thumbnail track: each cue points at a region of a sprite sheet."""
    lines = ["WEBVTT", ""]
    available = len(sheets) * per_sheet
    for i in range(min(tiles, available)):
        start = i * interval
        end = min((i + 1) * interval, duration)
        if end <= start:
            break
        sheet = sheets[i // per_sheet]
        slot = i % per_sheet
        x = (slot % columns) * tile_w
        y = (slot // columns) * tile_h
        lines.append(f"{format_timecode(start)} --> {format_timecode(end)}")
        lines.append(f"{url_prefix}{sheet}#xywh={x},{y},{tile_w},{tile_h}")
        lines.append("")
    Path(path).write_text("\n".join(lines), encoding="utf-8")
    return path
