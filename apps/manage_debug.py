#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""

import os
import sys
from pathlib import Path


def main():
    """Run administrative tasks."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

    # Initialize debugpy for Zed debugging (DEBUG mode only)
    from django.conf import settings

    if settings.DEBUG:
        # Prevent multiple debugpy listeners during auto-reload
        # RUN_MAIN=true is set by Django's watchdog reloader
        if os.environ.get("RUN_MAIN") == "true" or "runserver" in sys.argv:
            try:
                import debugpy

                # Check if already connected to avoid duplicate listeners
                if not debugpy.is_client_connected():
                    debugpy.listen(("127.0.0.1", 5678))
                    print("🐛 Debugpy listening on 127.0.0.1:5678")
                    print(
                        "   Attach debugger with: Ctrl+Shift+D → 'Attach to Running Process'"
                    )
            except ImportError:
                # debugpy not installed, continue without it
                pass
            except Exception as e:
                # Log but don't crash if debugpy fails
                print(f"⚠️  Debugpy warning: {e}")

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
