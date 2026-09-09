from dataclasses import dataclass
from datetime import datetime
from pathlib import Path, PurePosixPath

from django.conf import settings
from django.http import Http404
from django.shortcuts import render

# Extensions mapped to an icon key used by the template's icon tag.
ICON_MAP = {
    **{ext: "video" for ext in (".mp4", ".mkv", ".mov", ".avi", ".webm")},
    **{ext: "image" for ext in (".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg")},
    **{ext: "pdf" for ext in (".pdf",)},
    **{ext: "archive" for ext in (".zip", ".tar", ".gz", ".rar", ".7z")},
    **{ext: "code" for ext in (".json", ".py", ".js", ".ts", ".html", ".css")},
    **{ext: "sheet" for ext in (".csv", ".xlsx", ".xls")},
    **{ext: "text" for ext in (".txt", ".md", ".srt")},
    **{ext: "doc" for ext in (".doc", ".docx")},
}


@dataclass
class Entry:
    path: Path
    rel_path: str
    name: str
    is_dir: bool
    size: int
    modified: datetime
    icon: str
    ext: str


def _resolve_safe_path(rel_path: str) -> Path:
    """
    Resolve a user-supplied relative path against EXPLORER_ROOT using pathlib,
    refusing to leave the sandboxed root (blocks '..' traversal, symlink escape, etc).
    """
    root: Path = settings.EXPLORER_ROOT.resolve()
    root.mkdir(parents=True, exist_ok=True)

    # Normalize using PurePosixPath so the incoming URL-style path (always
    # forward slashes) is interpreted consistently regardless of OS.
    clean_parts = [p for p in PurePosixPath(rel_path or "").parts if p not in ("", ".", "..")]
    candidate = root.joinpath(*clean_parts).resolve()

    if candidate != root and root not in candidate.parents:
        raise Http404("Path is outside the sandboxed explorer root.")

    if not candidate.exists():
        raise Http404("Path does not exist.")

    return candidate


def _human_size(num_bytes: int) -> str:
    size = float(num_bytes)
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if size < 1024:
            return f"{size:.0f} {unit}" if unit == "B" else f"{size:.1f} {unit}"
        size /= 1024
    return f"{size:.1f} PB"


def _icon_for(path: Path, is_dir: bool) -> tuple[str, str]:
    if is_dir:
        return "folder", ""
    ext = path.suffix.lower()
    return ICON_MAP.get(ext, "file"), ext.lstrip(".")


def _list_dir(directory: Path, root: Path, sort: str) -> list[Entry]:
    entries: list[Entry] = []

    for child in directory.iterdir():
        try:
            stat = child.stat()
        except OSError:
            continue

        is_dir = child.is_dir()
        icon, ext = _icon_for(child, is_dir)
        rel = child.relative_to(root).as_posix()

        entries.append(
            Entry(
                path=child,
                rel_path=rel,
                name=child.name,
                is_dir=is_dir,
                size=0 if is_dir else stat.st_size,
                modified=datetime.fromtimestamp(stat.st_mtime),
                icon=icon,
                ext=ext,
            )
        )

    sort_field = sort.lstrip("-")
    reverse = sort.startswith("-")

    key_funcs = {
        "name": lambda e: e.name.lower(),
        "size": lambda e: e.size,
        "modified": lambda e: e.modified,
        "type": lambda e: e.ext,
    }
    key_func = key_funcs.get(sort_field, key_funcs["name"])

    # Folders always float to the top, then sort within each group.
    entries.sort(key=lambda e: (not e.is_dir, key_func(e)), reverse=False)
    if reverse and sort_field != "name":
        dirs = [e for e in entries if e.is_dir]
        files = sorted([e for e in entries if not e.is_dir], key=key_func, reverse=True)
        entries = dirs + files

    return entries


def _breadcrumbs(rel_path: str) -> list[dict]:
    parts = [p for p in PurePosixPath(rel_path or "").parts if p not in ("", ".", "..")]
    crumbs = [{"name": "Home", "path": ""}]
    accumulated = []
    for part in parts:
        accumulated.append(part)
        crumbs.append({"name": part, "path": "/".join(accumulated)})
    return crumbs


def _build_context(request):
    rel_path = request.GET.get("path", "").strip()
    sort = request.GET.get("sort", "name")

    root = settings.EXPLORER_ROOT.resolve()
    current = _resolve_safe_path(rel_path)

    if current.is_file():
        # If a file path sneaks in via query param, fall back to its parent dir.
        current = current.parent
        rel_path = current.relative_to(root).as_posix()

    entries = _list_dir(current, root, sort)
    folder_count = sum(1 for e in entries if e.is_dir)
    file_count = len(entries) - folder_count

    return {
        "entries": entries,
        "breadcrumbs": _breadcrumbs(rel_path),
        "current_path": rel_path,
        "current_sort": sort,
        "folder_count": folder_count,
        "file_count": file_count,
        "human_size": _human_size,
    }


def explorer_view(request):
    """Full page render of the File Explorer."""
    context = _build_context(request)
    return render(request, "explorer/explorer.html", context)


def explorer_browser(request):
    """HTMX partial: just the breadcrumb + file grid/table, used for navigation and sorting."""
    context = _build_context(request)
    return render(request, "explorer/partials/browser.html", context)


# --- Dummy context-menu actions -------------------------------------------------
# These never touch the real filesystem — they exist purely so the right-click
# menu has somewhere functional-looking to "call", returning a toast partial.

def dummy_action(request):
    action = request.GET.get("action", "action")
    name = request.GET.get("name", "item")
    labels = {
        "open": f'Opening "{name}"…',
        "rename": f'Rename "{name}" — dummy dialog would appear here.',
        "copy": f'Copied "{name}" to clipboard (dummy).',
        "cut": f'Cut "{name}" — ready to paste (dummy).',
        "download": f'Downloading "{name}" (dummy).',
        "delete": f'Deleted "{name}" (dummy — no files were harmed).',
        "properties": f'Properties for "{name}" (dummy).',
        "new-folder": "New folder created (dummy).",
        "paste": "Pasted item(s) here (dummy).",
    }
    message = labels.get(action, f'"{action}" triggered for "{name}" (dummy).')
    return render(request, "explorer/partials/toast.html", {"message": message, "action": action})