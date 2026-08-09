#!/usr/bin/env python3
"""Convenience launcher so the tool can be run as ./vidprobe.py <command>."""

import sys

from vidprobe.cli import main

if __name__ == "__main__":
    sys.exit(main())
