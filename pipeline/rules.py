"""Decides whether a file already meets its library's profile.

Tdarr calls these flows or plugins. Here each rule is a small function that
returns a reason string when the file fails, or None when it passes. Add a
function, register it in RULES, and it takes effect on the next probe.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass

# ffprobe codec names that mean the same thing as our profile choices.
CODEC_ALIASES = {
    "h264": {"h264", "avc", "avc1", "x264"},
    "hevc": {"hevc", "h265", "x265", "hvc1"},
    "av1": {"av1", "libaom-av1", "libsvtav1"},
    "vp9": {"vp9"},
}

CONTAINER_ALIASES = {
    "mkv": {"mkv", "matroska", "matroska,webm", "webm"},
    "mp4": {"mp4", "mov", "m4v", "mov,mp4,m4a,3gp,3g2,mj2"},
}


@dataclass
class Decision:
    needs_transcode: bool
    reason: str

    @property
    def verdict_reason(self) -> str:
        return self.reason


Rule = Callable[["MediaFile", "TranscodeProfile"], str | None]  # noqa: F821


def codec_matches(media_file, profile) -> str | None:
    actual = (media_file.video_codec or "").lower()
    if not actual:
        return "No video stream detected"
    wanted = CODEC_ALIASES.get(profile.video_codec, {profile.video_codec})
    if actual not in wanted:
        return f"Video is {actual}, target is {profile.video_codec}"
    return None


def container_matches(media_file, profile) -> str | None:
    actual = (media_file.container or "").lower()
    if not actual:
        return None
    wanted = CONTAINER_ALIASES.get(profile.container, {profile.container})
    if actual not in wanted:
        return f"Container is {actual}, target is {profile.container}"
    return None


def within_height(media_file, profile) -> str | None:
    if profile.max_height and media_file.height and media_file.height > profile.max_height:
        return f"{media_file.height}p exceeds the {profile.max_height}p ceiling"
    return None


def within_bitrate(media_file, profile) -> str | None:
    if (
        profile.max_bitrate_kbps
        and media_file.bitrate_kbps
        and media_file.bitrate_kbps > profile.max_bitrate_kbps
    ):
        return (
            f"{media_file.bitrate_kbps:,} kbps exceeds the "
            f"{profile.max_bitrate_kbps:,} kbps ceiling"
        )
    return None


RULES: list[Rule] = [codec_matches, container_matches, within_height, within_bitrate]


def evaluate(media_file, profile) -> Decision:
    """Run every rule and report the first failure, or a pass."""
    for rule in RULES:
        reason = rule(media_file, profile)
        if reason:
            return Decision(needs_transcode=True, reason=reason)
    return Decision(
        needs_transcode=False,
        reason=f"Already {profile.video_codec} in {profile.container}",
    )
