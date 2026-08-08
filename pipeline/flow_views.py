"""Flow editor views.

The canvas is a single page that talks JSON: `flow_save` takes the whole graph,
`flow_test` dry-runs it against a real file and hands back the trace so the
editor can light up the path that file took.
"""

from __future__ import annotations

import json

from django.db.models import Count
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils.text import slugify
from django.views.decorators.http import require_POST

from .flows import engine
from .flows.registry import registry
from .models import Flow, Library, MediaFile


def flow_list(request):
    flows = Flow.objects.annotate(library_count=Count("libraries")).order_by("name")
    return render(request, "pages/flows.html", {"flows": flows})


@require_POST
def flow_create(request):
    name = (request.POST.get("name") or "").strip() or "New flow"
    unique = name
    suffix = 2
    while Flow.objects.filter(name=unique).exists():
        unique = f"{name} {suffix}"
        suffix += 1
    flow = Flow.objects.create(name=unique, graph=engine.default_graph())
    return redirect("pipeline:flow_editor", pk=flow.pk)


@require_POST
def flow_duplicate(request, pk: int):
    original = get_object_or_404(Flow, pk=pk)
    copy = Flow.objects.create(
        name=f"{original.name} copy",
        description=original.description,
        graph=original.graph,
    )
    return redirect("pipeline:flow_editor", pk=copy.pk)


@require_POST
def flow_delete(request, pk: int):
    get_object_or_404(Flow, pk=pk).delete()
    return redirect("pipeline:flow_list")


def flow_editor(request, pk: int):
    flow = get_object_or_404(Flow, pk=pk)
    sample_files = (
        MediaFile.objects.filter(library__flow=flow)
        .exclude(video_codec="")
        .order_by("rel_path")[:50]
    )
    if not sample_files:
        sample_files = MediaFile.objects.exclude(video_codec="").order_by("rel_path")[:50]

    return render(
        request,
        "pages/flow_editor.html",
        {
            "flow": flow,
            # The palette, property forms and port counts all come from here.
            "node_types_json": json.dumps(registry.to_json()),
            "graph_json": json.dumps(flow.graph or engine.default_graph()),
            "sample_files": sample_files,
            "libraries": Library.objects.filter(flow=flow),
        },
    )


@require_POST
def flow_save(request, pk: int):
    flow = get_object_or_404(Flow, pk=pk)
    try:
        payload = json.loads(request.body)
    except json.JSONDecodeError:
        return HttpResponseBadRequest("Could not read the graph.")

    graph = payload.get("graph") or {}
    if not isinstance(graph.get("nodes"), list) or not isinstance(graph.get("edges"), list):
        return HttpResponseBadRequest("The graph needs a nodes list and an edges list.")

    # Drop anything the registry doesn't recognise rather than storing junk that
    # will fail at run time on a worker.
    clean_nodes = []
    for node in graph["nodes"]:
        definition = registry.get(node.get("type", ""))
        if definition is None:
            continue
        clean_nodes.append({
            "id": str(node["id"]),
            "type": node["type"],
            "x": round(float(node.get("x", 0)), 1),
            "y": round(float(node.get("y", 0)), 1),
            "config": {k: v for k, v in (node.get("config") or {}).items()
                       if k in {f.name for f in definition.fields}},
        })
    ids = {n["id"] for n in clean_nodes}
    clean_edges = [
        {"from": str(e["from"]), "output": int(e["output"]), "to": str(e["to"])}
        for e in graph["edges"]
        if str(e.get("from")) in ids and str(e.get("to")) in ids
    ]

    flow.graph = {"nodes": clean_nodes, "edges": clean_edges}
    flow.revision += 1
    if payload.get("name"):
        flow.name = payload["name"][:120]
    if "description" in payload:
        flow.description = (payload["description"] or "")[:300]
    if "enabled" in payload:
        flow.enabled = bool(payload["enabled"])
    flow.save()

    return JsonResponse({
        "saved": True,
        "revision": flow.revision,
        "problems": engine.validate(flow.graph),
    })


@require_POST
def flow_test(request, pk: int):
    """Dry-run the graph in the editor against a real file and return the trace.

    Tests the unsaved graph from the canvas, so you can try a change before
    committing to it.
    """
    flow = get_object_or_404(Flow, pk=pk)
    try:
        payload = json.loads(request.body)
    except json.JSONDecodeError:
        return HttpResponseBadRequest("Could not read the request.")

    media_file = MediaFile.objects.filter(pk=payload.get("file_id")).select_related("library").first()
    if media_file is None:
        return JsonResponse({"error": "Pick a file to test with."}, status=400)

    graph = payload.get("graph") or flow.graph
    from .flow_tasks import build_context

    ctx = build_context(media_file, dry_run=True)
    try:
        result = engine.run(graph, ctx)
    except engine.FlowError as exc:
        return JsonResponse({"error": str(exc)}, status=400)
    except Exception as exc:
        return JsonResponse({"error": f"{type(exc).__name__}: {exc}"}, status=400)

    return JsonResponse({
        "file": media_file.rel_path,
        "metadata": {
            "codec": media_file.video_codec,
            "resolution": media_file.resolution_label,
            "bitrate": media_file.bitrate_kbps,
            "size": media_file.size_bytes,
        },
        "trace": result.trace,
        "messages": ctx.messages,
        "planned": ctx.planned,
        "needs_work": result.needs_work,
        "failed": result.failed,
        "reason": result.reason,
    })


def flow_validate(request, pk: int):
    flow = get_object_or_404(Flow, pk=pk)
    return JsonResponse({"problems": engine.validate(flow.graph)})
