from django.contrib import admin
from django.urls import include, path

from apps import explorer

urlpatterns = [
    path("admin/", admin.site.urls),
    path("files/", include("files.urls")),
    path("offers/", include("offers.urls")),
    path("", include("dashboard.urls")),
    # path("", include("pipeline.urls")),
]
