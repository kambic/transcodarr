import shutil
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

TREE = {
    "Media": {
        "Movies": {
            "Inception (2010).mkv": 2_147_483_648,
            "Dune Part Two (2024).mp4": 4_294_967_296,
            "poster.jpg": 184_320,
        },
        "Shows": {
            "Season 01": {
                "episode-01.mp4": 734_003_200,
                "episode-02.mp4": 745_537_536,
            },
            "Season 02": {
                "episode-01.mp4": 812_374_016,
            },
        },
        "Subtitles": {
            "inception.en.srt": 48_213,
            "inception.fr.srt": 51_002,
        },
    },
    "Offers": {
        "Exports": {
            "offers_export_2025-05-21.csv": 92_412,
            "offers_export_2025-05-14.csv": 88_004,
        },
        "Templates": {
            "vod_catalogue_template.json": 4_112,
        },
    },
    "Providers": {
        "Blitz": {
            "contract.pdf": 512_004,
            "logo.png": 22_310,
        },
        "HBO": {
            "contract.pdf": 498_221,
        },
        "Playboy": {},
        "Curiosity": {
            "logo.png": 18_774,
        },
    },
    "Reports": {
        "weekly-summary-2025-w20.pdf": 302_411,
        "weekly-summary-2025-w21.pdf": 298_004,
        "audit-log-export.csv": 1_204_887,
    },
    "readme.txt": 1_204,
}


class Command(BaseCommand):
    help = "Seed a dummy folder/file tree for the File Explorer demo (pathlib-based)."

    def add_arguments(self, parser):
        parser.add_argument("--flush", action="store_true", help="Delete existing tree first")

    def handle(self, *args, **options):
        root: Path = settings.EXPLORER_ROOT

        if options["flush"] and root.exists():
            shutil.rmtree(root)
            self.stdout.write(self.style.WARNING(f"Removed existing tree at {root}"))

        root.mkdir(parents=True, exist_ok=True)

        def build(node: dict, current: Path):
            for name, value in node.items():
                target = current / name
                if isinstance(value, dict):
                    target.mkdir(exist_ok=True)
                    build(value, target)
                else:
                    # Create a sparse file of the given dummy size without
                    # actually writing that many bytes to disk.
                    if not target.exists():
                        with target.open("wb") as fh:
                            if value > 0:
                                fh.seek(value - 1)
                                fh.write(b"\0")

        build(TREE, root)
        self.stdout.write(self.style.SUCCESS(f"Seeded dummy file tree at {root}"))