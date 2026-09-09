"""Views.

Every page has a matching partial that htmx polls or swaps. Partials live
inside their page template and are addressed with the `template.html#name`
syntax Django 6 added, so a fragment never drifts from the page it belongs to.
"""

from __future__ import annotations

from django.contrib import messages
from django.core.paginator import Paginator
from django.db.models import Avg, Count, F, Q, Sum
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST

from .forms import LibraryForm, ProfileForm
from .models import (
    Job,
    JobKind,
    JobState,
    TranscodeProfile,
    Worker,
)
from files.models import Library, FileStatus, Verdict, MediaFile
from .tasks import probe_file, queue_transcode, run_transcode, scan_library


# --------------------------------------------------------------------------
# Dashboard
# --------------------------------------------------------------------------
def dashboard(request):
    return render(request, "pages/dashboard.html", _dashboard_context())


def dashboard_stats(request):
    """Polled every 5s by the cards at the top of the dashboard."""
    return render(request, "pages/dashboard.html#stats", _dashboard_context())


def dashboard_activity(request):
    return render(request, "pages/dashboard.html#activity", _dashboard_context())


def _dashboard_context() -> dict:
    files = MediaFile.objects.exclude(status=FileStatus.MISSING)
    counts = files.aggregate(
        total=Count("id"),
        needs_work=Count("id", filter=Q(verdict=Verdict.NEEDS_TRANSCODE)),
        meets_target=Count("id", filter=Q(verdict=Verdict.MEETS_TARGET)),
        errored=Count("id", filter=Q(status=FileStatus.ERROR)),
        total_size=Sum("size_bytes"),
    )
    codec_rows = (
        files.values("video_codec")
        .annotate(count=Count("id"), size=Sum("size_bytes"))
        .order_by("-count")[:6]
    )
    codec_total = sum(row["count"] for row in codec_rows) or 1
    codecs = [
        {**row, "share": round(row["count"] / codec_total * 100, 1)}
        for row in codec_rows
    ]

    return {
        "counts": counts,
        "saved_bytes": MediaFile.objects.savings(),
        "codecs": codecs,
        "active_jobs": _active_jobs(),
        "recent_jobs": (
            Job.objects.finished()
            .select_related("media_file", "library")
            .order_by("-finished_at")[:8]
        ),
        "queued_count": Job.objects.filter(state=JobState.QUEUED).count(),
        "workers": Worker.objects.all(),
        "libraries": Library.objects.select_related("profile").all(),
        "avg_saving": (
            MediaFile.objects.filter(original_size_bytes__gt=F("size_bytes")).aggregate(
                pct=Avg(
                    (F("original_size_bytes") - F("size_bytes"))
                    * 100.0
                    / F("original_size_bytes")
                )
            )["pct"]
        ),
    }


def _active_jobs():
    return (
        Job.objects.active()
        .select_related("media_file", "library", "worker")
        .order_by("state", "-priority", "created_at")[:25]
    )


# --------------------------------------------------------------------------
# Queue
# --------------------------------------------------------------------------
def queue(request):
    return render(request, "pages/queue.html", _queue_context())


def queue_table(request):
    """The polling target. Returns just the tbody, swapped via outerHTML."""
    return render(request, "pages/queue.html#queue-table", _queue_context())


def _queue_context() -> dict:
    return {
        "jobs": _active_jobs(),
        "recent": (
            Job.objects.finished()
            .select_related("media_file", "worker")
            .order_by("-finished_at")[:20]
        ),
        "now": timezone.now(),
    }


def job_detail(request, pk: int):
    job = get_object_or_404(Job.objects.select_related("media_file", "worker"), pk=pk)
    template = (
        "pages/job_detail.html#job-body" if request.htmx else "pages/job_detail.html"
    )
    return render(request, template, {"job": job})


@require_POST
def job_cancel(request, pk: int):
    job = get_object_or_404(Job, pk=pk)
    if job.state == JobState.RUNNING:
        # The worker polls this column between progress blocks and stops ffmpeg.
        Job.objects.filter(pk=job.pk).update(state=JobState.CANCELLING)
    elif job.state == JobState.QUEUED:
        Job.objects.filter(pk=job.pk).update(
            state=JobState.CANCELLED, finished_at=timezone.now()
        )
        MediaFile.objects.filter(pk=job.media_file_id).update(status=FileStatus.SKIPPED)
    return _queue_response(request, "Cancelling the job.")


