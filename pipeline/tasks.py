"""Background work, defined with Django 6's built-in Tasks framework.

Every task takes plain integers: arguments make a round trip through
json.dumps/json.loads before the worker sees them, so model instances and
datetimes are not allowed.

Queues (declared in settings.TASKS["default"]["QUEUES"]):
    scan       directory walks — cheap, IO bound
    probe      ffprobe calls — seconds each
    transcode  ffmpeg runs — minutes to hours each

Run a worker per queue so a four-hour 4K encode never blocks a scan:

    ./manage.py db_worker --queue-name scan,probe
    ./manage.py db_worker --queue-name transcode
"""

from __future__ import annotations

import logging
import os
import shutil
import time
from datetime import datetime, timedelta, timezone as dt_timezone
from pathlib import Path

from django.conf import settings
from django.db import transaction
from django.tasks import task
from django.utils import timezone
from pipeline import rules
import ffmpeg
from .models import (
    FileStatus,
    Job,
    JobKind,
    JobState,
    Library,
    MediaFile,
    Verdict,
    Worker,
)

logger = logging.getLogger(__name__)


# --------------------------------------------------------------------------
# Scanning
# --------------------------------------------------------------------------
@task(queue_name="scan", takes_context=True)
def scan_library(context, library_id: int) -> dict:
    """Walk a library folder, reconcile it with the database, queue probes."""
    library = Library.objects.select_related("profile").get(pk=library_id)
    job = _open_job(context, kind=JobKind.SCAN, library=library)
    Library.objects.filter(pk=library.pk).update(
        last_scan_started_at=timezone.now(), last_scan_finished_at=None
    )

    root = Path(library.path)
    if not root.is_dir():
        _fail_job(job, f"{library.path} is not a readable directory")
        Library.objects.filter(pk=library.pk).update(
            last_scan_finished_at=timezone.now()
        )
        return {"error": "path_unreadable"}

    wanted = library.extension_set
    seen: set[str] = set()
    added = updated = 0

    files = root.glob("**/*")

    for file in files:

            seen.add(str(file))
            stat = file.stat()

            mtime = datetime.fromtimestamp(stat.st_mtime, tz=dt_timezone.utc)
            media_file, created = MediaFile.objects.get_or_create(
                path=str(file),
                defaults={
                    "library": library,
                    "rel_path": str(file.relative_to(root)),
                    "size_bytes": stat.st_size,
                    "original_size_bytes": stat.st_size,
                    "mtime": mtime,
                },
            )
            if created:
                added += 1
                probe_file.enqueue(media_file.pk)
                continue

            # Re-probe anything that changed on disk since we last looked.
            changed = media_file.size_bytes != stat.st_size or media_file.mtime != mtime
            if changed and not media_file.is_busy:
                MediaFile.objects.filter(pk=media_file.pk).update(
                    size_bytes=stat.st_size,
                    mtime=mtime,
                    status=FileStatus.NEW,
                    verdict=Verdict.UNKNOWN,
                )
                updated += 1
                probe_file.enqueue(media_file.pk)

    # Anything not seen this pass *might* be gone — but a worker may have just
    # renamed it (mp4 -> mkv) while we were walking. Confirm against the disk
    # and never touch a file that is mid-flight.
    removed = 0
    stale = (
        MediaFile.objects.filter(library=library)
        .exclude(path__in=seen)
        .exclude(
            status__in=[FileStatus.PROBING, FileStatus.QUEUED, FileStatus.TRANSCODING]
        )
    )
    for candidate in stale.iterator(chunk_size=200):
        if not Path(candidate.path).exists():
            MediaFile.objects.filter(pk=candidate.pk).update(status=FileStatus.MISSING)
            removed += 1

    Library.objects.filter(pk=library.pk).update(last_scan_finished_at=timezone.now())
    summary = {
        "added": added,
        "updated": updated,
        "missing": removed,
        "total": len(seen),
    }
    job.append_log(
        f"Scan finished: {len(seen)} files on disk, {added} new, "
        f"{updated} changed, {removed} missing"
    )
    _finish_job(job, JobState.SUCCEEDED, progress=100.0)
    return summary


