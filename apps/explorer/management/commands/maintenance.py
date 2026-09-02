"""Run the periodic background jobs from cron, a systemd timer, or by hand.

    ./manage.py maintenance                 # everything, with defaults
    ./manage.py maintenance --only probe
    ./manage.py maintenance --trash-days 7 --dry-run

Each step is one of the tasks defined in the apps; this command just gives a
service manager something to call. Steps are independent — one failing doesn't
stop the rest.
"""

from django.core.management.base import BaseCommand

STEPS = ("trash", "log", "stuck", "probe")


class Command(BaseCommand):
    help = "Run periodic maintenance: trash retention, log pruning, stuck jobs, media probes."

    def add_arguments(self, parser):
        parser.add_argument(
            "--only", choices=STEPS, action="append", help="Run just these steps."
        )
        parser.add_argument("--trash-days", type=int, default=30)
        parser.add_argument("--keep-operations", type=int, default=5_000)
        parser.add_argument("--stuck-minutes", type=int, default=180)
        parser.add_argument("--probe-limit", type=int, default=200)
        parser.add_argument(
            "--dry-run", action="store_true", help="Report what would run."
        )

    def handle(self, *args, **options):
        from explorer.tasks import prune_operation_log, purge_expired_trash
        from transcode.tasks import probe_pending, sweep_stuck_jobs

        steps = options["only"] or list(STEPS)
        plan = {
            "trash": (
                "purge trash older than %d days" % options["trash_days"],
                lambda: purge_expired_trash.enqueue(options["trash_days"]),
            ),
            "log": (
                "prune the operation log to %d rows" % options["keep_operations"],
                lambda: prune_operation_log.enqueue(options["keep_operations"]),
            ),
            "stuck": (
                "fail transcode jobs stalled over %d minutes"
                % options["stuck_minutes"],
                lambda: sweep_stuck_jobs.enqueue(options["stuck_minutes"]),
            ),
            "probe": (
                "probe up to %d unmeasured media files" % options["probe_limit"],
                lambda: probe_pending.enqueue(options["probe_limit"]),
            ),
        }

        for name in steps:
            description, run = plan[name]
            if options["dry_run"]:
                self.stdout.write(f"would {description}")
                continue
            try:
                result = run()
                self.stdout.write(self.style.SUCCESS(f"{name}: {result.return_value}"))
            except (
                Exception
            ) as exc:  # noqa: BLE001 — one bad step shouldn't stop the others
                self.stderr.write(
                    self.style.ERROR(f"{name}: {type(exc).__name__}: {exc}")
                )
