"""Running saved flows.

`evaluate_flow` is the cheap pass used during probing: it walks the same graph
with `dry_run=True`, so conditions decide branches but actions only say what
they would do. `run_flow` is the expensive pass, executed by a worker.
"""

from __future__ import annotations

import logging
import time
from pathlib import Path

from django.conf import settings
from django.db import transaction
from django.tasks import task
from django.utils import timezone

from .flows import engine
from .models import Flow, Job, JobKind, JobState
from files.models import FileStatus, Verdict, MediaFile

logger = logging.getLogger(__name__)


def build_context(
    media_file: MediaFile, *, dry_run: bool, run_id: int = 0
) -> engine.FlowContext:
    return engine.FlowContext(
        working_path=media_file.path,
        relative_path=media_file.rel_path,
        dry_run=dry_run,
        run_id=run_id,
        metadata={
            "video_codec": media_file.video_codec,
            "audio_codec": media_file.audio_codec,
            "container": media_file.container,
            "width": media_file.width,
            "height": media_file.height,
            "bitrate_kbps": media_file.bitrate_kbps,
            "duration_seconds": media_file.duration_seconds,
            "size_bytes": media_file.size_bytes,
        },
        variables={
            "library": media_file.library.name,
            "filename": Path(media_file.path).name,
        },
    )


def evaluate_flow(media_file: MediaFile, flow: Flow) -> engine.FlowResult:
    """Decide, without doing any work, whether this file needs the flow run."""
    return engine.run(flow.graph, build_context(media_file, dry_run=True))


def queue_flow(media_file_id: int, priority: int = 0) -> Job | None:
    """Create the Job row, then hand the work to a worker."""
    media_file = MediaFile.objects.select_related("library__flow").get(pk=media_file_id)
    flow = media_file.library.flow
    if flow is None:
        return None

    existing = media_file.jobs.filter(kind=JobKind.FLOW).active().first()
    if existing:
        return existing

    job = Job.objects.create(
        media_file=media_file,
        library_id=media_file.library_id,
        flow=flow,
        kind=JobKind.FLOW,
        state=JobState.QUEUED,
        priority=priority,
        size_before=media_file.size_bytes,
    )
    MediaFile.objects.filter(pk=media_file.pk).update(status=FileStatus.QUEUED)
    transaction.on_commit(lambda: run_flow.using(priority=priority).enqueue(job.pk))
    return job


@task(queue_name="transcode", takes_context=True)
def run_flow(context, job_id: int) -> dict:
    """Execute every node in the library's flow against one file."""
    from .tasks import _fail_job, _finish_job, _register_worker

    job = Job.objects.select_related("media_file__library", "flow").get(pk=job_id)
    media_file = job.media_file
    flow = job.flow or media_file.library.flow
    worker = _register_worker(context)

    if flow is None:
        _fail_job(job, "The library has no flow attached.")
        return {"error": "no_flow"}
    if not Path(media_file.path).exists():
        MediaFile.objects.filter(pk=media_file.pk).update(status=FileStatus.MISSING)
        _fail_job(job, "Source file is gone")
        return {"error": "missing"}

    Job.objects.filter(pk=job.pk).update(
        state=JobState.RUNNING,
        started_at=timezone.now(),
        worker=worker,
        attempt=context.attempt,
        task_result_id=context.task_result.id,
        size_before=media_file.size_bytes,
        progress=0.0,
        trace=[],
    )
    MediaFile.objects.filter(pk=media_file.pk).update(status=FileStatus.TRANSCODING)

    ctx = build_context(media_file, dry_run=False, run_id=job.pk)
    ctx.size_before = media_file.size_bytes
    last_write = 0.0

    def on_progress(progress):
        nonlocal last_write
        now = time.monotonic()
        if now - last_write < settings.PROGRESS_INTERVAL_SECONDS:
            return
        last_write = now
        Job.objects.filter(pk=job.pk).update(
            progress=progress.percent,
            fps=progress.fps,
            speed=progress.speed,
            eta_seconds=progress.eta_seconds,
        )

    def should_cancel() -> bool:
        state = Job.objects.filter(pk=job.pk).values_list("state", flat=True).first()
        return state in {JobState.CANCELLING, JobState.CANCELLED}

    def record_command(command):
        Job.objects.filter(pk=job.pk).update(command=" ".join(command))

    ctx.progress_callback = on_progress
    ctx.cancel_callback = should_cancel
    ctx.command_callback = record_command

    from . import ffmpeg  # imported here to keep the module import graph flat

    try:
        result = engine.run(flow.graph, ctx)
    except ffmpeg.Cancelled:
        _flush(job, ctx)
        _finish_job(job, JobState.CANCELLED, log="Cancelled by operator")
        MediaFile.objects.filter(pk=media_file.pk).update(status=FileStatus.SKIPPED)
        return {"cancelled": True}
    except Exception as exc:
        _flush(job, ctx)
        MediaFile.objects.filter(pk=media_file.pk).update(
            status=FileStatus.ERROR, last_error=str(exc)[:2000]
        )
        _fail_job(job, str(exc))
        raise

    _flush(job, ctx)

    final = Path(ctx.working_path)
    updates = {
        "verdict_reason": result.reason,
        "last_error": "",
    }
    if ctx.changed and final.exists():
        original = media_file.original_size_bytes or media_file.size_bytes
        library_root = Path(media_file.library.path)
        try:
            rel = str(final.relative_to(library_root))
        except ValueError:
            rel = final.name  # a Move node took it outside the library
        updates |= {
            "path": str(final),
            "rel_path": rel,
            "size_bytes": final.stat().st_size,
            "original_size_bytes": original,
            "container": final.suffix.lstrip("."),
            "status": FileStatus.TRANSCODED,
            "verdict": Verdict.MEETS_TARGET,
        }
    elif result.failed:
        updates |= {"status": FileStatus.ERROR, "verdict": Verdict.UNREADABLE}
    else:
        updates |= {"status": FileStatus.READY, "verdict": Verdict.MEETS_TARGET}

    MediaFile.objects.filter(pk=media_file.pk).update(**updates)
    if worker and not result.failed:
        Job.objects.filter(pk=job.pk).update(worker=worker)

    size_after = updates.get("size_bytes", 0)
    if result.failed:
        job.error = result.reason[:4000]
    _finish_job(
        job,
        JobState.FAILED if result.failed else JobState.SUCCEEDED,
        progress=100.0,
        size_after=size_after,
    )

    return {
        "nodes_visited": len(result.trace),
        "changed": ctx.changed,
        "saved_bytes": max(ctx.size_before - size_after, 0) if size_after else 0,
    }


def _flush(job: Job, ctx: engine.FlowContext) -> None:
    """Move the flow's messages and trace onto the instance.

    Nothing is written here — whichever `_finish_job` or `_fail_job` call comes
    next persists them in one UPDATE.
    """
    for message in ctx.messages:
        job.append_log(message)
    ctx.messages.clear()
    job.trace = ctx.trace