@task(queue_name="scan")
def scan_due_libraries() -> int:
    """Enqueue scans for every library past its interval. Call from cron."""
    count = 0
    for library in Library.objects.filter(enabled=True):
        if library.is_scan_due and not library.is_scanning:
            scan_library.enqueue(library.pk)
            count += 1
    return count


# --------------------------------------------------------------------------
# Probing
# --------------------------------------------------------------------------
@task(queue_name="probe", takes_context=True)
def probe_file(context, media_file_id: int) -> str:
    """Read metadata with ffprobe, apply the library's rules, record a verdict."""
    media_file = MediaFile.objects.select_related("library__profile").get(
        pk=media_file_id
    )
    job = _open_job(context, kind=JobKind.PROBE, media_file=media_file)

    MediaFile.objects.filter(pk=media_file.pk).update(status=FileStatus.PROBING)

    try:
        data = ffmpeg.probe(media_file.path)
        video = next((s for s in data['streams'] if s.get("codec_type") == "video"))
        audio = list((s for s in data['streams'] if s.get("codec_type") == "audio"))

        meta = {
            "format": data.pop("format"),
            "audio": audio,
            "video": video,

            "cv": video["codec_name"],
            "ca": audio[0]["codec_name"] if audio else "",
            "height": video["height"] if video.get("height") else "",
            "width": video["width"] if video.get("width") else "",
            "duration": video["duration"] if video.get("duration") else "",
            "bitrate": video["bit_rate"] if video.get("bit_rate") else "",
            "size": video["size"] if video.get("size") else "",
        }
    except ffmpeg.Error as exc:
        MediaFile.objects.filter(pk=media_file.pk).update(
            status=FileStatus.ERROR, verdict=Verdict.UNREADABLE, last_error=str(exc)
        )
        _fail_job(job, str(exc))
        return "unreadable"

    media_file.meta.update(probe=meta)
    media_file.last_probed_at = timezone.now()
    media_file.last_error = ""

    # A flow, if the library has one, otherwise the profile rules.
    flow = media_file.library.flow
    if flow and flow.enabled:
        needs_work, reason, trace = _evaluate_flow(media_file, flow, job)
    else:
        decision = rules.evaluate(media_file, media_file.library.profile)
        needs_work, reason, trace = decision.needs_transcode, decision.reason, []

    media_file.verdict = Verdict.NEEDS_TRANSCODE if needs_work else Verdict.MEETS_TARGET
    media_file.verdict_reason = reason
    media_file.status = FileStatus.QUEUED if needs_work else FileStatus.READY
    media_file.save()

    if trace:
        job.trace, job.flow = trace, flow
    job.append_log(
        f"{media_file.video_codec or '?'} · {media_file.resolution_label} · {reason}"
    )
    _finish_job(job, JobState.SUCCEEDED, progress=100.0)

    if not needs_work:
        return media_file.verdict
    if not media_file.library.auto_queue:
        MediaFile.objects.filter(pk=media_file.pk).update(status=FileStatus.SKIPPED)
        return media_file.verdict

    if flow and flow.enabled:
        from .flow_tasks import queue_flow

        queue_flow(media_file.pk)
    else:
        queue_transcode(media_file.pk)

    return media_file.verdict


def _evaluate_flow(media_file, flow, job) -> tuple[bool, str, list]:
    """Dry-run the flow so probing can answer "does this need work?" cheaply."""
    from .flow_tasks import evaluate_flow

    try:
        result = evaluate_flow(media_file, flow)
    except Exception as exc:
        job.append_log(f"Flow could not be evaluated: {exc}")
        return False, f"Flow error: {exc}", []
    for message in result.ctx.messages:
        job.append_log(message)
    return result.needs_work, result.reason, result.trace


