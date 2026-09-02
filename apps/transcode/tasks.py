"""Background transcoding, on Django 6's Tasks framework.

A transcode is the archetypal task: minutes long, CPU-bound, and pointless to
hold an HTTP connection open for. Under the development ImmediateBackend these
still run inline — see the README before pointing this at real footage.
"""

from django.tasks import task

from explorer.models import Node

from . import services
from .models import Preset, TranscodeJob


@task(takes_context=True)
def run_transcode(context, job_id: str) -> dict:
    """Convert one file. Safe to deliver more than once: the claim is atomic."""
    job = services.claim(job_id)
    if job is None:
        existing = TranscodeJob.objects.filter(pk=job_id).first()
        return {
            "job": job_id,
            "status": existing.status if existing else "missing",
            "claimed": False,
        }

    task_id = getattr(getattr(context, "task_result", None), "id", "")
    if task_id:
        TranscodeJob.objects.filter(pk=job.pk).update(task_id=task_id)

    job = services.run(job)
    return {
        "job": str(job.pk),
        "status": job.status,
        "output": str(job.output_id) if job.output_id else None,
        "output_bytes": job.output_bytes,
        "elapsed_seconds": job.elapsed_seconds,
        "error": job.error[:200],
    }


@task
def transcode_nodes(
    node_ids: list[str], preset_slug: str, actor_id: int | None = None
) -> dict:
    """Queue and dispatch a batch. Folders expand to the media inside them."""
    from django.contrib.auth import get_user_model

    preset = Preset.objects.get(slug=preset_slug, enabled=True)
    nodes = list(Node.objects.filter(pk__in=node_ids).alive())
    actor = get_user_model().objects.filter(pk=actor_id).first() if actor_id else None

    report = services.queue(nodes=nodes, preset=preset, actor=actor)
    for job in report["queued"]:
        run_transcode.enqueue(str(job.pk))
    return {
        "queued": len(report["queued"]),
        "duplicate": report["duplicate"],
        "skipped": report["skipped"],
    }


@task
def probe_pending(limit: int = 200) -> int:
    """Fill in media metadata for files that don't have any yet.

    Pair this with a share scan: the scan catalogues quickly, this fills in
    durations and resolutions afterwards without slowing the walk down.
    """
    extensions = services.media_extensions()
    pending = (
        Node.objects.alive()
        .files()
        .filter(media__isnull=True)
        .exclude(missing_since__isnull=False)
    )
    done = 0
    for node in pending.iterator():
        if node.extension not in extensions:
            continue
        services.probe_node(node)
        done += 1
        if done >= limit:
            break
    return done


@task
def sweep_stuck_jobs(minutes: int = 180) -> int:
    return services.sweep_stuck(minutes)
