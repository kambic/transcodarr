"""All Rich console output lives here."""

from __future__ import annotations

import os

from rich import box
from rich.console import Console, Group
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

from vidprobe.compare import (
    Comparison,
    human_bitrate,
    human_duration,
    human_size,
    quality_per_mbit,
)
from vidprobe.models import ProbeResult
from vidprobe.quality import QualityResult, rate_psnr, rate_vmaf

BLOCKS = "▁▂▃▄▅▆▇█"
ACCENT = "bright_cyan"


def make_console(no_color: bool = False, width: int | None = None) -> Console:
    return Console(no_color=no_color, width=width, highlight=False, soft_wrap=False)


# --------------------------------------------------------------------------- #
# small widgets
# --------------------------------------------------------------------------- #
def sparkline(values: list[float], width: int = 60) -> Text:
    """A coloured block-character bitrate curve."""
    if not values:
        return Text("no data", style="dim")
    if len(values) > width:
        step = len(values) / width
        values = [
            max(values[int(i * step) : max(int((i + 1) * step), int(i * step) + 1)])
            for i in range(width)
        ]
    lo, hi = min(values), max(values)
    span = hi - lo or 1.0
    out = Text()
    for value in values:
        norm = (value - lo) / span
        char = BLOCKS[min(int(norm * (len(BLOCKS) - 1) + 0.5), len(BLOCKS) - 1)]
        style = "green" if norm < 0.5 else ("yellow" if norm < 0.8 else "red")
        out.append(char, style=style)
    return out


def bar(fraction: float, width: int = 18, style: str = ACCENT) -> Text:
    filled = int(max(0.0, min(1.0, fraction)) * width)
    return Text("█" * filled, style=style) + Text(
        "░" * (width - filled), style="grey37"
    )


def side_by_side(*renderables) -> Table:
    """A grid that always splits the full console width evenly."""
    grid = Table.grid(expand=True, padding=(0, 0))
    for _ in renderables:
        grid.add_column(ratio=1)
    grid.add_row(*renderables)
    return grid


def _kv_table(title: str | None = None) -> Table:
    table = Table(
        box=box.SIMPLE_HEAD,
        show_header=False,
        expand=True,
        pad_edge=False,
        padding=(0, 1),
        title=title,
    )
    table.add_column("k", style="grey62", no_wrap=True, ratio=2)
    table.add_column("v", style="white", ratio=3, overflow="fold")
    return table


def _add(table: Table, key: str, value, style: str | None = None) -> None:
    if value is None or value == "" or value == "-":
        return
    table.add_row(key, Text(str(value), style=style) if style else str(value))


# --------------------------------------------------------------------------- #
# probe view
# --------------------------------------------------------------------------- #
def flag_line(result: ProbeResult) -> Text:
    v = result.video
    out = Text()
    if not v:
        return out
    chips: list[tuple[str, str]] = []
    if v.is_hdr:
        chips.append(("HDR", "black on bright_yellow"))
    if (v.bit_depth or 8) > 8:
        chips.append((f"{v.bit_depth}-bit", "black on bright_magenta"))
    if v.is_interlaced:
        chips.append(("INTERLACED", "black on red"))
    if result.container.live:
        chips.append(("LIVE", "black on bright_green"))
    if v.closed_captions:
        chips.append(("CC", "black on white"))
    if v.height >= 2160:
        chips.append(("UHD", "black on bright_cyan"))
    elif v.height >= 1080:
        chips.append(("FHD", "black on cyan"))
    for label, style in chips:
        out.append(f" {label} ", style=style)
        out.append(" ")
    return out


def container_panel(result: ProbeResult) -> Panel:
    c = result.container
    table = _kv_table()
    _add(
        table,
        "format",
        f"{c.format_name}  ({c.format_long})" if c.format_long else c.format_name,
    )
    _add(
        table,
        "duration",
        human_duration(c.duration) if c.duration else "live / unknown",
    )
    _add(table, "size", human_size(c.size))
    _add(table, "overall bitrate", human_bitrate(c.bitrate))
    _add(table, "streams", c.nb_streams)
    _add(table, "probe score", f"{c.probe_score}/100" if c.probe_score else None)
    _add(
        table,
        "connect + probe",
        f"{result.connect_time:.2f} s" if result.connect_time else None,
    )
    for key in ("title", "encoder", "creation_time", "major_brand", "service_name"):
        _add(table, key, c.tags.get(key))
    return Panel(
        table, title="[b]container[/b]", border_style="grey37", box=box.ROUNDED
    )


