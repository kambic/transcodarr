1"""Transform operations: stream filtering, metadata editing and segment cutting."""

from __future__ import annotations

import os
import re
from dataclasses import dataclass, field
from pathlib import Path

from .ffmpeg import ProbeError, RunResult, ffprobe_bin, input_args, run_ffmpeg, run_json
from .streams import Plan, StreamInfo

# --------------------------------------------------------------------------- #
# timecodes
# --------------------------------------------------------------------------- #
_CLOCK = re.compile(r"^(?:(\d+):)?(\d{1,2}):(\d{1,2}(?:\.\d+)?)$")
_COMPOUND = re.compile(
    r"^(?:(\d+(?:\.\d+)?)h)?(?:(\d+(?:\.\d+)?)m)?(?:(\d+(?:\.\d+)?)s)?$"
)


def parse_timecode(value: str | float | None) -> float | None:
    """Accept 90, '90', '1:30', '00:01:30.5' or '1h2m3s' and return seconds."""
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).strip().lower()
    try:
        return float(text)
    except ValueError:
        pass
    clock = _CLOCK.match(text)
    if clock:
        hours = float(clock.group(1) or 0)
        return hours * 3600 + float(clock.group(2)) * 60 + float(clock.group(3))
    compound = _COMPOUND.match(text)
    if compound and any(compound.groups()):
        hours, minutes, seconds = (float(g or 0) for g in compound.groups())
        return hours * 3600 + minutes * 60 + seconds
    raise ValueError(f"could not parse timecode '{value}' (try 90, 1:30 or 00:01:30.5)")


def format_timecode(seconds: float | None) -> str:
    if seconds is None:
        return "-"
    hours, rem = divmod(int(seconds), 3600)
    minutes, secs = divmod(rem, 60)
    frac = seconds - int(seconds)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{int(round(frac * 1000)):03d}"


# --------------------------------------------------------------------------- #
# output paths
# --------------------------------------------------------------------------- #
def derive_output(
    source: str,
    suffix: str,
    output: str | None = None,
    output_dir: str | None = None,
    extension: str | None = None,
) -> str:
    """Build a sensible output path when the user did not give one."""
    if output:
        target = Path(output).expanduser()
        if target.is_dir():
            stem = Path(source).stem
            ext = extension or Path(source).suffix or ".mkv"
            return str(target / f"{stem}{suffix}{ext}")
        return str(target)
    src = Path(source)
    stem = src.stem or "output"
    ext = extension or (src.suffix if src.suffix else ".mkv")
    directory = (
        Path(output_dir).expanduser() if output_dir else (src.parent or Path("."))
    )
    return str(directory / f"{stem}{suffix}{ext}")


def ensure_parent(path: str) -> None:
    parent = Path(path).parent
    if str(parent) and not parent.exists():
        parent.mkdir(parents=True, exist_ok=True)


def quote_cmd(cmd: list[str]) -> str:
    out = []
    for token in cmd:
        out.append(f"'{token}'" if (" " in token or ";" in token) else token)
    return " ".join(out)


# --------------------------------------------------------------------------- #
# remux with a stream plan
# --------------------------------------------------------------------------- #
@dataclass
class Metadata:
    """Metadata edits to apply to a container."""

    clear: bool = False
    global_tags: dict[str, str] = field(default_factory=dict)
    stream_tags: dict[int, dict[str, str]] = field(default_factory=dict)
    default_audio: int | None = None
    default_subtitle: int | None = None
    clear_chapters: bool = False

    @property
    def empty(self) -> bool:
        return not (
            self.clear
            or self.global_tags
            or self.stream_tags
            or self.default_audio is not None
            or self.default_subtitle is not None
            or self.clear_chapters
        )

    def args(self, streams: list[StreamInfo] | None = None) -> list[str]:
        """ffmpeg arguments; stream tags are indexed by *output* position."""
        args: list[str] = []
        if self.clear:
            args += ["-map_metadata", "-1"]
        if self.clear_chapters:
            args += ["-map_chapters", "-1"]
        for key, value in self.global_tags.items():
            args += ["-metadata", f"{key}={value}"]

        order = {s.index: pos for pos, s in enumerate(streams or [])}
        for stream_index, tags in self.stream_tags.items():
            position = order.get(stream_index, stream_index)
            for key, value in tags.items():
                args += ["-metadata:s:" + str(position), f"{key}={value}"]

        if self.default_audio is not None or self.default_subtitle is not None:
            for kind, chosen in (
                ("a", self.default_audio),
                ("s", self.default_subtitle),
            ):
                if chosen is None:
                    continue
                wanted_kind = "audio" if kind == "a" else "subtitle"
                kind_streams = [s for s in (streams or []) if s.kind == wanted_kind]
                # `chosen` is 0-based within this kind, matching how ffmpeg and
                # players number tracks - not the container-wide stream index.
                for position, _stream in enumerate(kind_streams):
                    args += [
                        f"-disposition:{kind}:{position}",
                        "default" if position == chosen else "0",
                    ]
        return args


