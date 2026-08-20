from __future__ import annotations

import os
import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q
from django.utils import timezone

from explorer.models import Node, Operation


class Preset(models.Model):
    """A named ffmpeg recipe.

    Presets are configured by staff (admin or a data migration) and turned into
    an argv list by ``ffmpeg.build_args`` — never a shell string. ``extra_args``
    is an escape hatch for flags this model doesn't cover; it is validated to be
    a list of strings, but anything you put there is passed to ffmpeg, so it is
    a staff-only field.
    """

    NO_STREAM = "none"

    class Media(models.TextChoices):
        VIDEO = "video", "Video"
        AUDIO = "audio", "Audio"

    slug = models.SlugField(max_length=60, unique=True)
    label = models.CharField(max_length=120)
    description = models.CharField(max_length=250, blank=True)
    media_kind = models.CharField(max_length=5, choices=Media, default=Media.VIDEO)

    container = models.CharField(max_length=10, default="mp4", help_text="Output extension.")
    video_codec = models.CharField(
        max_length=20, default="libx264",
        help_text="Codec name, 'copy' to remux, or 'none' to drop the video stream.",
    )
    crf = models.PositiveSmallIntegerField(null=True, blank=True, help_text="Quality; lower is better.")
    speed = models.CharField(max_length=12, blank=True, help_text="x264/x265 -preset, e.g. veryfast.")
    max_height = models.PositiveSmallIntegerField(
        null=True, blank=True, help_text="Downscale to this height. Never upscales."
    )
    fps_cap = models.PositiveSmallIntegerField(null=True, blank=True)

    audio_codec = models.CharField(max_length=20, default="aac")
    audio_bitrate = models.CharField(max_length=10, blank=True, default="128k")

    hardware_accel = models.CharField(
        max_length=20, blank=True, help_text="ffmpeg -hwaccel value, e.g. vaapi. Leave blank for CPU."
    )
    threads = models.PositiveSmallIntegerField(
        null=True, blank=True, help_text="0 lets ffmpeg decide. Set a low number to stay polite."
    )
    extra_args = models.JSONField(default=list, blank=True)

    suffix = models.CharField(max_length=30, blank=True, help_text="Appended to the file stem.")
    enabled = models.BooleanField(default=True)
    position = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["position", "label"]

    def __str__(self) -> str:
        return self.label

    def clean(self):
        if not isinstance(self.extra_args, list) or any(
            not isinstance(arg, str) for arg in self.extra_args
        ):
            raise ValidationError({"extra_args": "Must be a list of strings."})
        if self.video_codec == self.NO_STREAM and self.audio_codec == self.NO_STREAM:
            raise ValidationError("A preset that drops both streams would produce nothing.")

    def output_name(self, source_name: str) -> str:
        stem = os.path.splitext(source_name)[0]
        return f"{stem}{self.suffix}.{self.container}"

    @property
    def summary(self) -> str:
        bits = []
        if self.video_codec == self.NO_STREAM:
            bits.append("audio only")
        elif self.video_codec != "copy":
            bits.append(self.video_codec)
            if self.max_height:
                bits.append(f"{self.max_height}p")
            if self.crf is not None:
                bits.append(f"crf {self.crf}")
        else:
            bits.append("remux")
        if self.audio_codec not in {"copy", self.NO_STREAM}:
            bits.append(f"{self.audio_codec} {self.audio_bitrate}".strip())
        return " · ".join(bits)


class MediaProbe(models.Model):
    """Cached ffprobe output for a node. Cheap to recompute, annoying to wait for."""

    node = models.OneToOneField(Node, on_delete=models.CASCADE, related_name="media")
    duration_seconds = models.FloatField(default=0)
    container = models.CharField(max_length=30, blank=True)
    video_codec = models.CharField(max_length=30, blank=True)
    audio_codec = models.CharField(max_length=30, blank=True)
    width = models.PositiveIntegerField(default=0)
    height = models.PositiveIntegerField(default=0)
    fps = models.FloatField(default=0)
    bitrate = models.BigIntegerField(default=0)
    error = models.CharField(max_length=250, blank=True)
    probed_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.node.name} ({self.resolution or 'unknown'})"

    @property
    def resolution(self) -> str:
        return f"{self.width}×{self.height}" if self.width and self.height else ""

    @property
    def runtime(self) -> str:
        total = int(self.duration_seconds)
        if not total:
            return ""
        hours, rest = divmod(total, 3600)
        minutes, seconds = divmod(rest, 60)
        return f"{hours}:{minutes:02d}:{seconds:02d}" if hours else f"{minutes}:{seconds:02d}"


