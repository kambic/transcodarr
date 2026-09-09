from __future__ import annotations

from datetime import timedelta

from django.conf import settings
from django.db import models
from django.urls import reverse
from django.utils import timezone

from files.models import Library, MediaFile


class JobKind(models.TextChoices):
    PROBE = "probe", "Probe"
    TRANSCODE = "transcode", "Transcode"
    FLOW = "flow", "Flow"
    SCAN = "scan", "Scan"


class Codec(models.TextChoices):
    H264 = "h264", "H.264 / AVC"
    HEVC = "hevc", "H.265 / HEVC"
    AV1 = "av1", "AV1"
    VP9 = "vp9", "VP9"
    MPEG2 = "mpeg2video", "MPEG-2"
    OTHER = "other", "Other"


class Container(models.TextChoices):
    MKV = "mkv", "MKV"
    MP4 = "mp4", "MP4"


class HWAccel(models.TextChoices):
    NONE = "none", "CPU only"
    NVENC = "nvenc", "NVIDIA NVENC"
    QSV = "qsv", "Intel QuickSync"
    VAAPI = "vaapi", "VAAPI"


class TranscodeProfile(models.Model):
    """The target every file in a library is measured against."""

    name = models.CharField(max_length=120, unique=True)
    video_codec = models.CharField(max_length=20, choices=Codec, default=Codec.HEVC)
    container = models.CharField(
        max_length=10, choices=Container, default=Container.MKV
    )
    audio_codec = models.CharField(max_length=20, default="copy")
    quality = models.PositiveSmallIntegerField(
        default=24, help_text="CRF for CPU encoders, CQ/global_quality for hardware."
    )
    preset = models.CharField(max_length=20, default="medium")
    hw_accel = models.CharField(max_length=10, choices=HWAccel, default=HWAccel.NONE)
    max_height = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Downscale anything taller. Blank keeps the source height.",
    )
    max_bitrate_kbps = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Flag files above this bitrate even if the codec matches.",
    )
    extra_args = models.CharField(
        max_length=400, blank=True, help_text="Appended verbatim to the ffmpeg command."
    )

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Flow(models.Model):
    """A node graph. The editor saves the whole thing as one JSON document.

    Storing the graph as JSON rather than normalised node and edge tables keeps
    a canvas save atomic: one write, no half-applied layouts if the request
    dies. Nothing queries inside a graph, so there is nothing to gain from
    splitting it up.

    Shape:
        {"nodes": [{"id", "type", "x", "y", "config": {...}}],
         "edges": [{"from": node_id, "output": 1, "to": node_id}]}
    """

    name = models.CharField(max_length=120, unique=True)
    description = models.CharField(max_length=300, blank=True)
    enabled = models.BooleanField(default=True)
    graph = models.JSONField(default=dict)
    revision = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    def get_absolute_url(self) -> str:
        return reverse("pipeline:flow_editor", args=[self.pk])

    @property
    def node_count(self) -> int:
        return len(self.graph.get("nodes") or [])

    @property
    def problems(self) -> list[str]:
        from .flows.engine import validate

        return validate(self.graph or {"nodes": [], "edges": []})


class Worker(models.Model):
    """A `db_worker` process that has checked in at least once."""

    name = models.CharField(max_length=120, unique=True)
    hostname = models.CharField(max_length=200, blank=True)
    concurrency = models.PositiveSmallIntegerField(default=1)
    enabled = models.BooleanField(default=True)
    last_heartbeat = models.DateTimeField(null=True, blank=True)
    jobs_completed = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    @property
    def is_online(self) -> bool:
        if not self.last_heartbeat:
            return False
        cutoff = timezone.now() - timedelta(seconds=settings.WORKER_OFFLINE_AFTER)
        return self.last_heartbeat >= cutoff


class JobState(models.TextChoices):
    QUEUED = "queued", "Queued"
    RUNNING = "running", "Running"
    CANCELLING = "cancelling", "Cancelling"
    SUCCEEDED = "succeeded", "Succeeded"
    FAILED = "failed", "Failed"
    CANCELLED = "cancelled", "Cancelled"


ACTIVE_JOB_STATES = (JobState.QUEUED, JobState.RUNNING, JobState.CANCELLING)


class JobQuerySet(models.QuerySet):
    def active(self):
        return self.filter(state__in=ACTIVE_JOB_STATES)

    def finished(self):
        return self.exclude(state__in=ACTIVE_JOB_STATES)


class Job(models.Model):
    """One unit of work, mirrored from a django.tasks TaskResult.

    The Tasks framework owns scheduling and retries; this row owns everything
    the dashboard needs to render — progress, fps, logs, byte counts.
    """

    media_file = models.ForeignKey(
        MediaFile, on_delete=models.CASCADE, related_name="jobs", null=True, blank=True
    )
    library = models.ForeignKey(
        Library, on_delete=models.CASCADE, related_name="jobs", null=True, blank=True
    )
    kind = models.CharField(max_length=20, choices=JobKind, default=JobKind.TRANSCODE)
    state = models.CharField(
        max_length=20, choices=JobState, default=JobState.QUEUED, db_index=True
    )
    priority = models.SmallIntegerField(default=0)

    task_result_id = models.CharField(max_length=64, blank=True, db_index=True)
    worker = models.ForeignKey(
        Worker, on_delete=models.SET_NULL, null=True, blank=True, related_name="jobs"
    )
    attempt = models.PositiveSmallIntegerField(default=1)

    progress = models.FloatField(default=0.0)
    fps = models.FloatField(null=True, blank=True)
    speed = models.FloatField(null=True, blank=True)
    eta_seconds = models.IntegerField(null=True, blank=True)

    size_before = models.BigIntegerField(default=0)
    size_after = models.BigIntegerField(default=0)

    flow = models.ForeignKey(
        Flow, on_delete=models.SET_NULL, null=True, blank=True, related_name="jobs"
    )
    trace = models.JSONField(
        default=list,
        blank=True,
        help_text="Nodes visited, in order, with the output taken.",
    )

    command = models.TextField(blank=True)
    log = models.TextField(blank=True)
    error = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    objects = JobQuerySet.as_manager()

    class Meta:
        ordering = ["-priority", "created_at"]
        indexes = [models.Index(fields=["state", "-priority", "created_at"])]

    def __str__(self) -> str:
        return f"{self.get_kind_display()} #{self.pk}"

    def get_absolute_url(self) -> str:
        return reverse("pipeline:job_detail", args=[self.pk])

    @property
    def is_active(self) -> bool:
        return self.state in ACTIVE_JOB_STATES

    @property
    def label(self) -> str:
        if self.media_file_id:
            return self.media_file.rel_path
        if self.library_id:
            return self.library.name
        return str(self)

    @property
    def duration_seconds(self) -> float | None:
        if not self.started_at:
            return None
        end = self.finished_at or timezone.now()
        return (end - self.started_at).total_seconds()

    @property
    def bytes_saved(self) -> int:
        if not self.size_after:
            return 0
        return self.size_before - self.size_after

    def append_log(self, line: str) -> None:
        """Keep the tail only — ffmpeg is chatty and these rows get polled."""
        stamped = f"[{timezone.now():%H:%M:%S}] {line}"
        lines = (self.log.splitlines() + [stamped])[-400:]
        self.log = "\n".join(lines)