def video_panel(result: ProbeResult) -> Panel:
    v = result.video
    if not v:
        return Panel(
            Text("no video stream", style="red"), title="video", border_style="red"
        )
    table = _kv_table()
    codec = v.codec.upper()
    if v.profile:
        codec += f"  {v.profile}"
    if v.level:
        codec += f" @ L{v.level}"
    _add(table, "codec", codec, ACCENT)
    _add(table, "resolution", f"{v.resolution}  ({v.megapixels:.2f} MP)", "bold white")
    if v.coded_width and (v.coded_width, v.coded_height) != (v.width, v.height):
        _add(table, "coded size", f"{v.coded_width}x{v.coded_height}")
    _add(table, "frame rate", f"{v.fps:.3f} fps  [{v.fps_raw}]" if v.fps else v.fps_raw)
    _add(
        table,
        "pixel format",
        f"{v.pix_fmt}  ({v.chroma}, {v.bit_depth}-bit)" if v.chroma else v.pix_fmt,
    )
    _add(table, "video bitrate", human_bitrate(v.bitrate), "bold white")
    if v.bits_per_pixel:
        _add(table, "bits per pixel", f"{v.bits_per_pixel:.4f}")
    _add(table, "aspect SAR/DAR", f"{v.sar or '-'} / {v.dar or '-'}")
    _add(table, "scan type", v.field_order)
    _add(table, "ref frames", v.refs)
    _add(table, "B-frame delay", v.has_b_frames)
    _add(table, "frames declared", f"{v.nb_frames:,}" if v.nb_frames else None)
    color = " / ".join(
        x
        for x in (v.color_range, v.color_space, v.color_primaries, v.color_transfer)
        if x
    )
    _add(table, "color", color or None, "bright_yellow" if v.is_hdr else None)
    _add(table, "encoder", v.tags.get("encoder"))
    _add(table, "language", v.tags.get("language"))
    return Panel(table, title="[b]video[/b]", border_style=ACCENT, box=box.ROUNDED)


def audio_panel(result: ProbeResult) -> Panel:
    if not result.audio and not result.other:
        return Panel(
            Text("no audio tracks", style="dim"),
            title="[b]audio[/b]",
            border_style="grey37",
            box=box.ROUNDED,
        )
    table = Table(box=box.SIMPLE_HEAD, expand=True, pad_edge=False, padding=(0, 1))
    table.add_column("#", style="grey62", width=3)
    table.add_column("codec", style="magenta")
    table.add_column("rate", justify="right")
    table.add_column("ch")
    table.add_column("bitrate", justify="right")
    table.add_column("lang")
    for a in result.audio:
        table.add_row(
            str(a.index),
            a.codec,
            f"{a.sample_rate:,}" if a.sample_rate else "-",
            a.layout or (str(a.channels) if a.channels else "-"),
            human_bitrate(a.bitrate),
            a.language or "-",
        )
    for o in result.other:
        table.add_row(
            str(o.index),
            f"[dim]{o.kind}:{o.codec}[/dim]",
            "-",
            "-",
            "-",
            o.language or "-",
        )
    return Panel(
        table,
        title="[b]audio & other tracks[/b]",
        border_style="magenta",
        box=box.ROUNDED,
    )


def frames_panel(result: ProbeResult) -> Panel:
    f = result.frames
    if not f:
        return Panel(
            Text("packet analysis not run", style="dim"),
            title="[b]stream behaviour[/b]",
            border_style="grey37",
            box=box.ROUNDED,
        )

    left = _kv_table()
    _add(
        left,
        "window analysed",
        f"{f.analysed_seconds:.1f} s  ({f.packet_count:,} packets)",
    )
    _add(left, "measured fps", f"{f.measured_fps:.3f}" if f.measured_fps else None)
    _add(left, "avg bitrate", human_bitrate(f.bitrate_avg))
    _add(
        left,
        "peak / min (1s)",
        f"{human_bitrate(f.bitrate_peak)}  /  {human_bitrate(f.bitrate_min)}",
    )
    if f.peak_to_avg:
        style = (
            "red"
            if f.peak_to_avg > 2.5
            else ("yellow" if f.peak_to_avg > 1.6 else "green")
        )
        _add(left, "peak-to-average", f"{f.peak_to_avg:.2f}x", style)
    if f.variability is not None:
        mode = (
            "CBR-like"
            if f.variability < 0.1
            else ("capped VBR" if f.variability < 0.3 else "VBR")
        )
        _add(left, "rate variability", f"{f.variability * 100:.1f}%  ({mode})")

    right = _kv_table()
    if f.gop_avg:
        gop_secs = f.gop_avg / f.measured_fps if f.measured_fps else None
        _add(
            right,
            "avg GOP",
            f"{f.gop_avg:.1f} frames" + (f"  ({gop_secs:.2f} s)" if gop_secs else ""),
        )
        _add(right, "GOP min/max", f"{min(f.gop_lengths)} / {max(f.gop_lengths)}")
    _add(right, "keyframes", f.keyframe_count)
    _add(right, "max B-frame run", f.max_b_run or None)
    if f.sizes:
        _add(
            right,
            "packet bytes",
            f"min {f.sizes['min']:,.0f} · avg {f.sizes['avg']:,.0f}"
            f" · max {f.sizes['max']:,.0f}",
        )
    if f.pts_gaps:
        _add(right, "timing gaps", f"{f.pts_gaps} (max {f.max_pts_gap:.3f} s)", "red")
    else:
        _add(right, "timing gaps", "none detected", "green")

    body: list = [side_by_side(left, right)]

    total = sum(f.pict_types.values()) or 1
    dist = Table(box=None, show_header=False, pad_edge=False, padding=(0, 1))
    dist.add_column(width=2)
    dist.add_column(width=20)
    dist.add_column(justify="right", width=14)
    colors = {"I": "bright_red", "P": "bright_blue", "B": "bright_green"}
    for ptype in ("I", "P", "B", "?"):
        count = f.pict_types.get(ptype)
        if not count:
            continue
        dist.add_row(
            Text(ptype, style=f"bold {colors.get(ptype, 'white')}"),
            bar(count / total, 18, colors.get(ptype, "white")),
            f"{count:,}  ({count / total * 100:.1f}%)",
        )
    if f.pict_types:
        body.append(Text("\nframe type mix", style="grey62"))
        body.append(dist)

    if f.bitrate_series:
        body.append(Text("\nbitrate over time (1 s buckets)", style="grey62"))
        body.append(sparkline(f.bitrate_series, width=68))
        body.append(
            Text(f"{human_bitrate(min(f.bitrate_series))}", style="grey50")
            + Text("  →  ", style="grey37")
            + Text(f"{human_bitrate(max(f.bitrate_series))} peak", style="grey50")
        )

    return Panel(
        Group(*body),
        title="[b]stream behaviour[/b]",
        border_style="green",
        box=box.ROUNDED,
    )


