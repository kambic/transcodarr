"""Enumerate streams and decide which ones survive a filtering operation."""

from __future__ import annotations

from dataclasses import dataclass, field

from .config import LanguagePolicy, normalize_language
from .ffmpeg import ffprobe_bin, input_args, run_json


@dataclass
class StreamInfo:
    index: int
    kind: str  # video / audio / subtitle / data / attachment
    codec: str = ""
    profile: str | None = None
    language: str = "und"
    title: str | None = None
    channels: int | None = None
    layout: str | None = None
    sample_rate: int | None = None
    bitrate: int | None = None
    width: int | None = None
    height: int | None = None
    default: bool = False
    forced: bool = False
    hearing_impaired: bool = False
    visual_impaired: bool = False
    commentary: bool = False
    attached_pic: bool = False
    type_index: int = 0  # position within its own kind (audio #0, audio #1, ...)

    @property
    def norm_language(self) -> str:
        return normalize_language(self.language)

    @property
    def descriptor(self) -> str:
        """Short human summary used in tables."""
        bits = [self.codec]
        if self.kind == "audio":
            if self.layout:
                bits.append(self.layout)
            elif self.channels:
                bits.append(f"{self.channels}ch")
            if self.sample_rate:
                bits.append(f"{self.sample_rate // 1000}kHz")
        elif self.kind == "video" and self.width:
            bits.append(f"{self.width}x{self.height}")
        return " ".join(b for b in bits if b)

    @property
    def flags(self) -> list[str]:
        out = []
        if self.default:
            out.append("default")
        if self.forced:
            out.append("forced")
        if self.commentary:
            out.append("commentary")
        if self.hearing_impaired:
            out.append("SDH")
        if self.visual_impaired:
            out.append("AD")
        if self.attached_pic:
            out.append("cover art")
        return out

    @property
    def map_spec(self) -> str:
        return f"0:{self.index}"


@dataclass
class Decision:
    stream: StreamInfo
    keep: bool
    reason: str


@dataclass
class Plan:
    decisions: list[Decision] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)

    @property
    def kept(self) -> list[StreamInfo]:
        return [d.stream for d in self.decisions if d.keep]

    @property
    def dropped(self) -> list[StreamInfo]:
        return [d.stream for d in self.decisions if not d.keep]

    @property
    def changes_anything(self) -> bool:
        return bool(self.dropped)

    def map_args(self) -> list[str]:
        args: list[str] = []
        for stream in self.kept:
            args += ["-map", stream.map_spec]
        return args


def _b(disposition: dict, key: str) -> bool:
    return bool(disposition.get(key))


def list_streams(
    url: str, timeout: float = 20.0, analyze: float = 5.0
) -> list[StreamInfo]:
    """Every stream in `url`, in container order."""
    cmd = [
        ffprobe_bin(),
        "-hide_banner",
        "-v",
        "error",
        *input_args(url, timeout=timeout, analyze=analyze),
        "-show_streams",
        "-of",
        "json",
        url,
    ]
    data = run_json(cmd, timeout=timeout + analyze + 15)
    counters: dict[str, int] = {}
    streams: list[StreamInfo] = []
    for entry in data.get("streams", []):
        kind = entry.get("codec_type", "data")
        tags = {k.lower(): v for k, v in (entry.get("tags") or {}).items()}
        disposition = entry.get("disposition") or {}
        title = tags.get("title")
        index_in_kind = counters.get(kind, 0)
        counters[kind] = index_in_kind + 1
        try:
            bitrate = int(entry.get("bit_rate") or tags.get("bps") or 0) or None
        except TypeError, ValueError:
            bitrate = None
        streams.append(
            StreamInfo(
                index=int(entry.get("index", 0)),
                kind=kind,
                codec=entry.get("codec_name", "?"),
                profile=entry.get("profile"),
                language=tags.get("language", "und"),
                title=title,
                channels=entry.get("channels"),
                layout=entry.get("channel_layout"),
                sample_rate=(
                    int(entry["sample_rate"]) if entry.get("sample_rate") else None
                ),
                bitrate=bitrate,
                width=entry.get("width"),
                height=entry.get("height"),
                default=_b(disposition, "default"),
                forced=_b(disposition, "forced"),
                hearing_impaired=_b(disposition, "hearing_impaired"),
                visual_impaired=_b(disposition, "visual_impaired"),
                commentary=_b(disposition, "comment")
                or bool(title and "comment" in title.lower()),
                attached_pic=_b(disposition, "attached_pic"),
                type_index=index_in_kind,
            )
        )
    return streams


