"""Data model for a probe run."""

from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Any


@dataclass
class Container:
    url: str = ""
    format_name: str = ""
    format_long: str = ""
    duration: float | None = None
    size: int | None = None
    bitrate: int | None = None
    nb_streams: int = 0
    probe_score: int | None = None
    start_time: float | None = None
    tags: dict[str, str] = field(default_factory=dict)
    live: bool = False


@dataclass
class VideoTrack:
    index: int = 0
    codec: str = ""
    codec_long: str = ""
    profile: str | None = None
    level: str | None = None
    width: int = 0
    height: int = 0
    coded_width: int | None = None
    coded_height: int | None = None
    pix_fmt: str = ""
    bit_depth: int | None = None
    chroma: str | None = None
    fps: float | None = None
    fps_raw: str | None = None
    tbr: str | None = None
    sar: str | None = None
    dar: str | None = None
    bitrate: int | None = None
    nb_frames: int | None = None
    field_order: str | None = None
    color_range: str | None = None
    color_space: str | None = None
    color_primaries: str | None = None
    color_transfer: str | None = None
    has_b_frames: int | None = None
    refs: int | None = None
    start_time: float | None = None
    time_base: str | None = None
    closed_captions: bool = False
    tags: dict[str, str] = field(default_factory=dict)

    @property
    def resolution(self) -> str:
        return f"{self.width}x{self.height}" if self.width else "-"

    @property
    def megapixels(self) -> float:
        return (self.width * self.height) / 1_000_000 if self.width else 0.0

    @property
    def is_hdr(self) -> bool:
        return (self.color_transfer or "") in {"smpte2084", "arib-std-b67"}

    @property
    def is_interlaced(self) -> bool:
        return bool(self.field_order) and self.field_order not in {
            "progressive",
            "unknown",
        }

    @property
    def bits_per_pixel(self) -> float | None:
        """Bits spent per pixel per frame - the core encoding-density metric."""
        if not (self.bitrate and self.width and self.height and self.fps):
            return None
        return self.bitrate / (self.width * self.height * self.fps)


@dataclass
class AudioTrack:
    index: int = 0
    codec: str = ""
    profile: str | None = None
    sample_rate: int | None = None
    channels: int | None = None
    layout: str | None = None
    sample_fmt: str | None = None
    bitrate: int | None = None
    language: str | None = None


@dataclass
class OtherTrack:
    index: int = 0
    kind: str = ""
    codec: str = ""
    language: str | None = None


@dataclass
class FrameStats:
    """Derived from packet/frame level inspection of the first N seconds."""

    analysed_seconds: float = 0.0
    packet_count: int = 0
    frame_count: int = 0
    pict_types: dict[str, int] = field(default_factory=dict)
    keyframe_count: int = 0
    gop_lengths: list[int] = field(default_factory=list)
    max_b_run: int = 0
    sizes: dict[str, float] = field(default_factory=dict)  # min/max/avg packet bytes
    bitrate_series: list[float] = field(default_factory=list)  # bits per second bucket
    bitrate_avg: float | None = None
    bitrate_peak: float | None = None
    bitrate_min: float | None = None
    bitrate_std: float | None = None
    measured_fps: float | None = None
    pts_gaps: int = 0
    max_pts_gap: float | None = None

    @property
    def gop_avg(self) -> float | None:
        return (
            sum(self.gop_lengths) / len(self.gop_lengths) if self.gop_lengths else None
        )

    @property
    def peak_to_avg(self) -> float | None:
        if self.bitrate_avg and self.bitrate_peak:
            return self.bitrate_peak / self.bitrate_avg
        return None

    @property
    def variability(self) -> float | None:
        """Coefficient of variation - low means CBR-ish, high means VBR."""
        if self.bitrate_avg and self.bitrate_std is not None and self.bitrate_avg > 0:
            return self.bitrate_std / self.bitrate_avg
        return None


@dataclass
class ProbeResult:
    container: Container = field(default_factory=Container)
    video: VideoTrack | None = None
    audio: list[AudioTrack] = field(default_factory=list)
    other: list[OtherTrack] = field(default_factory=list)
    frames: FrameStats | None = None
    connect_time: float | None = None
    warnings: list[str] = field(default_factory=list)
    raw: dict[str, Any] = field(default_factory=dict, repr=False)

    def to_dict(self, include_raw: bool = False) -> dict:
        data = asdict(self)
        data.pop("raw", None)
        if self.video:
            data["video"]["derived"] = {
                "bits_per_pixel": self.video.bits_per_pixel,
                "megapixels": self.video.megapixels,
                "hdr": self.video.is_hdr,
                "interlaced": self.video.is_interlaced,
            }
        if self.frames:
            data["frames"]["derived"] = {
                "gop_avg": self.frames.gop_avg,
                "peak_to_avg": self.frames.peak_to_avg,
                "variability": self.frames.variability,
            }
        if include_raw:
            data["raw"] = self.raw
        return data