def apply_plan(
    source: str,
    plan: Plan,
    output: str,
    metadata: Metadata | None = None,
    extra_args: list[str] | None = None,
    faststart: bool = False,
    overwrite: bool = True,
    timeout: float = 3600.0,
    dry_run: bool = False,
) -> RunResult:
    """Remux `source` keeping only the streams in `plan` (stream copy, no re-encode)."""
    ensure_parent(output)
    args = ["-i", source]
    args += plan.map_args()
    args += ["-c", "copy"]
    if metadata and not metadata.empty:
        args += metadata.args(plan.kept)
    if faststart and Path(output).suffix.lower() in {".mp4", ".m4v", ".mov"}:
        args += ["-movflags", "+faststart"]
    args += list(extra_args or [])
    args += [output]

    if dry_run:
        from .ffmpeg import ffmpeg_bin

        return RunResult(
            cmd=[ffmpeg_bin(), "-hide_banner", "-nostdin", "-y", *args],
            returncode=0,
            stderr="",
            wall_time=0.0,
            output=output,
        )
    return run_ffmpeg(args, output=output, timeout=timeout, overwrite=overwrite)


# --------------------------------------------------------------------------- #
# cutting
# --------------------------------------------------------------------------- #
def nearest_keyframe(
    source: str, position: float, window: float = 30.0, timeout: float = 30.0
) -> float | None:
    """Timestamp of the last keyframe at or before `position`.

    In stream-copy mode the cut lands here rather than exactly on `position`,
    so it is worth telling the user about the drift up front.
    """
    start = max(position - window, 0.0)
    cmd = [
        ffprobe_bin(),
        "-hide_banner",
        "-v",
        "error",
        "-skip_frame",
        "nokey",
        "-select_streams",
        "v:0",
        "-read_intervals",
        f"{start:g}%{position + 0.5:g}",
        "-show_entries",
        "frame=pts_time,best_effort_timestamp_time",
        "-of",
        "json",
        source,
    ]
    try:
        data = run_json(cmd, timeout=timeout)
    except ProbeError:
        return None
    times: list[float] = []
    for frame in data.get("frames", []):
        for key in ("pts_time", "best_effort_timestamp_time"):
            value = frame.get(key)
            try:
                times.append(float(value))
                break
            except TypeError, ValueError:
                continue
    candidates = [t for t in times if t <= position + 0.001]
    if candidates:
        return max(candidates)
    return min(times) if times else None


@dataclass
class CutSpec:
    start: float = 0.0
    duration: float | None = 60.0
    end: float | None = None
    accurate: bool = False
    video_codec: str = "libx264"
    audio_codec: str = "aac"
    crf: int = 18
    preset: str = "veryfast"
    fade: float = 0.0

    @property
    def stop(self) -> float | None:
        if self.end is not None:
            return self.end
        if self.duration is not None:
            return self.start + self.duration
        return None


