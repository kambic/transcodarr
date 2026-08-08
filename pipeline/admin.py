from django.contrib import admin

from .models import Flow, Job, Library, MediaFile, TranscodeProfile, Worker


@admin.register(Library)
class LibraryAdmin(admin.ModelAdmin):
    list_display = ["name", "path", "profile", "enabled", "last_scan_finished_at"]
    list_filter = ["enabled", "profile"]
    search_fields = ["name", "path"]


@admin.register(TranscodeProfile)
class TranscodeProfileAdmin(admin.ModelAdmin):
    list_display = ["name", "video_codec", "container", "quality", "hw_accel"]


@admin.register(MediaFile)
class MediaFileAdmin(admin.ModelAdmin):
    list_display = ["rel_path", "library", "video_codec", "height", "status", "verdict"]
    list_filter = ["status", "verdict", "video_codec", "library"]
    search_fields = ["rel_path", "path"]
    # Django 6.1: name the related fields instead of list_select_related = True.
    list_select_related = ["library"]


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