def quality_panel(quality: QualityResult, title: str = "quality vs reference") -> Panel:
    table = _kv_table()
    if quality.vmaf is not None:
        band, style = rate_vmaf(quality.vmaf)
        table.add_row(
            "VMAF",
            Text(f"{quality.vmaf:.2f}", style=f"bold {style}")
            + Text(f"   {band}", style=style),
        )
        if quality.vmaf_harmonic is not None:
            _add(table, "VMAF harmonic", f"{quality.vmaf_harmonic:.2f}")
        if quality.vmaf_min is not None:
            _add(table, "VMAF worst frame", f"{quality.vmaf_min:.2f}")
    if quality.psnr_y is not None:
        band, style = rate_psnr(quality.psnr_y)
        table.add_row(
            "PSNR (Y)",
            Text(f"{quality.psnr_y:.2f} dB", style=f"bold {style}")
            + Text(f"   {band}", style=style),
        )
        _add(
            table,
            "PSNR (avg)",
            f"{quality.psnr_avg:.2f} dB" if quality.psnr_avg else None,
        )
    if quality.ssim_y is not None:
        _add(table, "SSIM (Y)", f"{quality.ssim_y:.5f}")
        _add(
            table, "SSIM (all)", f"{quality.ssim_all:.5f}" if quality.ssim_all else None
        )
    _add(table, "frames compared", f"{quality.frames:,}" if quality.frames else None)
    if quality.scaled:
        _add(table, "note", "distorted rescaled to reference geometry", "grey62")
    for note in quality.notes:
        table.add_row("", Text(note, style="yellow"))
    if quality.empty and not quality.notes:
        table.add_row("", Text("no metrics produced", style="red"))
    return Panel(
        table, title=f"[b]{title}[/b]", border_style="bright_yellow", box=box.ROUNDED
    )


def render_probe(console: Console, result: ProbeResult) -> None:
    header = Text(result.container.url, style=f"bold {ACCENT}", overflow="ellipsis")
    flags = flag_line(result)
    console.print(
        Panel(
            Group(header, flags) if str(flags) else header,
            box=box.HEAVY,
            border_style=ACCENT,
            title="[b]vidprobe[/b]",
            title_align="left",
        )
    )
    console.print(side_by_side(container_panel(result), video_panel(result)))
    console.print(audio_panel(result))
    console.print(frames_panel(result))
    for warning in result.warnings:
        console.print(Text(f"  ! {warning}", style="yellow"))


# --------------------------------------------------------------------------- #
# compare view
# --------------------------------------------------------------------------- #
def diff_table(cmp: Comparison, only_diff: bool = False) -> Table:
    table = Table(
        box=box.SIMPLE_HEAD,
        expand=True,
        pad_edge=False,
        padding=(0, 1),
        header_style=f"bold {ACCENT}",
    )
    table.add_column("parameter", style="grey62", no_wrap=True, ratio=3)
    table.add_column(cmp.label_a, ratio=4, overflow="fold")
    table.add_column(cmp.label_b, ratio=4, overflow="fold")
    table.add_column("Δ", justify="right", ratio=2, style="grey62")

    rows = cmp.differences if only_diff else cmp.rows
    current_group = None
    for row in rows:
        if row.group != current_group:
            current_group = row.group
            table.add_section()
            table.add_row(
                Text(current_group.upper(), style="bold white on grey23"), "", "", ""
            )
        marker = "" if row.same else "•"
        a_style = b_style = "white" if row.same else "bold white"
        if row.winner == "a":
            a_style, b_style = "bold green", "white"
        elif row.winner == "b":
            a_style, b_style = "white", "bold green"
        delta_style = "grey62"
        if row.delta and row.winner:
            delta_style = "green" if row.winner == "b" else "red"
        table.add_row(
            Text(
                f"{marker} {row.label}".strip(), style="grey62" if row.same else "white"
            ),
            Text(row.a, style=a_style),
            Text(row.b, style=b_style),
            Text(row.delta, style=delta_style),
        )
    return table


