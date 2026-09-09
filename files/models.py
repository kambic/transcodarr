from __future__ import annotations

from datetime import timedelta

from django.db import models
from django.urls import reverse
from django.utils import timezone

# from pipeline.models import TranscodeProfile, Flow, JobKind

class JobKind(models.TextChoices):
    PROBE = "probe", "Probe"
    TRANSCODE = "transcode", "Transcode"
    FLOW = "flow", "Flow"
    SCAN = "scan", "Scan"


# Create your models here.
class Library(models.Model):
    """A folder to watch, plus the profile its contents should match."""

    name = models.CharField(max_length=120)
    path = models.CharField(
        max_length=500, help_text="Absolute path the worker can read."
    )
    profile = models.ForeignKey(
        "pipeline.TranscodeProfile",
        on_delete=models.PROTECT,
        related_name="libraries",
        help_text="Used when no flow is set, and as the fallback for simple setups.",
    )
    flow = models.ForeignKey(
        "pipeline.Flow",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="libraries",
        help_text="A flow takes precedence over the profile.",
    )
    extensions = models.CharField(
        max_length=200,
        default="mkv,mp4,avi,mov,m4v,ts,wmv",
        help_text="Comma separated, no dots.",
    )
    enabled = models.BooleanField(default=True)
    scan_interval_minutes = models.PositiveIntegerField(default=720)
    auto_queue = models.BooleanField(
        default=True,
        help_text="Queue a transcode as soon as a file fails the profile check.",
    )
    last_scan_started_at = models.DateTimeField(null=True, blank=True)
    last_scan_finished_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "libraries"

    def __str__(self) -> str:
        return self.name

    def get_absolute_url(self) -> str:
        return reverse("pipeline:library_detail", args=[self.pk])

    @property
    def extension_set(self) -> set[str]:
        return {
            e.strip().lower().lstrip(".")
            for e in self.extensions.split(",")
            if e.strip()
        }

    @property
    def is_scanning(self) -> bool:
        return bool(self.last_scan_started_at) and (
            self.last_scan_finished_at is None
            or self.last_scan_finished_at < self.last_scan_started_at
        )

    @property
    def is_scan_due(self) -> bool:
        if not self.enabled or not self.scan_interval_minutes:
            return False
        if self.last_scan_finished_at is None:
            return True
        due = self.last_scan_finished_at + timedelta(minutes=self.scan_interval_minutes)
        return timezone.now() >= due


class FileStatus(models.TextChoices):
    NEW = "new", "Not scanned"
    PROBING = "probing", "Reading metadata"
    READY = "ready", "Meets target"
    QUEUED = "queued", "Queued"
    TRANSCODING = "transcoding", "Transcoding"
    TRANSCODED = "transcoded", "Transcoded"
    ERROR = "error", "Error"
    SKIPPED = "skipped", "Skipped"
    MISSING = "missing", "File missing"


class Verdict(models.TextChoices):
    UNKNOWN = "unknown", "Not evaluated"
    MEETS_TARGET = "meets_target", "Meets target"
    NEEDS_TRANSCODE = "needs_transcode", "Needs transcode"
    UNREADABLE = "unreadable", "Unreadable"


class MediaFileQuerySet(models.QuerySet):
    def needs_work(self):
        return self.filter(verdict=Verdict.NEEDS_TRANSCODE)

    def savings(self):
        """Bytes reclaimed by every file this pipeline has already rewritten."""
        return (
            self.filter(original_size_bytes__gt=0).aggregate(
                saved=models.Sum(
                    models.F("original_size_bytes") - models.F("size_bytes"),
                    output_field=models.BigIntegerField(),
                )
            )["saved"]
            or 0
        )


def def_meta():
    return {
        "probe": {},
        "ca": "",
        "cv": "",
        "height": "",
        "width": "",
        "duration": "",
        "bitrate": "",
        "size": "",
    }


class MediaFile(models.Model):
    library = models.ForeignKey(Library, on_delete=models.CASCADE, related_name="files")
    path = models.CharField(max_length=1000, unique=True)
    rel_path = models.CharField(max_length=1000)
    size_bytes = models.BigIntegerField(default=0)
    original_size_bytes = models.BigIntegerField(
        default=0, help_text="Size before this pipeline first touched the file."
    )
    mtime = models.DateTimeField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=FileStatus, default=FileStatus.NEW)
    verdict = models.CharField(max_length=20, choices=Verdict, default=Verdict.UNKNOWN)
    verdict_reason = models.CharField(max_length=300, blank=True)

    # container = models.CharField(max_length=20, blank=True)
    video_codec = models.CharField(max_length=30, blank=True)
    # audio_codec = models.CharField(max_length=30, blank=True)
    # width = models.PositiveIntegerField(null=True, blank=True)
    # height = models.PositiveIntegerField(null=True, blank=True)
    # duration_seconds = models.FloatField(null=True, blank=True)
    # bitrate_kbps = models.PositiveIntegerField(null=True, blank=True)

    last_probed_at = models.DateTimeField(null=True, blank=True)
    last_error = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    meta = models.JSONField(default=def_meta, null=False, blank=True)

    objects = MediaFileQuerySet.as_manager()

    kinds = JobKind

    class Meta:
        ordering = ["rel_path"]
        indexes = [
            models.Index(fields=["library", "status"]),
            models.Index(fields=["verdict"]),
            models.Index(fields=["-updated_at"]),
        ]

    def __str__(self) -> str:
        return self.rel_path

    def enqueue_task(self, kind: JobKind):
        from pipeline import tasks

        if kind == JobKind.PROBE:
            tasks.probe_file.enqueue(self.pk)

    @property
    def video_codec_d(self):
        try:
            return self.meta["probe"]["video_codec"]
        except KeyError:
            return None

    @property
    def audio_codec(self):
        try:
            return self.meta["probe"]["audio_codec"]
        except KeyError:
            return None

    @property
    def width(self):
        try:
            return self.meta["probe"]["width"]
        except KeyError:
            return None

    @property
    def height(self):
        try:
            return self.meta["probe"]["height"]
        except KeyError:
            return None

    @property
    def duration_seconds(self):
        try:
            return self.meta["probe"]["duration"]
        except KeyError:
            return None

    @property
    def bitrate_kbps(self):
        try:
            return self.meta["probe"]["bitrate"]
        except KeyError:
            return None

    def get_absolute_url(self) -> str:
        return reverse("pipeline:file_detail", args=[self.pk])

    @property
    def resolution_label(self) -> str:
        if not self.height:
            return "—"
        for threshold, label in (
            (2000, "4K"),
            (1000, "1080p"),
            (700, "720p"),
            (400, "480p"),
        ):
            if self.height >= threshold:
                return label
        return f"{self.height}p"

    @property
    def bytes_saved(self) -> int:
        if not self.original_size_bytes:
            return 0
        return max(self.original_size_bytes - self.size_bytes, 0)

    @property
    def percent_saved(self) -> float:
        if not self.original_size_bytes:
            return 0.0
        return round(self.bytes_saved / self.original_size_bytes * 100, 1)

    @property
    def is_busy(self) -> bool:
        return self.status in {
            FileStatus.PROBING,
            FileStatus.QUEUED,
            FileStatus.TRANSCODING,
        }