def cut(
    source: str,
    output: str,
    spec: CutSpec,
    plan: Plan | None = None,
    metadata: Metadata | None = None,
    overwrite: bool = True,
    timeout: float = 3600.0,
    dry_run: bool = False,
) -> RunResult:
    """Extract a segment. Stream copy by default; `accurate` re-encodes.

    Fast seek (`-ss` before `-i`) is used in both modes: with a stream copy the
    cut snaps to the preceding keyframe, while re-encoding makes it exact.
    """
    ensure_parent(output)
    args: list[str] = []
    if spec.start:
        args += ["-ss", f"{spec.start:.3f}"]
    args += ["-i", source]
    if spec.end is not None:
        args += ["-to", f"{max(spec.end - spec.start, 0):.3f}"]
    elif spec.duration is not None:
        args += ["-t", f"{spec.duration:.3f}"]

    if plan is not None:
        args += plan.map_args()
    else:
        args += ["-map", "0"]

    if spec.accurate:
        args += [
            "-c:v",
            spec.video_codec,
            "-preset",
            spec.preset,
            "-crf",
            str(spec.crf),
        ]
        args += ["-c:a", spec.audio_codec]
        if spec.fade > 0:
            length = spec.duration or 0
            filters = [f"fade=t=in:st=0:d={spec.fade:g}"]
            if length:
                filters.append(
                    f"fade=t=out:st={max(length - spec.fade, 0):g}:d={spec.fade:g}"
                )
            args += ["-vf", ",".join(filters)]
        args += ["-c:s", "copy"]
    else:
        args += ["-c", "copy", "-avoid_negative_ts", "make_zero"]

    if metadata and not metadata.empty:
        args += metadata.args(plan.kept if plan else None)
    if Path(output).suffix.lower() in {".mp4", ".m4v", ".mov"}:
        args += ["-movflags", "+faststart"]
    args += [output]

    if dry_run:
        from .ffmpeg import ffmpeg_bin

        return RunResult(
            cmd=[ffmpeg_bin(), "-hide_banner", "-nostdin", "-y", *args],
            returncode=0,
            stderr="",
            wall_time=0.0,
            output=output,
        )
    return run_ffmpeg(args, output=output, timeout=timeout, overwrite=overwrite)


# --------------------------------------------------------------------------- #
# metadata-only edit
# --------------------------------------------------------------------------- #
def edit_metadata(
    source: str,
    output: str,
    metadata: Metadata,
    streams: list[StreamInfo] | None = None,
    overwrite: bool = True,
    timeout: float = 1800.0,
    dry_run: bool = False,
) -> RunResult:
    """Rewrite container/stream metadata without touching the media itself."""
    ensure_parent(output)
    args = ["-i", source, "-map", "0", "-c", "copy"]
    args += metadata.args(streams)
    if Path(output).suffix.lower() in {".mp4", ".m4v", ".mov"}:
        args += ["-movflags", "+faststart"]
    args += [output]

    if dry_run:
        from .ffmpeg import ffmpeg_bin

        return RunResult(
            cmd=[ffmpeg_bin(), "-hide_banner", "-nostdin", "-y", *args],
            returncode=0,
            stderr="",
            wall_time=0.0,
            output=output,
        )
    return run_ffmpeg(args, output=output, timeout=timeout, overwrite=overwrite)


def read_tags(source: str, timeout: float = 20.0) -> dict[str, str]:
    """Container-level tags currently present on `source`."""
    cmd = [
        ffprobe_bin(),
        "-hide_banner",
        "-v",
        "error",
        *input_args(source, timeout=timeout, analyze=2),
        "-show_entries",
        "format_tags",
        "-of",
        "json",
        source,
    ]
    data = run_json(cmd, timeout=timeout + 15)
    tags = (data.get("format") or {}).get("tags") or {}
    return {str(k): str(v) for k, v in tags.items()}


def parse_kv(pairs: list[str] | None) -> dict[str, str]:
    """Turn ['title=Foo', 'comment=Bar'] into a dict."""
    out: dict[str, str] = {}
    for item in pairs or []:
        if "=" not in item:
            raise ValueError(f"metadata must be KEY=VALUE, got '{item}'")
        key, _, value = item.partition("=")
        key = key.strip()
        if not key:
            raise ValueError(f"empty metadata key in '{item}'")
        out[key] = value
    return out


def parse_stream_kv(pairs: list[str] | None) -> dict[int, dict[str, str]]:
    """Turn ['1:language=eng', '2:title=Commentary'] into {1: {...}, 2: {...}}."""
    out: dict[int, dict[str, str]] = {}
    for item in pairs or []:
        stream_part, _, rest = item.partition(":")
        if not rest or "=" not in rest:
            raise ValueError(f"stream metadata must be INDEX:KEY=VALUE, got '{item}'")
        try:
            index = int(stream_part)
        except ValueError as exc:
            raise ValueError(
                f"'{stream_part}' is not a stream index in '{item}'"
            ) from exc
        key, _, value = rest.partition("=")
        out.setdefault(index, {})[key.strip()] = value
    return out


def file_size(path: str) -> int | None:
    try:
        return os.path.getsize(path)
    except OSError:
        return None
