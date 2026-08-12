from django import template
from django.utils.html import format_html
from django.utils.safestring import mark_safe

register = template.Library()

PATHS = {
    "folder": '<path stroke-linecap="round" stroke-linejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>',
    "file": '<path stroke-linecap="round" stroke-linejoin="round" d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z"/><path d="M14 3v5h5"/>',
    "image": '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path stroke-linecap="round" d="M4 17l5-4 4 3 3-2 4 3"/>',
    "video": '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/>',
    "audio": '<path stroke-linecap="round" d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="16" r="2"/>',
    "doc": '<path stroke-linecap="round" stroke-linejoin="round" d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z"/><path stroke-linecap="round" d="M9 12h6M9 16h6"/>',
    "sheet": '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16M4 15h16M10 4v16"/>',
    "code": '<path stroke-linecap="round" stroke-linejoin="round" d="M9 8l-4 4 4 4m6-8l4 4-4 4"/>',
    "archive": '<rect x="4" y="4" width="16" height="16" rx="2"/><path stroke-linecap="round" d="M12 4v4m0 3v2m0 3v2"/>',
    "design": '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3"/>',
}

COLOURS = {
    "folder": "text-primary",
    "image": "text-secondary",
    "video": "text-error",
    "audio": "text-accent",
    "doc": "text-info",
    "sheet": "text-success",
    "code": "text-warning",
    "archive": "opacity-70",
    "design": "text-primary",
    "file": "opacity-60",
}

LABELS = {
    "folder": "Folder", "image": "Image", "video": "Video", "audio": "Audio",
    "doc": "Document", "sheet": "Spreadsheet", "code": "Code", "archive": "Archive",
    "design": "Design file", "file": "File",
}


@register.simple_tag
def node_icon(node, size="w-5 h-5"):
    facet = node.facet
    body = PATHS.get(facet, PATHS["file"])
    return mark_safe(
        f'<svg xmlns="http://www.w3.org/2000/svg" class="{size} {COLOURS[facet]} shrink-0" '
        f'fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6">{body}</svg>'
    )


@register.filter
def facet_label(node):
    if node.facet == "file" and node.extension:
        return f"{node.extension.upper()} file"
    return LABELS.get(node.facet, "File")


@register.filter
def operation_badge(operation):
    tone = {
        "trash": "badge-error", "purge": "badge-error", "restore": "badge-success",
        "upload": "badge-success", "create_folder": "badge-success", "copy": "badge-info",
        "move": "badge-info", "rename": "badge-warning", "undo": "badge-neutral", "transcode": "badge-accent",
        "import": "badge-info", "vanished": "badge-warning",
    }.get(operation.kind, "badge-ghost")
    return format_html('<span class="badge badge-xs {}">{}</span>', tone, operation.get_kind_display())


@register.simple_tag(takes_context=True)
def querystring_without(context, *keys):
    params = context["request"].GET.copy()
    for key in keys:
        params.pop(key, None)
    return f"?{params.urlencode()}" if params else ""
