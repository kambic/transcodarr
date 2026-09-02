"""HTMX views.

Every endpoint renders a named partial out of ``explorer/index.html`` using
Django 6's ``template.html#partial`` syntax, so there is exactly one template
file describing the explorer. Mutating endpoints return the refreshed workspace
plus out-of-band swaps for the sidebar, the activity feed and a toast.
"""

from __future__ import annotations

from django.conf import settings
from django.db.models.functions import Lower
from django.http import Http404, HttpResponse, HttpResponseBadRequest
from django.shortcuts import get_object_or_404, redirect, render
from django.template.loader import render_to_string
from django.urls import reverse
from django.views.decorators.http import require_GET, require_POST

from . import services
from .models import Node, Operation, ScanRoot, ScanRun
from .services import OperationError
from .tasks import scan_share

SPECIALS = {"starred": "Starred", "recent": "Recent", "trash": "Trash"}
SORTS = {
    "name": Lower("name"),
    "size": "size",
    "modified": "modified_at",
    "type": "content_type",
}


# --------------------------------------------------------------------------- #
#  Location + context
# --------------------------------------------------------------------------- #
def is_htmx(request) -> bool:
    return request.headers.get("HX-Request") == "true"


def root_folder() -> Node:
    root = (
        Node.objects.filter(parent__isnull=True, kind=Node.Kind.FOLDER)
        .order_by("created_at")
        .first()
    )
    if root is None:
        root = Node.objects.create(name="My Drive", kind=Node.Kind.FOLDER)
    return root


def remember(
    request, *, folder: Node | None = None, special: str | None = None, query: str = ""
):
    request.session["cwd"] = str(folder.pk) if folder else None
    request.session["special"] = special
    request.session["query"] = query


def current_location(request) -> tuple[Node, str | None, str]:
    special = request.session.get("special")
    query = request.session.get("query", "")
    folder = Node.objects.filter(pk=request.session.get("cwd")).first() or root_folder()
    return folder, special, query


def listing(folder: Node, special: str | None, query: str, sort: str, direction: str):
    if special == "starred":
        qs = Node.objects.alive().filter(starred=True)
    elif special == "recent":
        qs = Node.objects.alive().files().order_by("-modified_at")[:25]
        return (
            qs
            if not query
            else Node.objects.alive().files().filter(name__icontains=query)
        )
    elif special == "trash":
        qs = Node.objects.trashed().exclude(parent__trashed_at__isnull=False)
    elif query:
        qs = Node.objects.search(query, root=folder)
    else:
        qs = Node.objects.children_of(folder).alive()

    field = SORTS.get(sort, SORTS["name"])
    if direction == "desc":
        field = field.desc() if hasattr(field, "desc") else f"-{field}"
    return qs.order_by("-kind", field)


def context(
    request, *, folder: Node, special: str | None, query: str, toast=None
) -> dict:
    sort = request.session.get("sort", "name")
    direction = request.session.get("direction", "asc")
    view = request.session.get("view", "list")
    items = list(listing(folder, special, query, sort, direction))
    quota = settings.VAULT["QUOTA_BYTES"]
    used = Node.objects.files().total_bytes()

    return {
        "root": root_folder(),
        "folder": folder,
        "special": special,
        "special_label": SPECIALS.get(special or ""),
        "query": query,
        "items": items,
        "item_count": len(items),
        "listing_bytes": sum(n.byte_size() for n in items),
        "breadcrumbs": folder.breadcrumbs(),
        "tree": tree_rows(request, folder),
        "view": view,
        "sort": sort,
        "sort_options": [
            ("name", "Name"),
            ("size", "Size"),
            ("modified", "Last modified"),
            ("type", "Type"),
        ],
        "sort_label": {
            "name": "Name",
            "size": "Size",
            "modified": "Modified",
            "type": "Type",
        }[sort],
        "themes": ["nord", "dim", "winter", "dracula", "retro", "corporate"],
        "direction": direction,
        "clipboard": request.session.get("clipboard"),
        "starred_count": Node.objects.alive().filter(starred=True).count(),
        "trash_count": Node.objects.trashed().count(),
        "used_bytes": used,
        "quota_bytes": quota,
        "used_pct": min(100, round(used / quota * 100, 1)) if quota else 0,
        "operations": Operation.objects.recent(12),
        "shares": (rows := share_rows()),
        "busy_scan": any(row["busy"] for row in rows),
        "toast": toast,
    }


