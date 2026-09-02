"""The node library.

Conditions read from `ctx.metadata` and are always safe to run. Actions touch
the file, so each one checks `ctx.dry_run` first: during a dry run it records
what it *would* do and reports the file as needing work, without spending an
hour of CPU to find that out.
"""

from __future__ import annotations

import re
import shutil
from pathlib import Path

from django.conf import settings

import ffmpeg
from .registry import Condition, Field, Node, Output, register

CODEC_CHOICES = [
    ("h264", "H.264 / AVC"),
    ("hevc", "H.265 / HEVC"),
    ("av1", "AV1"),
    ("vp9", "VP9"),
    ("mpeg2video", "MPEG-2"),
    ("mpeg4", "MPEG-4 part 2"),
]
CONTAINER_CHOICES = [("mkv", "MKV"), ("mp4", "MP4")]
HWACCEL_CHOICES = [
    ("none", "CPU only"),
    ("nvenc", "NVIDIA NVENC"),
    ("qsv", "Intel QuickSync"),
    ("vaapi", "VAAPI"),
]


# ---------------------------------------------------------------------------
# Input
# ---------------------------------------------------------------------------
@register
class InputFile(Node):
    type = "input_file"
    label = "Input file"
    category = "input"
    icon = "file"
    description = "Where every run starts. A flow needs exactly one."
    outputs = [Output("File")]

    def execute(self, ctx, config) -> int:
        ctx.log(f"Starting flow for {Path(ctx.working_path).name}")
        return 1


# ---------------------------------------------------------------------------
# Conditions
# ---------------------------------------------------------------------------
@register
class VideoCodecIs(Condition):
    type = "video_codec_is"
    label = "Video codec is"
    icon = "video"
    description = "Yes when the video stream uses any of the listed codecs."
    fields = [
        Field(
            "codecs",
            "Codecs",
            "csv",
            "hevc",
            CODEC_CHOICES,
            help="Comma separated. Yes if the file matches any of them.",
        ),
    ]

    def test(self, ctx, config) -> bool:
        return (ctx.metadata.get("video_codec") or "").lower() in self._list(
            config, "codecs"
        )

    def summary(self, config) -> str:
        return f"is {config.get('codecs') or '…'}"


@register
class AudioCodecIs(Condition):
    type = "audio_codec_is"
    label = "Audio codec is"
    icon = "audio"
    description = "Yes when the first audio stream uses any of the listed codecs."
    fields = [
        Field("codecs", "Codecs", "csv", "aac", help="Comma separated, e.g. aac,eac3")
    ]

    def test(self, ctx, config) -> bool:
        return (ctx.metadata.get("audio_codec") or "").lower() in self._list(
            config, "codecs"
        )

    def summary(self, config) -> str:
        return f"is {config.get('codecs') or '…'}"


@register
class ContainerIs(Condition):
    type = "container_is"
    label = "Container is"
    icon = "box"
    description = "Yes when the file is already in this container."
    fields = [Field("container", "Container", "select", "mkv", CONTAINER_CHOICES)]

    ALIASES = {
        "mkv": {"mkv", "matroska", "matroska,webm", "webm"},
        "mp4": {"mp4", "mov", "m4v", "mov,mp4,m4a,3gp,3g2,mj2"},
    }

    def test(self, ctx, config) -> bool:
        wanted = config.get("container", "mkv")
        actual = (ctx.metadata.get("container") or "").lower()
        return actual in self.ALIASES.get(wanted, {wanted})

    def summary(self, config) -> str:
        return f"is {config.get('container', '…')}"


@register
class ResolutionAtLeast(Condition):
    type = "resolution_at_least"
    label = "Resolution at least"
    icon = "expand"
    description = "Yes when the video is at least this tall."
    fields = [
        Field(
            "height",
            "Minimum height",
            "number",
            1080,
            help="720 for HD, 1080 for full HD, 2160 for 4K.",
        )
    ]

    def test(self, ctx, config) -> bool:
        return (ctx.metadata.get("height") or 0) >= self._int(config, "height", 1080)

    def summary(self, config) -> str:
        return f"≥ {config.get('height', '…')}p"


@register
class BitrateAbove(Condition):
    type = "bitrate_above"
    label = "Bitrate above"
    icon = "gauge"
    description = "Yes when the overall bitrate is higher than this."
    fields = [Field("kbps", "Bitrate", "number", 8000, help="In kbps.")]

    def test(self, ctx, config) -> bool:
        return (ctx.metadata.get("bitrate_kbps") or 0) > self._int(config, "kbps", 8000)

    def summary(self, config) -> str:
        return f"> {config.get('kbps', '…')} kbps"


@register
class FileSizeAbove(Condition):
    type = "file_size_above"
    label = "File size above"
    icon = "gauge"
    description = "Yes when the file is bigger than this."
    fields = [Field("mb", "Size", "number", 2000, help="In MB.")]

    def test(self, ctx, config) -> bool:
        return (ctx.metadata.get("size_bytes") or 0) > self._int(
            config, "mb", 2000
        ) * 1_000_000

    def summary(self, config) -> str:
        return f"> {config.get('mb', '…')} MB"