def efficiency_table(cmp: Comparison) -> Table:
    table = Table(box=box.SIMPLE_HEAD, expand=True, header_style=f"bold {ACCENT}")
    table.add_column("metric", style="grey62", ratio=3)
    table.add_column(cmp.label_a, justify="right", ratio=3)
    table.add_column(cmp.label_b, justify="right", ratio=3)
    table.add_column("better", justify="center", ratio=2)

    va, vb = cmp.a.video, cmp.b.video
    qa, qb = cmp.quality_a, cmp.quality_b

    def add(label, a_val, b_val, fmt, higher_better=True):
        if a_val is None and b_val is None:
            return
        winner = "-"
        if (
            isinstance(a_val, (int, float))
            and isinstance(b_val, (int, float))
            and a_val != b_val
        ):
            better_is_a = (a_val > b_val) if higher_better else (a_val < b_val)
            winner = cmp.label_a if better_is_a else cmp.label_b
        table.add_row(
            label,
            fmt(a_val) if a_val is not None else "-",
            fmt(b_val) if b_val is not None else "-",
            Text(winner, style="bold green" if winner != "-" else "grey37"),
        )

    add(
        "video bitrate",
        va.bitrate if va else None,
        vb.bitrate if vb else None,
        human_bitrate,
        higher_better=False,
    )
    add(
        "file size",
        cmp.a.container.size,
        cmp.b.container.size,
        human_size,
        higher_better=False,
    )
    add(
        "bits per pixel",
        va.bits_per_pixel if va else None,
        vb.bits_per_pixel if vb else None,
        lambda v: f"{v:.4f}",
        higher_better=False,
    )
    if qa or qb:
        add(
            "VMAF",
            qa.vmaf if qa else None,
            qb.vmaf if qb else None,
            lambda v: f"{v:.2f}",
        )
        add(
            "VMAF worst frame",
            qa.vmaf_min if qa else None,
            qb.vmaf_min if qb else None,
            lambda v: f"{v:.2f}",
        )
        add(
            "PSNR (Y)",
            qa.psnr_y if qa else None,
            qb.psnr_y if qb else None,
            lambda v: f"{v:.2f} dB",
        )
        add(
            "SSIM (Y)",
            qa.ssim_y if qa else None,
            qb.ssim_y if qb else None,
            lambda v: f"{v:.5f}",
        )
        add(
            "VMAF per Mb/s",
            quality_per_mbit(qa, va.bitrate if va else None),
            quality_per_mbit(qb, vb.bitrate if vb else None),
            lambda v: f"{v:.1f}",
        )
    return table


def render_compare(cmp: Comparison, console: Console, only_diff: bool = False) -> None:
    subtitle = (
        f"reference: {cmp.reference}" if cmp.reference else "no external reference"
    )
    console.print(
        Panel(
            Text.assemble(
                (f"A  {cmp.a.container.url}\n", "bold cyan"),
                (f"B  {cmp.b.container.url}", "bold magenta"),
            ),
            title="[b]encode comparison[/b]",
            subtitle=subtitle,
            title_align="left",
            border_style=ACCENT,
            box=box.HEAVY,
        )
    )

    console.print(
        side_by_side(
            Panel(
                _summary(cmp.a),
                title=f"[b cyan]{cmp.label_a}[/b cyan]",
                border_style="cyan",
                box=box.ROUNDED,
            ),
            Panel(
                _summary(cmp.b),
                title=f"[b magenta]{cmp.label_b}[/b magenta]",
                border_style="magenta",
                box=box.ROUNDED,
            ),
        )
    )

    console.print(
        Panel(
            diff_table(cmp, only_diff),
            title="[b]parameter diff[/b]"
            + (" (differences only)" if only_diff else ""),
            border_style="grey37",
            box=box.ROUNDED,
        )
    )

    panels = []
    if cmp.quality_a and not cmp.quality_a.empty:
        panels.append(quality_panel(cmp.quality_a, f"{cmp.label_a} quality"))
    if cmp.quality_b and not cmp.quality_b.empty:
        panels.append(quality_panel(cmp.quality_b, f"{cmp.label_b} quality"))
    if panels:
        console.print(side_by_side(*panels))

    console.print(
        Panel(
            efficiency_table(cmp),
            title="[b]efficiency scoreboard[/b]",
            border_style="bright_yellow",
            box=box.ROUNDED,
        )
    )

    if cmp.verdict:
        body = Text()
        for note in cmp.verdict:
            body.append("  • ", style=ACCENT)
            body.append(note + "\n")
        console.print(
            Panel(body, title="[b]verdict[/b]", border_style="green", box=box.ROUNDED)
        )

    for result, label in ((cmp.a, cmp.label_a), (cmp.b, cmp.label_b)):
        for warning in result.warnings:
            console.print(Text(f"  ! [{label}] {warning}", style="yellow"))


