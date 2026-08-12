"""Populate a demo drive: ./manage.py seed_demo --reset"""

import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from explorer.models import Node, Operation

TREE = {
    "Clients": {
        "Northwind Coffee": {
            "brand-guidelines-v4.pdf": (8_412_000, 2),
            "logo-lockup.svg": (24_300, 2, True),
            "packaging-mockup.png": (4_120_450, 5),
            "contract-2026.docx": (91_200, 41),
            "Photography": {
                "roastery-01.jpg": (6_290_000, 9),
                "roastery-02.jpg": (5_880_000, 9),
                "barista-portrait.jpg": (7_010_000, 9, True),
            },
        },
        "Halden Bank": {
            "rebrand-proposal.key": (22_900_000, 1),
            "audit-notes.md": (12_400, 3),
            "invoice-0142.pdf": (148_000, 12),
        },
        "Fjord Athletics": {
            "campaign-cut.mp4": (412_000_000, 6),
            "soundbed.wav": (38_400_000, 6),
            "shotlist.xlsx": (64_000, 7),
        },
    },
    "Design system": {
        "tokens.json": (18_700, 0, True),
        "components.fig": (96_400_000, 1),
        "icons.zip": (2_240_000, 30),
        "Specs": {
            "buttons.md": (9_100, 4),
            "forms.md": (14_600, 4),
            "motion.md": (7_800, 22),
        },
    },
    "Engineering": {
        "explorer.js": (42_800, 0),
        "theme.css": (11_300, 0),
        "deploy.sh": (2_100, 15),
        "README.md": (5_400, 15),
    },
    "Admin": {
        "payroll-q2.xlsx": (220_000, 18),
        "office-lease.pdf": (1_640_000, 120),
        "insurance.pdf": (890_000, 200),
    },
    "quarterly-review.pdf": (3_200_000, 3, True),
    "team-photo.jpg": (9_400_000, 60),
    "scratch.txt": (900, 0),
}


class Command(BaseCommand):
    help = "Create a demo folder tree to click around in."

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="Delete existing nodes first.")

    @transaction.atomic
    def handle(self, *args, **options):
        if options["reset"]:
            Operation.objects.all().delete()
            Node.objects.all().delete()

        if Node.objects.exists():
            self.stdout.write(self.style.WARNING("Nodes already exist. Use --reset to start over."))
            return

        root = Node.objects.create(name="My Drive", kind=Node.Kind.FOLDER)
        created = self.build(TREE, root)
        self.stdout.write(self.style.SUCCESS(f"Created {created} nodes under {root.name}."))

    def build(self, spec: dict, parent: Node) -> int:
        count = 0
        for name, value in spec.items():
            if isinstance(value, dict):
                folder = Node.objects.create(parent=parent, name=name, kind=Node.Kind.FOLDER)
                count += 1 + self.build(value, folder)
            else:
                size, days, *starred = value
                node = Node.objects.create(
                    parent=parent,
                    name=name,
                    kind=Node.Kind.FILE,
                    size=size,
                    starred=bool(starred and starred[0]),
                )
                stamp = timezone.now() - timedelta(days=days, hours=random.randint(0, 20))
                Node.objects.filter(pk=node.pk).update(modified_at=stamp, created_at=stamp)
                count += 1
        return count
