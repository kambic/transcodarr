"""Typer command line interface."""

from __future__ import annotations

import json
import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import typer
from rich import box as _box
from rich.console import Console
from rich.panel import Panel as _Panel
from rich.text import Text

from . import __version__
from .bench import BenchTask, run_bench
from .compare import compare as build_comparison
from .config import (
    SAMPLE_CONFIG,
    Build,
    ConfigError,
    LanguagePolicy,
    load_config,
    normalize_language,
)
from .edit import (
    CutSpec,
    Metadata,
    apply_plan,
    cut as cut_segment,
    derive_output,
    edit_metadata,
    format_timecode,
    nearest_keyframe,
    parse_kv,
    parse_stream_kv,
    parse_timecode,
    read_tags,
)
from .ffmpeg import (
    FFmpegNotFound,
    ProbeError,
    build_capabilities,
    set_active_build,
    using_build,
    versions,
)
from .models import ProbeResult
from .probe import probe as probe_input
from .quality import ALL_METRICS, measure, vmaf_available
from .render import (
    _kv_table,
    alignment_panel,
    bench_table,
    builds_table,
    capabilities_panel,
    checks_panel,
    command_panel,
    ladder_table,
    make_console,
    render_compare,
    render_operation,
    render_probe,
    render_thumbs,
    quality_curve_panel,
    stream_plan_table,
    switch_panel,
)
from .abr import (
    analyse_alignment,
    analyse_ladder,
    analyse_quality_curve,
    build_switch_clip,
    fill_variant,
    find_switch_point,
    load_ladder,
    summarise_switch,
    SwitchReport,
)
from .streams import Decision, Plan, list_streams, plan_audio, plan_languages
from .thumbs import ThumbMode, generate_sprite, generate_thumbnails, media_geometry

app = typer.Typer(
    name="vidprobe",
    help="Probe video streams, measure quality, compare encodes and run common "
    "FFmpeg edits - across several FFmpeg builds.",
    no_args_is_help=True,
    rich_markup_mode="rich",
    context_settings={"help_option_names": ["-h", "--help"]},
)
config_app = typer.Typer(
    help="Inspect and create configuration files.", no_args_is_help=True
)
app.add_typer(config_app, name="config")
abr_app = typer.Typer(
    help="Analyse ABR ladders: rung structure, switch-point alignment and "
    "switching quality.",
    no_args_is_help=True,
)
app.add_typer(abr_app, name="abr")


# --------------------------------------------------------------------------- #
# shared state
# --------------------------------------------------------------------------- #
@dataclass
class State:
    config: object
    console: Console
    build: Build
    dry_run: bool = False
    show_command: bool = False


def get_state(ctx: typer.Context) -> State:
    return ctx.obj


def fail(console: Console, message: str, code: int = 2) -> None:
    console.print(Text(f"error: {message}", style="bold red"))
    raise typer.Exit(code)


def guard_output(console: Console, source: str, output: str) -> None:
    try:
        same = os.path.exists(output) and os.path.samefile(source, output)
    except OSError:
        same = os.path.abspath(source) == os.path.abspath(output)
    if same:
        fail(console, "output would overwrite the input; pass a different -o/--output")


def _version_callback(value: bool) -> None:
    if value:
        typer.echo(f"vidprobe {__version__}")
        raise typer.Exit()


@app.callback()
def main_callback(
    ctx: typer.Context,
    config: Optional[Path] = typer.Option(
        None,
        "--config",
        "-c",
        dir_okay=False,
        help="Config file (default: search the standard locations).",
    ),
    build: Optional[str] = typer.Option(
        None,
        "--build",
        "-B",
        metavar="NAME",
        help="Which configured FFmpeg build to use for this run.",
    ),
    dry_run: bool = typer.Option(
        False, "--dry-run", help="Print what would run without touching any files."
    ),
    show_command: bool = typer.Option(
        False, "--show-command", "-v", help="Print the ffmpeg command that was used."
    ),
    no_color: bool = typer.Option(False, "--no-color", help="Disable ANSI colour."),
    width: Optional[int] = typer.Option(None, "--width", help="Force console width."),
    _version: Optional[bool] = typer.Option(
        None,
        "--version",
        callback=_version_callback,
        is_eager=True,
        help="Show the version and exit.",
    ),
) -> None:
    """Global options - place these before the command name."""
    console = make_console(no_color=no_color, width=width)
    try:
        loaded = load_config(config)
        selected = loaded.build(build)
    except ConfigError as exc:
        fail(console, str(exc))
        return
    set_active_build(selected)
    ctx.obj = State(
        config=loaded,
        console=console,
        build=selected,
        dry_run=dry_run,
        show_command=show_command,
    )


# --------------------------------------------------------------------------- #
# probe / compare / monitor
# --------------------------------------------------------------------------- #
@app.command()
def probe(
    ctx: typer.Context,
    url: str = typer.Argument(
        ..., help="File path or stream URL (rtsp/rtmp/srt/http/udp)."
    ),
    duration: float = typer.Option(
        10.0, "--duration", "-d", help="Seconds of packets to analyse."
    ),
    quick: bool = typer.Option(
        False, "--quick", "-q", help="Metadata only, skip the packet-level pass."
    ),
    json_out: Optional[Path] = typer.Option(
        None, "--json", help="Write the report as JSON."
    ),
    raw: bool = typer.Option(
        False, "--raw", help="Include raw ffprobe output in the JSON."
    ),
    timeout: Optional[float] = typer.Option(
        None, "--timeout", help="Network timeout (s)."
    ),
    analyze: Optional[float] = typer.Option(
        None, "--analyze", help="analyzeduration (s)."
    ),
) -> None:
    """Inspect one file or live stream and report every parameter available."""
    state = get_state(ctx)
    console = state.console
    with console.status(f"[cyan]probing {url} ...[/cyan]", spinner="dots"):
        result = probe_input(
            url,
            duration=duration,
            timeout=timeout if timeout is not None else state.config.timeout,
            analyze=analyze if analyze is not None else state.config.analyze,
            deep=not quick,
        )
    render_probe(console, result)
    if json_out:
        Path(json_out).write_text(
            json.dumps(result.to_dict(include_raw=raw), indent=2, default=str),
            encoding="utf-8",
        )
        console.print(f"[green]wrote[/green] {json_out}")