def _summary(result: ProbeResult) -> Group:
    v = result.video
    f = result.frames
    table = _kv_table()
    if v:
        _add(table, "codec", f"{v.codec} {v.profile or ''}".strip())
        _add(
            table,
            "resolution",
            f"{v.resolution} @ {v.fps:.2f} fps" if v.fps else v.resolution,
        )
        _add(table, "bitrate", human_bitrate(v.bitrate))
        _add(table, "pixel format", v.pix_fmt)
        _add(table, "encoder", v.tags.get("encoder"))
    _add(table, "size", human_size(result.container.size))
    _add(table, "duration", human_duration(result.container.duration))
    parts: list = [flag_line(result), table]
    if f and f.bitrate_series:
        parts.append(sparkline(f.bitrate_series, width=34))
    return Group(*[p for p in parts if str(p)])


# --------------------------------------------------------------------------- #
# stream filtering / editing views
# --------------------------------------------------------------------------- #
KIND_STYLE = {
    "video": "bright_cyan",
    "audio": "magenta",
    "subtitle": "bright_yellow",
    "attachment": "grey62",
    "data": "grey62",
}


def stream_plan_table(plan, title: str = "stream plan") -> Panel:
    """Keep/drop decision for every stream, with the reason."""
    table = Table(
        box=box.SIMPLE_HEAD,
        expand=True,
        pad_edge=False,
        padding=(0, 1),
        header_style=f"bold {ACCENT}",
    )
    table.add_column("", width=3, justify="center")
    table.add_column("#", style="grey62", width=3, justify="right")
    table.add_column("type", ratio=2)
    table.add_column("lang", ratio=2)
    table.add_column("details", ratio=5, overflow="fold")
    table.add_column("flags", ratio=3, overflow="fold")
    table.add_column("reason", ratio=4, overflow="fold")

    for decision in plan.decisions:
        stream = decision.stream
        mark = (
            Text("✓", style="bold green")
            if decision.keep
            else Text("✗", style="bold red")
        )
        row_style = None if decision.keep else "grey42"
        title_txt = f"{stream.descriptor}"
        if stream.title:
            title_txt += f"  “{stream.title}”"
        table.add_row(
            mark,
            str(stream.index),
            Text(stream.kind, style=KIND_STYLE.get(stream.kind, "white")),
            Text(
                stream.norm_language,
                style="grey50" if stream.norm_language == "und" else "white",
            ),
            title_txt,
            Text(", ".join(stream.flags), style="grey62"),
            Text(decision.reason, style="grey62" if decision.keep else "red"),
        )
        if row_style:
            table.rows[-1].style = row_style

    body: list = [table]
    kept, dropped = len(plan.kept), len(plan.dropped)
    summary = Text()
    summary.append(f"  keeping {kept}", style="green")
    summary.append(f"   dropping {dropped}", style="red" if dropped else "grey50")
    body.append(summary)
    for note in plan.notes:
        body.append(Text(f"  · {note}", style="yellow"))
    return Panel(
        Group(*body), title=f"[b]{title}[/b]", border_style="grey37", box=box.ROUNDED
    )


def command_panel(cmd: list[str], title: str = "command") -> Panel:
    from vidprobe.edit import quote_cmd

    return Panel(
        Text(quote_cmd(cmd), style="grey62"),
        title=f"[b]{title}[/b]",
        border_style="grey37",
        box=box.ROUNDED,
    )


def render_operation(
    console: Console,
    result,
    source: str | None = None,
    label: str = "done",
    show_command: bool = False,
) -> None:
    """Report the outcome of one ffmpeg transform."""
    if not result.ok:
        console.print(
            Panel(
                Text(result.error_tail, style="red"),
                title="[b red]ffmpeg failed[/b red]",
                border_style="red",
                box=box.ROUNDED,
            )
        )
        if show_command:
            console.print(command_panel(result.cmd))
        return

    table = _kv_table()
    _add(table, "output", result.output)
    if result.output_size is not None:
        line = human_size(result.output_size)
        if source and os.path.isfile(source):
            before = os.path.getsize(source)
            if before:
                change = (result.output_size - before) / before * 100
                style = "green" if change < 0 else "yellow"
                line += f"   (was {human_size(before)}, {change:+.1f}%)"
                table.add_row("size", Text(line, style=style))
            else:
                _add(table, "size", line)
        else:
            _add(table, "size", line)
    _add(table, "elapsed", f"{result.wall_time:.2f} s")
    if result.speed:
        _add(table, "speed", f"{result.speed:.1f}x realtime")
    if result.frames:
        _add(table, "frames", f"{result.frames:,}")
    _add(table, "build", result.build)
    console.print(
        Panel(
            table,
            title=f"[b green]{label}[/b green]",
            border_style="green",
            box=box.ROUNDED,
        )
    )
    if show_command:
        console.print(command_panel(result.cmd))


