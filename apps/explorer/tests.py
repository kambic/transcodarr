from django.test import TestCase
from django.urls import reverse

from . import services
from .models import Node, Operation
from .services import OperationError


class TreeTests(TestCase):
    def setUp(self):
        self.root = Node.objects.create(name="My Drive", kind=Node.Kind.FOLDER)
        self.docs = Node.objects.create(
            parent=self.root, name="Docs", kind=Node.Kind.FOLDER
        )
        self.deep = Node.objects.create(
            parent=self.docs, name="2026", kind=Node.Kind.FOLDER
        )
        self.file = Node.objects.create(parent=self.deep, name="notes.md", size=100)

    def test_path_is_maintained(self):
        self.assertEqual(
            self.file.path,
            f"/{self.root.id}/{self.docs.id}/{self.deep.id}/{self.file.id}",
        )
        self.assertIn(self.file, self.root.descendants())

    def test_move_rewrites_descendant_paths(self):
        services.move(nodes=[self.deep], destination=self.root)
        self.file.refresh_from_db()
        self.assertTrue(self.file.path.startswith(f"/{self.root.id}/{self.deep.id}/"))
        self.assertIn(self.file, self.root.descendants())

    def test_cannot_move_folder_into_itself(self):
        with self.assertRaises(OperationError):
            services.move(nodes=[self.docs], destination=self.deep)

    def test_folder_size_sums_descendants(self):
        Node.objects.create(parent=self.deep, name="other.md", size=400)
        self.assertEqual(self.root.byte_size(), 500)

    def test_name_collisions_get_a_suffix(self):
        services.create_folder(parent=self.root, name="Docs")
        self.assertTrue(Node.objects.filter(parent=self.root, name="Docs (2)").exists())


class OperationLogTests(TestCase):
    def setUp(self):
        self.root = Node.objects.create(name="My Drive", kind=Node.Kind.FOLDER)
        self.file = Node.objects.create(parent=self.root, name="report.pdf", size=2048)

    def test_every_mutation_is_logged(self):
        services.rename(node=self.file, name="report-final.pdf")
        operation = Operation.objects.get()
        self.assertEqual(operation.kind, Operation.Kind.RENAME)
        self.assertEqual(operation.status, Operation.Status.DONE)
        self.assertEqual(operation.item_count, 1)
        item = operation.items.get()
        self.assertEqual(item.before["name"], "report.pdf")
        self.assertEqual(item.after["name"], "report-final.pdf")

    def test_undo_rename(self):
        operation = services.rename(node=self.file, name="renamed.pdf")
        services.undo(operation=operation)
        self.file.refresh_from_db()
        operation.refresh_from_db()
        self.assertEqual(self.file.name, "report.pdf")
        self.assertIsNotNone(operation.undone_at)
        self.assertFalse(operation.can_undo)

    def test_undo_move_returns_node_home(self):
        elsewhere = Node.objects.create(
            parent=self.root, name="Archive", kind=Node.Kind.FOLDER
        )
        operation = services.move(nodes=[self.file], destination=elsewhere)
        services.undo(operation=operation)
        self.file.refresh_from_db()
        self.assertEqual(self.file.parent, self.root)

    def test_undo_trash_restores(self):
        operation = services.trash(nodes=[self.file])
        self.assertIsNotNone(Node.objects.get(pk=self.file.pk).trashed_at)
        services.undo(operation=operation)
        self.assertIsNone(Node.objects.get(pk=self.file.pk).trashed_at)

    def test_undo_create_removes_the_folder(self):
        operation = services.create_folder(parent=self.root, name="Temp")
        services.undo(operation=operation)
        self.assertFalse(Node.objects.filter(name="Temp").exists())

    def test_purge_is_not_reversible(self):
        services.trash(nodes=[self.file])
        operation = services.purge(nodes=[self.file])
        self.assertFalse(operation.can_undo)
        self.assertEqual(
            operation.items.get().label, "report.pdf"
        )  # log survives the delete
        with self.assertRaises(OperationError):
            services.undo(operation=operation)

    def test_copy_duplicates_subtree(self):
        folder = Node.objects.create(
            parent=self.root, name="Source", kind=Node.Kind.FOLDER
        )
        Node.objects.create(parent=folder, name="a.txt", size=10)
        destination = Node.objects.create(
            parent=self.root, name="Target", kind=Node.Kind.FOLDER
        )
        services.copy(nodes=[folder], destination=destination)
        self.assertEqual(destination.descendants().count(), 2)