@app.command()
def compare(
    ctx: typer.Context,
    a: str = typer.Argument(..., help="First input (encoding config A)."),
    b: str = typer.Argument(..., help="Second input (encoding config B)."),
    reference: Optional[str] = typer.Option(
        None,
        "--reference",
        "-r",
        help="Original source; scores both encodes against it.",
    ),
    metrics: str = typer.Option(
        "vmaf,psnr,ssim", "--metrics", "-m", help="Comma separated: vmaf,psnr,ssim."
    ),
    no_quality: bool = typer.Option(
        False, "--no-quality", help="Parameters only, skip pixel metrics."
    ),
    duration: float = typer.Option(
        10.0, "--duration", "-d", help="Seconds of packets to analyse per input."
    ),
    qduration: float = typer.Option(
        20.0, "--qduration", help="Seconds of video to score (0 = all)."
    ),
    threads: int = typer.Option(0, "--threads", help="libvmaf worker threads."),
    qtimeout: float = typer.Option(900.0, "--qtimeout", help="Quality timeout (s)."),
    diff_only: bool = typer.Option(
        False, "--diff-only", help="Hide identical parameters."
    ),
    quick: bool = typer.Option(
        False, "--quick", "-q", help="Skip packet-level analysis."
    ),
    label_a: Optional[str] = typer.Option(
        None, "--label-a", help="Display name for A."
    ),
    label_b: Optional[str] = typer.Option(
        None, "--label-b", help="Display name for B."
    ),
    json_out: Optional[Path] = typer.Option(
        None, "--json", help="Write the comparison as JSON."
    ),
) -> None:
    """Compare two encoding configurations side by side."""
    state = get_state(ctx)
    console = state.console
    timeout, analyze = state.config.timeout, state.config.analyze

    with console.status("[cyan]probing A ...[/cyan]", spinner="dots"):
        result_a = probe_input(
            a, duration=duration, timeout=timeout, analyze=analyze, deep=not quick
        )
    with console.status("[cyan]probing B ...[/cyan]", spinner="dots"):
        result_b = probe_input(
            b, duration=duration, timeout=timeout, analyze=analyze, deep=not quick
        )

    quality_a = quality_b = None
    score_seconds = None if qduration == 0 else qduration
    if not no_quality:
        if result_a.container.live or result_b.container.live:
            console.print(
                "[yellow]live input detected - quality metrics need seekable, "
                "frame-aligned sources; skipping[/yellow]"
            )
        else:
            wanted = tuple(m.strip().lower() for m in metrics.split(",") if m.strip())
            unknown = [m for m in wanted if m not in ALL_METRICS]
            if unknown:
                console.print(
                    f"[yellow]ignoring unknown metric(s): {', '.join(unknown)}[/yellow]"
                )
            wanted = tuple(m for m in wanted if m in ALL_METRICS)
            if wanted:
                try:
                    quality_a, quality_b = _measure_pair(
                        console,
                        a,
                        b,
                        reference,
                        wanted,
                        score_seconds,
                        threads,
                        qtimeout,
                        timeout,
                        analyze,
                        result_a,
                    )
                except (ProbeError, ValueError) as exc:
                    console.print(f"[red]quality measurement failed:[/red] {exc}")

    comparison = build_comparison(
        result_a,
        result_b,
        label_a=label_a or Path(a).name[:34] or "A",
        label_b=label_b or Path(b).name[:34] or "B",
        quality_a=quality_a,
        quality_b=quality_b,
        reference=reference,
    )
    render_compare(comparison, console, only_diff=diff_only)

    if json_out:
        payload = {
            "a": result_a.to_dict(),
            "b": result_b.to_dict(),
            "labels": {"a": comparison.label_a, "b": comparison.label_b},
            "reference": reference,
            "quality": {
                "a": quality_a.__dict__ if quality_a else None,
                "b": quality_b.__dict__ if quality_b else None,
            },
            "differences": [row.__dict__ for row in comparison.differences],
            "verdict": comparison.verdict,
        }
        Path(json_out).write_text(
            json.dumps(payload, indent=2, default=str), encoding="utf-8"
        )
        console.print(f"[green]wrote[/green] {json_out}")


def _measure_pair(
    console,
    a,
    b,
    reference,
    metrics,
    qduration,
    threads,
    qtimeout,
    timeout,
    analyze,
    result_a: ProbeResult,
):
    if reference:
        with console.status("[cyan]probing reference ...[/cyan]", spinner="dots"):
            ref = probe_input(reference, timeout=timeout, analyze=analyze, deep=False)
        geometry = (
            ref.video.width if ref.video else None,
            ref.video.height if ref.video else None,
            ref.video.fps if ref.video else None,
        )
        out = []
        for path, label in ((a, "A"), (b, "B")):
            with console.status(
                f"[cyan]measuring {label} against reference ...[/cyan]", spinner="dots"
            ):
                out.append(
                    measure(
                        path,
                        reference,
                        metrics=metrics,
                        duration=qduration,
                        width=geometry[0],
                        height=geometry[1],
                        fps=geometry[2],
                        threads=threads,
                        timeout=qtimeout,
                    )
                )
        return out[0], out[1]

    geometry = (
        result_a.video.width if result_a.video else None,
        result_a.video.height if result_a.video else None,
        result_a.video.fps if result_a.video else None,
    )
    with console.status("[cyan]measuring B against A ...[/cyan]", spinner="dots"):
        quality_b = measure(
            b,
            a,
            metrics=metrics,
            duration=qduration,
            width=geometry[0],
            height=geometry[1],
            fps=geometry[2],
            threads=threads,
            timeout=qtimeout,
        )
    quality_b.notes.append(
        "A was used as the reference; scores are relative, not absolute"
    )
    return None, quality_b


@app.command()
def monitor(
    ctx: typer.Context,
    url: str = typer.Argument(..., help="Stream URL to follow."),
    duration: Optional[float] = typer.Option(
        None, "--duration", "-d", help="Stop after N seconds."
    ),
    decode: bool = typer.Option(
        False, "--decode", help="Decode video for true frame/fps/drop counters."
    ),
    timeout: Optional[float] = typer.Option(
        None, "--timeout", help="Network timeout (s)."
    ),
) -> None:
    """Live dashboard for a running stream."""
    from .monitor import monitor as run_monitor

    state = get_state(ctx)
    run_monitor(
        url,
        state.console,
        duration=duration,
        timeout=timeout if timeout is not None else state.config.timeout,
        decode=decode,
    )


