# Vault — a Django 6 + HTMX file explorer

A server-rendered file manager with folder navigation, multi-select, batch
operations, drag and drop, and a full audit log of every mutation — with undo.
Catalogues mounted network shares, and converts media with ffmpeg in the
background.

Two apps: `explorer` (the tree, operations, share scanning) and `transcode`
(ffmpeg presets and jobs). `transcode` depends on `explorer`; nothing depends on
`transcode`, which reaches the UI through a context processor and one template
include.

## Run it

With Nix:

```bash
nix develop                         # Python 3.12, Django 6, ffmpeg, sqlite, ruff
python manage.py migrate
python manage.py seed_demo          # optional demo tree, --reset to rebuild
python manage.py runserver
```

Or without:

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate && python manage.py seed_demo && python manage.py runserver
```

Then open http://127.0.0.1:8000/. Requires Python 3.12+, Django 6.0, and ffmpeg
if you want the transcoding to work.

```bash
python manage.py test               # 75 tests
nix flake check                     # the same tests, in a sandbox
```

## Nix

```bash
nix develop            # dev shell
nix run .              # serve on 127.0.0.1:8000 under gunicorn
nix run .#manage -- migrate
nix run .#manage -- scan_share --register "Design" /mnt/smb/design
nix build .            # ./result/bin/{vault,vault-serve}
```

`nix develop` is `direnv`-friendly — there's an `.envrc`, so `direnv allow` gets
you the shell on `cd`.

The package installs the source tree plus two wrappers: `vault` is `manage.py`,
`vault-serve` is gunicorn. Both have ffmpeg on `PATH`, and static files are
collected at build time so nothing needs to be written at startup. Everything
the app writes lives under `$VAULT_DATA_DIR` (default: the project directory),
which is what lets the code itself sit read-only in the store.

The flake pins Django 6.0.7 from PyPI only if the channel doesn't already have
it — `django_6` or a `django` that's already 6.x is used as-is.

### Deploying on NixOS

```nix
{
  inputs.vault.url = "github:you/vault";

  outputs = { nixpkgs, vault, ... }: {
    nixosConfigurations.fileserver = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      modules = [
        vault.nixosModules.default
        {
          services.vault = {
            enable = true;
            allowedHosts = [ "vault.example.com" ];
            secretKeyFile = "/run/secrets/vault-key";
            shares = [ "/mnt/design" "/mnt/footage" ];
            scanInterval = "hourly";
          };
        }
      ];
    };
  };
}
```

The module runs migrations on activation, serves under gunicorn with
`--timeout 0` (encodes and share walks outlive any sane request timeout), and
adds two timers: an hourly `scan_share --all` and a daily `maintenance` pass
(trash retention, log pruning, stuck jobs, media probes) — both niced and on
idle IO so they stay out of the way.

`shares` does two things: `RequiresMountsFor`, so nothing starts before the
mounts are up, and `ReadOnlyPaths`, so the service can't write to them even by
accident. It doesn't mount anything — do that however you normally would.

One CIFS-specific gotcha: permissions on a CIFS mount are fixed at mount time,
so the mount needs `uid=vault` or a matching `gid=` for the service user to read
it. Everything else in the unit is hardened (`ProtectSystem=strict`,
`NoNewPrivileges`, private tmp and devices) with the state directory as the only
writable path.

## Django 6.0 features in use

| Feature | Where |
|---|---|
| **Template partials** (`{% partialdef %}`) | The entire UI lives in `templates/explorer/index.html`. Views render fragments by name: `render(request, "explorer/index.html#listing", ctx)` — no `partials/` directory, no template sprawl. |
| **Tasks framework** (`django.tasks`) | `explorer/tasks.py` — share scanning, trash retention sweeps, audit-log pruning. Runs inline on `ImmediateBackend`; point `TASKS` at a real backend and a worker picks them up unchanged. |
| **Content Security Policy** | `SECURE_CSP` + `ContentSecurityPolicyMiddleware` in settings. The CDN hosts are listed explicitly; remove them once you vendor Tailwind/DaisyUI/htmx locally. |
| Expression indexes & constraints | `Node.Meta` — case-insensitive uniqueness per folder, a check that folders carry no bytes, and a check that a node can't parent itself. |

## Data model

**`Node`** — one table for folders and files, adjacency list (`parent`) plus a
materialized `path` (`/root-id/child-id/self-id`). Subtree queries are one
indexed prefix scan, and a move rewrites the whole subtree in a single `UPDATE`
using `Concat`/`Substr` rather than N saves. Trash is a nullable `trashed_at`,
so nothing is destroyed until it's purged.

**`Operation`** — one row per user-visible action: kind, status, actor, source
and destination folders, item count, bytes affected, duration, and whether it
can be reversed.

**`OperationItem`** — one row per node touched, holding `before` and `after`
JSON snapshots plus a `label` copy of the name. The label is why the log still
reads correctly after a permanent delete: the node FK goes `NULL`, the history
doesn't.

Those snapshots are what make `services.undo()` possible. It reverses renames,
moves, trashes, restores and stars from `before`, and hard-deletes whatever a
create/upload/copy produced. Purge is deliberately the one irreversible
operation, and `Operation.can_undo` reflects that everywhere in the UI.

## Scanning a mounted share

Point a `ScanRoot` at a mounted directory and the scanner mirrors it into a
folder in the tree. The share is catalogued, not copied: `Node` rows carry the
`rel_path` and the share's mtime, and the files stay where they are.

```bash
# register a share and scan it in one go
python manage.py scan_share --register "Design share" /mnt/smb/design