def render_thumbs(console: Console, result, outdir: str) -> None:
    if result.run and not result.run.ok:
        console.print(
            Panel(
                Text(result.run.error_tail, style="red"),
                title="[b red]ffmpeg failed[/b red]",
                border_style="red",
                box=box.ROUNDED,
            )
        )
        return
    table = _kv_table()
    _add(table, "mode", result.mode)
    _add(table, "output dir", outdir)
    _add(table, "images", f"{result.count:,}")
    if result.count:
        _add(table, "total size", human_size(result.total_bytes))
        _add(table, "average", human_size(result.total_bytes / result.count))
    if getattr(result, "vtt", None):
        _add(table, "webvtt", result.vtt)
    if getattr(result, "tiles", None):
        _add(
            table, "tiles", f"{result.tiles} @ {result.tile_width}x{result.tile_height}"
        )
        _add(table, "grid", f"{result.columns}x{result.rows} per sheet")
        _add(table, "interval", f"{result.interval:.2f} s")
    if result.run:
        _add(table, "elapsed", f"{result.run.wall_time:.2f} s")
    for note in result.notes:
        table.add_row("", Text(note, style="grey62"))

    body: list = [table]
    if result.files:
        listing = Table(box=None, show_header=False, pad_edge=False, padding=(0, 1))
        listing.add_column(style="grey62")
        listing.add_column(justify="right", style="grey50")
        shown = result.files[:8]
        for path in shown:
            size = os.path.getsize(path) if os.path.isfile(path) else 0
            listing.add_row(os.path.basename(path), human_size(size))
        if len(result.files) > len(shown):
            listing.add_row(f"... {len(result.files) - len(shown)} more", "")
        body.append(Text("\nfiles", style="grey62"))
        body.append(listing)

    console.print(
        Panel(
            Group(*body),
            title="[b]thumbnails[/b]",
            border_style="green",
            box=box.ROUNDED,
        )
    )


# --------------------------------------------------------------------------- #
# build management
# --------------------------------------------------------------------------- #
def builds_table(entries: list[dict], config_path=None) -> Panel:
    table = Table(
        box=box.SIMPLE_HEAD,
        expand=True,
        pad_edge=False,
        padding=(0, 1),
        header_style=f"bold {ACCENT}",
    )
    table.add_column("", width=3, justify="center")
    table.add_column("name", ratio=3)
    table.add_column("version", ratio=4, overflow="fold")
    table.add_column("path", ratio=5, overflow="fold")
    table.add_column("notable", ratio=4, overflow="fold")
    for entry in entries:
        ok = entry["available"]
        table.add_row(
            Text("●" if ok else "○", style="green" if ok else "red"),
            Text(
                entry["name"] + (" *" if entry.get("default") else ""),
                style="bold white" if ok else "grey42",
            ),
            Text(entry.get("version") or "not found", style="white" if ok else "red"),
            Text(entry.get("path") or entry.get("configured", ""), style="grey62"),
            Text(entry.get("notable", ""), style="grey62"),
        )
    subtitle = f"config: {config_path}" if config_path else "no config file loaded"
    return Panel(
        table,
        title="[b]ffmpeg builds[/b]",
        subtitle=subtitle,
        border_style=ACCENT,
        box=box.ROUNDED,
    )


def bench_table(rows: list[dict], task: str) -> Panel:
    """Race results across builds, normalised against the fastest."""
    table = Table(
        box=box.SIMPLE_HEAD,
        expand=True,
        pad_edge=False,
        padding=(0, 1),
        header_style=f"bold {ACCENT}",
    )
    table.add_column("build", ratio=4)
    table.add_column("runs", justify="right", ratio=2)
    table.add_column("best", justify="right", ratio=3)
    table.add_column("median", justify="right", ratio=3)
    table.add_column("speed", justify="right", ratio=3)
    table.add_column("output", justify="right", ratio=3)
    table.add_column("relative", justify="right", ratio=3)

    ok_rows = [r for r in rows if r.get("best") is not None]
    fastest = min((r["best"] for r in ok_rows), default=None)

    for row in rows:
        if row.get("best") is None:
            table.add_row(
                Text(row["build"], style="grey42"),
                "-",
                "-",
                "-",
                "-",
                "-",
                Text(row.get("error", "failed")[:28], style="red"),
            )
            continue
        ratio = row["best"] / fastest if fastest else 1.0
        # run-to-run noise is easily a couple of percent, so do not dress up a
        # 1.004x difference as a real result
        if ratio <= 1.001:
            rel, style = "fastest", "bold green"
        elif ratio <= 1.02:
            rel, style = "tie", "green"
        else:
            rel, style = f"{ratio:.2f}x slower", "yellow" if ratio < 1.25 else "red"
        table.add_row(
            Text(row["build"], style="bold white"),
            str(row["runs"]),
            f"{row['best']:.2f} s",
            f"{row['median']:.2f} s",
            f"{row['speed']:.1f}x" if row.get("speed") else "-",
            human_size(row.get("size")) if row.get("size") else "-",
            Text(rel, style=style),
        )
    return Panel(
        table,
        title=f"[b]benchmark[/b] · {task}",
        border_style="bright_yellow",
        box=box.ROUNDED,
    )


def capabilities_panel(
    name: str, info: dict, highlight: list[str] | None = None
) -> Panel:
    table = _kv_table()
    _add(table, "version", info.get("version"))
    hwaccels = info.get("hwaccels") or []
    _add(table, "hwaccels", ", ".join(hwaccels) if hwaccels else "none")
    flags = info.get("configuration") or []
    _add(table, "enabled flags", f"{len(flags)}")
    wanted = highlight or [
        "libvmaf",
        "libx264",
        "libx265",
        "libsvtav1",
        "libaom",
        "libvpx",
        "nvenc",
        "vaapi",
        "qsv",
        "libfdk",
    ]
    # Some distros enable hwaccels without a matching --enable- flag, so a
    # capability counts as present if either source mentions it.
    haystack = list(flags) + list(hwaccels)
    found = [w for w in wanted if any(w in item for item in haystack)]
    missing = [w for w in wanted if w not in found]
    if found:
        table.add_row("present", Text(", ".join(found), style="green"))
    if missing:
        table.add_row("absent", Text(", ".join(missing), style="grey50"))
    return Panel(table, title=f"[b]{name}[/b]", border_style=ACCENT, box=box.ROUNDED)


