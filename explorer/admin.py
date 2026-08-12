from django.contrib import admin

from .models import Document, Node, Operation, OperationItem, ScanRoot, ScanRun


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("title",)


@admin.register(Node)
class NodeAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "kind",
        "parent",
        "size",
        "origin",
        "starred",
        "trashed_at",
        "modified_at",
    )
    list_filter = (
        "kind",
        "origin",
        "starred",
        "scan_root",
        ("trashed_at", admin.EmptyFieldListFilter),
    )
    search_fields = ("name", "path", "rel_path")
    readonly_fields = (
        "path",
        "rel_path",
        "fs_modified_at",
        "created_at",
        "modified_at",
    )
    raw_id_fields = ("parent", "owner", "scan_root")


class OperationItemInline(admin.TabularInline):
    model = OperationItem
    extra = 0
    readonly_fields = ("node", "label", "size", "before", "after")
    can_delete = False


@admin.register(Operation)
class OperationAdmin(admin.ModelAdmin):
    list_display = ("created_at", "kind", "status", "item_count", "actor", "undone_at")
    list_filter = ("kind", "status", "reversible")
    date_hierarchy = "created_at"
    inlines = [OperationItemInline]
    readonly_fields = [f.name for f in Operation._meta.fields]

    def has_add_permission(self, request):
        return False


class ScanRunInline(admin.TabularInline):
    model = ScanRun
    extra = 0
    fields = (
        "status",
        "scanned",
        "created",
        "updated",
        "vanished",
        "errors",
        "started_at",
    )
    readonly_fields = fields
    can_delete = False
    ordering = ("-started_at",)


@admin.register(ScanRoot)
class ScanRootAdmin(admin.ModelAdmin):
    list_display = (
        "label",
        "mount_path",
        "available",
        "enabled",
        "read_only",
        "missing_policy",
        "last_scanned_at",
    )
    list_filter = ("enabled", "read_only", "missing_policy")
    raw_id_fields = ("node",)
    inlines = [ScanRunInline]
    actions = ["scan_now"]

    @admin.display(boolean=True, description="Mounted")
    def available(self, obj):
        return obj.is_available

    @admin.action(description="Scan selected shares now")
    def scan_now(self, request, queryset):
        from .tasks import scan_share

        for scan_root in queryset:
            scan_share.enqueue(str(scan_root.pk))
        self.message_user(request, f"Queued {queryset.count()} scan(s).")


@admin.register(ScanRun)
class ScanRunAdmin(admin.ModelAdmin):
    list_display = (
        "started_at",
        "scan_root",
        "status",
        "scanned",
        "created",
        "updated",
        "vanished",
        "errors",
    )
    list_filter = ("status", "scan_root")
    date_hierarchy = "started_at"
    readonly_fields = [f.name for f in ScanRun._meta.fields]

    def has_add_permission(self, request):
        return False
