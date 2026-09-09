"""ABR ladder analysis: parse HLS/DASH manifests and check switching behaviour.

The questions this answers are the ones that actually break adaptive playback:
are the renditions switchable at all (aligned keyframes and segment boundaries),
does the declared bandwidth match reality, and is each rung earning its place on
the ladder?
"""

from __future__ import annotations

import os
import re
import statistics
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from typing import Iterable

from vidprobe.ffmpeg import ProbeError, ffprobe_bin, input_args, run_json
from vidprobe.models import ProbeResult
from vidprobe.quality import QualityResult

ATTRIBUTE = re.compile(r'([A-Z0-9\-]+)=("[^"]*"|[^,]+)')
# how far apart two keyframes may be and still count as the same switch point
SWITCH_TOLERANCE = 0.050  # seconds


# --------------------------------------------------------------------------- #
# data model
# --------------------------------------------------------------------------- #
@dataclass
class Segment:
    uri: str = ""
    duration: float = 0.0
    start: float = 0.0
    discontinuity: bool = False

    @property
    def end(self) -> float:
        return self.start + self.duration


@dataclass
class Variant:
    """One rung of the ladder."""

    uri: str = ""
    path: str = ""
    name: str = ""
    bandwidth: int | None = None  # declared peak
    average_bandwidth: int | None = None
    width: int | None = None
    height: int | None = None
    codecs: str | None = None
    frame_rate: float | None = None
    audio_group: str | None = None
    segments: list[Segment] = field(default_factory=list)
    target_duration: float | None = None
    independent_segments: bool = False
    probe: ProbeResult | None = None
    keyframes: list[float] = field(default_factory=list)
    quality: QualityResult | None = None
    stream_select: int = 0  # which video stream of `path` this rung is
    error: str | None = None

    # ---- derived ---------------------------------------------------------- #
    @property
    def label(self) -> str:
        if self.name:
            return self.name
        if self.height:
            return f"{self.height}p"
        return os.path.basename(self.uri) or self.uri

    @property
    def resolution(self) -> str:
        if self.width and self.height:
            return f"{self.width}x{self.height}"
        return "-"

    @property
    def pixels(self) -> int:
        return (self.width or 0) * (self.height or 0)

    @property
    def measured_bitrate(self) -> float | None:
        """Bitrate we actually observed, preferring packet measurement."""
        if self.probe and self.probe.frames and self.probe.frames.bitrate_avg:
            return self.probe.frames.bitrate_avg
        if self.probe and self.probe.video and self.probe.video.bitrate:
            return float(self.probe.video.bitrate)
        if self.probe and self.probe.container.bitrate:
            return float(self.probe.container.bitrate)
        return None

    @property
    def measured_peak(self) -> float | None:
        if self.probe and self.probe.frames and self.probe.frames.bitrate_peak:
            return self.probe.frames.bitrate_peak
        return None

    @property
    def effective_bandwidth(self) -> float | None:
        """What a player will use when deciding: declared if present."""
        return float(self.bandwidth) if self.bandwidth else self.measured_bitrate

    @property
    def bits_per_pixel(self) -> float | None:
        rate = self.measured_bitrate or self.effective_bandwidth
        fps = self.frame_rate or (
            self.probe.video.fps if self.probe and self.probe.video else None
        )
        if rate and self.pixels and fps:
            return rate / (self.pixels * fps)
        return None

    @property
    def segment_durations(self) -> list[float]:
        return [s.duration for s in self.segments]

    @property
    def boundaries(self) -> list[float]:
        return [s.start for s in self.segments]

    @property
    def gop_seconds(self) -> float | None:
        if len(self.keyframes) < 2:
            return None
        gaps = [b - a for a, b in zip(self.keyframes, self.keyframes[1:]) if b > a]
        return statistics.median(gaps) if gaps else None


@dataclass
class Check:
    """One verdict from the analysis."""

    level: str  # ok | warn | fail | info
    title: str
    detail: str = ""

    @property
    def failed(self) -> bool:
        return self.level == "fail"