# --------------------------------------------------------------------------
# Transcoding
# --------------------------------------------------------------------------
def queue_transcode(media_file_id: int, priority: int = 0) -> Job:
    """Create the Job row, then hand it to the Tasks backend.

    The row exists before the task is enqueued so the queue page can show the
    work immediately, even if every worker is busy.
    """
    media_file = MediaFile.objects.get(pk=media_file_id)
    existing = media_file.jobs.filter(kind=JobKind.TRANSCODE).active().first()
    if existing:
        return existing

    job = Job.objects.create(
        media_file=media_file,
        library_id=media_file.library_id,
        kind=JobKind.TRANSCODE,
        state=JobState.QUEUED,
        priority=priority,
        size_before=media_file.size_bytes,
    )
    MediaFile.objects.filter(pk=media_file.pk).update(status=FileStatus.QUEUED)
    transaction.on_commit(
        lambda: run_transcode.using(priority=priority).enqueue(job.pk)
    )
    return job


@task(queue_name="transcode", takes_context=True)
def run_transcode(context, job_id: int) -> dict:
    """Encode one file to the cache directory, then swap it into place."""
    job = Job.objects.select_related("media_file__library__profile").get(pk=job_id)
    media_file = job.media_file
    profile = media_file.library.profile
    worker = _register_worker(context)

    if job.state == JobState.CANCELLED:
        return {"skipped": "cancelled before start"}

    source = Path(media_file.path)
    if not source.exists():
        MediaFile.objects.filter(pk=media_file.pk).update(status=FileStatus.MISSING)
        _fail_job(job, "Source file is gone")
        return {"error": "missing"}

    cache_dir = Path(settings.TRANSCODE_CACHE_DIR)
    cache_dir.mkdir(parents=True, exist_ok=True)
    destination = cache_dir / f"job{job.pk}-{source.stem[:80]}.{profile.container}"

    try:
        probe_data = ffmpeg.probe(source)
    except ffmpeg.ProbeError as exc:
        _fail_job(job, str(exc))
        return {"error": "probe_failed"}

    command = ffmpeg.build_command(profile, source, destination, probe_data)

    Job.objects.filter(pk=job.pk).update(
        state=JobState.RUNNING,
        started_at=timezone.now(),
        worker=worker,
        attempt=context.attempt,
        task_result_id=context.task_result.id,
        command=" ".join(command),
        size_before=media_file.size_bytes,
        progress=0.0,
    )
    MediaFile.objects.filter(pk=media_file.pk).update(status=FileStatus.TRANSCODING)

    last_write = 0.0

    def on_progress(progress: ffmpeg.Progress) -> None:
        """Throttled write-back — the UI polls this row every two seconds."""
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

    try:
        result = ffmpeg.run(
            command,
            duration_seconds=probe_data.duration_seconds,
            on_progress=on_progress,
            should_cancel=should_cancel,
        )
    except ffmpeg.Cancelled:
        destination.unlink(missing_ok=True)
        _finish_job(job, JobState.CANCELLED, log="Cancelled by operator")
        MediaFile.objects.filter(pk=media_file.pk).update(status=FileStatus.SKIPPED)
        return {"cancelled": True}
    except ffmpeg.TranscodeError as exc:
        destination.unlink(missing_ok=True)
        MediaFile.objects.filter(pk=media_file.pk).update(
            status=FileStatus.ERROR, last_error=str(exc)[:2000]
        )
        _fail_job(job, str(exc))
        raise  # let the Tasks backend record the failure and apply its retry policy

    new_size = destination.stat().st_size
    ratio = new_size / max(media_file.size_bytes, 1)
    if ratio > settings.MAX_OUTPUT_SIZE_RATIO:
        destination.unlink(missing_ok=True)
        job.append_log(
            f"Output was {ratio:.0%} of the original — keeping the source file untouched."
        )
        MediaFile.objects.filter(pk=media_file.pk).update(
            status=FileStatus.SKIPPED,
            verdict=Verdict.MEETS_TARGET,
            verdict_reason="Re-encode produced a larger file",
        )
        _finish_job(
            job, JobState.SUCCEEDED, progress=100.0, size_after=media_file.size_bytes
        )
        return {"kept_original": True, "ratio": round(ratio, 3)}

    final_path = source.with_suffix(f".{profile.container}")
    shutil.move(str(destination), str(final_path))
    if final_path != source:
        source.unlink(missing_ok=True)

    original = media_file.original_size_bytes or media_file.size_bytes
    MediaFile.objects.filter(pk=media_file.pk).update(
        path=str(final_path),
        rel_path=str(final_path.relative_to(Path(media_file.library.path))),
        size_bytes=new_size,
        original_size_bytes=original,
        status=FileStatus.TRANSCODED,
        verdict=Verdict.MEETS_TARGET,
        verdict_reason=f"Transcoded to {profile.video_codec}",
        container=profile.container,
        video_codec=profile.video_codec,
        last_error="",
    )
    if worker:
        Worker.objects.filter(pk=worker.pk).update(
            jobs_completed=worker.jobs_completed + 1
        )

    saved = media_file.size_bytes - new_size
    job.append_log(
        f"Done. {_human(media_file.size_bytes)} → {_human(new_size)} ({_human(saved)} saved)"
    )
    for line in result.log_tail[-5:]:
        job.append_log(line)
    _finish_job(job, JobState.SUCCEEDED, progress=100.0, size_after=new_size)
    return {"saved_bytes": saved, "size_after": new_size}


