def jobs(request):
    """Expose recent transcode jobs to every template.

    Lets the explorer render the jobs panel without importing this app.
    """
    from .models import TranscodeJob

    recent = list(TranscodeJob.objects.recent(8))
    return {
        "transcode_jobs": recent,
        "transcode_busy": any(job.is_active for job in recent),
    }