@dataclass
class Ladder:
    source: str = ""
    kind: str = "files"  # hls | dash | files
    variants: list[Variant] = field(default_factory=list)
    audio_renditions: list[dict] = field(default_factory=list)
    independent_segments: bool = False
    checks: list[Check] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)

    @property
    def ordered(self) -> list[Variant]:
        return sorted(
            self.variants,
            key=lambda v: (v.effective_bandwidth or 0, v.pixels),
        )

    @property
    def failures(self) -> list[Check]:
        return [c for c in self.checks if c.level == "fail"]

    @property
    def warnings(self) -> list[Check]:
        return [c for c in self.checks if c.level == "warn"]


# --------------------------------------------------------------------------- #
# fetching and parsing
# --------------------------------------------------------------------------- #
def is_url(target: str) -> bool:
    return target.lower().startswith(("http://", "https://"))


def fetch_text(target: str, timeout: float = 20.0) -> str:
    if is_url(target):
        request = urllib.request.Request(target, headers={"User-Agent": "vidprobe"})
        with urllib.request.urlopen(request, timeout=timeout) as response:  # noqa: S310
            return response.read().decode("utf-8", errors="replace")
    with open(target, "r", encoding="utf-8", errors="replace") as handle:
        return handle.read()


def resolve(base: str, uri: str) -> str:
    if is_url(uri) or os.path.isabs(uri):
        return uri
    if is_url(base):
        return urllib.parse.urljoin(base, uri)
    return os.path.normpath(os.path.join(os.path.dirname(base) or ".", uri))


def parse_attributes(line: str) -> dict[str, str]:
    _, _, rest = line.partition(":")
    out: dict[str, str] = {}
    for key, value in ATTRIBUTE.findall(rest):
        out[key] = value.strip().strip('"')
    return out


def _float(value: str | None) -> float | None:
    try:
        return float(value)  # type: ignore[arg-type]
    except TypeError, ValueError:
        return None


def _int(value: str | None) -> int | None:
    try:
        return int(float(value))  # type: ignore[arg-type]
    except TypeError, ValueError:
        return None


def looks_like_manifest(target: str) -> bool:
    lowered = target.lower().split("?")[0]
    return lowered.endswith((".m3u8", ".m3u", ".mpd"))


def parse_hls_master(text: str, source: str) -> Ladder:
    """Parse a master playlist. Returns a ladder with unresolved media playlists."""
    ladder = Ladder(source=source, kind="hls")
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    ladder.independent_segments = any(
        ln.startswith("#EXT-X-INDEPENDENT-SEGMENTS") for ln in lines
    )

    pending: dict | None = None
    for line in lines:
        if line.startswith("#EXT-X-STREAM-INF"):
            pending = parse_attributes(line)
            continue
        if line.startswith("#EXT-X-MEDIA"):
            attrs = parse_attributes(line)
            if attrs.get("TYPE") in {"AUDIO", "SUBTITLES"}:
                ladder.audio_renditions.append(attrs)
            continue
        if line.startswith("#"):
            continue
        if pending is not None:
            resolution = pending.get("RESOLUTION", "")
            width = height = None
            if "x" in resolution:
                width, _, height = resolution.partition("x")
                width, height = _int(width), _int(height)
            ladder.variants.append(
                Variant(
                    uri=line,
                    path=resolve(source, line),
                    name=pending.get("NAME", ""),
                    bandwidth=_int(pending.get("BANDWIDTH")),
                    average_bandwidth=_int(pending.get("AVERAGE-BANDWIDTH")),
                    width=width,
                    height=height,
                    codecs=pending.get("CODECS"),
                    frame_rate=_float(pending.get("FRAME-RATE")),
                    audio_group=pending.get("AUDIO"),
                    independent_segments=ladder.independent_segments,
                )
            )
            pending = None
    return ladder


def parse_hls_media(text: str, source: str) -> tuple[list[Segment], float | None, bool]:
    """Parse a media playlist into segments with cumulative start times."""
    segments: list[Segment] = []
    target: float | None = None
    independent = False
    duration = 0.0
    clock = 0.0
    discontinuity = False

    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue
        if line.startswith("#EXT-X-TARGETDURATION"):
            target = _float(line.partition(":")[2])
        elif line.startswith("#EXT-X-INDEPENDENT-SEGMENTS"):
            independent = True
        elif line.startswith("#EXT-X-DISCONTINUITY"):
            discontinuity = True
        elif line.startswith("#EXTINF"):
            duration = _float(line.partition(":")[2].split(",")[0]) or 0.0
        elif not line.startswith("#"):
            segments.append(
                Segment(
                    uri=resolve(source, line),
                    duration=duration,
                    start=clock,
                    discontinuity=discontinuity,
                )
            )
            clock += duration
            duration = 0.0
            discontinuity = False
    return segments, target, independent