# --------------------------------------------------------------------------- #
# ABR ladder views
# --------------------------------------------------------------------------- #
LEVEL_MARK = {
    "ok": ("✓", "green"),
    "warn": ("!", "yellow"),
    "fail": ("✗", "red"),
    "info": ("·", "grey62"),
}


def checks_panel(checks, title: str = "findings") -> Panel:
    """Render analysis verdicts, worst first."""
    order = {"fail": 0, "warn": 1, "ok": 2, "info": 3}
    body = Table(
        box=None, show_header=False, pad_edge=False, padding=(0, 1), expand=True
    )
    body.add_column(width=2, justify="center")
    body.add_column(ratio=1, overflow="fold")

    for check in sorted(checks, key=lambda c: order.get(c.level, 9)):
        mark, style = LEVEL_MARK.get(check.level, ("·", "white"))
        text = Text()
        text.append(
            check.title + "\n",
            style=f"bold {style}" if check.level != "info" else "bold white",
        )
        if check.detail:
            text.append(check.detail, style="grey62")
        body.add_row(Text(mark, style=style), text)

    counts = {
        level: sum(1 for c in checks if c.level == level)
        for level in ("fail", "warn", "ok")
    }
    subtitle = (
        f"{counts['fail']} failed · {counts['warn']} warnings · {counts['ok']} passed"
    )
    border = "red" if counts["fail"] else ("yellow" if counts["warn"] else "green")
    return Panel(
        body,
        title=f"[b]{title}[/b]",
        subtitle=subtitle,
        border_style=border,
        box=box.ROUNDED,
    )


def ladder_table(ladder) -> Panel:
    """The rungs, what they declare, and what they actually deliver."""
    table = Table(
        box=box.SIMPLE_HEAD,
        expand=True,
        pad_edge=False,
        padding=(0, 1),
        header_style=f"bold {ACCENT}",
    )
    table.add_column("rung", ratio=3, overflow="fold")
    table.add_column("resolution", ratio=3)
    table.add_column("codec", ratio=3, overflow="fold")
    table.add_column("declared", justify="right", ratio=3)
    table.add_column("measured", justify="right", ratio=3)
    table.add_column("peak", justify="right", ratio=3)
    table.add_column("bits/px", justify="right", ratio=2)
    table.add_column("step", justify="right", ratio=2)
    table.add_column("GOP", justify="right", ratio=2)

    rungs = ladder.ordered
    previous = None
    for variant in rungs:
        declared = variant.bandwidth
        measured = variant.measured_bitrate
        peak = variant.measured_peak
        under = bool(declared and peak and peak > declared * 1.05)

        step = ""
        if previous is not None:
            low = previous.effective_bandwidth
            high = variant.effective_bandwidth
            if low and high:
                step = f"{high / low:.2f}x"
        codec = variant.codecs or (
            variant.probe.video.codec if variant.probe and variant.probe.video else "-"
        )
        table.add_row(
            Text(variant.label, style="bold white"),
            variant.resolution
            + (f" @{variant.frame_rate:g}" if variant.frame_rate else ""),
            Text(str(codec)[:24], style="grey62"),
            human_bitrate(declared) if declared else "-",
            human_bitrate(measured) if measured else "-",
            Text(
                human_bitrate(peak) if peak else "-", style="red" if under else "white"
            ),
            f"{variant.bits_per_pixel:.4f}" if variant.bits_per_pixel else "-",
            step,
            f"{variant.gop_seconds:.2f}s" if variant.gop_seconds else "-",
        )
        previous = variant

    body: list = [table]
    errored = [v for v in ladder.variants if v.error]
    for variant in errored:
        body.append(Text(f"  ! {variant.label}: {variant.error}", style="red"))
    for note in ladder.notes:
        body.append(Text(f"  · {note}", style="grey62"))

    subtitle = f"{ladder.kind.upper()} · {ladder.source}"
    return Panel(
        Group(*body),
        title="[b]ABR ladder[/b]",
        subtitle=subtitle[:96],
        border_style=ACCENT,
        box=box.ROUNDED,
    )


