from django.contrib import admin

from .models import MediaProbe, Preset, TranscodeJob


@admin.register(Preset)
class PresetAdmin(admin.ModelAdmin):
    list_display = (
        "label",
        "slug",
        "media_kind",
        "summary",
        "container",
        "enabled",
        "position",
    )
    list_filter = ("media_kind", "enabled")
    prepopulated_fields = {"slug": ("label",)}
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "label",
                    "slug",
                    "description",
                    "media_kind",
                    "enabled",
                    "position",
                )
            },
        ),
        ("Output", {"fields": ("container", "suffix")}),
        ("Video", {"fields": ("video_codec", "crf", "speed", "max_height", "fps_cap")}),
        ("Audio", {"fields": ("audio_codec", "audio_bitrate")}),
        (
            "Machine",
            {
                "fields": ("hardware_accel", "threads", "extra_args"),
                "description": "extra_args is passed straight to ffmpeg as arguments. Staff only.",
            },
        ),
    )


@admin.register(TranscodeJob)
class TranscodeJobAdmin(admin.ModelAdmin):
    list_display = (
        "created_at",
        "source",
        "preset",
        "status",
        "progress",
        "savings",
        "elapsed_seconds",
        "requested_by",
    )
    list_filter = ("status", "preset")
    date_hierarchy = "created_at"
    raw_id_fields = ("source", "output", "destination", "operation")
    readonly_fields = (
        "command",
        "log",
        "error",
        "task_id",
        "progress",
        "started_at",
        "finished_at",
        "elapsed_seconds",
    )
    actions = ["requeue"]

    @admin.action(description="Retry selected jobs")
    def requeue(self, request, queryset):
        from . import services
        from .tasks import run_transcode

        count = 0
        for job in queryset.exclude(status__in=["queued", "running"]):
            services.retry(job)
            run_transcode.enqueue(str(job.pk))
            count += 1
        self.message_user(request, f"Requeued {count} job(s).")


@admin.register(MediaProbe)
class MediaProbeAdmin(admin.ModelAdmin):
    list_display = (
        "node",
        "resolution",
        "runtime",
        "video_codec",
        "audio_codec",
        "probed_at",
    )
    search_fields = ("node__name",)
    raw_id_fields = ("node",)
