"""Filesystem scanning for mounted shares.

Written for network mounts. Three things follow from that:

1. **The mount can vanish.** A dead CIFS mount usually looks like an empty
   directory, not an error. Deleting the catalogue because the share blinked is
   the worst thing this code could do, so every destructive step is gated: the
   mount is probed first, and the missing-file pass aborts if more than
   ``max_missing_ratio`` of the catalogue disappeared at once.
2. **Syscalls are expensive.** ``os.scandir`` is used so name/type/size come
   from the directory read itself instead of a ``stat`` per entry, existing
   nodes are loaded in one query, and writes are batched.
3. **SMB is case-insensitive and mtimes are coarse.** Identity is the relative
   path, comparisons are case-insensitive, and mtimes are compared with a
   couple of seconds of slack so a scan doesn't rewrite the whole catalogue.
"""

from __future__ import annotations

import fnmatch
import os
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone as dt_timezone

from django.db import transaction
from django.utils import timezone

from .models import Node, Operation, OperationItem, ScanRoot, ScanRun

MTIME_SLACK = timedelta(seconds=2)
MAX_RECORDED_PROBLEMS = 20


@dataclass(slots=True)
class Entry:
    rel_path: str
    name: str
    parent_rel: str
    is_dir: bool
    size: int
    mtime: float


@dataclass
class Existing:
    """The columns of an already-catalogued node the scan needs to compare."""

    pk: str
    parent_id: str | None
    name: str
    kind: str
    size: int
    fs_modified_at: datetime | None
    missing_since: datetime | None
    trashed_at: datetime | None


