from django.contrib import admin

# Register your models here.
from .models import Library, MediaFile
@admin.register(Library)
class LibraryAdmin(admin.ModelAdmin):
    list_display = ["name", "path", "profile", "enabled", "last_scan_finished_at"]
    list_filter = ["enabled", "profile"]
    search_fields = ["name", "path"]


@admin.register(MediaFile)
class MediaFileAdmin(admin.ModelAdmin):
    list_display = ["rel_path", "library", "video_codec", "height", "status", "verdict"]
    list_filter = ["status", "verdict", "library"]
    search_fields = ["rel_path", "path"]
    # Django 6.1: name the related fields instead of list_select_related = True.
    list_select_related = ["library"]
    readonly_fields = ["path", "rel_path", "size_bytes", "original_size_bytes"]
