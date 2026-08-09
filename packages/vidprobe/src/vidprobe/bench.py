"""Race configured FFmpeg builds against each other on an identical workload.

This is the point of registering several builds in the config: run the same job
through a distro build, a static nightly and a hardware-accelerated build and
see which one actually wins on your machine.
"""

from __future__ import annotations

import os
import statistics
import tempfile
from enum import Enum
from typing import Callable

from .config import Build
from .ffmpeg import FFmpegNotFound, ProbeError, run_ffmpeg, using_build


class BenchTask(str, Enum):
    DECODE = "decode"  # full decode to null - isolates the decoder
    ENCODE = "encode"  # transcode - the usual CPU-bound comparison
    REMUX = "remux"  # stream copy - I/O and muxer overhead
    SCALE = "scale"  # decode + scale filter - filter chain throughput
    THUMBS = "thumbs"  # sprite-style frame extraction


def task_args(
    task: BenchTask,
    source: str,
    workdir: str,
    duration: float | None,
    encoder: str = "libx264",
    preset: str = "medium",
    crf: int = 23,
    scale_width: int = 640,
    threads: int | None = None,
) -> tuple[list[str], str | None]:
    """Build the ffmpeg arguments for one benchmark task."""
    head = ["-i", source]
    if duration:
        head = ["-t", f"{duration:g}", *head]
    common = ["-threads", str(threads)] if threads is not None else []
    output: str | None = None

    if task is BenchTask.DECODE:
        args = [*head, *common, "-map", "0:v:0", "-f", "null", "-"]
    elif task is BenchTask.REMUX:
        output = os.path.join(workdir, "remux.mkv")
        args = [*head, *common, "-map", "0", "-c", "copy", output]
    elif task is BenchTask.SCALE:
        args = [
            *head,
            *common,
            "-map",
            "0:v:0",
            "-vf",
            f"scale={scale_width}:-2:flags=bicubic",
            "-f",
            "null",
            "-",
        ]
    elif task is BenchTask.THUMBS:
        output = os.path.join(workdir, "bench_%03d.jpg")
        args = [
            *head,
            *common,
            "-map",
            "0:v:0",
            "-vf",
            "fps=1/2,scale=160:-2,tile=5x5",
            "-fps_mode",
            "vfr",
            "-qscale:v",
            "4",
            output,
        ]
    else:  # ENCODE
        output = os.path.join(workdir, "encode.mp4")
        args = [
            *head,
            *common,
            "-map",
            "0:v:0",
            "-c:v",
            encoder,
            "-preset",
            preset,
            "-crf",
            str(crf),
            "-an",
            output,
        ]
    return args, output


def run_bench(
    builds: list[Build],
    task: BenchTask,
    source: str,
    runs: int = 1,
    duration: float | None = 30.0,
    encoder: str = "libx264",
    preset: str = "medium",
    crf: int = 23,
    scale_width: int = 640,
    threads: int | None = None,
    timeout: float = 3600.0,
    progress: Callable[[str, int], None] | None = None,
) -> list[dict]:
    """Run `task` `runs` times per build and return one summary row per build."""
    rows: list[dict] = []
    for build in builds:
        row: dict = {
            "build": build.display,
            "runs": 0,
            "best": None,
            "median": None,
            "speed": None,
            "size": None,
        }
        if not build.available:
            row["error"] = "binary not found"
            rows.append(row)
            continue

        times: list[float] = []
        speeds: list[float] = []
        size: int | None = None
        error: str | None = None

        with tempfile.TemporaryDirectory(prefix="vidprobe_bench_") as workdir:
            args, output = task_args(
                task,
                source,
                workdir,
                duration,
                encoder,
                preset,
                crf,
                scale_width,
                threads,
            )
            for attempt in range(runs):
                if progress:
                    progress(build.display, attempt + 1)
                try:
                    with using_build(build):
                        result = run_ffmpeg(args, output=output, timeout=timeout)
                except (FFmpegNotFound, ProbeError) as exc:
                    error = str(exc)
                    break
                if not result.ok:
                    error = result.error_tail
                    break
                times.append(result.wall_time)
                if result.speed:
                    speeds.append(result.speed)
                if result.output_size:
                    size = result.output_size

        if times:
            row.update(
                runs=len(times),
                best=min(times),
                median=statistics.median(times),
                speed=max(speeds) if speeds else None,
                size=size,
            )
        else:
            row["error"] = error or "no successful run"
        rows.append(row)
    return rows