def parse_dash(text: str, source: str) -> Ladder:
    """Parse an MPD into the same ladder shape (video adaptation sets only)."""
    ladder = Ladder(source=source, kind="dash")
    try:
        root = ET.fromstring(text)
    except ET.ParseError as exc:
        raise ProbeError(f"could not parse MPD: {exc}") from exc

    namespace = ""
    if root.tag.startswith("{"):
        namespace = root.tag[: root.tag.index("}") + 1]

    def find_all(node, tag):
        return node.findall(f"{namespace}{tag}")

    video_ordinal = 0
    for period in find_all(root, "Period") or [root]:
        for adaptation in find_all(period, "AdaptationSet"):
            mime = adaptation.get("mimeType") or ""
            content = adaptation.get("contentType") or ""
            is_video = "video" in mime or content == "video"
            if not is_video and not find_all(adaptation, "Representation"):
                continue
            for rep in find_all(adaptation, "Representation"):
                rep_mime = rep.get("mimeType") or mime
                if not is_video and "video" not in rep_mime:
                    ladder.audio_renditions.append(
                        {
                            "TYPE": "AUDIO",
                            "NAME": rep.get("id", ""),
                            "BANDWIDTH": rep.get("bandwidth", ""),
                            "CODECS": rep.get("codecs", ""),
                        }
                    )
                    continue
                frame_rate = rep.get("frameRate") or adaptation.get("frameRate")
                if frame_rate and "/" in str(frame_rate):
                    num, _, den = str(frame_rate).partition("/")
                    frame_rate = (_float(num) or 0) / (_float(den) or 1)
                ladder.variants.append(
                    Variant(
                        uri=rep.get("id", ""),
                        path=source,  # DASH needs the MPD itself as the ffmpeg input
                        stream_select=video_ordinal,
                        name=rep.get("id", ""),
                        bandwidth=_int(rep.get("bandwidth")),
                        width=_int(rep.get("width") or adaptation.get("width")),
                        height=_int(rep.get("height") or adaptation.get("height")),
                        codecs=rep.get("codecs") or adaptation.get("codecs"),
                        frame_rate=_float(frame_rate) if frame_rate else None,
                    )
                )
                video_ordinal += 1
    ladder.notes.append(
        "DASH representations are read through the MPD, one video stream per "
        "representation"
    )
    return ladder


def load_ladder(sources: list[str], timeout: float = 20.0) -> Ladder:
    """Build a ladder from a manifest URL/path, or from a list of rendition files."""
    if len(sources) == 1 and looks_like_manifest(sources[0]):
        target = sources[0]
        text = fetch_text(target, timeout=timeout)
        if target.lower().split("?")[0].endswith(".mpd") or text.lstrip().startswith(
            "<"
        ):
            return parse_dash(text, target)
        if "#EXT-X-STREAM-INF" not in text:
            raise ProbeError(
                "this looks like a media playlist, not a master playlist - "
                "point vidprobe at the master manifest, or pass the renditions "
                "as separate files"
            )
        ladder = parse_hls_master(text, target)
        for variant in ladder.variants:
            try:
                media = fetch_text(variant.path, timeout=timeout)
            except (OSError, urllib.error.URLError) as exc:  # type: ignore[attr-defined]
                variant.error = f"media playlist unreadable: {exc}"
                continue
            segments, target_duration, independent = parse_hls_media(
                media, variant.path
            )
            variant.segments = segments
            variant.target_duration = target_duration
            variant.independent_segments = variant.independent_segments or independent
        return ladder

    ladder = Ladder(source=", ".join(sources), kind="files")
    for path in sources:
        ladder.variants.append(
            Variant(uri=path, path=path, name=os.path.basename(path))
        )
    ladder.notes.append("ad-hoc ladder from files - no manifest to validate against")
    return ladder


