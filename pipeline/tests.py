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
    Flow,
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


class FlowEngineTests(TestCase):
    """The graph walker: branching, endings, malformed input, loops."""

    def setUp(self):
        from .flows import engine

        self.engine = engine
        self.ctx = lambda **meta: engine.FlowContext(
            working_path="/media/Show.S01E01.mkv",
            relative_path="Show.S01E01.mkv",
            metadata={"video_codec": "h264", "height": 1080, "bitrate_kbps": 9000,
                      "size_bytes": 4_000_000_000, "container": "matroska", **meta},
        )

    def test_default_graph_is_valid_out_of_the_box(self):
        """A new flow should open without warnings."""
        self.assertEqual(self.engine.validate(self.engine.default_graph()), [])

    def test_condition_picks_the_no_branch(self):
        ctx = self.ctx(video_codec="h264")
        result = self.engine.run(self.engine.default_graph(), ctx)
        taken = [(s["label"], s["output_label"]) for s in result.trace]
        self.assertIn(("Video codec is", "No"), taken)
        self.assertTrue(result.needs_work)

    def test_condition_picks_the_yes_branch(self):
        ctx = self.ctx(video_codec="hevc")
        result = self.engine.run(self.engine.default_graph(), ctx)
        self.assertFalse(result.needs_work)
        self.assertEqual(result.reason, "Already HEVC")

    def test_dry_run_plans_instead_of_encoding(self):
        """The transcode node must not shell out during a dry run."""
        with mock.patch("pipeline.ffmpeg.run") as runner:
            result = self.engine.run(self.engine.default_graph(), self.ctx())
        runner.assert_not_called()
        self.assertEqual(result.ctx.planned, ["Transcode to hevc in mkv"])

    def test_a_loop_is_stopped_rather_than_hanging_a_worker(self):
        graph = {
            "nodes": [{"id": "a", "type": "input_file", "x": 0, "y": 0, "config": {}},
                      {"id": "b", "type": "log_message", "x": 0, "y": 0, "config": {}}],
            "edges": [{"from": "a", "output": 1, "to": "b"},
                      {"from": "b", "output": 1, "to": "a"}],
        }
        result = self.engine.run(graph, self.ctx())
        self.assertTrue(result.failed)
        self.assertEqual(len(result.trace), self.engine.MAX_STEPS)

    def test_graph_without_an_input_node_is_refused(self):
        with self.assertRaises(self.engine.FlowError):
            self.engine.run({"nodes": [], "edges": []}, self.ctx())

    def test_fail_node_marks_the_flow_failed(self):
        graph = {
            "nodes": [{"id": "a", "type": "input_file", "x": 0, "y": 0, "config": {}},
                      {"id": "b", "type": "fail_flow", "x": 0, "y": 0,
                       "config": {"reason": "Nope"}}],
            "edges": [{"from": "a", "output": 1, "to": "b"}],
        }
        result = self.engine.run(graph, self.ctx())
        self.assertTrue(result.failed)
        self.assertEqual(result.reason, "Nope")


class FlowEditorTests(TestCase):
    def setUp(self):
        from .flows import engine

        self.flow = Flow.objects.create(name="Test flow", graph=engine.default_graph())

    def test_save_drops_unknown_nodes_and_dangling_edges(self):
        """The canvas is user input — never store something a worker can't run."""
        payload = {
            "graph": {
                "nodes": [
                    {"id": "a", "type": "input_file", "x": 1, "y": 2, "config": {}},
                    {"id": "z", "type": "made_up_node", "x": 0, "y": 0, "config": {}},
                ],
                "edges": [{"from": "a", "output": 1, "to": "ghost"}],
            }
        }
        response = self.client.post(
            f"/flows/{self.flow.pk}/save/", payload, content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.flow.refresh_from_db()
        self.assertEqual([n["type"] for n in self.flow.graph["nodes"]], ["input_file"])
        self.assertEqual(self.flow.graph["edges"], [])

    def test_save_strips_config_keys_the_node_does_not_declare(self):
        payload = {"graph": {"nodes": [{"id": "a", "type": "bitrate_above", "x": 0, "y": 0,
                                        "config": {"kbps": 5000, "evil": "x"}}], "edges": []}}
        self.client.post(f"/flows/{self.flow.pk}/save/", payload, content_type="application/json")
        self.flow.refresh_from_db()
        self.assertEqual(self.flow.graph["nodes"][0]["config"], {"kbps": 5000})

    def test_save_bumps_the_revision(self):
        before = self.flow.revision
        self.client.post(
            f"/flows/{self.flow.pk}/save/",
            {"graph": {"nodes": [], "edges": []}},
            content_type="application/json",
        )
        self.flow.refresh_from_db()
        self.assertEqual(self.flow.revision, before + 1)

    def test_test_run_returns_the_path_a_real_file_took(self):
        profile = TranscodeProfile.objects.create(name="P", video_codec="hevc")
        library = Library.objects.create(name="L", path="/tmp", profile=profile, flow=self.flow)
        media_file = MediaFile.objects.create(
            library=library, path="/tmp/a.mkv", rel_path="a.mkv",
            video_codec="h264", container="matroska", height=1080, size_bytes=100,
        )
        response = self.client.post(
            f"/flows/{self.flow.pk}/test/",
            {"file_id": media_file.pk, "graph": self.flow.graph},
            content_type="application/json",
        )
        data = response.json()
        self.assertTrue(data["needs_work"])
        self.assertEqual([s["output_label"] for s in data["trace"]][:2], ["File", "No"])

    def test_editor_page_ships_the_node_registry(self):
        response = self.client.get(f"/flows/{self.flow.pk}/")
        self.assertContains(response, "transcode_video")
        self.assertContains(response, "id=\"node-types\"")
