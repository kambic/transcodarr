from django import template
from django.utils.safestring import mark_safe

register = template.Library()

BADGE_BASE = "text-xs font-medium px-2.5 py-0.5 rounded-full border"

STATE_STYLES = {
    "queued": "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600",
    "running": "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900 dark:text-cyan-300 dark:border-cyan-700",
    "cancelling": "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-700",
    "succeeded": "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-700",
    "failed": "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-700",
    "cancelled": "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600",
    # File statuses
    "new": "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600",
    "probing": "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900 dark:text-indigo-300 dark:border-indigo-700",
    "ready": "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-700",
    "transcoding": "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900 dark:text-cyan-300 dark:border-cyan-700",
    "transcoded": "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-700",
    "error": "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-700",
    "skipped": "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600",
    "missing": "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700",
    # Verdicts
    "meets_target": "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-700",
    "needs_transcode": "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-700",
    "unreadable": "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-700",
    "unknown": "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600",
}
FALLBACK = STATE_STYLES["unknown"]


@register.simple_tag
def badge(value, label=None):
    """Flowbite pill coloured by state, status, or verdict."""
    style = STATE_STYLES.get(str(value), FALLBACK)
    text = label or str(value).replace("_", " ").title()
    return mark_safe(f'<span class="{BADGE_BASE} {style}">{text}</span>')


@register.filter
def duration(seconds):
    """3725 -> 1h 2m. Used for runtimes and ETAs."""
    if seconds in (None, ""):
        return "—"
    seconds = int(float(seconds))
    hours, rest = divmod(seconds, 3600)
    minutes, secs = divmod(rest, 60)
    if hours:
        return f"{hours}h {minutes:02d}m"
    if minutes:
        return f"{minutes}m {secs:02d}s"
    return f"{secs}s"


@register.filter
def percent_of(value, total):
    try:
        return round(float(value) / float(total) * 100, 1)
    except (TypeError, ValueError, ZeroDivisionError):
        return 0


@register.filter
def dirname(path):
    """Show the folder above a file so long paths stay scannable."""
    parts = str(path).rsplit("/", 1)
    return parts[0] if len(parts) > 1 else ""


@register.filter
def basename(path):
    return str(path).rsplit("/", 1)[-1]


@register.simple_tag(takes_context=True)
def query_replace(context, **kwargs):
    """Rebuild the querystring, keeping existing filters. Used by pagination."""
    params = context["request"].GET.copy()
    for key, value in kwargs.items():
        if value in (None, ""):
            params.pop(key, None)
        else:
            params[key] = value
    return params.urlencode()
