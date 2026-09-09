import csv

from django.core.paginator import Paginator
from django.http import HttpResponse
from django.shortcuts import redirect, render

from .models import Offer

SORT_FIELDS = {
    "task_id": "task_id",
    "offer_id": "offer_id",
    "provider": "provider",
    "expired": "expired_at",
    "video_assets": "has_video_assets",
    "environment": "environment",
    "processing_datetime": "processing_datetime",
    "status": "status",
}

PAGE_SIZE = 10


def _apply_filters(request):
    qs = Offer.objects.all()

    task_id = request.GET.get("task_id", "").strip()
    if task_id:
        qs = qs.filter(task_id__icontains=task_id)

    offer_id = request.GET.get("offer_id", "").strip()
    if offer_id:
        qs = qs.filter(offer_id__icontains=offer_id)

    provider = request.GET.get("provider", "").strip()
    if provider:
        qs = qs.filter(provider=provider)

    environment = request.GET.get("environment", "").strip()
    if environment:
        qs = qs.filter(environment=environment)

    status = request.GET.get("status", "").strip()
    if status:
        qs = qs.filter(status=status)

    processing_from = request.GET.get("processing_from", "").strip()
    if processing_from:
        qs = qs.filter(processing_datetime__gte=processing_from)

    processing_to = request.GET.get("processing_to", "").strip()
    if processing_to:
        qs = qs.filter(processing_datetime__lte=processing_to)

    expired_from = request.GET.get("expired_from", "").strip()
    if expired_from:
        qs = qs.filter(expired_at__gte=expired_from)

    expired_to = request.GET.get("expired_to", "").strip()
    if expired_to:
        qs = qs.filter(expired_at__lte=expired_to)

    sort = request.GET.get("sort", "-processing_datetime")
    sort_field = sort.lstrip("-")
    if sort_field in SORT_FIELDS:
        db_field = SORT_FIELDS[sort_field]
        qs = qs.order_by(f"-{db_field}" if sort.startswith("-") else db_field)
    else:
        qs = qs.order_by("-processing_datetime")

    return qs


def offers_list(request):
    """Full page render of the Offers dashboard."""
    context = _build_context(request)
    return render(request, "dashboard/offers.html", context)


def offers_table(request):
    """HTMX partial: just the table + pagination, used for filters/sort/paging."""
    context = _build_context(request)
    return render(request, "partials/offers_table.html", context)


def _build_context(request):
    qs = _apply_filters(request)
    paginator = Paginator(qs, PAGE_SIZE)
    page_number = request.GET.get("page", 1)
    page_obj = paginator.get_page(page_number)

    sort = request.GET.get("sort", "-processing_datetime")

    providers = Offer.objects.values_list("provider", flat=True).distinct().order_by("provider")

    querydict = request.GET.copy()
    querydict.pop("page", None)
    base_query = querydict.urlencode()

    return {
        "page_obj": page_obj,
        "paginator": paginator,
        "providers": providers,
        "statuses": Offer.Status.choices,
        "environments": Offer.Environment.choices,
        "current_sort": sort,
        "filters": {
            "task_id": request.GET.get("task_id", ""),
            "offer_id": request.GET.get("offer_id", ""),
            "provider": request.GET.get("provider", ""),
            "environment": request.GET.get("environment", ""),
            "status": request.GET.get("status", ""),
            "processing_from": request.GET.get("processing_from", ""),
            "processing_to": request.GET.get("processing_to", ""),
            "expired_from": request.GET.get("expired_from", ""),
            "expired_to": request.GET.get("expired_to", ""),
        },
        "base_query": base_query,
        "total_count": paginator.count,
    }


def export_offers(request):
    """Dummy export endpoint — streams the currently filtered offers as CSV."""
    qs = _apply_filters(request)
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="offers_export.csv"'
    writer = csv.writer(response)
    writer.writerow(
        ["Task ID", "OfferID", "Provider", "Expired", "Video Assets", "Environment", "Processing Datetime", "Status"]
    )
    for offer in qs[:1000]:
        writer.writerow(
            [
                offer.task_id,
                offer.offer_id,
                offer.provider,
                offer.expired_at,
                "Yes" if offer.has_video_assets else "No",
                offer.get_environment_display(),
                offer.processing_datetime,
                offer.get_status_display(),
            ]
        )
    return response


def offers_clear(request):
    """Fallback redirect target for the Clear button (non-JS)."""
    return redirect("offers:list")