# --------------------------------------------------------------------------- #
# stream filtering
# --------------------------------------------------------------------------- #
@app.command("strip-langs")
def strip_langs(
    ctx: typer.Context,
    source: str = typer.Argument(..., help="Input file."),
    output: Optional[Path] = typer.Option(
        None, "--output", "-o", help="Output file or directory."
    ),
    lang: Optional[list[str]] = typer.Option(
        None,
        "--lang",
        "-l",
        help="Language to keep (repeatable). Overrides the config preference list.",
    ),
    kinds: str = typer.Option(
        "audio,subtitle", "--kinds", help="Stream kinds to filter: audio,subtitle."
    ),
    keep_und: Optional[bool] = typer.Option(
        None, "--keep-und/--drop-und", help="Keep streams tagged 'und'."
    ),
    drop_commentary: bool = typer.Option(
        False, "--drop-commentary", help="Also drop commentary tracks."
    ),
    fallback: Optional[bool] = typer.Option(
        None,
        "--fallback/--no-fallback",
        help="If nothing matches, keep the first stream of that kind.",
    ),
    faststart: bool = typer.Option(
        False, "--faststart", help="Move the MP4 moov atom to the front."
    ),
    plan_only: bool = typer.Option(False, "--plan", help="Show the plan and stop."),
) -> None:
    """Keep only the preferred languages, dropping every other audio/subtitle track."""
    state = get_state(ctx)
    console = state.console
    policy = state.config.languages
    if lang or keep_und is not None or fallback is not None:
        policy = LanguagePolicy(
            preferred=[str(x) for x in lang] if lang else policy.preferred,
            keep_undetermined=policy.keep_undetermined
            if keep_und is None
            else keep_und,
            keep_default_stream=policy.keep_default_stream,
            fallback_keep_first=policy.fallback_keep_first
            if fallback is None
            else fallback,
            apply_to=policy.apply_to,
        )

    target_kinds = [k.strip().lower() for k in kinds.split(",") if k.strip()]
    with console.status("[cyan]reading streams ...[/cyan]", spinner="dots"):
        streams = list_streams(
            source, timeout=state.config.timeout, analyze=state.config.analyze
        )
    if not streams:
        fail(console, "no streams found in the input")

    plan = plan_languages(
        streams, policy, kinds=target_kinds, drop_commentary=drop_commentary
    )
    console.print(
        stream_plan_table(plan, title=f"language filter · {Path(source).name}")
    )

    if plan_only:
        return
    if not plan.changes_anything:
        console.print("[green]nothing to strip - every stream already matches[/green]")
        return

    target = derive_output(
        source, "_lang", str(output) if output else None, state.config.output_dir
    )
    guard_output(console, source, target)
    with console.status("[cyan]remuxing ...[/cyan]", spinner="dots"):
        result = apply_plan(
            source, plan, target, faststart=faststart, dry_run=state.dry_run
        )
    if state.dry_run:
        console.print(command_panel(result.cmd, "would run"))
        return
    render_operation(
        console,
        result,
        source=source,
        label="languages stripped",
        show_command=state.show_command,
    )


@app.command("strip-audio")
def strip_audio(
    ctx: typer.Context,
    source: str = typer.Argument(..., help="Input file."),
    output: Optional[Path] = typer.Option(
        None, "--output", "-o", help="Output file or directory."
    ),
    keep: Optional[list[int]] = typer.Option(
        None,
        "--keep",
        "-k",
        help="Audio track to keep, 0-based within audio streams (repeatable).",
    ),
    keep_lang: Optional[list[str]] = typer.Option(
        None, "--keep-lang", help="Keep audio in this language (repeatable)."
    ),
    keep_first: bool = typer.Option(
        False, "--keep-first", help="Keep the first/default audio track."
    ),
    drop_commentary: bool = typer.Option(
        False, "--drop-commentary", help="Drop commentary tracks only."
    ),
    faststart: bool = typer.Option(False, "--faststart", help="MP4 faststart."),
    plan_only: bool = typer.Option(False, "--plan", help="Show the plan and stop."),
) -> None:
    """Remove audio streams. With no options every audio track is dropped."""
    state = get_state(ctx)
    console = state.console
    with console.status("[cyan]reading streams ...[/cyan]", spinner="dots"):
        streams = list_streams(
            source, timeout=state.config.timeout, analyze=state.config.analyze
        )
    if not any(s.kind == "audio" for s in streams):
        console.print("[yellow]this file has no audio streams[/yellow]")
        return

    plan = plan_audio(
        streams,
        keep=list(keep or []),
        keep_languages=[str(x) for x in (keep_lang or [])],
        keep_first=keep_first,
        drop_commentary=drop_commentary,
    )
    console.print(stream_plan_table(plan, title=f"audio filter · {Path(source).name}"))

    if plan_only:
        return
    if not plan.changes_anything:
        console.print("[green]nothing to strip[/green]")
        return

    muted = not any(s.kind == "audio" for s in plan.kept)
    target = derive_output(
        source,
        "_mute" if muted else "_audio",
        str(output) if output else None,
        state.config.output_dir,
    )
    guard_output(console, source, target)
    with console.status("[cyan]remuxing ...[/cyan]", spinner="dots"):
        result = apply_plan(
            source, plan, target, faststart=faststart, dry_run=state.dry_run
        )
    if state.dry_run:
        console.print(command_panel(result.cmd, "would run"))
        return
    render_operation(
        console,
        result,
        source=source,
        label="audio stripped",
        show_command=state.show_command,
    )