# later, from cron or a worker
python manage.py scan_share --all
python manage.py scan_share "Design share" --full   # ignore size/mtime, re-read everything
```

From Python, or on a schedule:

```python
from explorer.tasks import scan_share, scan_all_shares

scan_share.enqueue(str(scan_root.pk))     # one share
scan_all_shares.enqueue()                 # every enabled share
```

There's also a scan button per share in the sidebar, and a "Scan selected
shares now" action in the admin.

### What the scanner does about network mounts

A dead CIFS mount doesn't raise — it looks like an empty directory. Deleting the
catalogue because the share blinked would be the worst thing this code could do,
so:

- **The mount is probed first.** `require_mount` (default on) insists
  `mount_path` is a real mount point, not the empty directory left behind when
  the share is gone. A failed probe ends the run as `unavailable` having
  changed nothing.
- **Mass disappearance aborts.** If more than `max_missing_ratio` (default 25%)
  of the catalogued entries are absent, the run stops before touching anything
  and says so. Genuine bulk deletions need a deliberate re-run with a higher
  ratio.
- **Missing files are flagged, not destroyed.** Default `missing_policy` sets
  `missing_since` and leaves the row; `trash` and `delete` are opt-in. A file
  that comes back clears the flag on the next scan.
- **Unreadable directories cost one error, not the run.** The first 20 are kept
  on the run for display.

Other behaviour worth knowing: `os.scandir` supplies name, type and size from
the directory read rather than a `stat` per entry; writes are batched
(`batch_size`, default 500) so long scans don't hold a write lock; identity is
the relative path compared case-insensitively, which matches how SMB behaves;
mtimes are compared with two seconds of slack; symlinks are skipped by default;
and the availability probe shown in the sidebar is cached for 30 seconds so a
hung mount can't stall every page render.

Junk is excluded by default — dotfiles, `~$` Office locks, `Thumbs.db`,
`desktop.ini`, `@eaDir`, `$RECYCLE.BIN`, `System Volume Information`,
`*.tmp`/`*.part` — and `exclude` takes any list of fnmatch patterns.

### Read-only by default

`ScanRoot.read_only` (default on) makes the app refuse to rename, move, trash or
delete anything catalogued from that share, because doing so wouldn't touch the
real file and the next scan would revert it. The UI says that in an error toast
rather than silently doing nothing. Set `read_only=False` once you've wired
writes through to the filesystem.

Every scan writes to the same audit log as manual actions: one `import`
operation listing what was discovered, and a `vanished` operation for anything
that disappeared. Both are marked irreversible — undo can't put a file back on
someone else's server.

## Transcoding media

Select files or folders, hit **Convert** in the batch bar, pick a preset. Jobs
run in the background and report progress in the activity drawer; the panel
polls only while something is actually running.

```bash
python manage.py transcode_media --presets
python manage.py transcode_media "Fjord Athletics" --preset web-720p
python manage.py transcode_media --all-media --preset proxy-480p --dry-run
python manage.py transcode_media "clip.mov" --preset audio-m4a --wait   # inline
```

```python
from transcode.tasks import transcode_nodes, probe_pending

