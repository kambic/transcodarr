from django.urls import path

from . import flow_views, views

app_name = "pipeline"

urlpatterns = [
    path("", views.dashboard, name="dashboard"),
    path("hx/stats/", views.dashboard_stats, name="dashboard_stats"),
    path("hx/activity/", views.dashboard_activity, name="dashboard_activity"),

    path("queue/", views.queue, name="queue"),
    path("hx/queue/", views.queue_table, name="queue_table"),
    path("jobs/<int:pk>/", views.job_detail, name="job_detail"),
    path("jobs/<int:pk>/cancel/", views.job_cancel, name="job_cancel"),
    path("jobs/<int:pk>/retry/", views.job_retry, name="job_retry"),
    path("jobs/<int:pk>/bump/", views.job_bump, name="job_bump"),

    path("libraries/", views.library_list, name="library_list"),
    path("libraries/new/", views.library_form, name="library_create"),
    path("libraries/<int:pk>/", views.library_detail, name="library_detail"),
    path("libraries/<int:pk>/edit/", views.library_form, name="library_edit"),
    path("libraries/<int:pk>/scan/", views.library_scan, name="library_scan"),
    path("libraries/<int:pk>/queue-all/", views.library_queue_all, name="library_queue_all"),
    path("libraries/<int:pk>/delete/", views.library_delete, name="library_delete"),
    path("hx/libraries/<int:pk>/card/", views.library_row_status, name="library_card"),

    path("files/", views.file_list, name="file_list"),
    path("files/<int:pk>/", views.file_detail, name="file_detail"),
    path("files/<int:pk>/probe/", views.file_probe, name="file_probe"),
    path("files/<int:pk>/queue/", views.file_queue, name="file_queue"),

    path("profiles/", views.profile_list, name="profile_list"),
    path("profiles/new/", views.profile_form, name="profile_create"),
    path("profiles/<int:pk>/edit/", views.profile_form, name="profile_edit"),

    path("flows/", flow_views.flow_list, name="flow_list"),
    path("flows/new/", flow_views.flow_create, name="flow_create"),
    path("flows/<int:pk>/", flow_views.flow_editor, name="flow_editor"),
    path("flows/<int:pk>/save/", flow_views.flow_save, name="flow_save"),
    path("flows/<int:pk>/test/", flow_views.flow_test, name="flow_test"),
    path("flows/<int:pk>/validate/", flow_views.flow_validate, name="flow_validate"),
    path("flows/<int:pk>/duplicate/", flow_views.flow_duplicate, name="flow_duplicate"),
    path("flows/<int:pk>/delete/", flow_views.flow_delete, name="flow_delete"),

    path("workers/", views.worker_list, name="worker_list"),
]
