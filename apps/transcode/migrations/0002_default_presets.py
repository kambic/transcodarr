from django.db import migrations

PRESETS = [
    {
        "slug": "web-1080p",
        "label": "Web 1080p",
        "description": "H.264 MP4 that plays everywhere. Good default for review copies.",
        "media_kind": "video",
        "container": "mp4",
        "video_codec": "libx264",
        "crf": 23,
        "speed": "medium",
        "max_height": 1080,
        "audio_codec": "aac",
        "audio_bitrate": "128k",
        "suffix": "-1080p",
        "position": 10,
    },
    {
        "slug": "web-720p",
        "label": "Web 720p",
        "description": "Smaller H.264 MP4 for quick sharing and previews.",
        "media_kind": "video",
        "container": "mp4",
        "video_codec": "libx264",
        "crf": 24,
        "speed": "veryfast",
        "max_height": 720,
        "audio_codec": "aac",
        "audio_bitrate": "96k",
        "suffix": "-720p",
        "position": 20,
    },
    {
        "slug": "archive-h265",
        "label": "Archive H.265",
        "description": "Slower encode, roughly half the size. For footage you're keeping.",
        "media_kind": "video",
        "container": "mp4",
        "video_codec": "libx265",
        "crf": 28,
        "speed": "slow",
        "audio_codec": "aac",
        "audio_bitrate": "128k",
        "suffix": "-h265",
        "extra_args": ["-tag:v", "hvc1"],  # so QuickTime will play it
        "position": 30,
    },
    {
        "slug": "proxy-480p",
        "label": "Editing proxy 480p",
        "description": "Tiny, fast to encode, for scrubbing through rushes.",
        "media_kind": "video",
        "container": "mp4",
        "video_codec": "libx264",
        "crf": 30,
        "speed": "ultrafast",
        "max_height": 480,
        "fps_cap": 25,
        "audio_codec": "aac",
        "audio_bitrate": "64k",
        "suffix": "-proxy",
        "position": 40,
    },
    {
        "slug": "remux-mp4",
        "label": "Remux to MP4",
        "description": "Rewraps the same streams into MP4. Near-instant, no quality loss.",
        "media_kind": "video",
        "container": "mp4",
        "video_codec": "copy",
        "audio_codec": "copy",
        "suffix": "",
        "position": 50,
    },
    {
        "slug": "audio-m4a",
        "label": "Audio only (M4A)",
        "description": "Strips the video and keeps an AAC track.",
        "media_kind": "audio",
        "container": "m4a",
        "video_codec": "none",
        "audio_codec": "aac",
        "audio_bitrate": "192k",
        "suffix": "",
        "position": 60,
    },
    {
        "slug": "audio-mp3",
        "label": "Audio to MP3",
        "description": "For anything that still needs MP3.",
        "media_kind": "audio",
        "container": "mp3",
        "video_codec": "none",
        "audio_codec": "libmp3lame",
        "audio_bitrate": "192k",
        "suffix": "",
        "position": 70,
    },
]


def create_presets(apps, schema_editor):
    Preset = apps.get_model("transcode", "Preset")
    for values in PRESETS:
        Preset.objects.update_or_create(slug=values["slug"], defaults=values)


def remove_presets(apps, schema_editor):
    Preset = apps.get_model("transcode", "Preset")
    Preset.objects.filter(slug__in=[p["slug"] for p in PRESETS]).delete()


class Migration(migrations.Migration):
    dependencies = [("transcode", "0001_initial")]
    operations = [migrations.RunPython(create_presets, remove_presets)]