# --------------------------------------------------------------------------- #
# measurement
# --------------------------------------------------------------------------- #
def keyframe_times(
    source: str,
    window: float = 30.0,
    timeout: float = 60.0,
    start: float = 0.0,
    video_index: int = 0,
) -> list[float]:
    """Presentation timestamps of keyframes - the only legal switch points."""
    args = [
        ffprobe_bin(),
        "-hide_banner",
        "-v",
        "error",
        "-skip_frame",
        "nokey",
        "-select_streams",
        f"v:{video_index}",
    ]
    if window:
        interval = f"{start:g}%+{window:g}" if start else f"%+{window:g}"
        args += ["-read_intervals", interval]
    args += [
        "-show_entries",
        "frame=pts_time,best_effort_timestamp_time",
        "-of",
        "json",
        source,
    ]
    data = run_json(args, timeout=timeout)
    times: list[float] = []
    for frame in data.get("frames", []):
        for key in ("pts_time", "best_effort_timestamp_time"):
            value = _float(frame.get(key))
            if value is not None:
                times.append(value)
                break
    return sorted(times)


def fill_variant(
    variant: Variant, window: float, timeout: float, analyze: float, deep: bool = True
) -> None:
    """Probe one rung and collect its keyframe positions."""
    from vidprobe.probe import probe as probe_input

    try:
        variant.probe = probe_input(
            variant.path,
            duration=window,
            timeout=timeout,
            analyze=analyze,
            deep=deep,
            video_index=variant.stream_select,
        )
    except ProbeError as exc:
        variant.error = str(exc)
        return
    if variant.probe.video:
        variant.width = variant.width or variant.probe.video.width
        variant.height = variant.height or variant.probe.video.height
        variant.frame_rate = variant.frame_rate or variant.probe.video.fps
    try:
        variant.keyframes = keyframe_times(
            variant.path,
            window=window,
            timeout=timeout + window * 2 + 30,
            video_index=variant.stream_select,
        )
    except ProbeError as exc:
        variant.error = variant.error or f"keyframe scan failed: {exc}"


# --------------------------------------------------------------------------- #
# alignment
# --------------------------------------------------------------------------- #
@dataclass
class AlignmentReport:
    reference: str = ""
    rows: list[dict] = field(default_factory=list)
    common_points: list[float] = field(default_factory=list)
    switchable: bool = True
    max_drift: float = 0.0
    checks: list[Check] = field(default_factory=list)


def analyse_alignment(
    ladder: Ladder, tolerance: float = SWITCH_TOLERANCE
) -> AlignmentReport:
    """Compare keyframe positions across rungs.

    A player can only switch at a point where *every* rendition starts a fresh
    IDR frame. If the ladder's keyframes drift apart, switching either stalls or
    produces a visible glitch, no matter how good the individual encodes are.
    """
    report = AlignmentReport()
    usable = [v for v in ladder.ordered if v.keyframes and not v.error]
    if len(usable) < 2:
        report.checks.append(
            Check(
                "info",
                "not enough renditions",
                "need at least two probed renditions to compare switch points",
            )
        )
        report.switchable = False
        return report

    base = usable[0]
    report.reference = base.label
    report.common_points = list(base.keyframes)

    for variant in usable:
        drifts: list[float] = []
        matched = 0
        for point in base.keyframes:
            nearest = min(variant.keyframes, key=lambda t: abs(t - point))
            delta = abs(nearest - point)
            drifts.append(delta)
            if delta <= tolerance:
                matched += 1
        worst = max(drifts) if drifts else 0.0
        report.max_drift = max(report.max_drift, worst)
        report.rows.append(
            {
                "variant": variant.label,
                "keyframes": len(variant.keyframes),
                "gop": variant.gop_seconds,
                "matched": matched,
                "total": len(base.keyframes),
                "max_drift": worst,
                "aligned": matched == len(base.keyframes),
            }
        )
        if matched != len(base.keyframes):
            report.switchable = False

    # switch points every rendition agrees on
    common = []
    for point in base.keyframes:
        if all(
            any(abs(t - point) <= tolerance for t in variant.keyframes)
            for variant in usable
        ):
            common.append(point)
    report.common_points = common

    if report.switchable:
        report.checks.append(
            Check(
                "ok",
                "keyframes aligned",
                f"all {len(usable)} renditions share {len(common)} switch points "
                f"(max drift {report.max_drift * 1000:.0f} ms)",
            )
        )
    else:
        report.checks.append(
            Check(
                "fail",
                "keyframes not aligned",
                f"renditions disagree by up to {report.max_drift * 1000:.0f} ms; "
                f"only {len(common)} common switch point(s). Re-encode the ladder with "
                f"forced IDR frames at identical timestamps "
                f"(-force_key_frames 'expr:gte(t,n_forced*N)' on every rung).",
            )
        )

    gops = [row["gop"] for row in report.rows if row["gop"]]
    if gops and max(gops) - min(gops) > 0.05:
        report.checks.append(
            Check(
                "warn",
                "GOP length varies across rungs",
                f"{min(gops):.2f}s to {max(gops):.2f}s - switch opportunities are "
                f"limited by the longest GOP",
            )
        )
    return report