# --------------------------------------------------------------------------- #
# metadata
# --------------------------------------------------------------------------- #
@app.command("metadata")
def metadata_cmd(
    ctx: typer.Context,
    source: str = typer.Argument(..., help="Input file."),
    output: Optional[Path] = typer.Option(
        None, "--output", "-o", help="Output file or directory."
    ),
    show: bool = typer.Option(False, "--show", help="Print current metadata and exit."),
    title: Optional[str] = typer.Option(None, "--title", help="Shortcut for title=..."),
    set_tags: Optional[list[str]] = typer.Option(
        None,
        "--set",
        "-s",
        metavar="KEY=VALUE",
        help="Container tag to set (repeatable). An empty value removes the tag.",
    ),
    stream_tags: Optional[list[str]] = typer.Option(
        None,
        "--stream",
        "-S",
        metavar="INDEX:KEY=VALUE",
        help="Per-stream tag, e.g. 1:language=eng or 2:title=Commentary (repeatable).",
    ),
    clear: bool = typer.Option(
        False, "--clear", help="Drop all existing container metadata."
    ),
    clear_chapters: bool = typer.Option(
        False, "--clear-chapters", help="Drop chapters."
    ),
    default_audio: Optional[int] = typer.Option(
        None, "--default-audio", help="Flag this audio track (0-based) as default."
    ),
    default_sub: Optional[int] = typer.Option(
        None, "--default-sub", help="Flag this subtitle track (0-based) as default."
    ),
) -> None:
    """Edit container and per-stream metadata without re-encoding."""
    state = get_state(ctx)
    console = state.console

    if show:
        tags = read_tags(source, timeout=state.config.timeout)
        streams = list_streams(
            source, timeout=state.config.timeout, analyze=state.config.analyze
        )
        table = _kv_table()
        for key, value in tags.items():
            table.add_row(key, value)
        if not tags:
            table.add_row("", Text("no container tags", style="grey62"))
        console.print(
            _Panel(
                table,
                title=f"[b]metadata · {Path(source).name}[/b]",
                border_style="bright_cyan",
                box=_box.ROUNDED,
            )
        )
        listing = Plan(decisions=[Decision(s, True, s.title or "") for s in streams])
        console.print(stream_plan_table(listing, title="streams"))
        return

    try:
        globals_ = parse_kv(list(set_tags or []))
        per_stream = parse_stream_kv(list(stream_tags or []))
    except ValueError as exc:
        fail(console, str(exc))
        return
    if title is not None:
        globals_["title"] = title

    meta = Metadata(
        clear=clear,
        global_tags=globals_,
        stream_tags=per_stream,
        default_audio=default_audio,
        default_subtitle=default_sub,
        clear_chapters=clear_chapters,
    )
    if meta.empty:
        fail(
            console,
            "nothing to change; pass --set/--stream/--title/--clear, or use --show",
        )

    streams = list_streams(
        source, timeout=state.config.timeout, analyze=state.config.analyze
    )
    target = derive_output(
        source, "_meta", str(output) if output else None, state.config.output_dir
    )
    guard_output(console, source, target)

    with console.status("[cyan]writing metadata ...[/cyan]", spinner="dots"):
        result = edit_metadata(
            source, target, meta, streams=streams, dry_run=state.dry_run
        )
    if state.dry_run:
        console.print(command_panel(result.cmd, "would run"))
        return
    render_operation(
        console,
        result,
        source=source,
        label="metadata updated",
        show_command=state.show_command,
    )


# --------------------------------------------------------------------------- #
# cutting
# --------------------------------------------------------------------------- #
@app.command()
def cut(
    ctx: typer.Context,
    source: str = typer.Argument(..., help="Input file."),
    start: str = typer.Option(
        "0", "--start", "-s", help="Start position: 90, 1:30 or 00:01:30.5."
    ),
    duration: Optional[str] = typer.Option(
        None, "--duration", "-d", help="Segment length (default from config, 60s)."
    ),
    end: Optional[str] = typer.Option(
        None, "--end", "-e", help="End position instead of a length."
    ),
    output: Optional[Path] = typer.Option(
        None, "--output", "-o", help="Output file or directory."
    ),
    accurate: Optional[bool] = typer.Option(
        None,
        "--accurate/--copy",
        help="Re-encode for a frame-exact cut, or stream copy (fast, keyframe aligned).",
    ),
    crf: int = typer.Option(18, "--crf", help="CRF when re-encoding."),
    preset: str = typer.Option(
        "veryfast", "--preset", help="x264/x265 preset when re-encoding."
    ),
    vcodec: str = typer.Option(
        "libx264", "--vcodec", help="Video codec when re-encoding."
    ),
    acodec: str = typer.Option("aac", "--acodec", help="Audio codec when re-encoding."),
    fade: float = typer.Option(
        0.0, "--fade", help="Fade in/out seconds (re-encode only)."
    ),
    no_audio: bool = typer.Option(
        False, "--no-audio", help="Drop audio from the segment."
    ),
) -> None:
    """Seek to a position and cut a segment out of a longer video (60s by default)."""
    state = get_state(ctx)
    console = state.console
    defaults = state.config.cut

    try:
        start_s = parse_timecode(start) or 0.0
        end_s = parse_timecode(end)
        length = parse_timecode(duration)
    except ValueError as exc:
        fail(console, str(exc))
        return

    if end_s is not None and length is not None:
        fail(console, "pass either --duration or --end, not both")
    if end_s is not None and end_s <= start_s:
        fail(console, "--end must be after --start")
    if end_s is None and length is None:
        length = defaults.duration
    use_accurate = defaults.accurate if accurate is None else accurate

    spec = CutSpec(
        start=start_s,
        duration=length,
        end=end_s,
        accurate=use_accurate,
        video_codec=vcodec,
        audio_codec=acodec,
        crf=crf,
        preset=preset,
        fade=fade if fade else defaults.fade,
    )

    plan = None
    if no_audio:
        streams = list_streams(
            source, timeout=state.config.timeout, analyze=state.config.analyze
        )
        plan = plan_audio(streams)

    stop = spec.stop
    span = (
        f"{format_timecode(start_s)} → {format_timecode(stop)}"
        if stop
        else f"{format_timecode(start_s)} → end"
    )
    mode = "re-encode" if use_accurate else "stream copy"
    console.print(f"[cyan]cutting[/cyan] {span}   [grey62]({mode})[/grey62]")

    if not use_accurate and start_s > 0:
        keyframe = nearest_keyframe(source, start_s)
        if keyframe is not None and start_s - keyframe > 0.05:
            console.print(
                f"[yellow]stream copy snaps to the previous keyframe at "
                f"{format_timecode(keyframe)} ({start_s - keyframe:.2f}s early) - "
                f"use --accurate for a frame-exact cut[/yellow]"
            )

    target = derive_output(
        source,
        f"_cut{int(start_s)}",
        str(output) if output else None,
        state.config.output_dir,
    )
    guard_output(console, source, target)

    with console.status("[cyan]cutting ...[/cyan]", spinner="dots"):
        result = cut_segment(source, target, spec, plan=plan, dry_run=state.dry_run)
    if state.dry_run:
        console.print(command_panel(result.cmd, "would run"))
        return
    render_operation(
        console, result, label="segment written", show_command=state.show_command
    )