@dataclass
class Scanner:
    scan_root: ScanRoot
    run: ScanRun
    full: bool = False

    index: dict[str, Existing] = field(default_factory=dict, init=False)
    folders: dict[str, str] = field(default_factory=dict, init=False)
    seen: set[str] = field(default_factory=set, init=False)
    buffer: list[Entry] = field(default_factory=list, init=False)
    problems: list[str] = field(default_factory=list, init=False)
    operation: Operation | None = field(default=None, init=False)

    # -- entry point -------------------------------------------------------- #
    def execute(self) -> ScanRun:
        self.mark(ScanRun.Status.RUNNING)

        if not self.scan_root.is_available:  # uncached: the scan checks for real
            return self.finish(
                ScanRun.Status.UNAVAILABLE,
                f"{self.scan_root.mount_path} is not reachable. Nothing was changed.",
            )

        self.operation = Operation.objects.create(
            kind=Operation.Kind.IMPORT,
            source=self.scan_root.node,
            target=self.scan_root.node,
            reversible=False,
            detail={"share": self.scan_root.label, "path": self.scan_root.mount_path},
        )

        try:
            self.load_index()
            for entry in self.walk():
                self.buffer.append(entry)
                if len(self.buffer) >= self.scan_root.batch_size:
                    self.flush()
            self.flush()
            status, message = self.reconcile_missing()
        except Exception as exc:  # noqa: BLE001 — recorded, not swallowed
            self.operation.finish(status=Operation.Status.FAILED, error=str(exc))
            return self.finish(ScanRun.Status.FAILED, f"{type(exc).__name__}: {exc}")

        self.operation.finish()
        self.run.operation = self.operation
        ScanRoot.objects.filter(pk=self.scan_root.pk).update(
            last_scanned_at=timezone.now()
        )
        return self.finish(status, message)

    # -- bookkeeping -------------------------------------------------------- #
    def mark(self, status: str) -> None:
        self.run.status = status
        self.run.save(update_fields=["status"])

    def save_progress(self) -> None:
        self.run.problems = self.problems[:MAX_RECORDED_PROBLEMS]
        self.run.save(
            update_fields=[
                "scanned",
                "created",
                "updated",
                "vanished",
                "skipped",
                "errors",
                "bytes_seen",
                "problems",
            ]
        )

    def finish(self, status: str, message: str = "") -> ScanRun:
        self.run.status = status
        self.run.message = message
        self.run.finished_at = timezone.now()
        self.run.problems = self.problems[:MAX_RECORDED_PROBLEMS]
        self.run.save()
        return self.run

    def note_problem(self, path: str, exc: OSError) -> None:
        self.run.errors += 1
        if len(self.problems) < MAX_RECORDED_PROBLEMS:
            self.problems.append(f"{path}: {exc.strerror or exc}")

    # -- reading ------------------------------------------------------------ #
    def load_index(self) -> None:
        rows = Node.objects.filter(scan_root=self.scan_root).values_list(
            "pk",
            "parent_id",
            "name",
            "kind",
            "size",
            "fs_modified_at",
            "missing_since",
            "trashed_at",
            "rel_path",
        )
        for pk, parent_id, name, kind, size, fs_mtime, missing, trashed, rel in rows:
            self.index[rel.lower()] = Existing(
                str(pk),
                str(parent_id) if parent_id else None,
                name,
                kind,
                size,
                fs_mtime,
                missing,
                trashed,
            )
            if kind == Node.Kind.FOLDER:
                self.folders[rel.lower()] = str(pk)
        self.folders[""] = str(self.scan_root.node_id)

    def excluded(self, name: str) -> bool:
        return any(
            fnmatch.fnmatch(name, pattern) for pattern in self.scan_root.patterns
        )

    def walk(self):
        """Depth-first walk yielding parents before their children."""
        base = os.path.realpath(self.scan_root.mount_path)
        stack: list[tuple[str, str, int]] = [("", base, 0)]
        max_depth = self.scan_root.max_depth

        while stack:
            rel_dir, abs_dir, depth = stack.pop()
            try:
                with os.scandir(abs_dir) as it:
                    entries = sorted(it, key=lambda e: e.name)
            except OSError as exc:
                self.note_problem(abs_dir, exc)
                continue

            for dirent in entries:
                if self.excluded(dirent.name):
                    self.run.skipped += 1
                    continue
                try:
                    follow = self.scan_root.follow_symlinks
                    if dirent.is_symlink() and not follow:
                        self.run.skipped += 1
                        continue
                    is_dir = dirent.is_dir(follow_symlinks=follow)
                    if not is_dir and not dirent.is_file(follow_symlinks=follow):
                        self.run.skipped += 1  # socket, fifo, device
                        continue
                    stat = dirent.stat(follow_symlinks=follow)
                except OSError as exc:
                    self.note_problem(dirent.path, exc)
                    continue

                if not is_dir and stat.st_size < self.scan_root.min_size:
                    self.run.skipped += 1
                    continue

                rel_path = f"{rel_dir}/{dirent.name}".lstrip("/")
                self.run.scanned += 1
                if not is_dir:
                    self.run.bytes_seen += stat.st_size

                yield Entry(
                    rel_path, dirent.name, rel_dir, is_dir, stat.st_size, stat.st_mtime
                )

                if is_dir and (not max_depth or depth + 1 < max_depth):
                    stack.append((rel_path, dirent.path, depth + 1))

    # -- writing ------------------------------------------------------------ #
    @transaction.atomic
    def flush(self) -> None:
        """Apply one batch. Short transactions keep write locks brief."""
        for entry in self.buffer:
            key = entry.rel_path.lower()
            self.seen.add(key)
            existing = self.index.get(key)
            if existing is None:
                self.create(entry, key)
            else:
                self.update(entry, existing)
        self.buffer.clear()
        self.save_progress()

    def parent_for(self, entry: Entry) -> str | None:
        return self.folders.get(entry.parent_rel.lower())

    def create(self, entry: Entry, key: str) -> None:
        parent_id = self.parent_for(entry)
        if parent_id is None:
            # Parent was unreadable, so the child has nowhere to go.
            self.run.skipped += 1
            return

        # A node with this name may already exist from manual use of the app;
        # adopt it rather than colliding with the per-folder unique constraint.
        node = (
            Node.objects.filter(parent_id=parent_id, name__iexact=entry.name)
            .alive()
            .first()
        )
        if node is None:
            node = Node(parent_id=parent_id, name=entry.name)
        node.kind = Node.Kind.FOLDER if entry.is_dir else Node.Kind.FILE
        node.size = 0 if entry.is_dir else entry.size
        node.origin = Node.Origin.SCANNED
        node.scan_root = self.scan_root
        node.rel_path = entry.rel_path
        node.fs_modified_at = as_datetime(entry.mtime)
        node.missing_since = None
        node.save()

        self.index[key] = Existing(
            str(node.pk),
            parent_id,
            node.name,
            node.kind,
            node.size,
            node.fs_modified_at,
            None,
            None,
        )
        if entry.is_dir:
            self.folders[key] = str(node.pk)
        self.run.created += 1
        self.log(node, {"discovered": entry.rel_path})

    def update(self, entry: Entry, existing: Existing) -> None:
        if entry.is_dir:
            self.folders.setdefault(entry.rel_path.lower(), existing.pk)

        mtime = as_datetime(entry.mtime)
        changed = self.full or existing.missing_since is not None
        if not entry.is_dir:
            changed = changed or existing.size != entry.size
            changed = changed or existing.fs_modified_at is None
            changed = changed or abs(existing.fs_modified_at - mtime) > MTIME_SLACK

        if not changed:
            return

        fields = {
            "fs_modified_at": mtime,
            "missing_since": None,
            "modified_at": timezone.now(),
        }
        if not entry.is_dir:
            fields["size"] = entry.size
        if existing.missing_since and existing.trashed_at:
            fields["trashed_at"] = None  # it came back
        if existing.name != entry.name:
            fields["name"] = entry.name  # case-only rename on the share

        Node.objects.filter(pk=existing.pk).update(**fields)
        self.run.updated += 1

    def reconcile_missing(self) -> tuple[str, str]:
        """Handle catalogued nodes the walk didn't find."""
        known = {k for k, v in self.index.items() if v.missing_since is None}
        gone = known - self.seen
        if not gone:
            return ScanRun.Status.DONE, ""

        ratio = len(gone) / max(len(known), 1)
        if ratio > self.scan_root.max_missing_ratio:
            return (
                ScanRun.Status.ABORTED,
                f"{len(gone)} of {len(known)} catalogued items were not found "
                f"({ratio:.0%}). That looks like a mount problem rather than a "
                f"deletion, so nothing was removed. Re-run with a higher "
                f"max_missing_ratio if the share really did change that much.",
            )

        pks = [self.index[key].pk for key in gone]
        stamp = timezone.now()
        policy = self.scan_root.missing_policy

        with transaction.atomic():
            if policy == ScanRoot.MissingPolicy.DELETE:
                self.record_vanished(pks, deleted=True)
                Node.objects.filter(pk__in=pks).delete()
            else:
                self.record_vanished(pks, deleted=False)
                updates = {"missing_since": stamp}
                if policy == ScanRoot.MissingPolicy.TRASH:
                    updates["trashed_at"] = stamp
                Node.objects.filter(pk__in=pks).update(**updates)

        self.run.vanished = len(pks)
        self.save_progress()
        return ScanRun.Status.DONE, ""

    def record_vanished(self, pks: list[str], *, deleted: bool) -> None:
        if not self.operation:
            return
        vanished_op = Operation.objects.create(
            kind=Operation.Kind.VANISHED,
            source=self.scan_root.node,
            reversible=False,
            detail={"share": self.scan_root.label, "deleted": deleted},
        )
        by_pk = {entry.pk: (rel, entry) for rel, entry in self.index.items()}
        OperationItem.objects.bulk_create(
            [
                OperationItem(
                    operation=vanished_op,
                    node_id=None if deleted else pk,
                    label=by_pk[pk][1].name,
                    size=by_pk[pk][1].size,
                    before={"rel_path": by_pk[pk][0]},
                    after={"missing": True, "deleted": deleted},
                )
                for pk in pks
                if pk in by_pk
            ]
        )
        vanished_op.finish()

    def log(self, node: Node, before: dict) -> None:
        if self.operation:
            OperationItem.objects.create(
                operation=self.operation,
                node=node,
                label=node.name,
                size=node.size,
                before=before,
                after=node.snapshot(),
            )


def as_datetime(mtime: float) -> datetime:
    return datetime.fromtimestamp(mtime, tz=dt_timezone.utc)


def scan(
    scan_root: ScanRoot, *, full: bool = False, run: ScanRun | None = None
) -> ScanRun:
    run = run or ScanRun.objects.create(scan_root=scan_root)
    return Scanner(scan_root=scan_root, run=run, full=full).execute()