# --------------------------------------------------------------------------- #
# ladder analysis
# --------------------------------------------------------------------------- #
def analyse_ladder(ladder: Ladder) -> list[Check]:
    """Structural and rate checks over the whole ladder."""
    checks: list[Check] = []
    rungs = ladder.ordered
    if not rungs:
        return [Check("fail", "empty ladder", "no renditions found")]

    checks.append(
        Check("info", f"{len(rungs)} rungs", " · ".join(f"{v.label}" for v in rungs))
    )

    # --- spacing between rungs -------------------------------------------- #
    tight, gaps = [], []
    for lower, upper in zip(rungs, rungs[1:]):
        low = lower.effective_bandwidth
        high = upper.effective_bandwidth
        if not low or not high:
            continue
        ratio = high / low
        if ratio < 1.3:
            tight.append(f"{lower.label}→{upper.label} ({ratio:.2f}x)")
        elif ratio > 2.5:
            gaps.append(f"{lower.label}→{upper.label} ({ratio:.2f}x)")
    if tight:
        checks.append(
            Check(
                "warn",
                "rungs too close together",
                "these steps are under 1.3x apart, so switching between them barely "
                "changes quality while costing a switch: " + ", ".join(tight),
            )
        )
    if gaps:
        checks.append(
            Check(
                "warn",
                "large bitrate gaps",
                "over 2.5x between neighbours means a visible quality jump on switch: "
                + ", ".join(gaps),
            )
        )
    if not tight and not gaps:
        checks.append(
            Check(
                "ok",
                "rung spacing sensible",
                "every step is between 1.3x and 2.5x its neighbour",
            )
        )

    # --- resolution should rise with bitrate ------------------------------- #
    out_of_order = [
        f"{lower.label} ({lower.resolution}) → {upper.label} ({upper.resolution})"
        for lower, upper in zip(rungs, rungs[1:])
        if lower.pixels and upper.pixels and upper.pixels < lower.pixels
    ]
    if out_of_order:
        checks.append(
            Check(
                "fail",
                "resolution decreases as bitrate rises",
                "a higher rung must never be smaller than the one below it: "
                + ", ".join(out_of_order),
            )
        )

    # --- duplicate rungs ---------------------------------------------------- #
    seen: dict[str, list[Variant]] = {}
    for variant in rungs:
        if variant.resolution != "-":
            seen.setdefault(variant.resolution, []).append(variant)
    for resolution, group in seen.items():
        if len(group) < 2:
            continue
        rates = [v.effective_bandwidth or 0 for v in group]
        if max(rates) and min(rates) and max(rates) / min(rates) < 1.3:
            checks.append(
                Check(
                    "warn",
                    f"redundant rungs at {resolution}",
                    f"{len(group)} rungs within 1.3x of each other - one of them is "
                    f"probably not earning its place",
                )
            )

    # --- codec consistency -------------------------------------------------- #
    codecs = {v.codecs.split(",")[0].split(".")[0] for v in rungs if v.codecs}
    probed_codecs = {v.probe.video.codec for v in rungs if v.probe and v.probe.video}
    if len(codecs) > 1 or len(probed_codecs) > 1:
        found = ", ".join(sorted(codecs or probed_codecs))
        checks.append(
            Check(
                "warn",
                "mixed video codecs across the ladder",
                f"{found} - some devices cannot switch between codecs mid-stream; "
                f"use separate variant groups instead",
            )
        )

    # --- frame rate --------------------------------------------------------- #
    rates = {round(v.frame_rate, 3) for v in rungs if v.frame_rate}
    if len(rates) > 1:
        ordered = sorted(rates)
        divisible = all(
            abs((max(ordered) / rate) - round(max(ordered) / rate)) < 0.01
            for rate in ordered
        )
        level = "warn" if divisible else "fail"
        checks.append(
            Check(
                level,
                "frame rate varies across rungs",
                f"{', '.join(f'{r:g}' for r in ordered)} fps - "
                + (
                    "integer divisors are tolerated by most players but still cause "
                    "judder on switch"
                    if divisible
                    else "non-divisor frame rates break smooth switching"
                ),
            )
        )

    # --- declared vs measured ------------------------------------------------ #
    for variant in rungs:
        if not variant.bandwidth:
            continue
        peak = variant.measured_peak
        average = variant.measured_bitrate
        if peak and peak > variant.bandwidth * 1.05:
            checks.append(
                Check(
                    "fail",
                    f"{variant.label}: BANDWIDTH under-declared",
                    f"declared {variant.bandwidth / 1000:.0f} kb/s but peaks at "
                    f"{peak / 1000:.0f} kb/s ({peak / variant.bandwidth:.2f}x). Players "
                    f"size their buffer from the declared value, so this causes "
                    f"rebuffering on constrained links.",
                )
            )
        elif average and variant.bandwidth > average * 2.0:
            checks.append(
                Check(
                    "warn",
                    f"{variant.label}: BANDWIDTH over-declared",
                    f"declared {variant.bandwidth / 1000:.0f} kb/s but averages "
                    f"{average / 1000:.0f} kb/s - players will pick a lower rung than "
                    f"the connection can actually carry",
                )
            )

    # --- segmentation --------------------------------------------------------- #
    if ladder.kind == "hls":
        counts = {len(v.segments) for v in rungs if v.segments}
        if len(counts) > 1:
            checks.append(
                Check(
                    "fail",
                    "segment counts differ between rungs",
                    f"{sorted(counts)} - renditions must be segmented identically "
                    f"for a player to swap one for another",
                )
            )
        elif counts:
            reference = next(v for v in rungs if v.segments)
            misaligned = []
            for variant in rungs:
                if not variant.segments:
                    continue
                for a, b in zip(reference.segments, variant.segments):
                    if abs(a.start - b.start) > SWITCH_TOLERANCE:
                        misaligned.append(variant.label)
                        break
            if misaligned:
                checks.append(
                    Check(
                        "fail",
                        "segment boundaries not aligned",
                        "these rungs place segment starts elsewhere: "
                        + ", ".join(sorted(set(misaligned))),
                    )
                )
            else:
                checks.append(
                    Check(
                        "ok",
                        "segments aligned",
                        f"{counts.pop()} segments with matching boundaries on every rung",
                    )
                )

        for variant in rungs:
            if not (variant.segments and variant.target_duration):
                continue
            longest = max(variant.segment_durations)
            # the spec requires EXTINF to round to no more than TARGETDURATION
            if round(longest) > variant.target_duration:
                checks.append(
                    Check(
                        "fail",
                        f"{variant.label}: segment longer than TARGETDURATION",
                        f"{longest:.2f}s segment against a declared "
                        f"{variant.target_duration:g}s target",
                    )
                )

        if not ladder.independent_segments:
            checks.append(
                Check(
                    "warn",
                    "EXT-X-INDEPENDENT-SEGMENTS not set",
                    "declaring it lets players start decoding at any segment boundary",
                )
            )

    if ladder.audio_renditions:
        checks.append(
            Check(
                "ok",
                "audio is a separate rendition group",
                f"{len(ladder.audio_renditions)} rendition(s) - video switches do not "
                f"re-download audio",
            )
        )
    elif ladder.kind == "hls":
        checks.append(
            Check(
                "info",
                "audio appears muxed into the variants",
                "every video switch also re-fetches audio; a separate audio group "
                "saves bandwidth on switches",
            )
        )
    return checks


