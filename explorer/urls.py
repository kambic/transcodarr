from django.urls import path

from . import views

app_name = "explorer"

urlpatterns = [
    path("", views.index, name="index"),
    path("f/<uuid:pk>/", views.browse, name="browse"),
    path("v/<str:name>/", views.special_view, name="special"),
    path("search/", views.search, name="search"),
    path("tree/<uuid:pk>/toggle/", views.toggle_branch, name="toggle-branch"),
    path("prefs/", views.preference, name="preference"),
    path("details/<uuid:pk>/", views.details, name="details"),
    path("activity/", views.activity, name="activity"),
    path("shares/", views.scan_status, name="scan-status"),
    path("shares/<uuid:pk>/scan/", views.scan_start, name="scan-start"),
    path("modal/<str:name>/", views.modal, name="modal"),
    # operations
    path("op/new-folder/", views.op_new_folder, name="op-new-folder"),
    path("op/upload/", views.op_upload, name="op-upload"),
    path("op/rename/", views.op_rename, name="op-rename"),
    path("op/move/", views.op_move, name="op-move"),
    path("op/star/", views.op_star, name="op-star"),
    path("op/trash/", views.op_trash, name="op-trash"),
    path("op/restore/", views.op_restore, name="op-restore"),
    path("op/purge/", views.op_purge, name="op-purge"),
    path("op/download/", views.op_download, name="op-download"),
    path("op/clipboard/", views.op_clipboard, name="op-clipboard"),
    path("op/paste/", views.op_paste, name="op-paste"),
    path("op/<uuid:pk>/undo/", views.op_undo, name="op-undo"),
]
