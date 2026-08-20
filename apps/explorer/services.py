"""All file mutations live here.

Views never touch ``Node.save()`` directly. Every public function in this module
opens an ``Operation``, records a per-node before/after snapshot, and closes the
operation — which is what makes the activity feed and undo possible.
"""

from __future__ import annotations

from contextlib import contextmanager
from typing import Iterable, Sequence

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from .models import Node, Operation, OperationItem


class OperationError(ValidationError):
    """Raised when an operation can't proceed (bad destination, name clash, ...)."""


# --------------------------------------------------------------------------- #
#  Helpers
# --------------------------------------------------------------------------- #
def unique_name(parent: Node | None, name: str, *, exclude: Node | None = None) -> str:
    """Return ``name``, or ``name (2)`` etc. if a sibling already uses it."""
    siblings = Node.objects.children_of(parent).alive()
    if exclude:
        siblings = siblings.exclude(pk=exclude.pk)
    taken = {n.lower() for n in siblings.values_list("name", flat=True)}
    if name.lower() not in taken:
        return name
    stem, dot, ext = name.rpartition(".")
    if not dot:
        stem, ext = name, ""
    suffix = f".{ext}" if dot else ""
    counter = 2
    while f"{stem} ({counter}){suffix}".lower() in taken:
        counter += 1
    return f"{stem} ({counter}){suffix}"


def assert_mutable(nodes: Sequence[Node]) -> None:
    """Refuse to mutate the catalogue entry for a file on a read-only share.

    The app catalogues shares; it does not write to them. Renaming a row here
    would not rename the file on the server, and the next scan would undo it —
    so say no clearly instead of pretending it worked.
    """
    for node in nodes:
        if node.scan_root_id and node.scan_root.read_only:
            raise OperationError(
                f"{node.name} lives on {node.scan_root.label}, which is catalogued "
                f"read-only. Change it on the share and re-scan."
            )


def assert_valid_destination(nodes: Sequence[Node], destination: Node) -> None:
    if not destination.is_folder:
        raise OperationError("Files can't hold other files. Pick a folder.")
    for node in nodes:
        if node.pk == destination.pk:
            raise OperationError(f"{node.name} can't go inside itself.")
        if node.is_folder and node.is_ancestor_of(destination):
            raise OperationError(f"{node.name} can't go inside one of its own subfolders.")


@contextmanager
def record(kind: str, *, actor=None, source=None, target=None, reversible=True, **detail):
    """Open an Operation, hand it to the caller, close it either way."""
    op = Operation.objects.create(
        kind=kind, actor=actor, source=source, target=target,
        reversible=reversible, detail=detail,
    )
    try:
        yield op
    except Exception as exc:
        op.finish(status=Operation.Status.FAILED, error=str(exc))
        raise
    op.finish()


def log_item(op: Operation, node: Node, before: dict | None = None, after: dict | None = None):
    return OperationItem.objects.create(
        operation=op,
        node=node,
        label=node.name,
        size=node.byte_size(),
        before=before or {},
        after=after or node.snapshot(),
    )


# --------------------------------------------------------------------------- #
#  Operations
# --------------------------------------------------------------------------- #
@transaction.atomic
def create_folder(*, parent: Node, name: str, actor=None) -> Operation:
    name = (name or "").strip()
    if not name:
        raise OperationError("Give the folder a name first.")
    if "/" in name:
        raise OperationError("Folder names can't contain a slash.")
    assert_mutable([parent])
    with record(Operation.Kind.CREATE_FOLDER, actor=actor, target=parent) as op:
        folder = Node.objects.create(
            parent=parent, name=unique_name(parent, name), kind=Node.Kind.FOLDER, owner=actor
        )
        log_item(op, folder)
    return op


@transaction.atomic
def upload_files(*, parent: Node, files: Iterable, actor=None) -> Operation:
    files = list(files)
    if not files:
        raise OperationError("No files were attached.")
    assert_mutable([parent])
    with record(Operation.Kind.UPLOAD, actor=actor, target=parent) as op:
        for upload in files:
            node = Node(
                parent=parent,
                name=unique_name(parent, upload.name),
                kind=Node.Kind.FILE,
                size=upload.size,
                content_type=getattr(upload, "content_type", "") or "",
                owner=actor,
                upload=upload,
            )
            node.save()
            log_item(op, node)
    return op


@transaction.atomic
def rename(*, node: Node, name: str, actor=None) -> Operation:
    name = (name or "").strip()
    if not name:
        raise OperationError("Give it a name first.")
    if name == node.name:
        raise OperationError("That's already its name.")
    assert_mutable([node])
    with record(Operation.Kind.RENAME, actor=actor, source=node.parent) as op:
        before = node.snapshot()
        node.name = unique_name(node.parent, name, exclude=node)
        node.save(update_fields=["name", "modified_at"])
        log_item(op, node, before)
    return op


@transaction.atomic
def move(*, nodes: Sequence[Node], destination: Node, actor=None) -> Operation:
    assert_valid_destination(nodes, destination)
    assert_mutable([*nodes, destination])
    movable = [n for n in nodes if n.parent_id != destination.pk]
    if not movable:
        raise OperationError("Those items are already there.")
    with record(
        Operation.Kind.MOVE, actor=actor, source=movable[0].parent, target=destination
    ) as op:
        for node in movable:
            before = node.snapshot()
            node.name = unique_name(destination, node.name)
            node.move_to(destination)
            log_item(op, node, before)
    return op


