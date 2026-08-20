from django.urls import path

from . import views

app_name = "transcode"

urlpatterns = [
    path("jobs/", views.panel, name="panel"),
    path("choose/", views.choose, name="choose"),
    path("start/", views.start, name="start"),
    path("jobs/<uuid:pk>/cancel/", views.cancel, name="cancel"),
    path("jobs/<uuid:pk>/retry/", views.retry, name="retry"),
    path("clear/", views.clear, name="clear"),
]