# --------------------------------------------------------------------------- #
# planners
# --------------------------------------------------------------------------- #
def plan_languages(
    streams: list[StreamInfo],
    policy: LanguagePolicy,
    kinds: list[str] | None = None,
    drop_commentary: bool = False,
) -> Plan:
    """Keep only streams whose language is in the preferred list.

    Video and attachments are always kept. Per stream kind, if nothing matched
    the preference list the policy can fall back to keeping the first stream so
    the output never ends up with, say, no audio at all.
    """
    targets = [k.lower() for k in (kinds or policy.apply_to)]
    plan = Plan()
    plan.notes.append("preferred: " + ", ".join(policy.preferred))

    by_kind: dict[str, list[StreamInfo]] = {}
    for stream in streams:
        by_kind.setdefault(stream.kind, []).append(stream)

    rescued: set[int] = set()
    for kind in targets:
        pool = by_kind.get(kind, [])
        if not pool:
            continue
        survivors = [
            s
            for s in pool
            if policy.wants(s.language) and not (drop_commentary and s.commentary)
        ]
        if survivors:
            continue
        # Nothing in this kind matched. Rather than silently producing a file with
        # no audio at all, optionally rescue the default (or first) stream. This is
        # deliberately only a last resort: many containers flag several streams as
        # default, so honouring that flag eagerly would defeat the whole filter.
        if policy.fallback_keep_first or policy.keep_default_stream:
            candidates = [
                s for s in pool if not (drop_commentary and s.commentary)
            ] or pool
            fallback = next((s for s in candidates if s.default), candidates[0])
            rescued.add(fallback.index)
            plan.notes.append(
                f"no {kind} stream matched - keeping #{fallback.index} "
                f"({fallback.norm_language}) as a fallback"
            )

    for stream in streams:
        if stream.kind not in targets:
            reason = (
                "video is always kept"
                if stream.kind == "video"
                else "not targeted by this filter"
            )
            plan.decisions.append(Decision(stream, True, reason))
            continue
        if stream.index in rescued:
            plan.decisions.append(
                Decision(stream, True, "fallback - nothing else matched")
            )
            continue
        if drop_commentary and stream.commentary:
            plan.decisions.append(Decision(stream, False, "commentary track"))
            continue
        if policy.wants(stream.language):
            if normalize_language(stream.language) == "und":
                plan.decisions.append(
                    Decision(stream, True, "untagged, keep_undetermined")
                )
            else:
                plan.decisions.append(
                    Decision(stream, True, f"preferred ({stream.norm_language})")
                )
            continue
        plan.decisions.append(
            Decision(stream, False, f"language {stream.norm_language}")
        )
    return plan


def plan_audio(
    streams: list[StreamInfo],
    keep: list[int] | None = None,
    keep_languages: list[str] | None = None,
    keep_first: bool = False,
    drop_commentary: bool = False,
) -> Plan:
    """Drop audio streams. With no options at all, every audio track goes."""
    plan = Plan()
    audio = [s for s in streams if s.kind == "audio"]
    keep_set = set(keep or [])
    wanted_langs = [normalize_language(x) for x in (keep_languages or [])]

    first_index = None
    if keep_first and audio:
        preferred = [s for s in audio if not s.commentary] or audio
        first_index = next(
            (s.index for s in preferred if s.default), preferred[0].index
        )

    for stream in streams:
        if stream.kind != "audio":
            plan.decisions.append(Decision(stream, True, "not an audio stream"))
            continue
        if drop_commentary and stream.commentary:
            plan.decisions.append(Decision(stream, False, "commentary track"))
            continue
        if stream.type_index in keep_set or stream.index in keep_set:
            plan.decisions.append(Decision(stream, True, "explicitly kept"))
            continue
        if wanted_langs and stream.norm_language in wanted_langs:
            plan.decisions.append(
                Decision(stream, True, f"language {stream.norm_language}")
            )
            continue
        if stream.index == first_index:
            plan.decisions.append(Decision(stream, True, "first/default audio kept"))
            continue
        plan.decisions.append(Decision(stream, False, "audio removed"))

    if not any(d.keep and d.stream.kind == "audio" for d in plan.decisions):
        plan.notes.append("output will have no audio track")
    return plan
