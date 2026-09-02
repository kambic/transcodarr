"""Scan mounted shares from the command line or cron.

./manage.py scan_share --all
./manage.py scan_share "Design share" --full
./manage.py scan_share --register "Design share" /mnt/smb/design
"""

from django.core.management.base import BaseCommand, CommandError

from explorer.models import Node, ScanRoot, ScanRun
from explorer.scanning import scan


class Command(BaseCommand):
    help = "Scan a mounted share into the catalogue."

    def add_arguments(self, parser):
        parser.add_argument("label", nargs="?", help="Label of the share to scan.")
        parser.add_argument(
            "--all", action="store_true", help="Scan every enabled share."
        )
        parser.add_argument("--full", action="store_true", help="Re-read every entry.")
        parser.add_argument(
            "--register",
            nargs=2,
            metavar=("LABEL", "MOUNT_PATH"),
            help="Create a share pointing at a mount, then scan it.",
        )
        parser.add_argument(
            "--into", help="Name of the folder to mirror into. Defaults to the label."
        )

    def handle(self, *args, **options):
        if options["register"]:
            label, mount_path = options["register"]
            scan_root = self.register(label, mount_path, options.get("into") or label)
            roots = [scan_root]
        elif options["all"]:
            roots = list(ScanRoot.objects.filter(enabled=True))
        elif options["label"]:
            roots = list(ScanRoot.objects.filter(label=options["label"]))
            if not roots:
                raise CommandError(f"No share labelled {options['label']!r}.")
        else:
            raise CommandError("Give a label, or --all, or --register LABEL PATH.")

        for scan_root in roots:
            run = scan(scan_root, full=options["full"])
            style = (
                self.style.SUCCESS
                if run.status == ScanRun.Status.DONE
                else self.style.WARNING
            )
            self.stdout.write(
                style(
                    f"{scan_root.label}: {run.get_status_display().lower()} — "
                    f"{run.scanned} scanned, {run.created} new, {run.updated} changed, "
                    f"{run.vanished} gone, {run.errors} unreadable"
                )
            )
            if run.message:
                self.stdout.write(self.style.WARNING(f"  {run.message}"))
            for problem in run.problems:
                self.stdout.write(f"  ! {problem}")

    def register(self, label: str, mount_path: str, folder_name: str) -> ScanRoot:
        existing = ScanRoot.objects.filter(label=label).first()
        if existing:
            return existing
        drive = Node.objects.filter(parent__isnull=True, kind=Node.Kind.FOLDER).first()
        if drive is None:
            drive = Node.objects.create(name="My Drive", kind=Node.Kind.FOLDER)
        folder, _ = Node.objects.get_or_create(
            parent=drive, name=folder_name, defaults={"kind": Node.Kind.FOLDER}
        )
        return ScanRoot.objects.create(label=label, mount_path=mount_path, node=folder)
