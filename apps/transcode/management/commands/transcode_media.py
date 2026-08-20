"""Convert media from the command line.

    ./manage.py transcode_media --presets
    ./manage.py transcode_media "Fjord Athletics" --preset web-1080p
    ./manage.py transcode_media --all-media --preset audio-only --dry-run
"""

from django.core.management.base import BaseCommand, CommandError

from explorer.models import Node

from transcode import services
from transcode.models import Preset
from transcode.tasks import run_transcode


class Command(BaseCommand):
    help = "Queue transcode jobs for files or folders."

    def add_arguments(self, parser):
        parser.add_argument("name", nargs="?", help="Name of a file or folder in the tree.")
        parser.add_argument("--preset", help="Preset slug.")
        parser.add_argument("--presets", action="store_true", help="List presets and exit.")
        parser.add_argument("--all-media", action="store_true", help="Every media file in the tree.")
        parser.add_argument("--dry-run", action="store_true", help="Show what would be queued.")
        parser.add_argument("--wait", action="store_true", help="Run jobs inline instead of enqueueing.")

    def handle(self, *args, **options):
        if options["presets"]:
            for preset in Preset.objects.all():
                mark = " " if preset.enabled else "-"
                self.stdout.write(f"{mark} {preset.slug:<16} {preset.label} ({preset.summary})")
            return

        if not options["preset"]:
            raise CommandError("Pass --preset SLUG, or --presets to see what's available.")
        try:
            preset = Preset.objects.get(slug=options["preset"], enabled=True)
        except Preset.DoesNotExist:
            raise CommandError(f"No enabled preset {options['preset']!r}.")

        if options["all_media"]:
            nodes = [n for n in Node.objects.alive().files() if services.is_media(n)]
        elif options["name"]:
            nodes = list(Node.objects.alive().filter(name=options["name"]))
            if not nodes:
                raise CommandError(f"Nothing named {options['name']!r}.")
        else:
            raise CommandError("Give a file or folder name, or --all-media.")

        targets = services.expand(nodes)
        if options["dry_run"]:
            for node in targets:
                self.stdout.write(f"would convert {node.name} → {preset.output_name(node.name)}")
            self.stdout.write(self.style.WARNING(f"{len(targets)} file(s), nothing queued."))
            return

        report = services.queue(nodes=nodes, preset=preset)
        for job in report["queued"]:
            if options["wait"]:
                claimed = services.claim(str(job.pk))
                done = services.run(claimed) if claimed else job
                style = self.style.SUCCESS if done.status == "done" else self.style.ERROR
                self.stdout.write(style(f"{done.source.name}: {done.status} — {done.headline()}"))
            else:
                run_transcode.enqueue(str(job.pk))

        self.stdout.write(
            self.style.SUCCESS(
                f"{len(report['queued'])} queued, {report['duplicate']} already pending, "
                f"{report['skipped']} skipped"
            )
        )