transcode_nodes.enqueue([str(node.pk)], "archive-h265")
probe_pending.enqueue()   # fill in durations/resolutions after a share scan
```

Seven presets ship as a data migration — 1080p/720p H.264, H.265 archive, a
480p editing proxy, an MP4 remux, and audio-only M4A/MP3. Add your own in the
admin; the model covers codec, CRF, speed, scaling, fps cap and audio, with
`extra_args` for anything else.

### What the transcoder is careful about

- **Originals are never touched.** Output is a new file, filed as a new node,
  and the source is left exactly as it was.
- **ffmpeg never writes to a share.** Work happens in a local scratch directory
  and finished files land under `MEDIA_ROOT`. Anything sourced from a read-only
  share files its output into a managed `Transcodes/` folder, so mirrored
  folders keep matching what's actually on the server.
- **No shell, ever.** Presets become an argv list, so a filename containing
  `; rm -rf` is just an awkward filename. `extra_args` is passed to ffmpeg
  verbatim, which is why presets are staff-configured.
- **Progress comes from `-progress pipe:1`,** not by scraping stderr — and
  stderr is drained on its own thread, because ffmpeg deadlocks at ~64KB of
  unread output otherwise. That's the classic "stuck at 40%" bug.
- **Cancellation actually stops the process.** A cancel flag is polled every
  couple of seconds; ffmpeg gets SIGTERM, then SIGKILL if it ignores that. It
  runs in its own process group so the signal can't hit the worker.
- **Redelivery is safe.** Jobs are claimed with a conditional `UPDATE`; the
  second worker to arrive gets nothing. A unique constraint stops the same
  source+preset being queued twice, and `sweep_stuck_jobs` fails jobs abandoned
  by a dead worker.
- **Failures are legible.** A `.mp4` that isn't really a video fails with
  ffprobe's complaint, the last 40 lines of stderr are kept on the job, and
  there's a Retry button.

Every finished conversion writes a `transcode` operation to the same audit log
as everything else. It's marked irreversible — undo would delete a file someone
may already be using.

A missing ffmpeg is reported by `manage.py check` (`transcode.W001`) rather than
discovered when the first job fails.

## Layout

```
explorer/
  models.py      Node, Operation, OperationItem, ScanRoot, ScanRun
  services.py    every mutation, each wrapped in an Operation + snapshots
  scanning.py    the share walker and reconciler
  views.py       thin HTMX endpoints; all rendering goes through partials
  tasks.py       background jobs (Django 6 Tasks), including scan_share
  templates/explorer/
    index.html   the whole UI + every HTMX fragment as a named partial
    modals.html  new folder, rename, move picker, purge, details
  static/explorer/explorer.js   selection, drag/drop, context menu, shortcuts

transcode/
  models.py      Preset, MediaProbe, TranscodeJob
  ffmpeg.py      argv building, probing, progress parsing, cancellation
  services.py    queueing, claiming, running, filing the output
  tasks.py       run_transcode, transcode_nodes, probe_pending, sweep_stuck_jobs
  templates/transcode/panel.html   jobs panel + preset picker

flake.nix        dev shell, package, apps, checks, NixOS module
nix/package.nix  the derivation
nix/module.nix   services.vault — systemd units and timers
```

**Views never call `Node.save()`.** They resolve nodes, call a service function,
and re-render. That single chokepoint is what guarantees the log has no gaps.

## How the HTMX wiring works

Mutating endpoints return three things in one response: the refreshed
`#workspace`, plus out-of-band swaps for the sidebar (counts, storage meter)
and the activity feed, plus a toast that carries an Undo button when the
operation is reversible.

Selection stays on the client — checkboxes named `ids`, with shift-ranges and
⌘/Ctrl-click handled in JS. Batch buttons pick them up with
`hx-include=".row-check:checked"`, so the ids arrive as ordinary POST data and
`request.POST.getlist("ids")` is the whole server-side story.

Current location lives in the session, so an operation posted from anywhere
re-renders the folder you're actually looking at without the client having to
tell it.

## Keyboard

`⌘/Ctrl+A` select all · `⌘/Ctrl+C` / `X` / `V` copy, cut, paste ·
`Delete` trash · `F2` rename · `Enter` open · `Esc` clear · `/` search

## Before production

- Files are recorded but only stored when uploaded through the browser; wire
  `Node.upload` to real downloads (`FileResponse`) and swap the demo download
  handler, which currently only records the operation. For scanned nodes,
  `node.source_path` is the file on the share.
- Add authentication and scope `Node` queries to `owner` — the models carry the
  FK already, the querysets don't filter on it yet.
- Vendor the CDN assets and tighten `SECURE_CSP`.
- Django 6.0 ships only the immediate and dummy task backends — there is no
  database backend or `db_worker` in core yet. A real worker needs a third-party
  backend (e.g. `django-tasks`); until then everything runs inline, which is why
  the NixOS module sets `--timeout 0` and suggests extra gunicorn workers.
- Replace `ImmediateBackend` with a worker-backed task backend before scanning
  anything large or transcoding anything real — inline execution means the HTTP
  request waits for the entire walk or encode. Then schedule `scan_all_shares`,
  `probe_pending`, `sweep_stuck_jobs` and `purge_expired_trash`.
- The Tasks framework doesn't limit concurrency. Give transcodes their own queue
  with a small worker pool, or a four-core box will happily start ten encodes.
- The scanner loads one row per catalogued node into memory to diff against.
  That's fine into the low millions; past that, page the index by directory.
