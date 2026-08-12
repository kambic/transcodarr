"""Data model for the file explorer.

Two concerns live here:

* ``Node`` — the tree itself (folders and files), stored as an adjacency list
  plus a materialized ``path`` so subtree queries stay a single indexed
  ``LIKE 'prefix%'`` scan instead of N recursive queries.
* ``Operation`` / ``OperationItem`` — an append-only log of every mutation, with
  before/after snapshots rich enough to reverse the operation later.
"""

from __future__ import annotations

import mimetypes
import os
import uuid

from django.conf import settings
from django.core.cache import cache
from django.core.files.storage import FileSystemStorage
from django.db import models
from django.db.models import F, Q, Sum, Value
from django.db.models.functions import Concat, Lower, Substr
from django.urls import reverse
from django.utils import timezone

fs = FileSystemStorage(location="/export")


class Document(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(storage=fs)


def upload_to(instance: "Node", filename: str) -> str:
    return f"vault/{instance.id.hex[:2]}/{instance.id.hex}/{filename}"


# --------------------------------------------------------------------------- #
#  Nodes
# --------------------------------------------------------------------------- #
class NodeQuerySet(models.QuerySet):
    def alive(self):
        return self.filter(trashed_at__isnull=True)

    def trashed(self):
        return self.filter(trashed_at__isnull=False)

    def folders(self):
        return self.filter(kind=Node.Kind.FOLDER)

    def files(self):
        return self.filter(kind=Node.Kind.FILE)

    def children_of(self, node: "Node | None"):
        return self.filter(parent=node)

    def subtree(self, node: "Node"):
        """Everything below ``node``, excluding ``node`` itself."""
        return self.filter(path__startswith=node.subtree_prefix)

    def search(self, term: str, root: "Node | None" = None):
        qs = self.alive().filter(name__icontains=term)
        return qs.filter(path__startswith=root.subtree_prefix) if root else qs

    def total_bytes(self) -> int:
        return self.aggregate(total=Sum("size"))["total"] or 0

    def scanned(self):
        return self.filter(origin=Node.Origin.SCANNED)

    def missing(self):
        return self.filter(missing_since__isnull=False)


class Node(models.Model):
    class Kind(models.TextChoices):
        FOLDER = "folder", "Folder"
        FILE = "file", "File"

    class Origin(models.TextChoices):
        MANAGED = "managed", "Created here"
        SCANNED = "scanned", "Found on a share"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parent = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.CASCADE, related_name="children"
    )
    name = models.CharField(max_length=255)
    kind = models.CharField(max_length=6, choices=Kind, default=Kind.FILE)

    size = models.BigIntegerField(default=0, help_text="Bytes. Always 0 for folders.")
    content_type = models.CharField(max_length=120, blank=True)
    upload = models.FileField(upload_to=upload_to, blank=True, null=True)

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="nodes",
    )
    starred = models.BooleanField(default=False)
    trashed_at = models.DateTimeField(null=True, blank=True)

    # "/<root-id>/<child-id>/<self-id>" — maintained in save() and move_to().
    path = models.CharField(max_length=1024, editable=False, default="", db_index=True)

    # Provenance. Nodes discovered by a share scan carry the share they came
    # from and their location within it, which is how the next scan recognises
    # them instead of importing duplicates.
    origin = models.CharField(max_length=8, choices=Origin, default=Origin.MANAGED)
    scan_root = models.ForeignKey(
        "ScanRoot",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="nodes",
    )
    rel_path = models.CharField(
        max_length=1024, blank=True, help_text="POSIX path within the share."
    )
    fs_modified_at = models.DateTimeField(
        null=True, blank=True, help_text="mtime as reported by the share."
    )
    missing_since = models.DateTimeField(
        null=True, blank=True, help_text="Set when a scan no longer finds the file."
    )

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    objects = NodeQuerySet.as_manager()

    class Meta:
        # "folder" sorts after "file" alphabetically, so descending puts folders first.
        ordering = ["-kind", Lower("name")]
        constraints = [
            models.UniqueConstraint(
                Lower("name"),
                F("parent"),
                condition=Q(trashed_at__isnull=True),
                name="node_unique_name_per_parent",
            ),
            models.CheckConstraint(
                condition=Q(kind="file") | Q(kind="folder", size=0),
                name="node_folders_have_no_size",
            ),
            models.CheckConstraint(
                condition=~Q(parent=F("id")), name="node_is_not_its_own_parent"
            ),
            models.UniqueConstraint(
                fields=["scan_root", "rel_path"],
                condition=Q(scan_root__isnull=False),
                name="node_unique_path_per_share",
            ),
        ]
        indexes = [
            models.Index(fields=["trashed_at"], name="node_trashed_idx"),
            models.Index(
                fields=["starred"], condition=Q(starred=True), name="node_starred_idx"
            ),
            models.Index(fields=["-modified_at"], name="node_recent_idx"),
            models.Index(fields=["scan_root", "rel_path"], name="node_share_path_idx"),
        ]

    def __str__(self) -> str:
        return self.name

    # -- tree plumbing ------------------------------------------------------ #
    @property
    def is_folder(self) -> bool:
        return self.kind == self.Kind.FOLDER

    @property
    def subtree_prefix(self) -> str:
        return f"{self.path}/"

    @property
    def ancestor_ids(self) -> list[str]:
        return [part for part in self.path.split("/") if part][:-1]

    def build_path(self) -> str:
        return f"{self.parent.path}/{self.id}" if self.parent_id else f"/{self.id}"

    def save(self, *args, **kwargs):
        if self.is_folder:
            self.size = 0
        if not self.content_type and not self.is_folder:
            self.content_type = mimetypes.guess_type(self.name)[0] or ""
        expected = self.build_path()
        if self.path != expected:
            self.path = expected
            if kwargs.get("update_fields"):
                kwargs["update_fields"] = {*kwargs["update_fields"], "path"}
        super().save(*args, **kwargs)

    def descendants(self) -> NodeQuerySet:
        return Node.objects.subtree(self)

    def ancestors(self) -> list["Node"]:
        if not self.ancestor_ids:
            return []
        by_id = {str(n.id): n for n in Node.objects.filter(id__in=self.ancestor_ids)}
        return [by_id[i] for i in self.ancestor_ids if i in by_id]

    def breadcrumbs(self) -> list["Node"]:
        return [*self.ancestors(), self]

    def is_ancestor_of(self, other: "Node") -> bool:
        return other.path.startswith(self.subtree_prefix)

    def move_to(self, destination: "Node") -> None:
        """Reparent and rewrite the paths of the whole subtree in one UPDATE."""
        old_prefix = self.subtree_prefix
        self.parent = destination
        self.path = self.build_path()
        super().save(update_fields=["parent", "path", "modified_at"])
        Node.objects.filter(path__startswith=old_prefix).update(
            path=Concat(Value(self.subtree_prefix), Substr("path", len(old_prefix) + 1))
        )

    # -- derived values ----------------------------------------------------- #
    def byte_size(self) -> int:
        if not self.is_folder:
            return self.size
        return self.descendants().alive().files().total_bytes()

    def child_summary(self) -> dict[str, int]:
        kids = self.children.alive()
        return {
            "files": kids.files().count(),
            "folders": kids.folders().count(),
        }

    @property
    def extension(self) -> str:
        return self.name.rsplit(".", 1)[-1].lower() if "." in self.name[1:] else ""

    @property
    def facet(self) -> str:
        """Coarse type used for icon + colour selection."""
        if self.is_folder:
            return "folder"
        return {
            "png": "image",
            "jpg": "image",
            "jpeg": "image",
            "gif": "image",
            "webp": "image",
            "svg": "image",
            "mp4": "video",
            "mov": "video",
            "webm": "video",
            "wav": "audio",
            "mp3": "audio",
            "aiff": "audio",
            "pdf": "doc",
            "docx": "doc",
            "txt": "doc",
            "md": "doc",
            "key": "doc",
            "xlsx": "sheet",
            "csv": "sheet",
            "js": "code",
            "css": "code",
            "json": "code",
            "sh": "code",
            "html": "code",
            "py": "code",
            "zip": "archive",
            "tar": "archive",
            "gz": "archive",
            "fig": "design",
            "sketch": "design",
            "psd": "design",
        }.get(self.extension, "file")

    @property
    def is_scanned(self) -> bool:
        return self.origin == self.Origin.SCANNED

    @property
    def source_path(self) -> str:
        """Absolute path on the mounted share, for nodes that came from one."""
        if not self.scan_root_id:
            return ""
        return os.path.join(self.scan_root.mount_path, *self.rel_path.split("/"))

    def get_absolute_url(self) -> str:
        return reverse("explorer:browse", args=[self.pk])

    def snapshot(self) -> dict:
        """Everything needed to put this node back the way it was."""
        return {
            "name": self.name,
            "parent": str(self.parent_id) if self.parent_id else None,
            "starred": self.starred,
            "trashed_at": self.trashed_at.isoformat() if self.trashed_at else None,
        }


