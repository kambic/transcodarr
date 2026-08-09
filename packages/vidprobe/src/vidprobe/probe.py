"""Collect container, stream and packet level information from an input."""

from __future__ import annotations

import statistics
import time
from typing import Any

from .ffmpeg import ProbeError, ffprobe_bin, input_args, is_network, run_json
from .models import (
    AudioTrack,
    Container,
    FrameStats,
    OtherTrack,
    ProbeResult,
    VideoTrack,
)

LIVE_FORMATS = {"rtsp", "sdp", "flv", "mpegts", "hls", "applehttp", "rtp"}


# --------------------------------------------------------------------------- #
# small parsing helpers
# --------------------------------------------------------------------------- #
def _f(value: Any) -> float | None:
    try:
        out = float(value)
    except TypeError, ValueError:
        return None
    return None if out != out else out  # drop NaN


def _i(value: Any) -> int | None:
    try:
        return int(float(value))
    except TypeError, ValueError:
        return None


def _ratio(value: str | None) -> float | None:
    """Turn ffprobe's '30000/1001' style rationals into a float."""
    if not value or value in {"0/0", "N/A"}:
        return None
    if "/" in value:
        num, _, den = value.partition("/")
        n, d = _f(num), _f(den)
        return n / d if n is not None and d else None
    return _f(value)


def _pix_fmt_details(pix_fmt: str) -> tuple[int | None, str | None]:
    """Best-effort bit depth + chroma subsampling from a pixel format name."""
    if not pix_fmt:
        return None, None
    depth = 8
    for marker in ("16", "14", "12", "10", "9"):
        if marker in pix_fmt:
            depth = int(marker)
            break
    chroma = None
    for marker in ("444", "440", "422", "420", "411", "410"):
        if marker in pix_fmt:
            chroma = f"4:{marker[1]}:{marker[2]}"
            break
    if pix_fmt.startswith("gray"):
        chroma = "4:0:0"
    return depth, chroma


# --------------------------------------------------------------------------- #
# container + streams
# --------------------------------------------------------------------------- #
def _probe_streams(url: str, timeout: float, analyze: float) -> tuple[dict, float]:
    cmd = [
        ffprobe_bin(),
        "-hide_banner",
        "-v",
        "error",
        *input_args(url, timeout=timeout, analyze=analyze),
        "-show_format",
        "-show_streams",
        "-show_error",
        "-of",
        "json",
        url,
    ]
    started = time.perf_counter()
    data = run_json(cmd, timeout=timeout + analyze + 10)
    elapsed = time.perf_counter() - started
    if "error" in data:
        raise ProbeError(data["error"].get("string", "unknown ffprobe error"))
    return data, elapsed


def _build_video(s: dict) -> VideoTrack:
    pix_fmt = s.get("pix_fmt", "") or ""
    depth, chroma = _pix_fmt_details(pix_fmt)
    return VideoTrack(
        index=_i(s.get("index")) or 0,
        codec=s.get("codec_name", "?"),
        codec_long=s.get("codec_long_name", ""),
        profile=s.get("profile"),
        level=str(s["level"]) if s.get("level") not in (None, -99) else None,
        width=_i(s.get("width")) or 0,
        height=_i(s.get("height")) or 0,
        coded_width=_i(s.get("coded_width")),
        coded_height=_i(s.get("coded_height")),
        pix_fmt=pix_fmt,
        bit_depth=_i(s.get("bits_per_raw_sample")) or depth,
        chroma=chroma,
        fps=_ratio(s.get("avg_frame_rate")) or _ratio(s.get("r_frame_rate")),
        fps_raw=s.get("avg_frame_rate"),
        tbr=s.get("r_frame_rate"),
        sar=s.get("sample_aspect_ratio"),
        dar=s.get("display_aspect_ratio"),
        bitrate=_i(s.get("bit_rate")) or _i(s.get("tags", {}).get("BPS")),
        nb_frames=_i(s.get("nb_frames"))
        or _i(s.get("tags", {}).get("NUMBER_OF_FRAMES")),
        field_order=s.get("field_order"),
        color_range=s.get("color_range"),
        color_space=s.get("color_space"),
        color_primaries=s.get("color_primaries"),
        color_transfer=s.get("color_transfer"),
        has_b_frames=_i(s.get("has_b_frames")),
        refs=_i(s.get("refs")),
        start_time=_f(s.get("start_time")),
        time_base=s.get("time_base"),
        closed_captions=bool(s.get("closed_captions")),
        tags={k: str(v) for k, v in (s.get("tags") or {}).items()},
    )


