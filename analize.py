#!/usr/bin/env python3

import re
import subprocess
import sys
import time
from pathlib import Path

from rich.console import Console
from rich.table import Table


console = Console()

SOURCE = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("input.mp4")
CRFS = [18, 20, 22, 23, 24, 26, 28]
AUDIO_BITRATE = "128k"


def run(cmd):
    return subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )


def encode(crf, output):
    cmd = [
        "ffmpeg",
        "-y",
        "-i", str(SOURCE),

        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", str(crf),

        "-c:a", "aac",
        "-b:a", AUDIO_BITRATE,

        str(output),
    ]

    start = time.monotonic()
    result = run(cmd)
    elapsed = time.monotonic() - start

    if result.returncode != 0:
        console.print(result.stderr)
        raise RuntimeError(f"Encoding failed for CRF {crf}")

    return elapsed


def probe(file):
    cmd = [
        "ffprobe",
        "-v", "error",
        "-select_streams", "v:0",
        "-show_entries",
        "stream=width,height,r_frame_rate,bit_rate",
        "-show_entries",
        "format=duration,size",
        "-of", "default=noprint_wrappers=1",
        str(file),
    ]

    result = run(cmd)

    values = {}

    for line in result.stdout.splitlines():
        if "=" in line:
            key, value = line.split("=", 1)
            values[key] = value

    return values


def quality_metrics(encoded):
    """
    Compare encoded video against SOURCE using FFmpeg filters.

    Produces:
      VMAF
      SSIM
      PSNR
    """

    cmd = [
        "ffmpeg",
        "-i", str(encoded),
        "-i", str(SOURCE),

        "-lavfi",
        (
            "[0:v][1:v]"
            "libvmaf=log_fmt=json:"
            "log_path=/tmp/vmaf.json:"
            "feature=name=psnr|name=float_ssim"
        ),

        "-f", "null",
        "-",
    ]

    result = run(cmd)

    if result.returncode != 0:
        console.print(result.stderr)
        raise RuntimeError(f"Quality analysis failed for {encoded}")

    # Read VMAF JSON
    vmaf = None
    vmaf_file = Path("/tmp/vmaf.json")

    if vmaf_file.exists():
        import json

        data = json.loads(vmaf_file.read_text())

        if "pooled_metrics" in data:
            metrics = data["pooled_metrics"]

            if "vmaf" in metrics:
                vmaf = metrics["vmaf"].get("mean")

        vmaf_file.unlink(missing_ok=True)

    # Extract SSIM / PSNR from FFmpeg output
    ssim = None
    psnr = None

    for line in result.stderr.splitlines():

        # Example:
        # SSIM Y:0.99 U:0.99 V:0.99 All:0.99
        m = re.search(r"SSIM .*?All:([0-9.]+)", line)
        if m:
            ssim = float(m.group(1))

        # Example:
        # PSNR ... average:42.123
        m = re.search(r"PSNR .*?average:([0-9.]+)", line)
        if m:
            psnr = float(m.group(1))

    return vmaf, ssim, psnr


def format_size(size):
    size = int(size)

    for unit in ["B", "KiB", "MiB", "GiB"]:
        if size < 1024:
            return f"{size:.1f} {unit}"
        size /= 1024

    return f"{size:.1f} TiB"


def format_time(seconds):
    minutes = int(seconds // 60)
    seconds = seconds % 60

    return f"{minutes}:{seconds:04.1f}"


def format_bitrate(bitrate):
    if not bitrate:
        return "-"

    return f"{int(bitrate) / 1_000_000:.2f}"


results = []

for crf in CRFS:
    output = Path(f"crf{crf}.mp4")

    console.print(
        f"[cyan]CRF {crf}[/cyan] "
        f"→ encoding {output}..."
    )

    encode_time = encode(crf, output)

    console.print(
        f"  [green]encoded in {format_time(encode_time)}[/green]"
    )

    console.print("  measuring VMAF / SSIM / PSNR...")

    vmaf, ssim, psnr = quality_metrics(output)
    info = probe(output)

    results.append({
        "crf": crf,
        "vmaf": vmaf,
        "ssim": ssim,
        "psnr": psnr,
        "bitrate": info.get("bit_rate"),
        "size": info.get("size"),
        "time": encode_time,
    })


# ------------------------------------------------------------
# Rich table
# ------------------------------------------------------------

table = Table(title=f"CRF Quality Comparison — {SOURCE}")

table.add_column("CRF", justify="right", style="cyan")
table.add_column("VMAF", justify="right", style="green")
table.add_column("SSIM", justify="right", style="green")
table.add_column("PSNR", justify="right", style="green")
table.add_column("Mbps", justify="right", style="yellow")
table.add_column("Size", justify="right", style="yellow")
table.add_column("Time", justify="right", style="magenta")

for r in results:
    table.add_row(
        str(r["crf"]),
        f"{r['vmaf']:.2f}" if r["vmaf"] is not None else "-",
        f"{r['ssim']:.5f}" if r["ssim"] is not None else "-",
        f"{r['psnr']:.2f}" if r["psnr"] is not None else "-",
        format_bitrate(r["bitrate"]),
        format_size(r["size"]),
        format_time(r["time"]),
    )

console.print()
console.print(table)
