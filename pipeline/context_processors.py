from .models import Job, JobState


def nav(request):
    """Badge counts for the sidebar, on every page."""
    return {
        "nav_queue_count": Job.objects.active().count(),
        "nav_running_count": Job.objects.filter(state=JobState.RUNNING).count(),
    }