@task(queue_name="default")
def requeue_stale_jobs(older_than_minutes: int = 60) -> int:
    """Rescue jobs whose worker died mid-encode."""
    cutoff = timezone.now() - timedelta(minutes=older_than_minutes)
    stale = Job.objects.filter(state=JobState.RUNNING, started_at__lt=cutoff)
    count = 0
    for job in stale:
        job.state = JobState.QUEUED
        job.progress = 0
        job.append_log("Worker went away — requeued")
        job.save(update_fields=["state", "progress", "log"])
        run_transcode.enqueue(job.pk)
        count += 1
    return count


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------
def _open_job(context, *, kind, media_file=None, library=None) -> Job:
    """Reuse the queued Job row if one exists, otherwise create it."""
    lookup = {"kind": kind}
    if media_file is not None:
        lookup["media_file"] = media_file
        lookup["library_id"] = media_file.library_id
    if library is not None:
        lookup["library"] = library

    job = (
        Job.objects.filter(state=JobState.QUEUED, **lookup)
        .order_by("created_at")
        .first()
    )
    if job is None:
        job = Job.objects.create(**lookup)

    job.state = JobState.RUNNING
    job.started_at = timezone.now()
    job.worker = _register_worker(context)
    job.attempt = context.attempt
    job.task_result_id = context.task_result.id
    job.save(
        update_fields=["state", "started_at", "worker", "attempt", "task_result_id"]
    )
    return job


def _finish_job(
        job: Job, state, *, progress: float | None = None, size_after=None, log=None
) -> None:
    """Close a job with a targeted UPDATE.

    Workers write progress, worker and command with `.update()` while the job
    runs, so the in-memory instance is stale by the time we get here. Calling
    `job.save()` would quietly revert those columns — hence the explicit field
    list, which touches only what finishing actually changes.
    """
    if log:
        job.append_log(log)
    updates = {"state": state, "finished_at": timezone.now(), "log": job.log}
    if progress is not None:
        updates["progress"] = progress
    if size_after is not None:
        updates["size_after"] = size_after
    if job.trace:
        updates["trace"] = job.trace
    if job.error:
        updates["error"] = job.error
    if job.flow_id:
        updates["flow_id"] = job.flow_id
    Job.objects.filter(pk=job.pk).update(**updates)


def _fail_job(job: Job, error: str) -> None:
    job.error = error[:4000]
    job.append_log(f"Failed: {error[:300]}")
    _finish_job(job, JobState.FAILED)


def _register_worker(context) -> Worker | None:
    """Upsert a Worker row from the ids django.tasks attaches to the result."""
    worker_ids = getattr(context.task_result, "worker_ids", None) or []
    name = worker_ids[-1] if worker_ids else os.environ.get("WORKER_NAME", "local")
    worker, _ = Worker.objects.get_or_create(
        name=str(name)[:120], defaults={"hostname": os.uname().nodename}
    )
    Worker.objects.filter(pk=worker.pk).update(last_heartbeat=timezone.now())
    return worker


def _human(num: int) -> str:
    value = float(num)
    for unit in ("B", "KB", "MB", "GB"):
        if abs(value) < 1024:
            return f"{value:.1f} {unit}"
        value /= 1024
    return f"{value:.1f} TB"
