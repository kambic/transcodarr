from django.urls import path

from . import views

app_name = "dashboard"

urlpatterns = [
    path("", views.overview, name="overview"),
    path("dashboard/", views.dashboard_home, name="home"),
    path("providers/", views.providers, name="providers"),
    path("video-assets/", views.video_assets, name="video_assets"),
    path("collections/", views.collections, name="collections"),
    path("jobs/", views.jobs, name="jobs"),
    path("scheduled-tasks/", views.scheduled_tasks, name="scheduled_tasks"),
    path("workflows/", views.workflows, name="workflows"),
    path("alerts/", views.alerts, name="alerts"),
    path("reports/", views.reports, name="reports"),
    path("audit-logs/", views.audit_logs, name="audit_logs"),
    path("environments/", views.environments, name="environments"),
    path("settings/", views.settings_page, name="settings"),
]