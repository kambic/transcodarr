from django.urls import path

from . import views
from . import dash_views

# app_name = "offers"
app_name = "dashboard"

urlpatterns = [
    path("", dash_views.overview, name="overview"),
    path("dashboard/", dash_views.dashboard_home, name="home"),
    path("providers/", dash_views.providers, name="providers"),
    path("video-assets/", dash_views.video_assets, name="video_assets"),
    path("collections/", dash_views.collections, name="collections"),
    path("jobs/", dash_views.jobs, name="jobs"),
    path("scheduled-tasks/", dash_views.scheduled_tasks, name="scheduled_tasks"),
    path("workflows/", dash_views.workflows, name="workflows"),
    path("alerts/", dash_views.alerts, name="alerts"),
    path("reports/", dash_views.reports, name="reports"),
    path("audit-logs/", dash_views.audit_logs, name="audit_logs"),
    path("environments/", dash_views.environments, name="environments"),
    path("settings/", dash_views.settings_page, name="settings"),
]