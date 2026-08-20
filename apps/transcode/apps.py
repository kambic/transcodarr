from django.apps import AppConfig
from django.core.checks import Warning, register


class TranscodeConfig(AppConfig):
    name = "transcode"
    verbose_name = "Media transcoding"

    def ready(self):
        register(check_ffmpeg)


def check_ffmpeg(app_configs, **kwargs):
    """Surface a missing ffmpeg at check time instead of at job time."""
    from . import ffmpeg

    if ffmpeg.available():
        return []
    return [
        Warning(
            "ffmpeg or ffprobe was not found on PATH.",
            hint="Install ffmpeg, or set TRANSCODE['FFMPEG'] and TRANSCODE['FFPROBE']. "
                 "Transcode jobs will fail with a clear error until then.",
            id="transcode.W001",
        )
    ]