def _clone(node: Node, destination: Node, actor, *, rename_root=True) -> Node:
    copy = Node(
        parent=destination,
        name=unique_name(destination, node.name) if rename_root else node.name,
        kind=node.kind,
        size=node.size,
        content_type=node.content_type,
        upload=node.upload,
        owner=actor or node.owner,
        starred=node.starred,
    )
    copy.save()
    for child in node.children.alive():
        _clone(child, copy, actor, rename_root=False)
    return copy


@transaction.atomic
def copy(*, nodes: Sequence[Node], destination: Node, actor=None) -> Operation:
    assert_valid_destination(nodes, destination)
    assert_mutable([destination])
    with record(Operation.Kind.COPY, actor=actor, target=destination) as op:
        for node in nodes:
            duplicate = _clone(node, destination, actor)
            log_item(op, duplicate, before={"copied_from": str(node.pk), "name": node.name})
    return op


@transaction.atomic
def trash(*, nodes: Sequence[Node], actor=None) -> Operation:
    if not nodes:
        raise OperationError("Nothing selected.")
    assert_mutable(nodes)
    with record(Operation.Kind.TRASH, actor=actor, source=nodes[0].parent) as op:
        stamp = timezone.now()
        for node in nodes:
            before = node.snapshot()
            node.trashed_at = stamp
            node.save(update_fields=["trashed_at", "modified_at"])
            log_item(op, node, before)
    return op


@transaction.atomic
def restore(*, nodes: Sequence[Node], actor=None) -> Operation:
    if not nodes:
        raise OperationError("Nothing selected.")
    with record(Operation.Kind.RESTORE, actor=actor) as op:
        for node in nodes:
            before = node.snapshot()
            node.trashed_at = None
            node.name = unique_name(node.parent, node.name, exclude=node)
            node.save(update_fields=["trashed_at", "name", "modified_at"])
            # An item is only truly back if its ancestors are back too.
            for ancestor in node.ancestors():
                if ancestor.trashed_at:
                    ancestor.trashed_at = None
                    ancestor.save(update_fields=["trashed_at"])
            log_item(op, node, before)
    return op


@transaction.atomic
def purge(*, nodes: Sequence[Node], actor=None) -> Operation:
    """Permanent delete. Deliberately not reversible."""
    if not nodes:
        raise OperationError("Nothing selected.")
    assert_mutable(nodes)
    with record(Operation.Kind.PURGE, actor=actor, reversible=False) as op:
        for node in nodes:
            OperationItem.objects.create(
                operation=op,
                node=None,
                label=node.name,
                size=node.byte_size(),
                before=node.snapshot(),
                after={"deleted": True},
            )
        Node.objects.filter(pk__in=[n.pk for n in nodes]).delete()
    return op


@transaction.atomic
def set_star(*, nodes: Sequence[Node], starred: bool, actor=None) -> Operation:
    if not nodes:
        raise OperationError("Nothing selected.")
    kind = Operation.Kind.STAR if starred else Operation.Kind.UNSTAR
    with record(kind, actor=actor) as op:
        for node in nodes:
            before = node.snapshot()
            node.starred = starred
            node.save(update_fields=["starred", "modified_at"])
            log_item(op, node, before)
    return op


@transaction.atomic
def record_download(*, nodes: Sequence[Node], actor=None) -> Operation:
    """Downloads mutate nothing but are worth auditing."""
    with record(Operation.Kind.DOWNLOAD, actor=actor, reversible=False) as op:
        for node in nodes:
            log_item(op, node)
    return op


# --------------------------------------------------------------------------- #
#  Undo
# --------------------------------------------------------------------------- #
@transaction.atomic
def undo(*, operation: Operation, actor=None) -> Operation:
    if not operation.can_undo:
        raise OperationError("That operation can't be undone.")

    with record(
        Operation.Kind.UNDO, actor=actor, reversible=False, undid=operation.get_kind_display()
    ) as reverse_op:
        reverse_op.undo_of = operation
        reverse_op.save(update_fields=["undo_of"])

        for item in operation.items.select_related("node"):
            node = item.node
            if node is None:
                continue

            if operation.kind in {
                Operation.Kind.CREATE_FOLDER,
                Operation.Kind.UPLOAD,
                Operation.Kind.COPY,
            }:
                OperationItem.objects.create(
                    operation=reverse_op, node=None, label=node.name,
                    size=item.size, before=node.snapshot(), after={"deleted": True},
                )
                node.delete()
                continue

            before = item.before
            snapshot = node.snapshot()
            if operation.kind == Operation.Kind.RENAME:
                node.name = unique_name(node.parent, before["name"], exclude=node)
                node.save(update_fields=["name", "modified_at"])
            elif operation.kind == Operation.Kind.MOVE:
                original = Node.objects.filter(pk=before.get("parent")).first()
                if original:
                    node.name = unique_name(original, before["name"], exclude=node)
                    node.move_to(original)
            elif operation.kind in {Operation.Kind.TRASH, Operation.Kind.RESTORE}:
                node.trashed_at = None
                if before.get("trashed_at"):
                    node.trashed_at = timezone.datetime.fromisoformat(before["trashed_at"])
                node.save(update_fields=["trashed_at", "modified_at"])
            elif operation.kind in {Operation.Kind.STAR, Operation.Kind.UNSTAR}:
                node.starred = before.get("starred", False)
                node.save(update_fields=["starred", "modified_at"])

            OperationItem.objects.create(
                operation=reverse_op, node=node, label=node.name,
                size=item.size, before=snapshot, after=node.snapshot(),
            )

        operation.undone_at = timezone.now()
        operation.save(update_fields=["undone_at"])

    return reverse_op
