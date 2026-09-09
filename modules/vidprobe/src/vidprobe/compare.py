"""Diff two probe results and judge which encoding config did better."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable

from vidprobe.models import ProbeResult
from vidprobe.quality import QualityResult

# direction: "lower" = smaller is better, "higher" = bigger is better,
# "info" = informational only (no winner).
Direction = str


@dataclass
class DiffRow:
    label: str
    a: str
    b: str
    same: bool
    direction: Direction = "info"
    winner: str | None = None  # "a" | "b" | None
    delta: str = ""
    group: str = ""


@dataclass
class Comparison:
    a: ProbeResult
    b: ProbeResult
    label_a: str = "A"
    label_b: str = "B"
    rows: list[DiffRow] = field(default_factory=list)
    quality_a: QualityResult | None = None
    quality_b: QualityResult | None = None
    reference: str | None = None
    verdict: list[str] = field(default_factory=list)

    @property
    def differences(self) -> list[DiffRow]:
        return [r for r in self.rows if not r.same]


# --------------------------------------------------------------------------- #
# formatting helpers
# --------------------------------------------------------------------------- #
def human_bitrate(value: float | None) -> str:
    if not value:
        return "-"
    if value >= 1_000_000:
        return f"{value / 1_000_000:.2f} Mb/s"
    if value >= 1_000:
        return f"{value / 1_000:.0f} kb/s"
    return f"{value:.0f} b/s"


def human_size(value: float | None) -> str:
    if not value:
        return "-"
    for unit in ("B", "KiB", "MiB", "GiB", "TiB"):
        if value < 1024 or unit == "TiB":
            return f"{value:.2f} {unit}" if unit != "B" else f"{value:.0f} B"
        value /= 1024
    return "-"


def human_duration(value: float | None) -> str:
    if value is None:
        return "-"
    hours, rem = divmod(int(value), 3600)
    mins, secs = divmod(rem, 60)
    frac = value - int(value)
    if hours:
        return f"{hours}:{mins:02d}:{secs:02d}"
    return f"{mins:02d}:{secs:02d}.{int(frac * 100):02d}"


def _fmt(value: Any, digits: int = 2) -> str:
    if value is None or value == "":
        return "-"
    if isinstance(value, bool):
        return "yes" if value else "no"
    if isinstance(value, float):
        return f"{value:.{digits}f}"
    return str(value)


def _pct(a: float | None, b: float | None) -> str:
    if not a or b is None:
        return ""
    change = (b - a) / a * 100
    sign = "+" if change >= 0 else ""
    return f"{sign}{change:.1f}%"


# --------------------------------------------------------------------------- #
# row construction
# --------------------------------------------------------------------------- #
def _row(
    group: str,
    label: str,
    a_val: Any,
    b_val: Any,
    direction: Direction = "info",
    fmt: Callable[[Any], str] = _fmt,
    numeric: bool = False,
) -> DiffRow:
    a_txt, b_txt = fmt(a_val), fmt(b_val)
    same = a_txt == b_txt
    row = DiffRow(
        label=label, a=a_txt, b=b_txt, same=same, direction=direction, group=group
    )
    if numeric and isinstance(a_val, (int, float)) and isinstance(b_val, (int, float)):
        row.delta = _pct(float(a_val), float(b_val))
        if not same and direction in {"lower", "higher"}:
            if direction == "lower":
                row.winner = "a" if a_val < b_val else "b"
            else:
                row.winner = "a" if a_val > b_val else "b"
    return row


def build_rows(a: ProbeResult, b: ProbeResult) -> list[DiffRow]:
    rows: list[DiffRow] = []
    va, vb = a.video, b.video
    ca, cb = a.container, b.container
    fa, fb = a.frames, b.frames

    rows += [
        _row("Container", "format", ca.format_name, cb.format_name),
        _row("Container", "duration", ca.duration, cb.duration, fmt=human_duration),
        _row(
            "Container",
            "file size",
            ca.size,
            cb.size,
            "lower",
            human_size,
            numeric=True,
        ),
        _row(
            "Container",
            "overall bitrate",
            ca.bitrate,
            cb.bitrate,
            "lower",
            human_bitrate,
            numeric=True,
        ),
        _row("Container", "streams", ca.nb_streams, cb.nb_streams),
    ]

    if va and vb:
        rows += [
            _row("Video", "codec", va.codec, vb.codec),
            _row("Video", "profile", va.profile, vb.profile),
            _row("Video", "level", va.level, vb.level),
            _row("Video", "resolution", va.resolution, vb.resolution),
            _row(
                "Video",
                "pixels",
                va.megapixels,
                vb.megapixels,
                fmt=lambda v: f"{v:.2f} MP",
            ),
            _row("Video", "pixel format", va.pix_fmt, vb.pix_fmt),
            _row("Video", "bit depth", va.bit_depth, vb.bit_depth),
            _row("Video", "chroma", va.chroma, vb.chroma),
            _row(
                "Video",
                "frame rate",
                va.fps,
                vb.fps,
                fmt=lambda v: f"{v:.3f} fps" if v else "-",
            ),
            _row(
                "Video",
                "video bitrate",
                va.bitrate,
                vb.bitrate,
                "lower",
                human_bitrate,
                numeric=True,
            ),
            _row(
                "Video",
                "bits/pixel",
                va.bits_per_pixel,
                vb.bits_per_pixel,
                "lower",
                lambda v: f"{v:.4f}" if v else "-",
                numeric=True,
            ),
            _row("Video", "reference frames", va.refs, vb.refs),
            _row("Video", "B-frame delay", va.has_b_frames, vb.has_b_frames),
            _row("Video", "scan", va.field_order, vb.field_order),
            _row("Video", "color range", va.color_range, vb.color_range),
            _row("Video", "color space", va.color_space, vb.color_space),
            _row("Video", "transfer", va.color_transfer, vb.color_transfer),
            _row("Video", "primaries", va.color_primaries, vb.color_primaries),
            _row("Video", "HDR", va.is_hdr, vb.is_hdr),
            _row(
                "Video",
                "aspect (SAR/DAR)",
                f"{va.sar or '-'} / {va.dar or '-'}",
                f"{vb.sar or '-'} / {vb.dar or '-'}",
            ),
            _row("Video", "encoder", va.tags.get("encoder"), vb.tags.get("encoder")),
        ]

    if fa and fb:
        rows += [
            _row(
                "GOP",
                "avg GOP length",
                fa.gop_avg,
                fb.gop_avg,
                fmt=lambda v: f"{v:.1f} frames" if v else "-",
            ),
            _row("GOP", "keyframes seen", fa.keyframe_count, fb.keyframe_count),
            _row("GOP", "max B-run", fa.max_b_run, fb.max_b_run),
            _row("GOP", "I / P / B", _types(fa.pict_types), _types(fb.pict_types)),
            _row(
                "GOP",
                "peak bitrate",
                fa.bitrate_peak,
                fb.bitrate_peak,
                "lower",
                human_bitrate,
                numeric=True,
            ),
            _row(
                "GOP",
                "peak-to-average",
                fa.peak_to_avg,
                fb.peak_to_avg,
                fmt=lambda v: f"{v:.2f}x" if v else "-",
            ),
            _row(
                "GOP",
                "rate variability",
                fa.variability,
                fb.variability,
                fmt=lambda v: f"{v * 100:.1f}%" if v is not None else "-",
            ),
            _row(
                "GOP",
                "avg packet size",
                (fa.sizes or {}).get("avg"),
                (fb.sizes or {}).get("avg"),
                fmt=lambda v: f"{v:,.0f} B" if v else "-",
            ),
            _row("GOP", "timing gaps", fa.pts_gaps, fb.pts_gaps, "lower", numeric=True),
        ]

    audio_a = a.audio[0] if a.audio else None
    audio_b = b.audio[0] if b.audio else None
    if audio_a or audio_b:
        rows += [
            _row(
                "Audio",
                "codec",
                getattr(audio_a, "codec", None),
                getattr(audio_b, "codec", None),
            ),
            _row(
                "Audio",
                "bitrate",
                getattr(audio_a, "bitrate", None),
                getattr(audio_b, "bitrate", None),
                "lower",
                human_bitrate,
                numeric=True,
            ),
            _row(
                "Audio",
                "sample rate",
                getattr(audio_a, "sample_rate", None),
                getattr(audio_b, "sample_rate", None),
                fmt=lambda v: f"{v:,} Hz" if v else "-",
            ),
            _row(
                "Audio",
                "channels",
                getattr(audio_a, "layout", None) or getattr(audio_a, "channels", None),
                getattr(audio_b, "layout", None) or getattr(audio_b, "channels", None),
            ),
        ]
    return rows


def _types(counts: dict[str, int]) -> str:
    if not counts:
        return "-"
    return " / ".join(str(counts.get(t, 0)) for t in ("I", "P", "B"))


# --------------------------------------------------------------------------- #
# verdicts
# --------------------------------------------------------------------------- #
def quality_per_mbit(
    quality: QualityResult | None, bitrate: int | None
) -> float | None:
    """VMAF points per Mb/s - a crude but useful efficiency score."""
    if not quality or quality.vmaf is None or not bitrate:
        return None
    return quality.vmaf / (bitrate / 1_000_000)


def build_verdict(cmp: Comparison) -> list[str]:
    notes: list[str] = []
    a, b = cmp.a, cmp.b
    la, lb = cmp.label_a, cmp.label_b
    va, vb = a.video, b.video

    if va and vb and va.bitrate and vb.bitrate:
        change = (vb.bitrate - va.bitrate) / va.bitrate * 100
        if abs(change) < 1:
            notes.append(
                f"Video bitrate is effectively identical ({human_bitrate(va.bitrate)})."
            )
        else:
            cheaper, saving = (lb, -change) if change < 0 else (la, change)
            notes.append(
                f"{cheaper} spends {abs(change):.1f}% "
                f"{'less' if change < 0 else 'more'} on video "
                f"({human_bitrate(va.bitrate)} vs {human_bitrate(vb.bitrate)})."
            )

    if va and vb and va.resolution != vb.resolution:
        notes.append(
            f"Resolutions differ ({va.resolution} vs {vb.resolution}); "
            "quality metrics are computed on a common grid."
        )
    if va and vb and va.codec != vb.codec:
        notes.append(f"Different codecs: {va.codec} vs {vb.codec}.")

    qa, qb = cmp.quality_a, cmp.quality_b
    if qa and qb and qa.vmaf is not None and qb.vmaf is not None:
        diff = qb.vmaf - qa.vmaf
        better = lb if diff > 0 else la
        if abs(diff) < 0.5:
            notes.append(f"VMAF is a statistical tie ({qa.vmaf:.2f} vs {qb.vmaf:.2f}).")
        else:
            notes.append(
                f"{better} scores {abs(diff):.2f} VMAF points higher "
                f"({qa.vmaf:.2f} vs {qb.vmaf:.2f})."
            )
        ea = quality_per_mbit(qa, va.bitrate if va else None)
        eb = quality_per_mbit(qb, vb.bitrate if vb else None)
        if ea and eb:
            winner = lb if eb > ea else la
            notes.append(
                f"Efficiency (VMAF per Mb/s): {la} {ea:.1f} vs {lb} {eb:.1f} "
                f"-> {winner} delivers more quality per bit."
            )
    elif qa and qb and qa.psnr_y is not None and qb.psnr_y is not None:
        diff = qb.psnr_y - qa.psnr_y
        better = lb if diff > 0 else la
        notes.append(
            f"{better} is {abs(diff):.2f} dB higher on luma PSNR "
            f"({qa.psnr_y:.2f} vs {qb.psnr_y:.2f} dB)."
        )
    elif qb and not qb.empty and not qa:
        notes.append(f"{lb} was scored against {la} used as the reference.")

    fa, fb = a.frames, b.frames
    if fa and fb and fa.gop_avg and fb.gop_avg and abs(fa.gop_avg - fb.gop_avg) > 1:
        notes.append(
            f"GOP length differs ({fa.gop_avg:.0f} vs {fb.gop_avg:.0f} frames) - "
            "affects seek granularity and error recovery."
        )
    if fa and fb and fa.variability is not None and fb.variability is not None:
        if abs(fa.variability - fb.variability) > 0.15:
            steadier = la if fa.variability < fb.variability else lb
            notes.append(
                f"{steadier} has the steadier rate curve (better for constrained links)."
            )
    return notes


def compare(
    a: ProbeResult,
    b: ProbeResult,
    label_a: str = "A",
    label_b: str = "B",
    quality_a: QualityResult | None = None,
    quality_b: QualityResult | None = None,
    reference: str | None = None,
) -> Comparison:
    cmp = Comparison(
        a=a,
        b=b,
        label_a=label_a,
        label_b=label_b,
        quality_a=quality_a,
        quality_b=quality_b,
        reference=reference,
    )
    cmp.rows = build_rows(a, b)
    cmp.verdict = build_verdict(cmp)
    return cmp
