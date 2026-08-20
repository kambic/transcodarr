"""Job orchestration.

The rule that shapes this module: **ffmpeg never writes to a share.** Sources
may live on a read-only SMB mount; outputs always land under ``MEDIA_ROOT`` in
storage this app controls, and are filed into a writable folder in the tree.
"""

from __future__ import annotations

import os
import shutil
import tempfile
from pathlib import Path

from django.conf import settings
from django.db import IntegrityError, transaction
from django.utils import timezone

from explorer.models import Node, Operation, OperationItem

from . import ffmpeg
from .models import MediaProbe, Preset, TranscodeJob


class TranscodeError(Exception):
    pass


def media_extensions() -> set[str]:
    return {ext.lower() for ext in settings.TRANSCODE["MEDIA_EXTENSIONS"]}


def is_media(node: Node) -> bool:
    return not node.is_folder and node.extension in media_extensions()


def source_path(node: Node) -> str:
    """Where the bytes actually are, share or local upload."""
    if node.scan_root_id and node.rel_path:
        return node.source_path
    if node.upload:
        return node.upload.path
    raise TranscodeError(f"{node.name} has no file on disk to read.")


def output_folder(node: Node) -> Node:
    """Pick a writable folder for the result.

    Anything catalogued from a read-only share sends its output to a managed
    folder rather than next to the source. Two reasons: ffmpeg must not write to
    the share, and the mirrored folders should keep matching what's actually on
    the server — an output filed into a mirror would show a file that isn't
    there.
    """
    from_locked_share = node.scan_root_id and node.scan_root.read_only
    parent = node.parent
    parent_locked = parent and parent.scan_root_id and parent.scan_root.read_only

    if parent and not from_locked_share and not parent_locked:
        return parent

    drive = Node.objects.filter(parent__isnull=True, kind=Node.Kind.FOLDER).order_by("created_at").first()
    if drive is None:
        drive = Node.objects.create(name="My Drive", kind=Node.Kind.FOLDER)
    folder, _ = Node.objects.get_or_create(
        parent=drive,
        name=settings.TRANSCODE["OUTPUT_FOLDER_NAME"],
        defaults={"kind": Node.Kind.FOLDER},
    )
    return folder


# --------------------------------------------------------------------------- #
#  Queueing
# --------------------------------------------------------------------------- #
def expand(nodes) -> list[Node]:
    """Folders contribute the media files inside them."""
    found: dict[str, Node] = {}
    for node in nodes:
        if node.is_folder:
            for child in node.descendants().alive().files():
                if is_media(child):
                    found[str(child.pk)] = child
        elif is_media(node):
            found[str(node.pk)] = node
    return list(found.values())


def queue(*, nodes, preset: Preset, actor=None) -> dict:
    """Create jobs for every eligible node. Returns a small report."""
    candidates = expand(nodes)
    report = {"queued": [], "duplicate": 0, "skipped": len(nodes) - len(candidates)}

    for node in candidates:
        try:
            with transaction.atomic():
                job = TranscodeJob.objects.create(
                    source=node,
                    preset=preset,
                    destination=output_folder(node),
                    source_bytes=node.size,
                    requested_by=actor if actor and actor.is_authenticated else None,
                )
        except IntegrityError:
            report["duplicate"] += 1  # already queued or running with this preset
            continue
        report["queued"].append(job)
    return report


def cancel(job: TranscodeJob) -> None:
    if not job.is_active:
        return
    if job.status == TranscodeJob.Status.QUEUED:
        job.mark(TranscodeJob.Status.CANCELLED, error="Cancelled before it started.")
    else:
        TranscodeJob.objects.filter(pk=job.pk).update(cancel_requested=True)


def retry(job: TranscodeJob) -> TranscodeJob:
    if job.is_active:
        return job
    TranscodeJob.objects.filter(pk=job.pk).update(
        status=TranscodeJob.Status.QUEUED, progress=0, error="", log="",
        cancel_requested=False, started_at=None, finished_at=None,
    )
    job.refresh_from_db()
    return job


# --------------------------------------------------------------------------- #
#  Probing
# --------------------------------------------------------------------------- #
def probe_node(node: Node) -> MediaProbe:
    record, _ = MediaProbe.objects.get_or_create(node=node)
    try:
        result = ffmpeg.probe(source_path(node))
    except (ffmpeg.TranscodeFailed, ffmpeg.FFmpegUnavailable, TranscodeError) as exc:
        record.error = str(exc)[:250]
        record.save()
        return record

    record.duration_seconds = result.duration
    record.container = result.container
    record.video_codec = result.video_codec
    record.audio_codec = result.audio_codec
    record.width = result.width
    record.height = result.height
    record.fps = result.fps
    record.bitrate = result.bitrate
    record.error = ""
    record.save()
    return record