def quality_curve_panel(ladder) -> Panel | None:
    """Rate-quality curve across the ladder, with efficiency per rung."""
    scored = [
        v
        for v in ladder.ordered
        if v.quality and (v.quality.vmaf is not None or v.quality.psnr_y is not None)
    ]
    if not scored:
        return None
    use_vmaf = all(v.quality.vmaf is not None for v in scored)
    metric = "VMAF" if use_vmaf else "PSNR (Y)"

    def score(variant):
        return variant.quality.vmaf if use_vmaf else variant.quality.psnr_y

    table = Table(
        box=box.SIMPLE_HEAD,
        expand=True,
        pad_edge=False,
        padding=(0, 1),
        header_style=f"bold {ACCENT}",
    )
    table.add_column("rung", ratio=3)
    table.add_column("bitrate", justify="right", ratio=3)
    table.add_column(metric, justify="right", ratio=2)
    table.add_column("", ratio=5)
    table.add_column("Δ", justify="right", ratio=2)
    table.add_column("per Mb/s", justify="right", ratio=3)

    ceiling = 100.0 if use_vmaf else max(score(v) for v in scored) * 1.05
    previous = None
    for variant in scored:
        value = score(variant)
        rate = variant.effective_bandwidth
        delta = ""
        delta_style = "grey62"
        if previous is not None:
            change = value - score(previous)
            delta = f"{change:+.2f}"
            if change < 0:
                delta_style = "red"
            elif change < (1.0 if use_vmaf else 0.3):
                delta_style = "yellow"
            else:
                delta_style = "green"
        efficiency = (value / (rate / 1_000_000)) if rate else None
        style = (
            "bright_green"
            if use_vmaf and value >= 90
            else ("yellow" if use_vmaf and value >= 70 else "white")
        )
        table.add_row(
            Text(variant.label, style="bold white"),
            human_bitrate(rate) if rate else "-",
            Text(f"{value:.2f}", style=style),
            bar(value / ceiling, 20, style),
            Text(delta, style=delta_style),
            f"{efficiency:.1f}" if efficiency else "-",
        )
        previous = variant
    return Panel(
        table,
        title="[b]rate-quality curve[/b]",
        border_style="bright_yellow",
        box=box.ROUNDED,
    )


def alignment_panel(report) -> Panel:
    """Per-rung keyframe alignment against the reference rung."""
    table = Table(
        box=box.SIMPLE_HEAD,
        expand=True,
        pad_edge=False,
        padding=(0, 1),
        header_style=f"bold {ACCENT}",
    )
    table.add_column("", width=3, justify="center")
    table.add_column("rung", ratio=4)
    table.add_column("keyframes", justify="right", ratio=3)
    table.add_column("median GOP", justify="right", ratio=3)
    table.add_column("matched", justify="right", ratio=3)
    table.add_column("max drift", justify="right", ratio=3)

    for row in report.rows:
        ok = row["aligned"]
        drift_ms = row["max_drift"] * 1000
        table.add_row(
            Text("✓" if ok else "✗", style="green" if ok else "red"),
            Text(row["variant"], style="bold white"),
            str(row["keyframes"]),
            f"{row['gop']:.2f}s" if row["gop"] else "-",
            f"{row['matched']}/{row['total']}",
            Text(f"{drift_ms:.0f} ms", style="green" if drift_ms <= 50 else "red"),
        )

    body: list = [table]
    if report.common_points:
        preview = ", ".join(f"{t:.2f}" for t in report.common_points[:10])
        more = (
            ""
            if len(report.common_points) <= 10
            else f" (+{len(report.common_points) - 10} more)"
        )
        body.append(Text(f"\nshared switch points: {preview}{more}", style="grey62"))
    else:
        body.append(Text("\nno switch point is shared by every rendition", style="red"))

    border = "green" if report.switchable else "red"
    subtitle = f"reference rung: {report.reference}" if report.reference else ""
    return Panel(
        Group(*body),
        title="[b]switch point alignment[/b]",
        subtitle=subtitle,
        border_style=border,
        box=box.ROUNDED,
    )


def switch_panel(report) -> Panel:
    table = _kv_table()
    _add(table, "switching", f"{report.lower}  →  {report.upper}")
    _add(table, "requested at", f"{report.at:.3f} s")
    if report.switch_point is not None:
        _add(table, "switch point", f"{report.switch_point:.3f} s")
    if report.drift is not None:
        _add(
            table,
            "keyframe drift",
            Text(
                f"{report.drift * 1000:.0f} ms",
                style="green" if report.aligned else "red",
            ),
        )
    if getattr(report, "usable_point", None) is not None:
        _add(
            table,
            "nearest usable point",
            Text(f"{report.usable_point:.3f} s", style="yellow"),
        )
    _add(table, "window each side", f"{report.window:g} s")

    metric = report.metric
    before = report.quality_before
    after = report.quality_after
    if before and after:
        value_before = before.vmaf if metric == "VMAF" else before.psnr_y
        value_after = after.vmaf if metric == "VMAF" else after.psnr_y
        if value_before is not None and value_after is not None:
            unit = "" if metric == "VMAF" else " dB"
            table.add_row(f"{metric} before", f"{value_before:.2f}{unit}")
            table.add_row(f"{metric} after", f"{value_after:.2f}{unit}")
            step = value_after - value_before
            style = "green" if abs(step) <= (6 if metric == "VMAF" else 2) else "yellow"
            table.add_row(
                "step across switch", Text(f"{step:+.2f}{unit}", style=f"bold {style}")
            )
    if report.output:
        _add(table, "spliced clip", report.output)

    return Panel(
        table,
        title="[b]switch simulation[/b]",
        border_style="green" if report.aligned else "red",
        box=box.ROUNDED,
    )