def analyse_quality_curve(ladder: Ladder) -> list[Check]:
    """Interpret per-rung quality scores once a reference has been measured."""
    checks: list[Check] = []
    scored = [
        v
        for v in ladder.ordered
        if v.quality and (v.quality.vmaf is not None or v.quality.psnr_y is not None)
    ]
    if len(scored) < 2:
        return checks

    use_vmaf = all(v.quality.vmaf is not None for v in scored)

    def score(variant: Variant) -> float:
        return variant.quality.vmaf if use_vmaf else variant.quality.psnr_y  # type: ignore

    metric = "VMAF" if use_vmaf else "PSNR"
    flat_gap = 1.0 if use_vmaf else 0.3
    big_gap = 6.0 if use_vmaf else 2.0

    for lower, upper in zip(scored, scored[1:]):
        delta = score(upper) - score(lower)
        if delta < 0:
            checks.append(
                Check(
                    "fail",
                    f"{upper.label} scores below {lower.label}",
                    f"{metric} {score(upper):.2f} vs {score(lower):.2f} while costing "
                    f"more bitrate - this rung is strictly dominated and should be "
                    f"re-encoded or dropped",
                )
            )
        elif delta < flat_gap:
            checks.append(
                Check(
                    "warn",
                    f"{lower.label} → {upper.label} adds almost no quality",
                    f"+{delta:.2f} {metric} for "
                    f"{(upper.effective_bandwidth or 0) / (lower.effective_bandwidth or 1):.2f}x "
                    f"the bitrate - viewers pay for a switch they cannot see",
                )
            )
        elif delta > big_gap:
            checks.append(
                Check(
                    "warn",
                    f"{lower.label} → {upper.label} is a visible jump",
                    f"+{delta:.2f} {metric} in one step - a switch here is noticeable; "
                    f"consider an intermediate rung",
                )
            )

    top = scored[-1]
    if use_vmaf and score(top) < 90:
        checks.append(
            Check(
                "warn",
                "top rung never reaches transparency",
                f"the best rung only scores {score(top):.1f} VMAF - viewers on fast "
                f"connections never see a clean picture",
            )
        )
    if use_vmaf and len(scored) > 1 and score(scored[0]) < 40:
        checks.append(
            Check(
                "info",
                "bottom rung is very low quality",
                f"{score(scored[0]):.1f} VMAF - acceptable as a fallback, but check it "
                f"is not the rung players start on",
            )
        )
    return checks


