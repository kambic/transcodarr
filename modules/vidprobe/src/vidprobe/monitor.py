"""Follow a live stream and show a continuously updating health dashboard."""

from __future__ import annotations

import os
import subprocess
import time
from collections import deque

from rich import box
from rich.console import Console, Group
from rich.live import Live
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

from vidprobe.compare import human_bitrate, human_duration, human_size
from vidprobe.ffmpeg import ffmpeg_bin, input_args
from vidprobe.render import sparkline


def _dashboard(
    url: str, stats: dict, history: deque, errors: deque, started: float, decode: bool
) -> Panel:
    table = Table(box=box.SIMPLE_HEAD, show_header=False, expand=True, padding=(0, 1))
    table.add_column("k", style="grey62", ratio=2)
    table.add_column("v", ratio=3)

    elapsed = time.time() - started
    bitrate = stats.get("bitrate_bps")
    speed = stats.get("speed")
    drops = int(stats.get("drop_frames", 0) or 0)
    dups = int(stats.get("dup_frames", 0) or 0)

    table.add_row("wall clock", f"{elapsed:.0f} s")
    table.add_row("stream time", human_duration(stats.get("out_time_s")))
    if decode or stats.get("frame"):
        table.add_row("frames decoded", f"{int(stats.get('frame', 0) or 0):,}")
        table.add_row("current fps", f"{float(stats.get('fps', 0) or 0):.2f}")
    table.add_row("bitrate", Text(human_bitrate(bitrate), style="bold white"))
    table.add_row("data received", human_size(stats.get("total_size")))
    speed_style = "green"
    if speed is not None and speed < 0.97:
        speed_style = "red"
    table.add_row(
        "realtime factor",
        Text(f"{speed:.3f}x" if speed is not None else "-", style=speed_style),
    )
    if decode:
        table.add_row(
            "dropped / duplicated",
            Text(f"{drops:,} / {dups:,}", style="red" if drops or dups else "green"),
        )
    else:
        table.add_row(
            "mode", Text("stream copy (add --decode for frame stats)", style="grey62")
        )

    body: list = [table]
    if history:
        body.append(Text("\nbitrate (per update)", style="grey62"))
        body.append(sparkline(list(history), width=60))
    if errors:
        body.append(Text("\nrecent decoder messages", style="grey62"))
        for line in list(errors)[-4:]:
            body.append(Text(f"  {line[:110]}", style="red"))

    return Panel(
        Group(*body),
        title=f"[b]monitoring[/b] [cyan]{url}[/cyan]",
        subtitle="press Ctrl-C to stop",
        border_style="bright_cyan",
        box=box.ROUNDED,
    )


def monitor(
    url: str,
    console: Console,
    duration: float | None = None,
    timeout: float = 20.0,
    decode: bool = False,
) -> None:
    """Follow `url` and render a live panel.

    Stream copy is the cheap default; `decode=True` actually decodes video so
    frame counts, real fps and drop/dup counters become meaningful.
    """
    cmd = [
        ffmpeg_bin(),
        "-hide_banner",
        "-nostdin",
        "-y",
        "-loglevel",
        "warning",
        "-progress",
        "pipe:1",
        "-nostats",
        *input_args(url, timeout=timeout, analyze=3),
        "-i",
        url,
        "-map",
        "0:v:0?",
    ]
    limit = ["-t", f"{duration:g}"] if duration else []
    # a real (discarded) muxer keeps total_size/bitrate meaningful, unlike -f null;
    # in decode mode a second rawvideo output adds true frame/fps/drop counters
    cmd += [*limit, "-c", "copy", "-f", "mpegts", os.devnull]
    if decode:
        cmd += ["-map", "0:v:0?", *limit, "-c:v", "rawvideo", "-f", "null", "-"]

    proc = subprocess.Popen(
        cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1
    )
    stats: dict = {}
    history: deque = deque(maxlen=180)
    errors: deque = deque(maxlen=20)
    started = time.time()

    try:
        with Live(
            _dashboard(url, stats, history, errors, started, decode),
            console=console,
            refresh_per_second=4,
        ) as live:
            assert proc.stdout is not None
            for line in proc.stdout:
                key, _, value = line.strip().partition("=")
                value = value.strip()
                if key == "bitrate" and value not in {"N/A", ""}:
                    try:
                        stats["bitrate_bps"] = float(value.rstrip("kbits/s")) * 1000
                        history.append(stats["bitrate_bps"])
                    except ValueError:
                        pass
                elif key == "out_time_us" and value.isdigit():
                    stats["out_time_s"] = int(value) / 1_000_000
                elif key == "speed" and value not in {"N/A", ""}:
                    try:
                        stats["speed"] = float(value.rstrip("x"))
                    except ValueError:
                        pass
                elif key in {"frame", "fps", "total_size", "drop_frames", "dup_frames"}:
                    try:
                        stats[key] = float(value)
                    except ValueError:
                        pass
                elif key == "progress":
                    live.update(
                        _dashboard(url, stats, history, errors, started, decode)
                    )
                    if value == "end":
                        break
                if duration and time.time() - started > duration + 5:
                    break
    except KeyboardInterrupt:
        console.print("\n[yellow]stopped by user[/yellow]")
    finally:
        proc.terminate()
        try:
            _, stderr = proc.communicate(timeout=5)
        except subprocess.TimeoutExpired:  # pragma: no cover
            proc.kill()
            stderr = ""
        for line in (stderr or "").splitlines():
            if line.strip():
                errors.append(line.strip())

    if errors:
        console.print(
            Panel(
                Text("\n".join(list(errors)[-10:]), style="red"),
                title="[b]ffmpeg messages[/b]",
                border_style="red",
                box=box.ROUNDED,
            )
        )