# --------------------------------------------------------------------------- #
# thumbnails and sprites
# --------------------------------------------------------------------------- #
@app.command()
def thumbs(
    ctx: typer.Context,
    source: str = typer.Argument(..., help="Input file."),
    output: Optional[Path] = typer.Option(
        None, "--output", "-o", help="Output directory."
    ),
    mode: ThumbMode = typer.Option(
        ThumbMode.QUICK, "--mode", "-m", help="Frame selection strategy."
    ),
    width: Optional[int] = typer.Option(
        None, "--width", "-w", help="Thumbnail width in px."
    ),
    count: Optional[int] = typer.Option(
        None, "--count", "-n", help="How many thumbnails."
    ),
    interval: Optional[float] = typer.Option(
        None, "--interval", "-i", help="Seconds between frames (interval mode)."
    ),
    scene_threshold: Optional[float] = typer.Option(
        None, "--scene-threshold", help="Scene change sensitivity, 0-1 (scene mode)."
    ),
    at: Optional[str] = typer.Option(
        None, "--at", help="Timestamp for a single thumbnail."
    ),
    image_format: Optional[str] = typer.Option(
        None, "--format", "-f", help="jpg, png or webp."
    ),
    quality: Optional[int] = typer.Option(
        None, "--quality", "-q", help="JPEG/WebP quality, 1 best to 31 worst."
    ),
    prefix: str = typer.Option("thumb", "--prefix", help="Filename prefix."),
) -> None:
    """Generate thumbnails: representative (quick), scene-change, interval or keyframe."""
    state = get_state(ctx)
    console = state.console
    defaults = state.config.thumbnails

    try:
        timestamp = parse_timecode(at)
    except ValueError as exc:
        fail(console, str(exc))
        return
    if timestamp is not None:
        mode = ThumbMode.SINGLE

    outdir = (
        str(output)
        if output
        else derive_output(
            source, "_thumbs", None, state.config.output_dir, extension=""
        )
    )
    with console.status("[cyan]reading geometry ...[/cyan]", spinner="dots"):
        geometry = media_geometry(source, timeout=state.config.timeout)

    with console.status(
        f"[cyan]extracting frames ({mode.value}) ...[/cyan]", spinner="dots"
    ):
        result = generate_thumbnails(
            source,
            outdir,
            mode=mode,
            width=width or defaults.width,
            count=count
            if count is not None
            else (
                None
                if mode in {ThumbMode.INTERVAL, ThumbMode.SINGLE}
                else defaults.count
            ),
            interval=interval
            if interval is not None
            else (defaults.interval if mode is ThumbMode.INTERVAL else None),
            scene_threshold=(
                scene_threshold
                if scene_threshold is not None
                else defaults.scene_threshold
            ),
            timestamp=timestamp,
            quality=quality if quality is not None else defaults.quality,
            image_format=image_format or defaults.format,
            prefix=prefix,
            geometry=geometry,
            dry_run=state.dry_run,
        )
    if state.dry_run:
        console.print(command_panel(result.run.cmd, "would run"))
        return
    render_thumbs(console, result, outdir)
    if state.show_command and result.run:
        console.print(command_panel(result.run.cmd))


@app.command()
def sprite(
    ctx: typer.Context,
    source: str = typer.Argument(..., help="Input file."),
    output: Optional[Path] = typer.Option(
        None, "--output", "-o", help="Output directory."
    ),
    width: int = typer.Option(160, "--width", "-w", help="Tile width in px."),
    interval: Optional[float] = typer.Option(
        None, "--interval", "-i", help="Seconds between tiles."
    ),
    count: Optional[int] = typer.Option(
        None, "--count", "-n", help="Total tiles instead of an interval."
    ),
    columns: Optional[int] = typer.Option(None, "--cols", help="Tiles per row."),
    rows: Optional[int] = typer.Option(None, "--rows", help="Rows per sheet."),
    quality: Optional[int] = typer.Option(
        None, "--quality", "-q", help="JPEG quality 1-31."
    ),
    image_format: Optional[str] = typer.Option(
        None, "--format", "-f", help="jpg, png or webp."
    ),
    prefix: str = typer.Option("sprite", "--prefix", help="Sheet filename prefix."),
    vtt_name: str = typer.Option("sprite.vtt", "--vtt", help="WebVTT filename."),
    vtt_prefix: str = typer.Option(
        "", "--vtt-prefix", help="URL prefix written into the VTT cues."
    ),
) -> None:
    """Build tiled sprite sheets plus a WebVTT index for player scrub previews."""
    state = get_state(ctx)
    console = state.console
    defaults = state.config.thumbnails

    outdir = (
        str(output)
        if output
        else derive_output(
            source, "_sprite", None, state.config.output_dir, extension=""
        )
    )
    with console.status("[cyan]building sprite sheets ...[/cyan]", spinner="dots"):
        result = generate_sprite(
            source,
            outdir,
            width=width,
            interval=interval,
            count=count,
            columns=columns or defaults.sprite_columns,
            rows=rows or defaults.sprite_rows,
            quality=quality if quality is not None else defaults.quality + 1,
            image_format=image_format or defaults.format,
            prefix=prefix,
            vtt_name=vtt_name,
            vtt_prefix=vtt_prefix,
            dry_run=state.dry_run,
        )
    if state.dry_run:
        console.print(command_panel(result.run.cmd, "would run"))
        return
    render_thumbs(console, result, outdir)
    if state.show_command and result.run:
        console.print(command_panel(result.run.cmd))