# --------------------------------------------------------------------------- #
# switch simulation
# --------------------------------------------------------------------------- #
@dataclass
class SwitchReport:
    lower: str = ""
    upper: str = ""
    at: float = 0.0
    window: float = 5.0
    aligned: bool = False
    drift: float | None = None
    switch_point: float | None = None
    usable_point: float | None = None
    quality_before: QualityResult | None = None
    quality_after: QualityResult | None = None
    output: str | None = None
    checks: list[Check] = field(default_factory=list)

    @property
    def step(self) -> float | None:
        for attribute in ("vmaf", "psnr_y"):
            before = (
                getattr(self.quality_before, attribute, None)
                if self.quality_before
                else None
            )
            after = (
                getattr(self.quality_after, attribute, None)
                if self.quality_after
                else None
            )
            if before is not None and after is not None:
                return after - before
        return None

    @property
    def metric(self) -> str:
        if self.quality_before and self.quality_before.vmaf is not None:
            return "VMAF"
        return "PSNR"


def find_switch_point(
    lower: Variant, upper: Variant, at: float, tolerance: float = SWITCH_TOLERANCE
) -> tuple[float | None, float | None]:
    """Nearest keyframe both rungs share, and how far the pair drifts apart."""
    if not lower.keyframes or not upper.keyframes:
        return None, None
    candidate = min(lower.keyframes, key=lambda t: abs(t - at))
    partner = min(upper.keyframes, key=lambda t: abs(t - candidate))
    drift = abs(partner - candidate)
    if drift <= tolerance:
        return candidate, drift
    return None, drift


def common_switch_points(
    lower: Variant, upper: Variant, tolerance: float = SWITCH_TOLERANCE
) -> list[float]:
    """Timestamps where both renditions start a keyframe."""
    return [
        point
        for point in lower.keyframes
        if any(abs(point - other) <= tolerance for other in upper.keyframes)
    ]


