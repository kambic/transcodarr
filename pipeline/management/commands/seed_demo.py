"""Populate the app with plausible data so the UI has something to show.

    ./manage.py seed_demo --files 120

Creates real (tiny, empty) files in a temp folder so scanning and the file
browser work end to end. Probing them will fail unless ffmpeg is installed —
pass --fake-probe to write metadata directly instead of shelling out.
"""

import random
from pathlib import Path

from django.core.management.base import BaseCommand
from django.utils import timezone

from pipeline.flows import engine
from pipeline.models import (
    Container,
    Flow,
    FileStatus,
    HWAccel,
    Job,
    JobKind,
    JobState,
    Library,
    MediaFile,
    TranscodeProfile,
    Verdict,
    Worker,
)

SHOWS = [
    "Deep Field/Season 01/Deep Field - S01E{n:02d}",
    "Deep Field/Season 02/Deep Field - S02E{n:02d}",
    "The Long Quiet/Season 01/The Long Quiet - S01E{n:02d}",
    "Harbour Lights/Season 03/Harbour Lights - S03E{n:02d}",
]
CODECS = ["h264", "h264", "h264", "hevc", "mpeg2video", "vp9"]
HEIGHTS = [480, 720, 1080, 1080, 1080, 2160]


class Command(BaseCommand):
    help = "Create demo profiles, a library, and sample media files."

    def add_arguments(self, parser):
        parser.add_argument("--files", type=int, default=80)
        parser.add_argument(
            "--path",
            default="/tmp/transcodarr-demo",
            help="Where to create the placeholder files.",
        )

    def handle(self, *args, **options):
        root = Path(options["path"])
        root.mkdir(parents=True, exist_ok=True)

        hevc, _ = TranscodeProfile.objects.get_or_create(
            name="HEVC 1080p",
            defaults={
                "video_codec": "hevc",
                "container": Container.MKV,
                "quality": 24,
                "preset": "medium",
                "max_height": 1080,
                "hw_accel": HWAccel.NONE,
            },
        )
        TranscodeProfile.objects.get_or_create(
            name="AV1 archive",
            defaults={
                "video_codec": "av1",
                "container": Container.MKV,
                "quality": 32,
                "preset": "6",
            },
        )

        flow, _ = Flow.objects.get_or_create(
            name="Everything to HEVC",
            defaults={
                "description": "Leave HEVC alone, re-encode the rest. Edit it on the Flows page.",
                "graph": engine.default_graph(),
            },
        )

        library, _ = Library.objects.get_or_create(
            name="TV shows",
            defaults={
                "path": str(root),
                "profile": hevc,
                "flow": flow,
                "last_scan_finished_at": timezone.now(),
            },
        )

        created = 0
        for index in range(options["files"]):
            template = SHOWS[index % len(SHOWS)]
            rel = f"{template.format(n=index // len(SHOWS) + 1)}.mkv"
            full = root / rel
            full.parent.mkdir(parents=True, exist_ok=True)
            full.touch(exist_ok=True)

            codec = random.choice(CODECS)
            height = random.choice(HEIGHTS)
            size = random.randint(700, 9000) * 1_000_000
            needs = codec != "hevc" or height > 1080

            media_file, made = MediaFile.objects.get_or_create(
                path=str(full),
                defaults={
                    "library": library,
                    "rel_path": rel,
                    "size_bytes": size,
                    "original_size_bytes": size,
                    "container": "matroska",
                    "video_codec": codec,
                    "audio_codec": random.choice(["aac", "ac3", "eac3", "dts"]),
                    "width": int(height * 16 / 9),
                    "height": height,
                    "duration_seconds": random.randint(1200, 3600),
                    "bitrate_kbps": random.randint(1500, 18000),
                    "status": FileStatus.QUEUED if needs else FileStatus.READY,
                    "verdict": (
                        Verdict.NEEDS_TRANSCODE if needs else Verdict.MEETS_TARGET
                    ),
                    "verdict_reason": (
                        f"Video is {codec}, target is hevc"
                        if needs
                        else "Already hevc in mkv"
                    ),
                    "last_probed_at": timezone.now(),
                },
            )
            created += int(made)

        # A few finished jobs so the dashboard has history and savings to show.
        worker, _ = Worker.objects.get_or_create(
            name="demo-worker",
            defaults={"hostname": "localhost", "last_heartbeat": timezone.now()},
        )
        for media_file in MediaFile.objects.filter(verdict=Verdict.MEETS_TARGET)[:12]:
            after = int(media_file.size_bytes * random.uniform(0.42, 0.72))
            MediaFile.objects.filter(pk=media_file.pk).update(
                size_bytes=after,
                original_size_bytes=media_file.size_bytes,
                status=FileStatus.TRANSCODED,
            )
            Job.objects.get_or_create(
                media_file=media_file,
                kind=JobKind.TRANSCODE,
                defaults={
                    "library": media_file.library,
                    "state": JobState.SUCCEEDED,
                    "progress": 100,
                    "worker": worker,
                    "size_before": media_file.size_bytes,
                    "size_after": after,
                    "started_at": timezone.now(),
                    "finished_at": timezone.now(),
                    "log": "[demo] transcoded",
                },
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {created} files under {root}. Open http://127.0.0.1:8000/ to see them."
            )
        )