class TranscodeJobQuerySet(models.QuerySet):
    def active(self):
        return self.filter(status__in=[TranscodeJob.Status.QUEUED, TranscodeJob.Status.RUNNING])

    def recent(self, limit: int = 12):
        return self.select_related("source", "preset", "output")[:limit]


class TranscodeJob(models.Model):
    class Status(models.TextChoices):
        QUEUED = "queued", "Queued"
        RUNNING = "running", "Converting"
        DONE = "done", "Finished"
        FAILED = "failed", "Failed"
        CANCELLED = "cancelled", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source = models.ForeignKey(Node, on_delete=models.CASCADE, related_name="transcode_jobs")
    preset = models.ForeignKey(Preset, on_delete=models.PROTECT, related_name="jobs")
    destination = models.ForeignKey(
        Node, null=True, blank=True, on_delete=models.SET_NULL, related_name="transcode_targets",
        help_text="Folder the result is filed into.",
    )
    output = models.ForeignKey(
        Node, null=True, blank=True, on_delete=models.SET_NULL, related_name="transcoded_from"
    )

    status = models.CharField(max_length=9, choices=Status, default=Status.QUEUED)
    progress = models.FloatField(default=0)
    cancel_requested = models.BooleanField(default=False)

    source_bytes = models.BigIntegerField(default=0)
    output_bytes = models.BigIntegerField(default=0)
    duration_seconds = models.FloatField(default=0)
    elapsed_seconds = models.FloatField(default=0)
    attempts = models.PositiveSmallIntegerField(default=0)

    error = models.TextField(blank=True)
    log = models.TextField(blank=True, help_text="Tail of ffmpeg's stderr.")
    command = models.TextField(blank=True)
    task_id = models.CharField(max_length=64, blank=True)

    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="transcode_jobs",
    )
    operation = models.ForeignKey(
        Operation, null=True, blank=True, on_delete=models.SET_NULL, related_name="transcode_jobs"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    objects = TranscodeJobQuerySet.as_manager()

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            # Queueing the same conversion twice is always a mistake.
            models.UniqueConstraint(
                fields=["source", "preset"],
                condition=Q(status__in=["queued", "running"]),
                name="transcode_one_active_job_per_source_preset",
            ),
        ]
        indexes = [
            models.Index(fields=["status", "-created_at"], name="job_status_recent_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.source.name} → {self.preset.label}"

    @property
    def is_active(self) -> bool:
        return self.status in {self.Status.QUEUED, self.Status.RUNNING}

    @property
    def savings(self) -> int | None:
        """Percent smaller than the source. Negative means the file grew."""
        if not (self.source_bytes and self.output_bytes):
            return None
        return round((1 - self.output_bytes / self.source_bytes) * 100)

    def headline(self) -> str:
        if self.status == self.Status.RUNNING:
            return f"{self.progress:.0f}%"
        if self.status == self.Status.DONE:
            saved = self.savings
            if saved is None:
                return "Finished"
            return f"{saved}% smaller" if saved >= 0 else f"{abs(saved)}% larger"
        if self.status == self.Status.FAILED:
            return self.error[:120] or "Failed"
        return self.get_status_display()

    def mark(self, status: str, **fields) -> None:
        self.status = status
        for key, value in fields.items():
            setattr(self, key, value)
        if status not in {self.Status.QUEUED, self.Status.RUNNING}:
            self.finished_at = timezone.now()
        self.save(update_fields=["status", "finished_at", *fields])