# --------------------------------------------------------------------------- #
#  Running
# --------------------------------------------------------------------------- #
def claim(job_id: str) -> TranscodeJob | None:
    """Move a job from queued to running, atomically.

    The UPDATE returning 0 rows means someone else got there first — two
    workers picking up the same task is otherwise a real possibility.
    """
    claimed = TranscodeJob.objects.filter(
        pk=job_id, status=TranscodeJob.Status.QUEUED
    ).update(status=TranscodeJob.Status.RUNNING, started_at=timezone.now(), progress=0)
    if not claimed:
        return None
    job = TranscodeJob.objects.select_related("source", "preset", "destination").get(pk=job_id)
    TranscodeJob.objects.filter(pk=job.pk).update(attempts=job.attempts + 1)
    return job


def run(job: TranscodeJob) -> TranscodeJob:
    """Do the conversion. Assumes the job has already been claimed."""
    conf = settings.TRANSCODE
    workspace = Path(conf["WORK_DIR"])
    workspace.mkdir(parents=True, exist_ok=True)

    try:
        src = source_path(job.source)
        if not os.path.exists(src):
            raise TranscodeError(f"{job.source.name} is not readable — is the share mounted?")

        probe = probe_node(job.source)
        if probe.error:
            raise TranscodeError(probe.error)

        filename = job.preset.output_name(job.source.name)
        temp_dir = tempfile.mkdtemp(prefix=f"job-{job.pk.hex[:8]}-", dir=workspace)
        temp_out = os.path.join(temp_dir, filename)

        args = ffmpeg.build_args(job.preset, src, temp_out)
        TranscodeJob.objects.filter(pk=job.pk).update(
            command=" ".join(args), duration_seconds=probe.duration_seconds
        )

        def on_progress(percent: float) -> None:
            TranscodeJob.objects.filter(pk=job.pk).update(progress=percent)

        def should_cancel() -> bool:
            return TranscodeJob.objects.filter(pk=job.pk, cancel_requested=True).exists()

        try:
            result = ffmpeg.run(
                args,
                duration=probe.duration_seconds,
                on_progress=on_progress,
                should_cancel=should_cancel,
                timeout=conf["MAX_JOB_SECONDS"],
            )
            final = file_output(job, temp_out, filename)
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    except ffmpeg.TranscodeCancelled:
        job.refresh_from_db()
        job.mark(TranscodeJob.Status.CANCELLED, error="Cancelled.", progress=0)
        return job
    except (ffmpeg.TranscodeFailed, ffmpeg.FFmpegUnavailable, TranscodeError) as exc:
        job.refresh_from_db()
        job.mark(
            TranscodeJob.Status.FAILED,
            error=str(exc)[:2000],
            log=getattr(exc, "log", "")[:4000],
        )
        return job
    except Exception as exc:  # noqa: BLE001 — recorded on the job, not swallowed
        job.refresh_from_db()
        job.mark(TranscodeJob.Status.FAILED, error=f"{type(exc).__name__}: {exc}"[:2000])
        return job

    job.refresh_from_db()
    job.output = final
    job.mark(
        TranscodeJob.Status.DONE,
        progress=100,
        output=final,
        output_bytes=final.size,
        elapsed_seconds=round(result.seconds, 1),
        log=result.log[:4000],
        error="",
    )
    return job


def file_output(job: TranscodeJob, temp_path: str, filename: str) -> Node:
    """Move the finished file into MEDIA_ROOT and catalogue it."""
    from explorer.services import unique_name

    relative = Path(settings.TRANSCODE["OUTPUT_SUBDIR"]) / str(job.pk)
    target_dir = Path(settings.MEDIA_ROOT) / relative
    target_dir.mkdir(parents=True, exist_ok=True)
    final_path = target_dir / filename
    shutil.move(temp_path, final_path)  # same filesystem: a rename, not a copy

    destination = job.destination or output_folder(job.source)
    with transaction.atomic():
        node = Node(
            parent=destination,
            name=unique_name(destination, filename),
            kind=Node.Kind.FILE,
            size=final_path.stat().st_size,
            owner=job.requested_by,
        )
        node.upload.name = str(relative / filename)
        node.save()

        operation = Operation.objects.create(
            kind=Operation.Kind.TRANSCODE,
            actor=job.requested_by,
            source=job.source.parent,
            target=destination,
            reversible=False,
            detail={
                "preset": job.preset.slug,
                "source": job.source.name,
                "source_bytes": job.source_bytes,
                "output_bytes": node.size,
            },
        )
        OperationItem.objects.create(
            operation=operation, node=node, label=node.name, size=node.size,
            before={"source": job.source.name, "preset": job.preset.label},
            after=node.snapshot(),
        )
        operation.finish()
        TranscodeJob.objects.filter(pk=job.pk).update(operation=operation)

    return node


def sweep_stuck(minutes: int = 180) -> int:
    """Fail jobs left RUNNING by a worker that died."""
    cutoff = timezone.now() - timezone.timedelta(minutes=minutes)
    stuck = TranscodeJob.objects.filter(status=TranscodeJob.Status.RUNNING, started_at__lt=cutoff)
    return stuck.update(
        status=TranscodeJob.Status.FAILED,
        error="No progress reported; the worker probably died. Retry when ready.",
        finished_at=timezone.now(),
    )