@register
class DurationLongerThan(Condition):
    type = "duration_longer_than"
    label = "Runtime longer than"
    icon = "clock"
    description = "Yes when the file runs longer than this. Useful for skipping extras."
    fields = [Field("minutes", "Minutes", "number", 20)]

    def test(self, ctx, config) -> bool:
        return (ctx.metadata.get("duration_seconds") or 0) > self._int(
            config, "minutes", 20
        ) * 60

    def summary(self, config) -> str:
        return f"> {config.get('minutes', '…')} min"


@register
class FilenameMatches(Condition):
    type = "filename_matches"
    label = "Filename matches"
    icon = "search"
    description = "Yes when the file name matches this regular expression."
    fields = [
        Field(
            "pattern",
            "Pattern",
            "text",
            "",
            placeholder=r"S\d{2}E\d{2}",
            help="Python regular expression, case insensitive.",
        ),
    ]

    def test(self, ctx, config) -> bool:
        pattern = (config.get("pattern") or "").strip()
        if not pattern:
            return False
        try:
            return bool(re.search(pattern, Path(ctx.working_path).name, re.IGNORECASE))
        except re.error as exc:
            ctx.log(f"Bad pattern: {exc}")
            return False

    def summary(self, config) -> str:
        return config.get("pattern") or "…"


# ---------------------------------------------------------------------------
# Actions
# ---------------------------------------------------------------------------
@register
class TranscodeVideo(Node):
    type = "transcode_video"
    label = "Transcode video"
    category = "action"
    icon = "bolt"
    mutating = True
    description = (
        "Re-encode the video stream. Audio and subtitles are copied unless changed."
    )
    outputs = [Output("Transcoded"), Output("Kept original", "no")]
    fields = [
        Field("video_codec", "Video codec", "select", "hevc", CODEC_CHOICES[:3]),
        Field("container", "Container", "select", "mkv", CONTAINER_CHOICES),
        Field("hw_accel", "Encoder", "select", "none", HWACCEL_CHOICES),
        Field(
            "quality",
            "Quality",
            "number",
            24,
            help="CRF for CPU encoders, CQ or QP for hardware. Lower is better.",
        ),
        Field(
            "preset", "Preset", "text", "medium", help="ffmpeg preset, e.g. slow or p5."
        ),
        Field(
            "max_height", "Downscale to", "number", 0, help="0 keeps the source height."
        ),
        Field(
            "audio_codec",
            "Audio",
            "text",
            "copy",
            help="copy, or an encoder such as aac.",
        ),
        Field(
            "extra_args",
            "Extra ffmpeg arguments",
            "text",
            "",
            placeholder="-x265-params log-level=error",
        ),
    ]

    def summary(self, config) -> str:
        bits = [config.get("video_codec", "hevc"), f"q{config.get('quality', 24)}"]
        if self._int(config, "max_height"):
            bits.append(f"{config['max_height']}p")
        if config.get("hw_accel", "none") != "none":
            bits.append(config["hw_accel"])
        return " · ".join(bits)

    def execute(self, ctx, config) -> int:
        target = ctx.encode_settings(config)
        if ctx.dry_run:
            ctx.plan(f"Transcode to {target.video_codec} in {target.container}")
            return 1

        source = Path(ctx.working_path)
        cache = Path(settings.TRANSCODE_CACHE_DIR)
        cache.mkdir(parents=True, exist_ok=True)
        destination = cache / f"flow{ctx.run_id}-{source.stem[:70]}.{target.container}"

        probe = ffmpeg.probe(source)
        command = ffmpeg.build_command(target, source, destination, probe)
        ctx.record_command(command)

        ffmpeg.run(
            command,
            duration_seconds=probe.duration_seconds,
            on_progress=ctx.on_progress,
            should_cancel=ctx.should_cancel,
        )

        before = source.stat().st_size
        after = destination.stat().st_size
        if after / max(before, 1) > settings.MAX_OUTPUT_SIZE_RATIO:
            destination.unlink(missing_ok=True)
            ctx.log(f"Result was larger ({after / before:.0%}). Keeping the original.")
            return 2

        final = source.with_suffix(f".{target.container}")
        shutil.move(str(destination), str(final))
        if final != source:
            source.unlink(missing_ok=True)
        ctx.replace_working_file(final, before=before, after=after)
        ctx.log(
            f"Transcoded to {target.video_codec}: {_human(before)} → {_human(after)}"
        )
        return 1


