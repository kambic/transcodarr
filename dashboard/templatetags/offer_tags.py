from django import template
from django.urls import reverse
from django.utils.safestring import mark_safe

register = template.Library()


@register.simple_tag
def sortable_th(field, label, current_sort, base_query):
    """Render a <th> with a sort toggle button that HTMX-fetches the table partial."""
    is_active = current_sort.lstrip("-") == field
    is_desc = current_sort.startswith("-")
    next_sort = f"-{field}" if not (is_active and not is_desc) else field
    if is_active:
        next_sort = f"{field}" if is_desc else f"-{field}"
    else:
        next_sort = field

    arrow = ""
    if is_active:
        arrow = (
            '<svg class="h-3.5 w-3.5 text-gray-700" fill="none" viewBox="0 0 24 24" '
            'stroke-width="2" stroke="currentColor">'
            + (
                '<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />'
                if not is_desc
                else '<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />'
            )
            + "</svg>"
        )
    else:
        arrow = (
            '<svg class="h-3.5 w-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" '
            'stroke-width="2" stroke="currentColor">'
            '<path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"/>'
            "</svg>"
        )

    url = reverse("offers:table")
    qs = f"{base_query}&sort={next_sort}" if base_query else f"sort={next_sort}"
    active_class = "text-gray-900" if is_active else "text-gray-500"

    html = (
        f'<th><button type="button" class="sort-btn {active_class}" '
        f'hx-get="{url}?{qs}" hx-target="#offers-table-wrapper">'
        f"{label} {arrow}</button></th>"
    )
    return mark_safe(html)


@register.simple_tag
def page_link(num, page_obj, base_query):
    url = reverse("offers:table")
    qs = f"{base_query}&page={num}" if base_query else f"page={num}"
    is_current = num == page_obj.number

    # Only render a window of pages around the current one, plus first/last, with ellipses.
    total = page_obj.paginator.num_pages
    show = (
        num == 1
        or num == total
        or abs(num - page_obj.number) <= 1
    )
    if not show:
        # Only emit an ellipsis once per gap (right after the previous shown page).
        prev_shown = (
            num - 1 == 1
            or num - 1 == total
            or abs((num - 1) - page_obj.number) <= 1
        )
        if prev_shown:
            return mark_safe('<span class="px-1.5 text-sm text-gray-400">&hellip;</span>')
        return ""

    if is_current:
        cls = "bg-primary-600 text-white border-primary-600"
    else:
        cls = "border-gray-300 text-gray-600 hover:bg-gray-50"

    html = (
        f'<button type="button" class="flex h-8 min-w-8 items-center justify-center rounded-lg '
        f'border px-2 text-sm font-medium {cls}" '
        f'hx-get="{url}?{qs}" hx-target="#offers-table-wrapper">{num}</button>'
    )
    return mark_safe(html)