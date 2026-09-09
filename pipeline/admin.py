from django.contrib import admin

from .models import Flow, Job, TranscodeProfile, Worker



@admin.register(TranscodeProfile)
class TranscodeProfileAdmin(admin.ModelAdmin):
    list_display = ["name", "video_codec", "container", "quality", "hw_accel"]


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ["id", "kind", "state", "progress", "worker", "created_at"]
    list_filter = ["kind", "state"]
    list_select_related = ["media_file", "worker"]


@admin.register(Worker)
class WorkerAdmin(admin.ModelAdmin):
    list_display = ["name", "hostname", "enabled", "last_heartbeat", "jobs_completed"]


@admin.register(Flow)
class FlowAdmin(admin.ModelAdmin):
    list_display = ["name", "enabled", "node_count", "revision", "updated_at"]
    list_filter = ["enabled"]
    readonly_fields = ["revision"]