@register
class RemuxContainer(Node):
    type = "remux_container"
    label = "Remux container"
    category = "action"
    icon = "box"
    mutating = True
    description = "Rewrap the existing streams in another container. No re-encoding."
    fields = [Field("container", "Container", "select", "mkv", CONTAINER_CHOICES)]

    def summary(self, config) -> str:
        return f"to {config.get('container', 'mkv')}"

    def execute(self, ctx, config) -> int:
        container = config.get("container", "mkv")
        source = Path(ctx.working_path)
        if source.suffix.lstrip(".").lower() == container:
            ctx.log("Already in that container, nothing to do.")
            return 1
        if ctx.dry_run:
            ctx.plan(f"Remux to {container}")
            return 1

        destination = (
            Path(settings.TRANSCODE_CACHE_DIR)
            / f"flow{ctx.run_id}-{source.stem[:70]}.{container}"
        )
        destination.parent.mkdir(parents=True, exist_ok=True)
        command = [
            settings.FFMPEG_BIN,
            "-hide_banner",
            "-nostdin",
            "-y",
            "-i",
            str(source),
            "-map",
            "0",
            "-c",
            "copy",
            "-progress",
            "pipe:1",
            "-nostats",
            str(destination),
        ]
        ctx.record_command(command)
        ffmpeg.run(
            command,
            duration_seconds=ctx.metadata.get("duration_seconds"),
            on_progress=ctx.on_progress,
            should_cancel=ctx.should_cancel,
        )

        before = source.stat().st_size
        final = source.with_suffix(f".{container}")
        shutil.move(str(destination), str(final))
        source.unlink(missing_ok=True)
        ctx.replace_working_file(final, before=before, after=final.stat().st_size)
        ctx.log(f"Remuxed to {container}")
        return 1


@register
class MoveFile(Node):
    type = "move_file"
    label = "Move file"
    category = "action"
    icon = "arrow"
    mutating = True
    description = "Move the file to another folder, creating it if needed."
    fields = [
        Field(
            "destination",
            "Destination folder",
            "text",
            "",
            placeholder="/media/archive",
        ),
        Field(
            "keep_structure",
            "Keep the folder structure below the library root",
            "checkbox",
            True,
        ),
    ]

    def summary(self, config) -> str:
        return config.get("destination") or "…"

    def execute(self, ctx, config) -> int:
        destination = (config.get("destination") or "").strip()
        if not destination:
            ctx.log("No destination set, skipping the move.")
            return 1

        source = Path(ctx.working_path)
        target_dir = Path(destination)
        if config.get("keep_structure"):
            target_dir = target_dir / Path(ctx.relative_path).parent
        target = target_dir / source.name

        if ctx.dry_run:
            ctx.plan(f"Move to {target}")
            return 1

        target_dir.mkdir(parents=True, exist_ok=True)
        shutil.move(str(source), str(target))
        ctx.replace_working_file(target)
        ctx.log(f"Moved to {target}")
        return 1


@register
class LogMessage(Node):
    type = "log_message"
    label = "Write to the log"
    category = "action"
    icon = "note"
    description = "Add a line to the job log. Handy while building a flow."
    fields = [
        Field("message", "Message", "text", "", placeholder="Reached the 4K branch")
    ]

    def summary(self, config) -> str:
        return config.get("message") or "…"

    def execute(self, ctx, config) -> int:
        ctx.log(config.get("message") or "(empty)")
        return 1


@register
class SetVariable(Node):
    type = "set_variable"
    label = "Set a variable"
    category = "action"
    icon = "tag"
    description = (
        "Store a value for later nodes to read. Available as {name} in messages."
    )
    fields = [
        Field("name", "Name", "text", "reason"),
        Field("value", "Value", "text", ""),
    ]

    def summary(self, config) -> str:
        return f"{config.get('name', '…')} = {config.get('value', '…')}"

    def execute(self, ctx, config) -> int:
        name = (config.get("name") or "").strip()
        if name:
            ctx.variables[name] = config.get("value", "")
        return 1


# ---------------------------------------------------------------------------
# Flow control
# ---------------------------------------------------------------------------
@register
class CompleteFlow(Node):
    type = "complete_flow"
    label = "Nothing to do"
    category = "flow"
    icon = "check"
    description = "End the flow here. The file is left as it is and counts as healthy."
    outputs = []
    fields = [
        Field(
            "reason",
            "Reason",
            "text",
            "Meets target",
            help="Shown on the file as its verdict.",
        )
    ]

    def summary(self, config) -> str:
        return config.get("reason") or ""

    def execute(self, ctx, config) -> int:
        ctx.verdict_reason = config.get("reason") or "Meets target"
        return 0


@register
class FailFlow(Node):
    type = "fail_flow"
    label = "Fail the flow"
    category = "flow"
    icon = "alert"
    description = "Stop and mark the file as errored, so it shows up for review."
    outputs = []
    fields = [Field("reason", "Reason", "text", "Rejected by flow")]

    def summary(self, config) -> str:
        return config.get("reason") or ""

    def execute(self, ctx, config) -> int:
        ctx.verdict_reason = config.get("reason") or "Rejected by flow"
        ctx.log(f"Flow failed: {ctx.verdict_reason}")
        return -1


def _human(num: int) -> str:
    value = float(num)
    for unit in ("B", "KB", "MB", "GB"):
        if abs(value) < 1024:
            return f"{value:.1f} {unit}"
        value /= 1024
    return f"{value:.1f} TB"