def build_switch_clip(
    lower: Variant,
    upper: Variant,
    at: float,
    window: float,
    output: str,
    width: int | None = None,
    height: int | None = None,
    fps: float | None = None,
    crf: int = 16,
    preset: str = "veryfast",
    timeout: float = 900.0,
    dry_run: bool = False,
):
    """Splice `window` seconds of the low rung into the high rung at `at`.

    Both halves are normalised onto one grid, which is what a player does when it
    scales every rendition to the same display surface.
    """
    from vidprobe.ffmpeg import RunResult, ffmpeg_bin, run_ffmpeg

    width = width or upper.width or 1280
    height = height or upper.height or 720
    fps = (
        fps
        or upper.frame_rate
        or (upper.probe.video.fps if upper.probe and upper.probe.video else 25.0)
    )
    start = max(at - window, 0.0)

    chain = (
        f"[0:v]trim=start={start:.3f}:end={at:.3f},setpts=PTS-STARTPTS,"
        f"scale={width}:{height}:flags=bicubic,fps={fps:g},format=yuv420p[a];"
        f"[1:v]trim=start={at:.3f}:end={at + window:.3f},setpts=PTS-STARTPTS,"
        f"scale={width}:{height}:flags=bicubic,fps={fps:g},format=yuv420p[b];"
        f"[a][b]concat=n=2:v=1:a=0[out]"
    )
    args = [
        *input_args(lower.path, timeout=20, analyze=5),
        "-i",
        lower.path,
        *input_args(upper.path, timeout=20, analyze=5),
        "-i",
        upper.path,
        "-filter_complex",
        chain,
        "-map",
        "[out]",
        "-c:v",
        "libx264",
        "-preset",
        preset,
        "-crf",
        str(crf),
        "-an",
        output,
    ]
    if dry_run:
        return RunResult(
            cmd=[ffmpeg_bin(), "-hide_banner", "-nostdin", "-y", *args],
            returncode=0,
            stderr="",
            wall_time=0.0,
            output=output,
        )
    return run_ffmpeg(args, output=output, timeout=timeout)


def summarise_switch(report: SwitchReport, lower: Variant, upper: Variant) -> None:
    """Turn the raw numbers into verdicts."""
    if report.aligned:
        report.checks.append(
            Check(
                "ok",
                "switch point is clean",
                f"both rungs start a keyframe at "
                f"{report.switch_point:.3f}s (drift {(report.drift or 0) * 1000:.0f} ms)",
            )
        )
    else:
        detail = (
            f"nearest keyframes are {(report.drift or 0) * 1000:.0f} ms apart"
            if report.drift is not None
            else "no keyframes found to compare"
        )
        detail += (
            " - a player switching here must either wait for the next "
            "aligned boundary or show a glitch"
        )
        shared = common_switch_points(lower, upper)
        if shared:
            nearest = min(shared, key=lambda t: abs(t - report.at))
            report.usable_point = nearest
            detail += (
                f". The nearest point both rungs share is {nearest:.3f}s "
                f"({abs(nearest - report.at):.2f}s away); "
                f"{len(shared)} usable switch point(s) in the scanned window."
            )
        else:
            detail += ". These two rungs share no switch point at all in the "
            detail += "scanned window, so this pair can never switch cleanly."
        report.checks.append(
            Check(
                "fail",
                "no shared keyframe at the requested position",
                detail,
            )
        )

    step = report.step
    if step is not None:
        metric = report.metric
        threshold = 6.0 if metric == "VMAF" else 2.0
        if abs(step) < 1.0:
            report.checks.append(
                Check(
                    "warn",
                    "the switch is nearly invisible",
                    f"{metric} moves {step:+.2f} across the boundary - these two rungs "
                    f"are close enough that the switch costs more than it delivers",
                )
            )
        elif abs(step) > threshold:
            report.checks.append(
                Check(
                    "warn",
                    "large quality step at the switch",
                    f"{metric} moves {step:+.2f} across the boundary - viewers will "
                    f"notice this transition",
                )
            )
        else:
            report.checks.append(
                Check(
                    "ok",
                    "quality step is reasonable",
                    f"{metric} moves {step:+.2f} across the boundary",
                )
            )

    low_rate = lower.effective_bandwidth
    high_rate = upper.effective_bandwidth
    if low_rate and high_rate:
        report.checks.append(
            Check(
                "info",
                "bitrate step",
                f"{low_rate / 1000:.0f} → {high_rate / 1000:.0f} kb/s "
                f"({high_rate / low_rate:.2f}x)",
            )
        )
    else:
        report.checks.append(
            Check(
                "info",
                "bitrate step unknown",
                "neither rendition declares a bandwidth and none could be measured",
            )
        )
    if lower.resolution != "-" and upper.resolution != "-":
        report.checks.append(
            Check(
                "info",
                "resolution step",
                f"{lower.resolution} → {upper.resolution}",
            )
        )


def iter_probe_targets(ladder: Ladder) -> Iterable[Variant]:
    for variant in ladder.ordered:
        if not variant.error:
            yield variant