# --------------------------------------------------------------------------- #
#  Operation log
# --------------------------------------------------------------------------- #
class OperationQuerySet(models.QuerySet):
    def recent(self, limit: int = 25):
        return self.select_related("actor", "source", "target").prefetch_related(
            "items"
        )[:limit]

    def undoable(self):
        return self.filter(
            status=Operation.Status.DONE, reversible=True, undone_at__isnull=True
        )


class Operation(models.Model):
    """One user-visible action, however many nodes it touched."""

    class Kind(models.TextChoices):
        CREATE_FOLDER = "create_folder", "Created folder"
        UPLOAD = "upload", "Added files"
        RENAME = "rename", "Renamed"
        MOVE = "move", "Moved"
        COPY = "copy", "Copied"
        TRASH = "trash", "Moved to trash"
        RESTORE = "restore", "Restored"
        PURGE = "purge", "Deleted permanently"
        STAR = "star", "Starred"
        UNSTAR = "unstar", "Unstarred"
        DOWNLOAD = "download", "Downloaded"
        IMPORT = "import", "Imported from share"
        TRANSCODE = "transcode", "Converted"
        VANISHED = "vanished", "Gone from share"
        UNDO = "undo", "Undid an operation"

    class Status(models.TextChoices):
        PENDING = "pending", "In progress"
        DONE = "done", "Done"
        FAILED = "failed", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    kind = models.CharField(max_length=20, choices=Kind)
    status = models.CharField(max_length=8, choices=Status, default=Status.PENDING)

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="file_operations",
    )
    source = models.ForeignKey(
        Node,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="operations_from",
    )
    target = models.ForeignKey(
        Node,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="operations_to",
    )

    item_count = models.PositiveIntegerField(default=0)
    bytes_affected = models.BigIntegerField(default=0)
    detail = models.JSONField(default=dict, blank=True)
    error = models.TextField(blank=True)

    reversible = models.BooleanField(default=True)
    undone_at = models.DateTimeField(null=True, blank=True)
    undo_of = models.OneToOneField(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="undone_by",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    objects = OperationQuerySet.as_manager()

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-created_at"], name="op_recent_idx"),
            models.Index(fields=["kind", "status"], name="op_kind_status_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.get_kind_display()} ({self.item_count})"

    @property
    def can_undo(self) -> bool:
        return (
            self.reversible
            and self.status == self.Status.DONE
            and self.undone_at is None
            and self.kind != self.Kind.UNDO
        )

    @property
    def duration_ms(self) -> int | None:
        if not self.finished_at:
            return None
        return int((self.finished_at - self.created_at).total_seconds() * 1000)

    def headline(self) -> str:
        names = [i.label for i in self.items.all()[:2]]
        rest = self.item_count - len(names)
        subject = ", ".join(names) + (f" and {rest} more" if rest > 0 else "")
        verb = self.get_kind_display()
        if self.kind in {self.Kind.MOVE, self.Kind.COPY} and self.target:
            return f"{verb} {subject} to {self.target.name}"
        if self.kind == self.Kind.RENAME and self.items.exists():
            first = self.items.first()
            return f"Renamed {first.before.get('name')} to {first.after.get('name')}"
        return f"{verb} {subject}" if subject else verb

    def finish(self, *, status: str = Status.DONE, error: str = "") -> None:
        aggregate = self.items.aggregate(n=models.Count("id"), b=Sum("size"))
        self.item_count = aggregate["n"] or 0
        self.bytes_affected = aggregate["b"] or 0
        self.status = status
        self.error = error
        self.finished_at = timezone.now()
        self.save(
            update_fields=[
                "item_count",
                "bytes_affected",
                "status",
                "error",
                "finished_at",
            ]
        )


class OperationItem(models.Model):
    """Per-node record. Keeps a label so the log survives a permanent delete."""

    operation = models.ForeignKey(
        Operation, on_delete=models.CASCADE, related_name="items"
    )
    node = models.ForeignKey(
        Node, null=True, blank=True, on_delete=models.SET_NULL, related_name="history"
    )
    label = models.CharField(max_length=255)
    size = models.BigIntegerField(default=0)
    before = models.JSONField(default=dict, blank=True)
    after = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["id"]
        indexes = [
            models.Index(fields=["operation", "node"], name="opitem_op_node_idx")
        ]

    def __str__(self) -> str:
        return self.label


# --------------------------------------------------------------------------- #
#  Mounted shares
# --------------------------------------------------------------------------- #
class ScanRoot(models.Model):
    """A directory on the filesystem that mirrors into a folder in the tree.

    Aimed at network mounts (SMB/CIFS, NFS): they disappear without warning,
    they are slow per-syscall, and they are case-insensitive. The defaults here
    assume the share is a source of truth to be catalogued, not written to.
    """

    class MissingPolicy(models.TextChoices):
        FLAG = "flag", "Flag as missing"
        TRASH = "trash", "Move to trash"
        DELETE = "delete", "Remove from the catalogue"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    label = models.CharField(max_length=120, unique=True)
    mount_path = models.CharField(
        max_length=1024, help_text="Absolute path of the mounted share."
    )
    node = models.ForeignKey(
        Node,
        on_delete=models.CASCADE,
        related_name="scan_roots",
        help_text="Folder in the tree this share is mirrored into.",
    )

    enabled = models.BooleanField(default=True)
    read_only = models.BooleanField(
        default=True,
        help_text="Refuse rename/move/delete on files catalogued from this share.",
    )

    # Safety rails for flaky mounts.
    require_mount = models.BooleanField(
        default=True, help_text="Abort unless mount_path is a real mount point."
    )
    max_missing_ratio = models.FloatField(
        default=0.25,
        help_text="Abort the missing-file pass if a larger share of the catalogue vanished at once.",
    )

    # Walk behaviour.
    follow_symlinks = models.BooleanField(default=False)
    max_depth = models.PositiveSmallIntegerField(
        default=0, help_text="0 means unlimited."
    )
    min_size = models.BigIntegerField(
        default=0, help_text="Skip files smaller than this."
    )
    exclude = models.JSONField(
        default=list,
        blank=True,
        help_text="fnmatch patterns matched against each entry name.",
    )
    missing_policy = models.CharField(
        max_length=6, choices=MissingPolicy, default=MissingPolicy.FLAG
    )
    batch_size = models.PositiveIntegerField(
        default=500,
        help_text="Entries per transaction. Keeps write locks short on long scans.",
    )

    last_scanned_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    DEFAULT_EXCLUDES = [
        ".*",
        "~$*",
        "*.tmp",
        "*.crdownload",
        "*.part",
        "Thumbs.db",
        "desktop.ini",
        ".DS_Store",
        "@eaDir",
        ".TemporaryItems",
        ".Trashes",
        "$RECYCLE.BIN",
        "System Volume Information",
    ]

    class Meta:
        ordering = ["label"]

    def __str__(self) -> str:
        return self.label

    @property
    def patterns(self) -> list[str]:
        return self.exclude or self.DEFAULT_EXCLUDES

    @property
    def is_available(self) -> bool:
        """Cheap liveness probe. On a dead CIFS mount this is what fails first."""
        try:
            if not os.path.isdir(self.mount_path):
                return False
            # if self.require_mount and not os.path.ismount(self.mount_path):
            # return False
            os.listdir(self.mount_path)
        except OSError:
            return False
        return True

    def probe(self, ttl: int = 30) -> bool:
        """Cached liveness check.

        ``is_available`` touches the network. The sidebar renders on every
        request, so without this a dead mount would make every page wait on the
        CIFS timeout.
        """
        key = f"scanroot:available:{self.pk}"
        cached = cache.get(key)
        if cached is None:
            cached = self.is_available
            cache.set(key, cached, ttl)
        return cached

    def latest_run(self) -> "ScanRun | None":
        return self.runs.first()


class ScanRun(models.Model):
    """One execution of a scan. Doubles as the progress record the UI polls."""

    class Status(models.TextChoices):
        QUEUED = "queued", "Queued"
        RUNNING = "running", "Scanning"
        DONE = "done", "Finished"
        FAILED = "failed", "Failed"
        UNAVAILABLE = "unavailable", "Share unavailable"
        ABORTED = "aborted", "Stopped for safety"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    scan_root = models.ForeignKey(
        ScanRoot, on_delete=models.CASCADE, related_name="runs"
    )
    status = models.CharField(max_length=12, choices=Status, default=Status.QUEUED)
    task_id = models.CharField(max_length=64, blank=True)
    dry_run = models.BooleanField(default=False)

    scanned = models.PositiveIntegerField(default=0)
    created = models.PositiveIntegerField(default=0)
    updated = models.PositiveIntegerField(default=0)
    vanished = models.PositiveIntegerField(default=0)
    skipped = models.PositiveIntegerField(default=0)
    errors = models.PositiveIntegerField(default=0)
    bytes_seen = models.BigIntegerField(default=0)

    message = models.TextField(blank=True)
    problems = models.JSONField(
        default=list, blank=True, help_text="First few unreadable paths."
    )
    operation = models.ForeignKey(
        Operation,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="scan_runs",
    )

    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-started_at"]
        indexes = [
            models.Index(fields=["scan_root", "-started_at"], name="scanrun_recent_idx")
        ]

    def __str__(self) -> str:
        return f"{self.scan_root.label} · {self.get_status_display()}"

    @property
    def is_active(self) -> bool:
        return self.status in {self.Status.QUEUED, self.Status.RUNNING}

    @property
    def changed(self) -> int:
        return self.created + self.updated + self.vanished

    def headline(self) -> str:
        if self.status == self.Status.UNAVAILABLE:
            return "Share not reachable — nothing was changed"
        if self.status == self.Status.ABORTED:
            return self.message or "Stopped before removing anything"
        if self.is_active:
            return f"{self.scanned} entries so far"
        bits = []
        if self.created:
            bits.append(f"{self.created} new")
        if self.updated:
            bits.append(f"{self.updated} changed")
        if self.vanished:
            bits.append(f"{self.vanished} gone")
        if self.errors:
            bits.append(f"{self.errors} unreadable")
        return ", ".join(bits) or "No changes"
