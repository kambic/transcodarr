from django.contrib.auth.models import AnonymousUser
from django.shortcuts import get_object_or_404, render
from django.template.loader import render_to_string
from django.http import HttpResponse
from django.views.decorators.http import require_GET, require_POST

from explorer.models import Node

from . import services
from .models import Preset, TranscodeJob
from .tasks import run_transcode


def panel_context(limit: int = 12) -> dict:
    jobs = list(TranscodeJob.objects.recent(limit))
    return {
        "transcode_jobs": jobs,
        "transcode_busy": any(job.is_active for job in jobs),
    }


def panel_response(toast: dict | None = None, request=None) -> HttpResponse:
    """The jobs panel, plus an optional toast swapped in out-of-band."""
    html = render_to_string("transcode/panel.html#jobs", panel_context(), request)
    if toast:
        html += render_to_string("explorer/index.html#toast", {"toast": toast}, request)
    return HttpResponse(html)


@require_GET
def panel(request):
    """Polled while anything is converting."""
    return render(request, "transcode/panel.html#jobs", panel_context())


@require_GET
def choose(request):
    """Preset picker for the current selection."""
    ids = request.GET.getlist("ids")
    nodes = list(Node.objects.filter(pk__in=ids).alive())
    eligible = services.expand(nodes)
    return render(
        request,
        "transcode/panel.html#choose",
        {
            "presets": Preset.objects.filter(enabled=True),
            "nodes": nodes,
            "ids": ids,
            "eligible_count": len(eligible),
            "ffmpeg_ready": services.ffmpeg.available(),
        },
    )


@require_POST
def start(request):
    preset = get_object_or_404(Preset, slug=request.POST.get("preset"), enabled=True)
    nodes = list(Node.objects.filter(pk__in=request.POST.getlist("ids")).alive())
    if not nodes:
        return panel_response(
            {"message": "Nothing selected.", "level": "warning"}, request
        )

    actor = request.user if not isinstance(request.user, AnonymousUser) else None
    report = services.queue(nodes=nodes, preset=preset, actor=actor)
    for job in report["queued"]:
        run_transcode.enqueue(str(job.pk))

    count = len(report["queued"])
    if not count and report["duplicate"]:
        message, level = "Already queued with that preset.", "info"
    elif not count:
        message, level = "No media files in that selection.", "warning"
    else:
        message = f"Queued {count} file{'' if count == 1 else 's'} for {preset.label}"
        extra = []
        if report["duplicate"]:
            extra.append(f"{report['duplicate']} already queued")
        if report["skipped"]:
            extra.append(f"{report['skipped']} not media")
        message += f" ({', '.join(extra)})" if extra else ""
        level = "success"
    return panel_response({"message": message, "level": level}, request)


@require_POST
def cancel(request, pk):
    job = get_object_or_404(TranscodeJob, pk=pk)
    services.cancel(job)
    return panel_response(
        {"message": f"Stopping {job.source.name}", "level": "info"}, request
    )


@require_POST
def retry(request, pk):
    job = get_object_or_404(TranscodeJob, pk=pk)
    services.retry(job)
    run_transcode.enqueue(str(job.pk))
    return panel_response(
        {"message": f"Retrying {job.source.name}", "level": "info"}, request
    )


@require_POST
def clear(request):
    """Drop finished jobs from the panel. The audit log keeps the history."""
    removed, _ = TranscodeJob.objects.exclude(
        status__in=[TranscodeJob.Status.QUEUED, TranscodeJob.Status.RUNNING]
    ).delete()
    return panel_response(
        {"message": f"Cleared {removed} finished job(s)", "level": "info"}, request
    )