def _build_audio(s: dict) -> AudioTrack:
    return AudioTrack(
        index=_i(s.get("index")) or 0,
        codec=s.get("codec_name", "?"),
        profile=s.get("profile"),
        sample_rate=_i(s.get("sample_rate")),
        channels=_i(s.get("channels")),
        layout=s.get("channel_layout"),
        sample_fmt=s.get("sample_fmt"),
        bitrate=_i(s.get("bit_rate")) or _i(s.get("tags", {}).get("BPS")),
        language=(s.get("tags") or {}).get("language"),
    )


# --------------------------------------------------------------------------- #
# packet / frame level analysis
# --------------------------------------------------------------------------- #
def _split_sections(data: dict) -> tuple[list[dict], list[dict]]:
    """ffprobe emits either separate arrays or a merged packets_and_frames list."""
    if "packets_and_frames" in data:
        merged = data["packets_and_frames"]
        packets = [e for e in merged if e.get("type") == "packet"]
        frames = [e for e in merged if e.get("type") == "frame"]
        return packets, frames
    return data.get("packets", []), data.get("frames", [])


def analyse_frames(
    url: str, duration: float, timeout: float, analyze: float, video_index: int = 0
) -> FrameStats:
    """Inspect the first `duration` seconds of video packets and frames."""
    cmd = [
        ffprobe_bin(),
        "-hide_banner",
        "-v",
        "error",
        *input_args(url, timeout=timeout, analyze=analyze),
        "-select_streams",
        f"v:{video_index}",
        "-read_intervals",
        f"%+{duration:g}",
        "-show_packets",
        "-show_frames",
        "-show_entries",
        "packet=pts_time,dts_time,duration_time,size,flags:"
        "frame=pict_type,pts_time,key_frame,interlaced_frame",
        "-of",
        "json",
        url,
    ]
    data = run_json(cmd, timeout=timeout + duration * 3 + 30)
    packets, frames = _split_sections(data)

    stats = FrameStats(packet_count=len(packets), frame_count=len(frames))

    # ---- packet timing / size / bitrate buckets -------------------------- #
    sizes: list[int] = []
    times: list[float] = []
    timed: list[tuple[float, int]] = []
    for pkt in packets:
        size = _i(pkt.get("size")) or 0
        ts = _f(pkt.get("pts_time"))
        if ts is None:
            ts = _f(pkt.get("dts_time"))
        sizes.append(size)
        if ts is not None:
            times.append(ts)
            timed.append((ts, size))

    # bucket relative to the first timestamp, so bucket 0 is a full second
    buckets: dict[int, float] = {}
    if timed:
        origin = min(ts for ts, _ in timed)
        for ts, size in timed:
            key = int(ts - origin)
            buckets[key] = buckets.get(key, 0.0) + size * 8

    if sizes:
        stats.sizes = {
            "min": float(min(sizes)),
            "max": float(max(sizes)),
            "avg": sum(sizes) / len(sizes),
        }
    if times:
        times.sort()
        span = times[-1] - times[0]
        stats.analysed_seconds = span
        if span > 0:
            stats.measured_fps = (len(times) - 1) / span
            stats.bitrate_avg = sum(sizes) * 8 / span
        # a gap of >2.5x the median spacing suggests a dropped/late packet
        deltas = [b - a for a, b in zip(times, times[1:]) if b > a]
        if len(deltas) > 4:
            median = statistics.median(deltas)
            gaps = [d for d in deltas if d > median * 2.5]
            stats.pts_gaps = len(gaps)
            stats.max_pts_gap = max(gaps) if gaps else None

    if buckets:
        # drop the last, usually partial, one-second bucket
        keys = sorted(buckets)
        series = [buckets[k] for k in keys]
        if len(series) > 2:
            series = series[:-1]
        stats.bitrate_series = series
        stats.bitrate_peak = max(series)
        stats.bitrate_min = min(series)
        if len(series) > 1:
            stats.bitrate_std = statistics.pstdev(series)
        if stats.bitrate_avg is None:
            stats.bitrate_avg = sum(series) / len(series)

    # ---- frame types, GOP structure -------------------------------------- #
    ordered = (
        sorted(
            [f for f in frames if _f(f.get("pts_time")) is not None],
            key=lambda f: _f(f.get("pts_time")) or 0.0,
        )
        or frames
    )

    counts: dict[str, int] = {}
    key_positions: list[int] = []
    b_run = current_b = 0
    for pos, frm in enumerate(ordered):
        ptype = (frm.get("pict_type") or "?").upper()
        counts[ptype] = counts.get(ptype, 0) + 1
        if ptype == "B":
            current_b += 1
            b_run = max(b_run, current_b)
        else:
            current_b = 0
        if str(frm.get("key_frame")) in {"1", "True", "true"} or ptype == "I":
            key_positions.append(pos)

    stats.pict_types = counts
    stats.max_b_run = b_run
    stats.keyframe_count = len(key_positions)
    stats.gop_lengths = [b - a for a, b in zip(key_positions, key_positions[1:])]
    return stats


