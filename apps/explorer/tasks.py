"""Background work, using Django 6's built-in Tasks framework.

The default ImmediateBackend runs these inline, which is fine for development
but means a scan of a large share blocks the request that started it. Point the
TASKS setting at a worker-backed backend before aiming this at a real share —
nothing in this module changes.
"""

from django.tasks import task
from django.utils import timezone

from .models import Node, Operation, ScanRoot, ScanRun


@task(takes_context=True)
def scan_share(
    context, scan_root_id: str, full: bool = False, run_id: str | None = None
) -> dict:
    """Walk one mounted share and reconcile it with the catalogue.

    ``full=True`` re-reads every entry instead of trusting size and mtime, which
    is what you want after changing exclude rules, or when clients have been
    writing files with a skewed clock.
    """
    from .scanning import scan  # late import keeps task discovery cheap

    scan_root = ScanRoot.objects.select_related("node").get(pk=scan_root_id)
    run = ScanRun.objects.filter(pk=run_id).first() if run_id else None
    run = run or ScanRun.objects.create(scan_root=scan_root)

    task_id = getattr(getattr(context, "task_result", None), "id", "")
    if task_id:
        ScanRun.objects.filter(pk=run.pk).update(task_id=task_id)
        run.task_id = task_id

    run = scan(scan_root, full=full, run=run)
    return {
        "status": run.status,
        "scanned": run.scanned,
        "created": run.created,
        "updated": run.updated,
        "vanished": run.vanished,
        "errors": run.errors,
    }


@task
def scan_all_shares(full: bool = False) -> list[str]:
    """Enqueue a scan for every enabled share. Suitable for a nightly trigger."""
    started = []
    for scan_root in ScanRoot.objects.filter(enabled=True):
        if not scan_root.is_available:
            ScanRun.objects.create(
                scan_root=scan_root,
                status=ScanRun.Status.UNAVAILABLE,
                finished_at=timezone.now(),
                message=f"{scan_root.mount_path} was not reachable when the sweep ran.",
            )
            continue
        run = ScanRun.objects.create(scan_root=scan_root)
        scan_share.enqueue(str(scan_root.pk), full=full, run_id=str(run.pk))
        started.append(scan_root.label)
    return started


@task
def purge_expired_trash(days: int = 30) -> int:
    """Permanently remove anything that has sat in Trash past the retention window.

    Scanned nodes are excluded: their real files live on the share, and the next
    scan would only import them again.
    """
    from . import services

    cutoff = timezone.now() - timezone.timedelta(days=days)
    stale = list(
        Node.objects.trashed()
        .filter(trashed_at__lt=cutoff, scan_root__isnull=True)
        .exclude(parent__trashed_at__isnull=False)
    )
    if not stale:
        return 0
    services.purge(nodes=stale)
    return len(stale)


@task
def prune_operation_log(keep: int = 5_000) -> int:
    """Trim the audit log, oldest first, once it grows past `keep` rows."""
    total = Operation.objects.count()
    if total <= keep:
        return 0
    doomed = Operation.objects.order_by("created_at").values_list("pk", flat=True)[
        : total - keep
    ]
    deleted, _ = Operation.objects.filter(pk__in=list(doomed)).delete()
    return deleted