# --------------------------------------------------------------------------- #
# builds, benchmarking, diagnostics
# --------------------------------------------------------------------------- #
@app.command()
def builds(
    ctx: typer.Context,
    caps: bool = typer.Option(
        False, "--caps", "-C", help="Also show capabilities for each build."
    ),
) -> None:
    """List the FFmpeg builds registered in the config and whether they work."""
    state = get_state(ctx)
    console = state.console
    configured = state.config.builds or {"system": Build(name="system")}

    entries = []
    for name, build in configured.items():
        path = build.resolve("ffmpeg")
        entry = {
            "name": build.display,
            "available": bool(path),
            "path": path,
            "configured": build.ffmpeg,
            "default": name == state.config.default_build,
            "notable": build.note,
        }
        if path:
            with using_build(build):
                info = build_capabilities()
            entry["version"] = info["version"]
            flags = info.get("configuration") or []
            notable = [
                f.replace("--enable-", "")
                for f in flags
                if any(
                    k in f
                    for k in (
                        "libvmaf",
                        "libx265",
                        "libsvtav1",
                        "nvenc",
                        "vaapi",
                        "qsv",
                    )
                )
            ]
            entry["notable"] = ", ".join(notable[:4]) or build.note
        entries.append(entry)
    console.print(builds_table(entries, config_path=state.config.path))

    if caps:
        for build in configured.values():
            if not build.available:
                continue
            with using_build(build):
                console.print(capabilities_panel(build.display, build_capabilities()))


@app.command()
def bench(
    ctx: typer.Context,
    source: str = typer.Argument(..., help="Input file to run the workload against."),
    task: BenchTask = typer.Option(
        BenchTask.DECODE, "--task", "-t", help="Workload to run on every build."
    ),
    runs: int = typer.Option(1, "--runs", "-n", help="Repetitions per build."),
    duration: float = typer.Option(
        30.0, "--duration", "-d", help="Seconds of input to process (0 = all)."
    ),
    only: Optional[list[str]] = typer.Option(
        None, "--only", help="Limit to these builds (repeatable)."
    ),
    encoder: str = typer.Option(
        "libx264", "--encoder", help="Encoder for the encode task."
    ),
    preset: str = typer.Option("medium", "--preset", help="Encoder preset."),
    crf: int = typer.Option(23, "--crf", help="Encoder CRF."),
    scale_width: int = typer.Option(
        640, "--scale-width", help="Target width for the scale task."
    ),
    threads: Optional[int] = typer.Option(
        None, "--threads", help="Pin the thread count."
    ),
) -> None:
    """Race the configured FFmpeg builds against each other on one workload."""
    state = get_state(ctx)
    console = state.console
    try:
        selected = state.config.build_list([str(x) for x in only] if only else None)
    except ConfigError as exc:
        fail(console, str(exc))
        return
    if len(selected) < 2:
        console.print(
            "[yellow]only one build configured - add more under [builds] "
            "in your config to compare them[/yellow]"
        )

    status = console.status("[cyan]benchmarking ...[/cyan]", spinner="dots")
    with status:

        def progress(name: str, attempt: int) -> None:
            status.update(f"[cyan]{name}: run {attempt}/{runs} ...[/cyan]")

        rows = run_bench(
            selected,
            task,
            source,
            runs=runs,
            duration=None if duration == 0 else duration,
            encoder=encoder,
            preset=preset,
            crf=crf,
            scale_width=scale_width,
            threads=threads,
            progress=progress,
        )
    label = f"{task.value} · {Path(source).name}"
    if duration:
        label += f" · first {duration:g}s"
    console.print(bench_table(rows, label))


@app.command()
def doctor(ctx: typer.Context) -> None:
    """Check the FFmpeg installation and what the active build supports."""
    state = get_state(ctx)
    console = state.console
    console.print(f"  [cyan]vidprobe[/cyan] {__version__}")
    console.print(
        f"  [cyan]config  [/cyan] {state.config.path or 'none found (using defaults)'}"
    )
    console.print(f"  [cyan]build   [/cyan] {state.build.display}")
    for key, value in versions().items():
        style = "red" if value == "not found" else "green"
        console.print(f"  [{style}]{key:<8}[/{style}] {value}")
    console.print(
        f"  [{'green' if vmaf_available() else 'yellow'}]libvmaf [/] "
        + (
            "available"
            if vmaf_available()
            else "missing - VMAF disabled (PSNR/SSIM still work)"
        )
    )
    console.print()
    console.print(capabilities_panel(state.build.display, build_capabilities()))


# --------------------------------------------------------------------------- #
# ABR
# --------------------------------------------------------------------------- #
def _load_and_probe(state, sources, window, quick, quiet=False):
    """Shared helper: parse the ladder and probe every rung."""
    console = state.console
    with console.status("[cyan]reading manifest ...[/cyan]", spinner="dots") as status:
        ladder = load_ladder(list(sources), timeout=state.config.timeout)
        for variant in ladder.variants:
            if not quiet:
                status.update(f"[cyan]probing {variant.label} ...[/cyan]")
            fill_variant(
                variant,
                window=window,
                timeout=state.config.timeout,
                analyze=state.config.analyze,
                deep=not quick,
            )
    return ladder