@require_POST
def job_retry(request, pk: int):
    job = get_object_or_404(Job, pk=pk)
    Job.objects.filter(pk=job.pk).update(
        state=JobState.QUEUED, progress=0, error="", finished_at=None, started_at=None
    )
    if job.kind == JobKind.TRANSCODE:
        run_transcode.enqueue(job.pk)
    elif job.kind == JobKind.PROBE and job.media_file_id:
        probe_file.enqueue(job.media_file_id)
    elif job.library_id:
        scan_library.enqueue(job.library_id)
    return _queue_response(request, "Job requeued.")


@require_POST
def job_bump(request, pk: int):
    """Push a job to the front of the queue."""
    job = get_object_or_404(Job, pk=pk)
    top = (
        Job.objects.active()
        .order_by("-priority")
        .values_list("priority", flat=True)
        .first()
        or 0
    )
    Job.objects.filter(pk=job.pk).update(priority=min(top + 1, 100))
    return _queue_response(request, "Moved to the front of the queue.")


def _queue_response(request, note: str) -> HttpResponse:
    if request.htmx:
        return render(request, "pages/queue.html#queue-table", _queue_context())
    messages.success(request, note)
    return redirect("pipeline:queue")


# --------------------------------------------------------------------------
# Libraries
# --------------------------------------------------------------------------
def library_list(request):
    return render(request, "pages/libraries.html", {"libraries": _libraries()})


def _libraries():
    return (
        Library.objects.select_related("profile")
        .annotate(
            file_count=Count("files", distinct=True),
            pending=Count(
                "files", filter=Q(files__verdict=Verdict.NEEDS_TRANSCODE), distinct=True
            ),
            size=Sum("files__size_bytes"),
        )
        .order_by("name")
    )


def library_detail(request, pk: int):
    library = get_object_or_404(Library.objects.select_related("profile"), pk=pk)
    files = library.files.exclude(status=FileStatus.MISSING).order_by("rel_path")
    return render(
        request,
        "pages/library_detail.html",
        {
            "library": library,
            "page_obj": Paginator(files, 50).get_page(request.GET.get("page")),
            "breakdown": library.files.values("verdict").annotate(count=Count("id")),
        },
    )


def library_form(request, pk: int | None = None):
    """Serves the modal body, and handles its POST. Same URL, both directions."""
    library = get_object_or_404(Library, pk=pk) if pk else None
    if request.method == "POST":
        form = LibraryForm(request.POST, instance=library)
        if form.is_valid():
            saved = form.save()
            if not pk:
                scan_library.enqueue(saved.pk)
            response = render(
                request,
                "pages/libraries.html#library-grid",
                {"libraries": _libraries()},
            )
            # Tells the base template to close the modal and raise a toast.
            response["HX-Trigger"] = (
                '{"closeModal": true, "toast": {"message": "Library saved. Scanning now."}}'
            )
            return response
        return render(
            request,
            "partials/library_form.html",
            {"form": form, "library": library},
            status=422,
        )

    form = LibraryForm(instance=library)
    return render(
        request, "partials/library_form.html", {"form": form, "library": library}
    )


@require_POST
def library_scan(request, pk: int):
    library = get_object_or_404(Library, pk=pk)
    scan_library.enqueue(library.pk)
    Library.objects.filter(pk=library.pk).update(
        last_scan_started_at=timezone.now(), last_scan_finished_at=None
    )
    if request.htmx:
        return render(
            request, "pages/libraries.html#library-grid", {"libraries": _libraries()}
        )
    messages.success(request, f"Scanning {library.name}.")
    return redirect("pipeline:library_list")


@require_POST
def library_queue_all(request, pk: int):
    """Queue every file in this library that fails its profile check."""
    library = get_object_or_404(Library, pk=pk)
    pending = library.files.needs_work().exclude(status=FileStatus.TRANSCODING)
    count = 0
    for media_file in pending.iterator(chunk_size=200):
        queue_transcode(media_file.pk)
        count += 1
    messages.success(request, f"Queued {count} files from {library.name}.")
    return redirect("pipeline:library_detail", pk=library.pk)


@require_POST
def library_delete(request, pk: int):
    library = get_object_or_404(Library, pk=pk)
    library.delete()
    if request.htmx:
        return render(
            request, "pages/libraries.html#library-grid", {"libraries": _libraries()}
        )
    return redirect("pipeline:library_list")


