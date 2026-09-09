from django.urls import path

from . import views

app_name = "offers"

urlpatterns = [
    path("", views.offers_list, name="list"),
    path("table/", views.offers_table, name="table"),
    path("export/", views.export_offers, name="export"),
    path("clear/", views.offers_clear, name="clear"),
]