def share_rows() -> list[dict]:
    """Shares plus their most recent run, for the sidebar panel."""
    rows = []
    for scan_root in ScanRoot.objects.select_related("node"):
        run = scan_root.runs.first()
        rows.append(
            {
                "share": scan_root,
                "run": run,
                "busy": bool(run and run.is_active),
                "available": scan_root.probe(),
            }
        )
    return rows


def tree_rows(request, current: Node) -> list[dict]:
    """Flattened sidebar tree; only expanded branches are walked."""
    expanded = set(request.session.get("expanded", [])) | {
        str(n.pk) for n in current.ancestors()
    }
    expanded.add(str(root_folder().pk))
    rows: list[dict] = []

    def walk(folder: Node, depth: int):
        children = list(
            Node.objects.children_of(folder).alive().folders().order_by(Lower("name"))
        )
        rows.append(
            {
                "node": folder,
                "depth": depth,
                "expanded": str(folder.pk) in expanded,
                "has_children": bool(children),
                "active": folder.pk == current.pk,
            }
        )
        if str(folder.pk) in expanded:
            for child in children:
                walk(child, depth + 1)

    walk(root_folder(), 0)
    return rows


def explorer_response(
    request, *, folder: Node, special=None, query="", toast=None, push=None
):
    ctx = context(request, folder=folder, special=special, query=query, toast=toast)
    html = render_to_string("explorer/index.html#workspace", ctx, request)
    html += render_to_string("explorer/index.html#sidebar-oob", ctx, request)
    html += render_to_string("explorer/index.html#activity-oob", ctx, request)
    if toast:
        html += render_to_string("explorer/index.html#toast", {"toast": toast}, request)
    response = HttpResponse(html)
    if push:
        response["HX-Push-Url"] = push
    return response


def toast(message, level="info", operation: Operation | None = None) -> dict:
    return {
        "message": message,
        "level": level,
        "operation": operation if operation and operation.can_undo else None,
    }


def refresh(request, toast_payload=None):
    folder, special, query = current_location(request)
    return explorer_response(
        request, folder=folder, special=special, query=query, toast=toast_payload
    )


def selected(request) -> list[Node]:
    ids = request.POST.getlist("ids")
    nodes = list(Node.objects.filter(pk__in=ids))
    order = {str(pk): i for i, pk in enumerate(ids)}
    nodes.sort(key=lambda n: order.get(str(n.pk), 0))
    return nodes


# --------------------------------------------------------------------------- #
#  Browsing
# --------------------------------------------------------------------------- #
@require_GET
def index(request):
    folder = root_folder()
    remember(request, folder=folder)
    return render(
        request,
        "explorer/index.html",
        context(request, folder=folder, special=None, query=""),
    )


@require_GET
def browse(request, pk):
    folder = get_object_or_404(Node, pk=pk, kind=Node.Kind.FOLDER)
    remember(request, folder=folder)
    if not is_htmx(request):
        return render(
            request,
            "explorer/index.html",
            context(request, folder=folder, special=None, query=""),
        )
    return explorer_response(request, folder=folder, push=folder.get_absolute_url())


@require_GET
def special_view(request, name):
    if name not in SPECIALS:
        raise Http404
    folder, _, _ = current_location(request)
    remember(request, folder=folder, special=name)
    if not is_htmx(request):
        return render(
            request,
            "explorer/index.html",
            context(request, folder=folder, special=name, query=""),
        )
    return explorer_response(
        request,
        folder=folder,
        special=name,
        push=reverse("explorer:special", args=[name]),
    )


@require_GET
def search(request):
    query = request.GET.get("q", "").strip()
    folder, special, _ = current_location(request)
    remember(request, folder=folder, special=special, query=query)
    ctx = context(request, folder=folder, special=special, query=query)
    return render(request, "explorer/index.html#listing", ctx)