def library_row_status(request, pk: int):
    """Polled while a scan is running so the card can show live counts."""
    library = get_object_or_404(_libraries(), pk=pk)
    return render(request, "pages/libraries.html#library-card", {"library": library})


# --------------------------------------------------------------------------
# Files
# --------------------------------------------------------------------------
def file_list(request):
    context = _file_context(request)
    template = "pages/files.html#file-results" if request.htmx else "pages/files.html"
    return render(request, template, context)


def _file_context(request) -> dict:
    files = MediaFile.objects.select_related("library").exclude(
        status=FileStatus.MISSING
    )

    query = request.GET.get("q", "").strip()
    verdict = request.GET.get("verdict", "")
    library_id = request.GET.get("library", "")
    codec = request.GET.get("codec", "")

    if query:
        files = files.filter(rel_path__icontains=query)
    if verdict:
        files = files.filter(verdict=verdict)
    if library_id:
        files = files.filter(library_id=library_id)
    if codec:
        files = files.filter(video_codec=codec)

    sort = request.GET.get("sort", "rel_path")
    allowed = {
        "rel_path",
        "-size_bytes",
        "size_bytes",
        "-updated_at",
        "video_codec",
        "-height",
    }
    files = files.order_by(sort if sort in allowed else "rel_path")

    params = request.GET.copy()
    params.pop("page", None)

    return {
        "page_obj": Paginator(files, 40).get_page(request.GET.get("page")),
        "libraries": Library.objects.all(),
        "verdicts": Verdict.choices,
        "codec_options": (
            MediaFile.objects.exclude(video_codec="")
            .values_list("video_codec", flat=True)
            .distinct()
            .order_by("video_codec")
        ),
        "filters": {
            "q": query,
            "verdict": verdict,
            "library": library_id,
            "codec": codec,
            "sort": sort,
        },
        "querystring": params.urlencode(),
        "result_count": files.count(),
    }


def file_detail(request, pk: int):
    media_file = get_object_or_404(
        MediaFile.objects.select_related("library__profile"), pk=pk
    )
    context = {"file": media_file, "jobs": media_file.jobs.order_by("-created_at")[:10]}
    template = (
        "pages/file_detail.html#file-body" if request.htmx else "pages/file_detail.html"
    )
    return render(request, template, context)


@require_POST
def file_probe(request, pk: int):
    media_file = get_object_or_404(MediaFile, pk=pk)
    media_file.enqueue_task(media_file.kinds.PROBE)
    MediaFile.objects.filter(pk=pk).update(status=FileStatus.PROBING)

    return render(request, "pages/file_detail.html#file-body", {"file": media_file})

    # return _file_row_response(request, pk)


@require_POST
def file_queue(request, pk: int):
    media_file = get_object_or_404(MediaFile, pk=pk)
    queue_transcode(media_file.pk, priority=int(request.POST.get("priority", 0)))
    return _file_row_response(request, pk)


def _file_row_response(request, pk: int) -> HttpResponse:
    media_file = MediaFile.objects.select_related("library").get(pk=pk)
    if request.htmx:
        return render(request, "pages/files.html#file-row", {"file": media_file})
    return redirect("pipeline:file_detail", pk=pk)


# --------------------------------------------------------------------------
# Profiles and workers
# --------------------------------------------------------------------------
def profile_list(request):
    return render(
        request,
        "pages/profiles.html",
        {
            "profiles": TranscodeProfile.objects.annotate(
                library_count=Count("libraries")
            )
        },
    )


def profile_form(request, pk: int | None = None):
    profile = get_object_or_404(TranscodeProfile, pk=pk) if pk else None
    if request.method == "POST":
        form = ProfileForm(request.POST, instance=profile)
        if form.is_valid():
            form.save()
            response = HttpResponse(status=204)
            response["HX-Trigger"] = (
                '{"closeModal": true, "reloadPage": true, "toast": {"message": "Profile saved."}}'
            )
            return response
        return render(
            request,
            "partials/profile_form.html",
            {"form": form, "profile": profile},
            status=422,
        )
    return render(
        request,
        "partials/profile_form.html",
        {"form": ProfileForm(instance=profile), "profile": profile},
    )


def worker_list(request):
    context = {
        "workers": Worker.objects.annotate(
            running=Count("jobs", filter=Q(jobs__state=JobState.RUNNING))
        )
    }
    template = (
        "pages/workers.html#worker-grid" if request.htmx else "pages/workers.html"
    )
    return render(request, template, context)
