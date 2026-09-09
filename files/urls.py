from django.urls import path

from . import views

app_name = "files"

urlpatterns = [
    path("", views.explorer_view, name="index"),
    path("browse/", views.explorer_browser, name="browse"),
    path("action/", views.dummy_action, name="action"),
]