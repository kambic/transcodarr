"""Tests.

Task behaviour is tested by overriding TASKS with the immediate backend, so
enqueued work runs inline and assertions can look at the result directly. Swap
in `django.tasks.backends.dummy.DummyBackend` when you only care that something
was enqueued, not what it did.
"""

from unittest import mock

from django.test import TestCase, override_settings

from .models import (
    Container,
    FileStatus,
    Job,
    JobState,
    Library,
    MediaFile,
    TranscodeProfile,
    Verdict,
)
from .rules import evaluate

IMMEDIATE = {
    "default": {
        "BACKEND": "django.tasks.backends.immediate.ImmediateBackend",
        "QUEUES": ["default", "scan", "probe", "transcode"],
    }
}


class RuleTests(TestCase):
    def setUp(self):
        self.profile = TranscodeProfile(
            name="HEVC", video_codec="hevc", container=Container.MKV, max_height=1080
        )

    def test_wrong_codec_needs_transcode(self):
        decision = evaluate(MediaFile(video_codec="h264", container="matroska"), self.profile)
        self.assertTrue(decision.needs_transcode)
        self.assertIn("h264", decision.reason)

    def test_matching_file_passes(self):
        decision = evaluate(
            MediaFile(video_codec="hevc", container="matroska", height=1080), self.profile
        )
        self.assertFalse(decision.needs_transcode)

    def test_container_aliases_are_accepted(self):
        """ffprobe reports MKV as "matroska" — that must not count as a mismatch."""
        decision = evaluate(MediaFile(video_codec="hevc", container="matroska"), self.profile)
        self.assertFalse(decision.needs_transcode)

    def test_oversized_height_is_flagged(self):
        decision = evaluate(
            MediaFile(video_codec="hevc", container="mkv", height=2160), self.profile
        )
        self.assertTrue(decision.needs_transcode)
        self.assertIn("2160", decision.reason)


@override_settings(TASKS=IMMEDIATE)
class ProbeTaskTests(TestCase):
    def setUp(self):
        profile = TranscodeProfile.objects.create(name="HEVC", video_codec="hevc")
        self.library = Library.objects.create(
            name="TV", path="/tmp", profile=profile, auto_queue=False
        )
        self.file = MediaFile.objects.create(
            library=self.library, path="/tmp/a.mkv", rel_path="a.mkv", size_bytes=100
        )

    def test_probe_records_metadata_and_verdict(self):
        from . import ffmpeg
        from .tasks import probe_file

        fake = ffmpeg.Probe(
            container="matroska", video_codec="h264", audio_codec="aac",
            width=1920, height=1080, duration_seconds=60.0, size_bytes=100,
        )
        with mock.patch("pipeline.ffmpeg.probe", return_value=fake):
            probe_file.enqueue(self.file.pk)

        self.file.refresh_from_db()
        self.assertEqual(self.file.video_codec, "h264")
        self.assertEqual(self.file.verdict, Verdict.NEEDS_TRANSCODE)
        # auto_queue is off, so nothing should have been queued.
        self.assertEqual(Job.objects.filter(kind="transcode").count(), 0)

    def test_unreadable_file_is_marked_not_silently_passed(self):
        from . import ffmpeg
        from .tasks import probe_file

        with mock.patch("pipeline.ffmpeg.probe", side_effect=ffmpeg.ProbeError("bad header")):
            probe_file.enqueue(self.file.pk)

        self.file.refresh_from_db()
        self.assertEqual(self.file.status, FileStatus.ERROR)
        self.assertEqual(self.file.verdict, Verdict.UNREADABLE)
        self.assertEqual(Job.objects.get(kind="probe").state, JobState.FAILED)


class ViewTests(TestCase):
    def setUp(self):
        profile = TranscodeProfile.objects.create(name="HEVC", video_codec="hevc")
        self.library = Library.objects.create(name="TV", path="/tmp", profile=profile)
        self.file = MediaFile.objects.create(
            library=self.library, path="/tmp/a.mkv", rel_path="a.mkv",
            video_codec="h264", verdict=Verdict.NEEDS_TRANSCODE, size_bytes=100,
        )

    def test_htmx_request_returns_only_the_fragment(self):
        full = self.client.get("/files/")
        fragment = self.client.get("/files/", headers={"HX-Request": "true"})
        self.assertContains(full, "<html")
        self.assertNotContains(fragment, "<html")
        self.assertContains(fragment, 'id="file-results"')

    def test_queue_partial_polls_itself(self):
        response = self.client.get("/hx/queue/", headers={"HX-Request": "true"})
        self.assertContains(response, 'hx-trigger="every 2s"')

    def test_library_form_rejects_a_path_that_is_not_a_directory(self):
        response = self.client.post(
            "/libraries/new/",
            {"name": "X", "path": "/definitely/not/here", "profile": self.library.profile_id,
             "extensions": "mkv", "scan_interval_minutes": 60},
            headers={"HX-Request": "true"},
        )
        self.assertEqual(response.status_code, 422)
        self.assertContains(response, "cannot see a directory", status_code=422)
