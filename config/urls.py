from django.contrib import admin
from django.urls import include, path
# from debug_toolbar.toolbar import debug_toolbar_urls
from apps import explorer

urlpatterns = [
    path("admin/", admin.site.urls),
    path("files/", include("files.urls")),
    path("offers/", include("offers.urls")),
    path("ex/", include("explorer.urls")),
    path("tr/", include("transcode.urls")),
    path("p/", include("pipeline.urls")),
    path("", include("dashboard.urls")),
] # + debug_toolbar_urls()