@abr_app.command("ladder")
def abr_ladder(
    ctx: typer.Context,
    sources: list[str] = typer.Argument(
        ..., help="Master .m3u8/.mpd, or the rendition files that make up the ladder."
    ),
    reference: Optional[str] = typer.Option(
        None,
        "--reference",
        "-r",
        help="Original source; scores every rung against it to build a rate-quality curve.",
    ),
    metrics: str = typer.Option(
        "vmaf,psnr", "--metrics", "-m", help="Comma separated: vmaf,psnr,ssim."
    ),
    window: float = typer.Option(
        30.0, "--window", "-w", help="Seconds of each rung to analyse."
    ),
    qduration: float = typer.Option(
        15.0, "--qduration", help="Seconds to score per rung when a reference is given."
    ),
    threads: int = typer.Option(0, "--threads", help="libvmaf worker threads."),
    quick: bool = typer.Option(
        False, "--quick", "-q", help="Skip packet-level analysis."
    ),
    json_out: Optional[Path] = typer.Option(
        None, "--json", help="Write the report as JSON."
    ),
) -> None:
    """Validate an ABR ladder: rung spacing, declared vs real bitrate, segmentation."""
    state = get_state(ctx)
    console = state.console

    ladder = _load_and_probe(state, sources, window, quick)
    if not ladder.variants:
        fail(console, "no renditions found in that manifest")

    if reference:
        score_seconds = None if qduration == 0 else qduration
        wanted = tuple(m.strip().lower() for m in metrics.split(",") if m.strip())
        wanted = tuple(m for m in wanted if m in ALL_METRICS)
        if not wanted:
            fail(console, "no valid metrics requested")
        with console.status("[cyan]probing reference ...[/cyan]", spinner="dots"):
            ref = probe_input(
                reference,
                timeout=state.config.timeout,
                analyze=state.config.analyze,
                deep=False,
            )
        geometry = (
            ref.video.width if ref.video else None,
            ref.video.height if ref.video else None,
            ref.video.fps if ref.video else None,
        )
        with console.status("[cyan]scoring rungs ...[/cyan]", spinner="dots") as status:
            for variant in ladder.ordered:
                if variant.error:
                    continue
                status.update(f"[cyan]scoring {variant.label} ...[/cyan]")
                try:
                    variant.quality = measure(
                        variant.path,
                        reference,
                        metrics=wanted,
                        duration=score_seconds,
                        width=geometry[0],
                        height=geometry[1],
                        fps=geometry[2],
                        threads=threads,
                    )
                except (ProbeError, ValueError) as exc:
                    console.print(f"[red]{variant.label}: {exc}[/red]")

    ladder.checks = analyse_ladder(ladder)
    alignment = analyse_alignment(ladder)
    ladder.checks += alignment.checks
    ladder.checks += analyse_quality_curve(ladder)

    console.print(ladder_table(ladder))
    curve = quality_curve_panel(ladder)
    if curve:
        console.print(curve)
    console.print(alignment_panel(alignment))
    console.print(checks_panel(ladder.checks, title="ladder review"))

    if json_out:
        payload = {
            "source": ladder.source,
            "kind": ladder.kind,
            "rungs": [
                {
                    "label": v.label,
                    "uri": v.uri,
                    "resolution": v.resolution,
                    "declared_bandwidth": v.bandwidth,
                    "measured_bitrate": v.measured_bitrate,
                    "measured_peak": v.measured_peak,
                    "bits_per_pixel": v.bits_per_pixel,
                    "frame_rate": v.frame_rate,
                    "codecs": v.codecs,
                    "gop_seconds": v.gop_seconds,
                    "segments": len(v.segments),
                    "keyframes": v.keyframes[:200],
                    "quality": v.quality.__dict__ if v.quality else None,
                    "error": v.error,
                }
                for v in ladder.ordered
            ],
            "alignment": {
                "switchable": alignment.switchable,
                "max_drift": alignment.max_drift,
                "common_points": alignment.common_points,
                "rows": alignment.rows,
            },
            "checks": [c.__dict__ for c in ladder.checks],
        }
        Path(json_out).write_text(
            json.dumps(payload, indent=2, default=str), encoding="utf-8"
        )
        console.print(f"[green]wrote[/green] {json_out}")

    if any(c.level == "fail" for c in ladder.checks):
        raise typer.Exit(1)


@abr_app.command("align")
def abr_align(
    ctx: typer.Context,
    sources: list[str] = typer.Argument(
        ..., help="Master .m3u8/.mpd, or the rendition files to compare."
    ),
    window: float = typer.Option(
        60.0, "--window", "-w", help="Seconds of each rung to scan for keyframes."
    ),
    tolerance: float = typer.Option(
        50.0, "--tolerance", "-t", help="Allowed keyframe drift in milliseconds."
    ),
) -> None:
    """Check that every rendition places its keyframes at the same timestamps."""
    state = get_state(ctx)
    console = state.console

    with console.status("[cyan]reading manifest ...[/cyan]", spinner="dots") as status:
        ladder = load_ladder(list(sources), timeout=state.config.timeout)
        for variant in ladder.variants:
            status.update(f"[cyan]scanning {variant.label} ...[/cyan]")
            fill_variant(
                variant,
                window=window,
                timeout=state.config.timeout,
                analyze=state.config.analyze,
                deep=False,
            )

    report = analyse_alignment(ladder, tolerance=tolerance / 1000.0)
    console.print(alignment_panel(report))
    console.print(checks_panel(report.checks, title="alignment review"))
    if not report.switchable:
        raise typer.Exit(1)


@abr_app.command("switch")
def abr_switch(
    ctx: typer.Context,
    lower: str = typer.Argument(..., help="Rendition being switched away from."),
    upper: str = typer.Argument(..., help="Rendition being switched to."),
    at: str = typer.Option(
        "10", "--at", "-a", help="Where the switch happens: 30, 0:30 or 00:00:30.5."
    ),
    window: float = typer.Option(
        5.0, "--window", "-w", help="Seconds to measure either side of the switch."
    ),
    reference: Optional[str] = typer.Option(
        None,
        "--reference",
        "-r",
        help="Original source; needed to score quality either side of the switch.",
    ),
    metrics: str = typer.Option(
        "vmaf,psnr", "--metrics", "-m", help="Comma separated: vmaf,psnr,ssim."
    ),
    clip: Optional[Path] = typer.Option(
        None, "--clip", help="Also render a spliced clip of the switch to this path."
    ),
    tolerance: float = typer.Option(
        50.0, "--tolerance", "-t", help="Allowed keyframe drift in milliseconds."
    ),
    threads: int = typer.Option(0, "--threads", help="libvmaf worker threads."),
) -> None:
    """Simulate one ABR switch and measure what the viewer sees across the boundary."""
    state = get_state(ctx)
    console = state.console
    try:
        position = parse_timecode(at) or 0.0
    except ValueError as exc:
        fail(console, str(exc))
        return

    # a full packet pass here is what makes the measured bitrate step meaningful
    ladder = _load_and_probe(
        state,
        [lower, upper],
        window=max(position + window * 2, 30.0),
        quick=False,
        quiet=True,
    )
    low, high = ladder.variants[0], ladder.variants[1]
    for variant in (low, high):
        if variant.error:
            fail(console, f"{variant.label}: {variant.error}")

    report = SwitchReport(lower=low.label, upper=high.label, at=position, window=window)
    point, drift = find_switch_point(low, high, position, tolerance=tolerance / 1000.0)
    report.switch_point = point if point is not None else position
    report.drift = drift
    report.aligned = point is not None

    if reference:
        wanted = tuple(m.strip().lower() for m in metrics.split(",") if m.strip())
        wanted = tuple(m for m in wanted if m in ALL_METRICS)
        with console.status("[cyan]probing reference ...[/cyan]", spinner="dots"):
            ref = probe_input(
                reference,
                timeout=state.config.timeout,
                analyze=state.config.analyze,
                deep=False,
            )
        geometry = (
            ref.video.width if ref.video else None,
            ref.video.height if ref.video else None,
            ref.video.fps if ref.video else None,
        )
        start = max(report.switch_point - window, 0.0)
        try:
            with console.status(
                "[cyan]scoring the rung before the switch ...[/cyan]", spinner="dots"
            ):
                report.quality_before = measure(
                    low.path,
                    reference,
                    metrics=wanted,
                    duration=window,
                    width=geometry[0],
                    height=geometry[1],
                    fps=geometry[2],
                    threads=threads,
                    start=start,
                )
            with console.status(
                "[cyan]scoring the rung after the switch ...[/cyan]", spinner="dots"
            ):
                report.quality_after = measure(
                    high.path,
                    reference,
                    metrics=wanted,
                    duration=window,
                    width=geometry[0],
                    height=geometry[1],
                    fps=geometry[2],
                    threads=threads,
                    start=report.switch_point,
                )
        except (ProbeError, ValueError) as exc:
            console.print(f"[red]quality measurement failed:[/red] {exc}")

    if clip:
        with console.status(
            "[cyan]rendering the spliced switch ...[/cyan]", spinner="dots"
        ):
            run = build_switch_clip(
                low, high, report.switch_point, window, str(clip), dry_run=state.dry_run
            )
        if state.dry_run:
            console.print(command_panel(run.cmd, "would run"))
        elif run.ok:
            report.output = str(clip)
        else:
            console.print(f"[red]could not render the clip:[/red] {run.error_tail}")

    summarise_switch(report, low, high)
    console.print(switch_panel(report))
    console.print(checks_panel(report.checks, title="switch review"))
    if not report.aligned:
        raise typer.Exit(1)