@require_GET
def toggle_branch(request, pk):
    expanded = set(request.session.get("expanded", []))
    expanded.symmetric_difference_update({str(pk)})
    request.session["expanded"] = list(expanded)
    folder, special, query = current_location(request)
    ctx = context(request, folder=folder, special=special, query=query)
    return render(request, "explorer/index.html#sidebar", ctx)


@require_POST
def preference(request):
    for key, allowed in (
        ("view", {"list", "grid"}),
        ("sort", set(SORTS)),
        ("direction", {"asc", "desc"}),
    ):
        value = request.POST.get(key)
        if value in allowed:
            request.session[key] = value
    return refresh(request)


@require_GET
def details(request, pk):
    node = get_object_or_404(Node, pk=pk)
    return render(request, "explorer/modals.html#details", {"node": node})


@require_GET
def activity(request):
    return render(
        request,
        "explorer/index.html#activity",
        {"operations": Operation.objects.recent(40)},
    )


# --------------------------------------------------------------------------- #
#  Modals
# --------------------------------------------------------------------------- #
@require_GET
def modal(request, name):
    folder, special, _ = current_location(request)
    ids = request.GET.getlist("ids")
    nodes = list(Node.objects.filter(pk__in=ids))
    ctx = {
        "folder": folder,
        "special": special,
        "nodes": nodes,
        "ids": ids,
        "node": nodes[0] if nodes else None,
    }
    if name == "move":
        blocked = {str(n.pk) for n in nodes}
        ctx["choices"] = [
            {
                "node": f,
                "depth": len(f.ancestor_ids),
                "blocked": str(f.pk) in blocked
                or any(n.is_folder and n.is_ancestor_of(f) for n in nodes),
            }
            for f in Node.objects.alive().folders().order_by("path")
        ]
    elif name not in {"new-folder", "rename", "purge"}:
        raise Http404
    return render(request, f"explorer/modals.html#{name}", ctx)


# --------------------------------------------------------------------------- #
#  Operations
# --------------------------------------------------------------------------- #
def _run(request, fn, success):
    try:
        operation = fn()
    except OperationError as exc:
        return refresh(request, toast(exc.messages[0], "error"))
    return refresh(request, toast(success(operation), "success", operation))


def _plural(n, word="item"):
    return f"{n} {word}{'' if n == 1 else 's'}"


@require_POST
def op_new_folder(request):
    folder, _, _ = current_location(request)
    return _run(
        request,
        lambda: services.create_folder(
            parent=folder,
            name=request.POST.get("name", ""),
            actor=request.user if request.user.is_authenticated else None,
        ),
        lambda op: f"Created {op.items.first().label}",
    )


@require_POST
def op_upload(request):
    folder, _, _ = current_location(request)
    return _run(
        request,
        lambda: services.upload_files(
            parent=folder,
            files=request.FILES.getlist("files"),
            actor=request.user if request.user.is_authenticated else None,
        ),
        lambda op: f"Added {_plural(op.item_count, 'file')}",
    )


@require_POST
def op_rename(request):
    node = get_object_or_404(Node, pk=request.POST.get("id"))
    return _run(
        request,
        lambda: services.rename(
            node=node,
            name=request.POST.get("name", ""),
            actor=request.user if request.user.is_authenticated else None,
        ),
        lambda op: f"Renamed to {op.items.first().label}",
    )


@require_POST
def op_move(request):
    nodes = selected(request)
    destination = get_object_or_404(Node, pk=request.POST.get("destination"))
    return _run(
        request,
        lambda: services.move(
            nodes=nodes,
            destination=destination,
            actor=request.user if request.user.is_authenticated else None,
        ),
        lambda op: f"Moved {_plural(op.item_count)} to {destination.name}",
    )


@require_POST
def op_star(request):
    nodes = selected(request)
    starred = request.POST.get("starred", "1") == "1"
    return _run(
        request,
        lambda: services.set_star(
            nodes=nodes,
            starred=starred,
            actor=request.user if request.user.is_authenticated else None,
        ),
        lambda op: f"{'Starred' if starred else 'Unstarred'} {_plural(op.item_count)}",
    )


@require_POST
def op_trash(request):
    nodes = selected(request)
    return _run(
        request,
        lambda: services.trash(
            nodes=nodes, actor=request.user if request.user.is_authenticated else None
        ),
        lambda op: f"Moved {_plural(op.item_count)} to Trash",
    )