class ViewTests(TestCase):
    def setUp(self):
        self.root = Node.objects.create(name="My Drive", kind=Node.Kind.FOLDER)
        self.file = Node.objects.create(parent=self.root, name="brief.pdf", size=5000)

    def test_index_renders(self):
        response = self.client.get(reverse("explorer:index"))
        self.assertContains(response, "brief.pdf")

    def test_htmx_browse_returns_a_fragment(self):
        response = self.client.get(
            reverse("explorer:browse", args=[self.root.pk]),
            headers={"HX-Request": "true"},
        )
        self.assertNotContains(response, "<!DOCTYPE html>")
        self.assertContains(response, 'id="listing"')
        self.assertContains(response, "hx-swap-oob")  # sidebar + activity refresh

    def test_trash_operation_through_the_view(self):
        self.client.get(reverse("explorer:index"))  # establishes the session location
        response = self.client.post(
            reverse("explorer:op-trash"), {"ids": [str(self.file.pk)]}
        )
        self.assertEqual(response.status_code, 200)
        self.file.refresh_from_db()
        self.assertIsNotNone(self.file.trashed_at)
        self.assertEqual(Operation.objects.get().kind, Operation.Kind.TRASH)

    def test_search_returns_only_the_listing(self):
        self.client.get(reverse("explorer:index"))
        response = self.client.get(reverse("explorer:search"), {"q": "brief"})
        self.assertContains(response, "brief.pdf")
        self.assertNotContains(response, 'id="sidebar"')


# --------------------------------------------------------------------------- #
#  Share scanning
# --------------------------------------------------------------------------- #
import os
import tempfile
import unittest
import unittest.mock
from pathlib import Path

from django.test import override_settings

from .models import ScanRoot, ScanRun
from .scanning import scan