# --------------------------------------------------------------------------- #
# public entry point
# --------------------------------------------------------------------------- #
def probe(
    url: str,
    duration: float = 10.0,
    timeout: float = 20.0,
    analyze: float = 5.0,
    deep: bool = True,
    video_index: int = 0,
) -> ProbeResult:
    """Probe `url` and return every parameter we can extract.

    `deep=False` skips the packet-level pass (faster, but no GOP/bitrate curve).
    `video_index` selects which video stream to report on, which matters for
    inputs that expose several (a DASH manifest presents one per representation).
    """
    data, connect = _probe_streams(url, timeout, analyze)
    fmt = data.get("format", {}) or {}

    result = ProbeResult(raw=data, connect_time=connect)
    result.container = Container(
        url=url,
        format_name=fmt.get("format_name", "?"),
        format_long=fmt.get("format_long_name", ""),
        duration=_f(fmt.get("duration")),
        size=_i(fmt.get("size")),
        bitrate=_i(fmt.get("bit_rate")),
        nb_streams=_i(fmt.get("nb_streams")) or 0,
        probe_score=_i(fmt.get("probe_score")),
        start_time=_f(fmt.get("start_time")),
        tags={k: str(v) for k, v in (fmt.get("tags") or {}).items()},
        live=is_network(url)
        or bool(LIVE_FORMATS & set(fmt.get("format_name", "").split(",")))
        and _f(fmt.get("duration")) is None,
    )

    video_seen = 0
    for stream in data.get("streams", []):
        kind = stream.get("codec_type")
        if kind == "video":
            if stream.get("disposition", {}).get("attached_pic"):
                continue  # cover art, not a real video track
            if video_seen == video_index and result.video is None:
                result.video = _build_video(stream)
            video_seen += 1
        elif kind == "audio":
            result.audio.append(_build_audio(stream))
        else:
            result.other.append(
                OtherTrack(
                    index=_i(stream.get("index")) or 0,
                    kind=kind or "?",
                    codec=stream.get("codec_name", "?"),
                    language=(stream.get("tags") or {}).get("language"),
                )
            )

    if result.video is None:
        if video_seen:
            result.warnings.append(
                f"video stream #{video_index} requested but only {video_seen} present"
            )
        else:
            result.warnings.append("no decodable video stream found in this input")
        return result

    if deep:
        try:
            result.frames = analyse_frames(url, duration, timeout, analyze, video_index)
        except ProbeError as exc:
            result.warnings.append(f"packet analysis unavailable: {exc}")

    # fill gaps in the declared metadata using what we measured
    v, f = result.video, result.frames
    if f:
        if not v.bitrate and f.bitrate_avg:
            v.bitrate = int(f.bitrate_avg)
            result.warnings.append("video bitrate not declared - using measured value")
        if not v.fps and f.measured_fps:
            v.fps = f.measured_fps
    if not v.bitrate and result.container.bitrate:
        audio_total = sum(a.bitrate or 0 for a in result.audio)
        v.bitrate = max(result.container.bitrate - audio_total, 0) or None

    if result.container.live:
        result.warnings.append("live/network input - duration and size are estimates")
    return result
