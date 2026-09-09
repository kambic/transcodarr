from pathlib import Path

from django import forms

from .models import TranscodeProfile
from files.models import Library

INPUT = (
    "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg "
    "focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 "
    "dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white "
    "dark:focus:ring-cyan-500 dark:focus:border-cyan-500"
)
CHECKBOX = (
    "w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500 "
    "dark:bg-gray-700 dark:border-gray-600"
)


class FlowbiteFormMixin:
    """Apply Flowbite input classes without repeating them per field."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            widget = field.widget
            if isinstance(widget, forms.CheckboxInput):
                widget.attrs.setdefault("class", CHECKBOX)
            else:
                widget.attrs.setdefault("class", INPUT)


class LibraryForm(FlowbiteFormMixin, forms.ModelForm):
    class Meta:
        model = Library
        fields = [
            "name",
            "path",
            "profile",
            "flow",
            "extensions",
            "scan_interval_minutes",
            "auto_queue",
            "enabled",
        ]
        widgets = {
            "path": forms.TextInput(attrs={"placeholder": "/media/tv"}),
            "name": forms.TextInput(attrs={"placeholder": "TV shows"}),
        }

    def clean_path(self) -> str:
        path = self.cleaned_data["path"].strip().rstrip("/")
        if not path.startswith("/"):
            raise forms.ValidationError("Use an absolute path, starting with /.")
        if not Path(path).is_dir():
            raise forms.ValidationError(
                "The worker cannot see a directory here. Check the path and any volume mounts."
            )
        return path

    def clean_extensions(self) -> str:
        raw = {
            e.strip().lower().lstrip(".")
            for e in self.cleaned_data["extensions"].split(",")
        }
        cleaned = sorted(e for e in raw if e)
        if not cleaned:
            raise forms.ValidationError("List at least one file extension.")
        return ",".join(cleaned)


class ProfileForm(FlowbiteFormMixin, forms.ModelForm):
    class Meta:
        model = TranscodeProfile
        fields = [
            "name",
            "video_codec",
            "container",
            "audio_codec",
            "quality",
            "preset",
            "hw_accel",
            "max_height",
            "max_bitrate_kbps",
            "extra_args",
        ]
