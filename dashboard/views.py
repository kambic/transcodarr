from django.shortcuts import render


def _placeholder(request, title, subtitle=""):
    return render(
        request,
        "dashboard/placeholder.html",
        {"page_title": title, "page_subtitle": subtitle},
    )


def overview(request):
    return render(request, "dashboard/overview.html", {"page_title": "Overview"})


def dashboard_home(request):
    return _placeholder(request, "Dashboard", "High-level metrics across your content pipeline")


def providers(request):
    return _placeholder(request, "Providers", "Manage content providers and their integration settings")


def video_assets(request):
    return _placeholder(request, "Video Assets", "Browse and manage processed video assets")


def collections(request):
    return _placeholder(request, "Collections", "Group offers and assets into curated collections")


def jobs(request):
    return _placeholder(request, "Jobs", "Track background job execution and retries")


def scheduled_tasks(request):
    return _placeholder(request, "Scheduled Tasks", "Manage recurring and scheduled processing tasks")


def workflows(request):
    return _placeholder(request, "Workflows", "Configure multi-step content processing workflows")


def alerts(request):
    return _placeholder(request, "Alerts", "Configure and review system alerts")


def reports(request):
    return _placeholder(request, "Reports", "Generate and download operational reports")


def audit_logs(request):
    return _placeholder(request, "Audit Logs", "Review a history of actions taken across MediaHub")


def environments(request):
    return _placeholder(request, "Environments", "Manage Production and Staging environment configuration")


def settings_page(request):
    return _placeholder(request, "Settings", "Application-wide configuration")