class ScanTests(TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.share = Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)

        self.root = Node.objects.create(name="My Drive", kind=Node.Kind.FOLDER)
        self.mirror = Node.objects.create(
            parent=self.root, name="Design share", kind=Node.Kind.FOLDER
        )
        self.scan_root = ScanRoot.objects.create(
            label="Design share",
            mount_path=str(self.share),
            node=self.mirror,
            require_mount=False,  # a temp dir is not a mount point
        )

    def write(self, rel, content=b"x" * 100):
        path = self.share / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
        return path

    def test_imports_tree_structure(self):
        self.write("Logos/mark.svg")
        self.write("Logos/Archive/old.svg")
        self.write("brief.pdf")

        run = scan(self.scan_root)

        self.assertEqual(run.status, ScanRun.Status.DONE)
        self.assertEqual(run.created, 5)  # 2 folders + 3 files
        self.assertEqual(self.mirror.descendants().count(), 5)
        imported = Node.objects.get(rel_path="Logos/Archive/old.svg")
        self.assertEqual(imported.origin, Node.Origin.SCANNED)
        self.assertEqual(imported.parent.name, "Archive")
        self.assertTrue(imported.path.startswith(self.mirror.path))
        self.assertEqual(
            imported.source_path, str(self.share / "Logos/Archive/old.svg")
        )

    def test_rescan_is_idempotent(self):
        self.write("a.txt")
        scan(self.scan_root)
        run = scan(self.scan_root)
        self.assertEqual(run.created, 0)
        self.assertEqual(run.updated, 0)
        self.assertEqual(Node.objects.filter(rel_path="a.txt").count(), 1)

    def test_detects_changed_size(self):
        path = self.write("a.txt", b"short")
        scan(self.scan_root)
        path.write_bytes(b"much longer content here")
        run = scan(self.scan_root)
        self.assertEqual(run.updated, 1)
        self.assertEqual(Node.objects.get(rel_path="a.txt").size, 24)

    def test_excludes_junk(self):
        self.write("Thumbs.db")
        self.write(".hidden")
        self.write("~$draft.docx")
        self.write("real.txt")
        run = scan(self.scan_root)
        self.assertEqual(run.created, 1)
        self.assertEqual(run.skipped, 3)

    def test_missing_files_are_flagged_not_deleted(self):
        self.write("a.txt")
        self.write("b.txt")
        self.write("c.txt")
        self.write("d.txt")
        self.write("e.txt")
        scan(self.scan_root)
        os.remove(self.share / "a.txt")

        run = scan(self.scan_root)

        self.assertEqual(run.vanished, 1)
        node = Node.objects.get(rel_path="a.txt")
        self.assertIsNotNone(node.missing_since)
        self.assertIsNone(node.trashed_at)  # default policy only flags
        self.assertEqual(
            Operation.objects.filter(kind=Operation.Kind.VANISHED)
            .get()
            .items.get()
            .label,
            "a.txt",
        )

    def test_returning_file_clears_the_missing_flag(self):
        for name in "abcde":
            self.write(f"{name}.txt")
        scan(self.scan_root)
        os.remove(self.share / "a.txt")
        scan(self.scan_root)
        self.write("a.txt")

        scan(self.scan_root)

        self.assertIsNone(Node.objects.get(rel_path="a.txt").missing_since)

    def test_mass_disappearance_aborts_instead_of_deleting(self):
        for name in "abcdefghij":
            self.write(f"{name}.txt")
        scan(self.scan_root)
        for name in "abcdefgh":
            os.remove(self.share / f"{name}.txt")

        run = scan(self.scan_root)

        self.assertEqual(run.status, ScanRun.Status.ABORTED)
        self.assertEqual(run.vanished, 0)
        self.assertFalse(Node.objects.missing().exists())
        self.assertIn("mount problem", run.message)

    def test_unreachable_share_changes_nothing(self):
        self.write("a.txt")
        scan(self.scan_root)
        ScanRoot.objects.filter(pk=self.scan_root.pk).update(
            mount_path="/nonexistent/share"
        )
        self.scan_root.refresh_from_db()

        run = scan(self.scan_root)

        self.assertEqual(run.status, ScanRun.Status.UNAVAILABLE)
        self.assertEqual(Node.objects.filter(rel_path="a.txt").count(), 1)
        self.assertFalse(Node.objects.missing().exists())

    def test_require_mount_rejects_a_plain_directory(self):
        ScanRoot.objects.filter(pk=self.scan_root.pk).update(require_mount=True)
        self.scan_root.refresh_from_db()
        self.assertEqual(scan(self.scan_root).status, ScanRun.Status.UNAVAILABLE)

    def test_trash_policy_moves_missing_files_to_trash(self):
        ScanRoot.objects.filter(pk=self.scan_root.pk).update(
            missing_policy=ScanRoot.MissingPolicy.TRASH
        )
        self.scan_root.refresh_from_db()
        for name in "abcde":
            self.write(f"{name}.txt")
        scan(self.scan_root)
        os.remove(self.share / "a.txt")

        scan(self.scan_root)

        self.assertIsNotNone(Node.objects.get(rel_path="a.txt").trashed_at)

    def test_symlinks_are_skipped_by_default(self):
        self.write("real.txt")
        os.symlink(self.share / "real.txt", self.share / "link.txt")
        run = scan(self.scan_root)
        self.assertEqual(run.created, 1)
        self.assertEqual(run.skipped, 1)

    def test_scandir_failure_is_recorded_not_fatal(self):
        """A directory that can't be read costs one error, not the whole scan."""
        self.write("open/file.txt")
        self.write("top.txt")
        real_scandir = os.scandir

        def flaky(path):
            if str(path).endswith("open"):
                raise PermissionError(13, "Permission denied")
            return real_scandir(path)

        with unittest.mock.patch("explorer.scanning.os.scandir", side_effect=flaky):
            run = scan(self.scan_root)

        self.assertEqual(run.status, ScanRun.Status.DONE)
        self.assertEqual(run.errors, 1)
        self.assertIn("Permission denied", run.problems[0])
        self.assertTrue(Node.objects.filter(rel_path="top.txt").exists())

    @unittest.skipIf(os.geteuid() == 0, "root ignores directory permissions")
    def test_unreadable_directory_is_recorded_not_fatal(self):
        self.write("open/file.txt")
        locked = self.share / "locked"
        locked.mkdir()
        (locked / "secret.txt").write_bytes(b"hi")
        os.chmod(locked, 0o000)
        self.addCleanup(os.chmod, locked, 0o755)

        run = scan(self.scan_root)

        self.assertEqual(run.status, ScanRun.Status.DONE)
        self.assertEqual(run.errors, 1)
        self.assertTrue(run.problems)
        self.assertTrue(Node.objects.filter(rel_path="open/file.txt").exists())

    def test_max_depth_limits_the_walk(self):
        self.write("one/two/three/deep.txt")
        ScanRoot.objects.filter(pk=self.scan_root.pk).update(max_depth=2)
        self.scan_root.refresh_from_db()
        scan(self.scan_root)
        self.assertTrue(Node.objects.filter(rel_path="one/two").exists())
        self.assertFalse(Node.objects.filter(rel_path="one/two/three").exists())

    def test_scan_writes_an_operation_to_the_audit_log(self):
        self.write("a.txt")
        run = scan(self.scan_root)
        operation = Operation.objects.get(kind=Operation.Kind.IMPORT)
        self.assertEqual(operation.status, Operation.Status.DONE)
        self.assertEqual(operation.items.count(), 1)
        self.assertEqual(run.operation, operation)
        self.assertFalse(operation.can_undo)

    def test_read_only_share_refuses_mutations(self):
        self.write("a.txt")
        scan(self.scan_root)
        node = Node.objects.get(rel_path="a.txt")
        with self.assertRaises(OperationError):
            services.rename(node=node, name="b.txt")
        with self.assertRaises(OperationError):
            services.trash(nodes=[node])

    def test_writable_share_allows_mutations(self):
        ScanRoot.objects.filter(pk=self.scan_root.pk).update(read_only=False)
        self.write("a.txt")
        scan(self.scan_root)
        node = Node.objects.get(rel_path="a.txt")
        services.rename(node=node, name="b.txt")
        self.assertEqual(Node.objects.get(pk=node.pk).name, "b.txt")

    def test_adopts_a_manually_created_node_with_the_same_name(self):
        Node.objects.create(parent=self.mirror, name="a.txt", size=0)
        self.write("a.txt")
        scan(self.scan_root)
        node = Node.objects.get(parent=self.mirror, name="a.txt")
        self.assertEqual(
            Node.objects.filter(parent=self.mirror, name="a.txt").count(), 1
        )
        self.assertEqual(node.origin, Node.Origin.SCANNED)
        self.assertEqual(node.size, 100)

    def test_task_entrypoint(self):
        from .tasks import scan_share

        self.write("a.txt")
        result = scan_share.enqueue(str(self.scan_root.pk))
        self.assertEqual(result.return_value["created"], 1)
        self.assertTrue(ScanRun.objects.filter(scan_root=self.scan_root).exists())

    def test_scan_start_view(self):
        self.write("a.txt")
        self.client.get(reverse("explorer:index"))
        response = self.client.post(
            reverse("explorer:scan-start", args=[self.scan_root.pk])
        )
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Design share")
        self.assertEqual(ScanRun.objects.get().status, ScanRun.Status.DONE)