@require_POST
def op_restore(request):
    nodes = selected(request) or list(Node.objects.trashed())
    return _run(
        request,
        lambda: services.restore(
            nodes=nodes, actor=request.user if request.user.is_authenticated else None
        ),
        lambda op: f"Restored {_plural(op.item_count)}",
    )


@require_POST
def op_purge(request):
    nodes = selected(request) or list(
        Node.objects.trashed().exclude(parent__trashed_at__isnull=False)
    )
    return _run(
        request,
        lambda: services.purge(
            nodes=nodes, actor=request.user if request.user.is_authenticated else None
        ),
        lambda op: f"Deleted {_plural(op.item_count)} permanently",
    )


@require_POST
def op_download(request):
    nodes = selected(request)
    return _run(
        request,
        lambda: services.record_download(
            nodes=nodes, actor=request.user if request.user.is_authenticated else None
        ),
        lambda op: f"Prepared {_plural(op.item_count)} for download",
    )


@require_POST
def op_clipboard(request):
    mode = request.POST.get("mode")
    if mode not in {"copy", "cut"}:
        return HttpResponseBadRequest("Unknown clipboard mode")
    ids = request.POST.getlist("ids")
    if not ids:
        return refresh(request, toast("Select something first.", "warning"))
    request.session["clipboard"] = {"ids": ids, "mode": mode}
    verb = "copy" if mode == "copy" else "move"
    return refresh(request, toast(f"{_plural(len(ids))} ready to {verb}", "info"))


@require_POST
def op_paste(request):
    clipboard = request.session.get("clipboard")
    if not clipboard:
        return refresh(request, toast("Nothing to paste.", "warning"))
    folder, _, _ = current_location(request)
    nodes = list(Node.objects.filter(pk__in=clipboard["ids"]))
    actor = request.user if request.user.is_authenticated else None

    def run():
        if clipboard["mode"] == "copy":
            return services.copy(nodes=nodes, destination=folder, actor=actor)
        operation = services.move(nodes=nodes, destination=folder, actor=actor)
        request.session["clipboard"] = None
        return operation

    return _run(
        request,
        run,
        lambda op: f"{op.get_kind_display()} {_plural(op.item_count)} to {folder.name}",
    )


@require_POST
def op_undo(request, pk):
    operation = get_object_or_404(Operation, pk=pk)
    return _run(
        request,
        lambda: services.undo(
            operation=operation,
            actor=request.user if request.user.is_authenticated else None,
        ),
        lambda op: f"Undid: {operation.get_kind_display().lower()}",
    )


# --------------------------------------------------------------------------- #
#  Share scanning
# --------------------------------------------------------------------------- #
@require_GET
def scan_status(request):
    """Polled while a scan is running; also refreshed out-of-band after any op."""
    rows = share_rows()
    return render(
        request,
        "explorer/index.html#shares",
        {"shares": rows, "busy_scan": any(row["busy"] for row in rows)},
    )


@require_POST
def scan_start(request, pk):
    scan_root = get_object_or_404(ScanRoot, pk=pk)
    if not scan_root.enabled:
        return refresh(request, toast(f"{scan_root.label} is disabled.", "warning"))
    if scan_root.runs.filter(
        status__in=[ScanRun.Status.QUEUED, ScanRun.Status.RUNNING]
    ).exists():
        return refresh(
            request, toast(f"{scan_root.label} is already being scanned.", "info")
        )

    run = ScanRun.objects.create(scan_root=scan_root)
    scan_share.enqueue(
        str(scan_root.pk), full=request.POST.get("full") == "1", run_id=str(run.pk)
    )

    # Under a worker-backed TASKS backend the run is still queued here; under
    # the development ImmediateBackend it has already finished.
    run.refresh_from_db()
    level = {
        ScanRun.Status.DONE: "success",
        ScanRun.Status.UNAVAILABLE: "error",
        ScanRun.Status.FAILED: "error",
        ScanRun.Status.ABORTED: "warning",
    }.get(run.status, "info")
    message = (
        f"{scan_root.label}: {run.headline()}"
        if not run.is_active
        else f"Scanning {scan_root.label}…"
    )
    return refresh(request, toast(message, level))