# --------------------------------------------------------------------------- #
# config subcommands
# --------------------------------------------------------------------------- #
@config_app.command("show")
def config_show(ctx: typer.Context) -> None:
    """Show the active configuration and where it came from."""
    state = get_state(ctx)
    console = state.console
    config = state.config

    table = _kv_table()
    table.add_row(
        "config file",
        str(config.path)
        if config.path
        else Text("none - built-in defaults", style="yellow"),
    )
    table.add_row("default build", config.default_build)
    table.add_row("active build", state.build.display)
    table.add_row("builds", ", ".join(config.builds) or "system (implicit)")
    table.add_row(
        "preferred languages",
        ", ".join(
            f"{lang} → {normalize_language(lang)}"
            for lang in config.languages.preferred
        ),
    )
    table.add_row(
        "keep undetermined", "yes" if config.languages.keep_undetermined else "no"
    )
    table.add_row(
        "keep default stream", "yes" if config.languages.keep_default_stream else "no"
    )
    table.add_row(
        "fallback keep first", "yes" if config.languages.fallback_keep_first else "no"
    )
    table.add_row("filter applies to", ", ".join(config.languages.apply_to))
    table.add_row("thumbnail width", str(config.thumbnails.width))
    table.add_row("thumbnail count", str(config.thumbnails.count))
    table.add_row("scene threshold", str(config.thumbnails.scene_threshold))
    table.add_row(
        "sprite grid",
        f"{config.thumbnails.sprite_columns}x{config.thumbnails.sprite_rows}",
    )
    table.add_row("cut duration", f"{config.cut.duration:g}s")
    table.add_row("output dir", config.output_dir or "alongside the input")
    console.print(
        _Panel(
            table,
            title="[b]configuration[/b]",
            border_style="bright_cyan",
            box=_box.ROUNDED,
        )
    )
    if not config.path:
        console.print("[grey62]create one with:[/grey62] vidprobe config init")


@config_app.command("init")
def config_init(
    ctx: typer.Context,
    path: Optional[Path] = typer.Argument(None, help="Where to write the config."),
    force: bool = typer.Option(False, "--force", help="Overwrite an existing file."),
    stdout: bool = typer.Option(False, "--stdout", help="Print the sample instead."),
) -> None:
    """Write a commented starter config with FFmpeg build slots."""
    state = get_state(ctx)
    console = state.console
    if stdout:
        typer.echo(SAMPLE_CONFIG)
        return
    target = (
        Path(path) if path else Path.home() / ".config" / "vidprobe" / "config.toml"
    ).expanduser()
    if target.exists() and not force:
        fail(console, f"{target} already exists (use --force to overwrite)")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(SAMPLE_CONFIG, encoding="utf-8")
    console.print(f"[green]wrote[/green] {target}")
    console.print(
        "[grey62]add your optimized FFmpeg builds under [builds], then run "
        "'vidprobe builds' to verify them[/grey62]"
    )


@config_app.command("path")
def config_path(ctx: typer.Context) -> None:
    """Print every location that is searched for a config file."""
    from .config import candidate_paths

    console = get_state(ctx).console
    for candidate in candidate_paths():
        marker = "[green]●[/green]" if candidate.is_file() else "[grey42]○[/grey42]"
        console.print(f"  {marker} {candidate}")


# --------------------------------------------------------------------------- #
# entry point
# --------------------------------------------------------------------------- #
def main(argv: list[str] | None = None) -> int:
    import click

    console = Console(stderr=True)
    try:
        # with standalone_mode=False click does not exit for us: it *returns*
        # the exit code from typer.Exit instead of raising it
        result = app(args=argv, standalone_mode=False)
        return int(result) if isinstance(result, int) else 0
    except typer.Exit as exc:
        return int(exc.exit_code)
    except click.exceptions.Abort:
        console.print("\n[yellow]aborted[/yellow]")
        return 130
    except click.ClickException as exc:
        exc.show()
        return exc.exit_code
    except FFmpegNotFound as exc:
        console.print(Text(f"error: {exc}", style="bold red"))
        return 127
    except (ProbeError, ConfigError) as exc:
        console.print(Text(f"error: {exc}", style="bold red"))
        return 2
    except KeyboardInterrupt:
        console.print("\n[yellow]interrupted[/yellow]")
        return 130


if __name__ == "__main__":  # pragma: no cover
    sys.exit(main())
