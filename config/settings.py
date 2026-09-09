"""Settings for Transcodarr — a Tdarr-style media transcode pipeline.

Django 6.1 · django.tasks · template partials · htmx · Flowbite
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-only-change-me")
DEBUG = os.environ.get("DJANGO_DEBUG", "1") == "1"
ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "*").split(",")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.humanize",
    # Third party
    "django_tasks_db",  # DatabaseBackend + `manage.py db_worker`
    "django_htmx",
    # "debug_toolbar",
    # Local
    'compressor',  # new
    "pipeline",
    "files.apps.FilesConfig",
    "dashboard.apps.DashboardConfig",
    "offers.apps.OffersConfig",
    "explorer.apps.ExplorerConfig",
    "transcode.apps.TranscodeConfig",
]

EXPLORER_ROOT = Path('/home/kamba/tmp')
TRANSCODE = {}
VAULT = { "QUOTA_BYTES" : 1_000_000 }
MIDDLEWARE = [
    # "debug_toolbar.middleware.DebugToolbarMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "django_htmx.middleware.HtmxMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "pipeline.context_processors.nav",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
        "OPTIONS": {
            # Workers hold write locks while updating job progress. WAL plus a
            # generous timeout keeps the web process responsive on SQLite.
            "init_command": "PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL;",
            "transaction_mode": "IMMEDIATE",
            "timeout": 20,
        },
    }
}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --------------------------------------------------------------------------
# Background tasks (django.tasks, new in Django 6.0)
# --------------------------------------------------------------------------
# Django ships only ImmediateBackend and DummyBackend. `django-tasks-db`
# supplies the persistent DatabaseBackend and the `db_worker` command.
# Set TASKS_BACKEND=immediate to run everything inline (handy for tests).
_BACKENDS = {
    "database": "django_tasks_db.DatabaseBackend",
    "immediate": "django.tasks.backends.immediate.ImmediateBackend",
    "dummy": "django.tasks.backends.dummy.DummyBackend",
}
TASKS = {
    "default": {
        "BACKEND": _BACKENDS[os.environ.get("TASKS_BACKEND", "database")],
        "QUEUES": ["default", "scan", "probe", "transcode"],
    }
}

# --------------------------------------------------------------------------
# Pipeline behaviour
# --------------------------------------------------------------------------
FFMPEG_BIN = os.environ.get("FFMPEG_BIN", "ffmpeg")
FFPROBE_BIN = os.environ.get("FFPROBE_BIN", "ffprobe")
# Where in-flight transcodes are written before replacing the source file.
TRANSCODE_CACHE_DIR = Path("/tmp/transcodarr")
TRANSCODE_CACHE_DIR.mkdir(parents=True, exist_ok=True)
# TRANSCODE_CACHE_DIR = Path(os.environ.get("TRANSCODE_CACHE_DIR", BASE_DIR / "cache"))
MAX_OUTPUT_SIZE_RATIO = float(os.environ.get("MAX_OUTPUT_SIZE_RATIO", "1.0"))
# How often the worker writes progress back to the database, in seconds.
PROGRESS_INTERVAL_SECONDS = 2.0
WORKER_OFFLINE_AFTER = 45

LANGUAGE_CODE = "en-us"
TIME_ZONE = os.environ.get("TZ", "UTC")
USE_I18N = True
USE_TZ = True

MEDIA_ROOT = 'media'
MEDIA_URL = '/media/'

STATIC_ROOT = BASE_DIR / "staticfiles"
# STORAGES = {
#     "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    # "staticfiles": {"BACKEND": "whitenoise.storage.CompressedStaticFilesStorage"},
# }

LOGIN_URL = "/admin/login/"
MESSAGE_STORAGE = "django.contrib.messages.storage.session.SessionStorage"

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
    "loggers": {
        "pipeline": {"level": os.environ.get("LOG_LEVEL", "INFO")},
        "django.db.backends": {"level": "WARNING"},
    },
}

COMPRESS_ROOT = BASE_DIR / 'static'



STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']

COMPRESS_ENABLED = True
COMPRESS_OUTPUT_DIR = 'CACHE'

# Retain script element attributes when compressing
# COMPRESS_JS_FILTERS = [
#     'compressor.filters.jsmin.JSMinFilter',
# ]
STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'compressor.finders.CompressorFinder',
]
# Ensure data attributes and type="module" are preserved
COMPRESS_DATA_URI_MAX_SIZE = 1024