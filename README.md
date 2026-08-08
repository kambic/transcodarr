# Transcodarr

A Tdarr-style media transcode pipeline, built on Django 6.1.

Point it at a folder. It scans, probes every file with `ffprobe`, measures each
one against a target profile, and queues the ones that fall short. Workers run
`ffmpeg`, stream progress back, and replace the source file only if the result
is actually smaller.

What happens to a file is drawn, not configured: flows are node graphs you
build on a canvas, the way FileFlows does it.

Built with **Django Tasks** for background work, **template partials** for
htmx fragments, and **Flowbite** for the interface.

---

## Quick start

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env          # optional, sensible defaults are baked in
./manage.py migrate
./manage.py seed_demo          # profiles + a library + ~80 sample files
./manage.py createsuperuser    # only needed for /admin/

./manage.py runserver          # terminal 1
./manage.py db_worker          # terminal 2 — nothing runs without this
```

Open http://127.0.0.1:8000/.

You need `ffmpeg` and `ffprobe` on the worker's PATH. Everything else is Python.

---

## Running workers

Tasks are split across three queues so a four-hour 4K encode never blocks a
directory walk. Run one worker for the fast queues and one or more for encoding:

```bash
./manage.py db_worker --queue-name scan,probe
./manage.py db_worker --queue-name transcode
```

Two encodes at once means two `transcode` workers — one process takes one job at
a time. Give each a name if you want to tell them apart on the Workers page:

```bash
WORKER_NAME=gpu-box ./manage.py db_worker --queue-name transcode
```

Periodic scans are not built in, because the Tasks framework has no scheduler.
Point cron or a systemd timer at:

```bash
./manage.py shell -c "from pipeline.tasks import scan_due_libraries; scan_due_libraries.enqueue()"
```

`requeue_stale_jobs` does the same job for encodes whose worker was killed
mid-run.

---

## How it fits together

```
Library (folder + flow or profile)
   └── scan_library ─────► MediaFile rows
                              └── probe_file ──► ffprobe
                                                    │
                                        ┌───────────┴───────────┐
                                   has a flow?              no flow
                                        │                       │
                                 flow dry run            rules.evaluate()
                                        │                       │
                                        └──── needs work? ──────┘
                                                    │
                                              Job row queued
                                                    │
                                    ┌───────────────┴───────────────┐
                                run_flow                      run_transcode
                             (walks the graph,              (one encode from
                              actions run for real)          the profile)
```

**`Job` versus `TaskResult`.** The Tasks framework owns scheduling, retries and
task state. The `Job` model owns everything the dashboard needs: progress, fps,
speed, ETA, byte counts, the exact command, and a log tail. They're linked by
`Job.task_result_id`. A `Job` row is created *before* the task is enqueued, so
work shows up in the queue immediately even when every worker is busy.

**Deciding what to do.** Two mechanisms, and a library picks one:

- A **flow** — a node graph drawn in the editor. Takes precedence when set.
- A **profile** plus `pipeline/rules.py` — four hardcoded checks (codec,
  container, height, bitrate). Simpler, fine when every file gets the same
  treatment.

Either way the outcome is a verdict and a human-readable reason, which is what
the Files page shows ("Video is mpeg4, target is h264").

**Safety rails.** Encodes are written to a cache directory and only moved into
place afterwards. If the result exceeds `MAX_OUTPUT_SIZE_RATIO` of the original,
the source is kept and the file is marked as meeting target. Cancelling sends
SIGTERM so ffmpeg closes the container cleanly, then deletes the partial file.

---

## Flows

A flow is a diagram of what should happen to a file. Open **Flows → New flow**
and you get a working example: check the codec, leave HEVC alone, transcode
everything else.

### How a flow runs

Every flow runs **twice** per file, over the same graph:

| Pass | When | Conditions | Actions |
| --- | --- | --- | --- |
| Dry run | During probing | Evaluated normally | Record what they *would* do |
| Live | In a transcode worker | Evaluated normally | Actually run |

The dry run is what makes the Files page useful. Answering "does this file need
work?" by starting a two-hour encode is not an answer, so actions check
`ctx.dry_run`, call `ctx.plan("Transcode to hevc in mkv")`, and return. That
string becomes the file's verdict reason. If the dry run plans nothing, the file
is healthy and no job is queued.

### Nodes

Each node returns the number of the output to follow — the same convention
FileFlows uses. Two values are special: `0` ends the flow normally, `-1` fails it.

**Conditions** (Yes / No outputs): video codec is, audio codec is, container is,
resolution at least, bitrate above, file size above, runtime longer than,
filename matches.

**Actions**: transcode video, remux container, move file, write to the log, set
a variable.

**Endings**: nothing to do, fail the flow.

### Adding a node type

One class. The palette entry, the properties form and the port count are all
generated from it — there is no JavaScript to touch.

```python
@register
class HasSubtitles(Condition):
    type = "has_subtitles"
    label = "Has subtitles"
    icon = "note"
    description = "Yes when the file carries at least one subtitle stream."
    fields = [Field("language", "Language", "text", "", placeholder="eng")]

    def test(self, ctx, config) -> bool:
        return bool(ctx.metadata.get("subtitle_languages"))
```

Restart the worker and the web process, and it appears in the palette.

### The editor

Vanilla JavaScript, no build step.

- Drag from the palette, or click a palette entry to drop one in the middle.
- Drag a node by its header. Drag from an output port to another node to wire
  them up. Reconnecting an output replaces its old connection — one edge per
  output, so a branch can never be ambiguous.
- Click a node for its settings; edits show on the node immediately.
- `Delete` removes the selection. `Ctrl/Cmd+S` saves. Scroll to zoom, drag the
  background to pan, `Fit` re-centres.
- **Test with a file** dry-runs the graph *currently on the canvas* against a
  real file and lights up the path it took, with the branch chosen at each step.
  You can try a change before saving it.

Warnings appear above the canvas: no input node, two input nodes, a branch that
goes nowhere, an orphaned node.

### Storage and trust

The graph is one JSON document on `Flow.graph`:

```json
{"nodes": [{"id": "n1", "type": "video_codec_is", "x": 400, "y": 180,
            "config": {"codecs": "hevc"}}],
 "edges": [{"from": "n1", "output": 2, "to": "n4"}]}
```

One write per save, so a canvas save is atomic — no half-applied layout if the
request dies. Nothing queries inside a graph, so normalising it into node and
edge tables would buy nothing.

The canvas is user input, so `flow_save` rebuilds the graph rather than trusting
it: unknown node types are dropped, edges pointing at nodes that no longer exist
are dropped, and config keys the node doesn't declare are stripped. A graph that
reaches a worker is always one the worker can run.

The engine stops after 250 steps, so a loop drawn by accident fails the job
instead of pinning a CPU forever. Every run records a trace — the nodes visited
and the output taken at each — shown on the job detail page and replayed by the
editor's test button.

---

## Django Tasks

```python
@task(queue_name="transcode", takes_context=True)
def run_transcode(context, job_id: int) -> dict:
    ...
```

`takes_context=True` gives access to `context.attempt` and
`context.task_result.id`, both recorded on the `Job` so the UI can show which
retry you're looking at.

Arguments make a round trip through `json.dumps`/`json.loads` before the worker
sees them, so every task here takes plain integers — never a model instance.

Django ships only `ImmediateBackend` and `DummyBackend`. Persistence comes from
[`django-tasks-db`](https://pypi.org/project/django-tasks-db/), which supplies
`DatabaseBackend` and the `db_worker` command. Switch backends with an
environment variable:

```bash
TASKS_BACKEND=immediate ./manage.py runserver   # runs everything inline, no worker
```

Tests use the same switch via `@override_settings(TASKS=...)`.

### Progress reporting

`ffmpeg -progress pipe:1 -nostats` emits `key=value` blocks on stdout.
`pipeline/ffmpeg.py` parses them and calls back with percent, fps, speed and
ETA; the task throttles writes to one every `PROGRESS_INTERVAL_SECONDS` so a
long encode doesn't hammer the database. The same callback checks whether the
job's state has flipped to `cancelling`, which is how the web request stops a
process running in another machine's worker.

---

## Template partials

Fragments live inside the page they belong to, using the `{% partialdef %}` tag
Django added in 6.0:

```django
{% partialdef queue-table inline %}
<tbody id="queue-table"
       hx-get="{% url 'pipeline:queue_table' %}"
       hx-trigger="every 2s"
       hx-swap="outerHTML">
  ...
</tbody>
{% endpartialdef %}
```

`inline` means it renders in place on the full page load. The view for htmx
requests renders the fragment alone with the `template#partial` syntax:

```python
def queue_table(request):
    return render(request, "pages/queue.html#queue-table", _queue_context())
```

One definition, two entry points, no `_partial.html` files drifting out of sync
with their page. `/queue/` returns ~19 KB; `/hx/queue/` returns ~700 bytes of
identical markup.

Partials in this project:

| Partial | File | Used for |
| --- | --- | --- |
| `stats` | `pages/dashboard.html` | Stat cards, polled every 5s |
| `activity` | `pages/dashboard.html` | Running jobs, polled every 3s |
| `queue-table` | `pages/queue.html` | Whole tbody, polled every 2s |
| `file-results` | `pages/files.html` | Search and pagination results |
| `file-row` | `pages/files.html` | Single row, swapped after an action |
| `library-grid` / `library-card` | `pages/libraries.html` | Grid, and per-card scan status |
| `file-body` / `job-body` | detail pages | Same markup as page or modal |

---

## htmx patterns

- **Self-replacing polls.** The tbody re-fetches itself with
  `hx-swap="outerHTML"`, so rows never disagree with each other mid-update.
  `hx-sync="this:replace"` drops a poll if the previous one is still in flight.
- **Active search.** `hx-trigger="input changed delay:300ms from:#q, change from:select"`
  plus `hx-push-url="true"` keeps the URL shareable and the back button honest.
- **Modal forms.** `hx-get` loads the body into `#modal`. On success the view
  returns the refreshed grid and an `HX-Trigger` header that closes the dialog
  and raises a toast. On failure it returns the form with errors at 422.
- **Row-level actions.** Buttons target `#file-{{ pk }}` and get one `<tr>` back.
- **CSRF.** Set once on `<body>` with `hx-headers`.

Two things that bite people, both handled in `base.html`:

```js
// Flowbite binds on load. Anything htmx swaps in later needs re-initialising
// or dropdowns, tooltips and modals go dead.
document.body.addEventListener('htmx:afterSwap', () => window.initFlowbite && initFlowbite());

// Stop polling while the tab is hidden.
document.addEventListener('visibilitychange', () => { ... });
```

---

## Flowbite in production

`base.html` loads Tailwind and Flowbite from a CDN so this runs with no build
step. That's fine for development and wrong for production — the Play CDN
compiles styles in the browser on every page load.

For a real deployment:

```bash
npm install -D tailwindcss flowbite
```

```js
// tailwind.config.js
module.exports = {
  content: ['./templates/**/*.html', './node_modules/flowbite/**/*.js'],
  darkMode: 'class',
  plugins: [require('flowbite/plugin')],
};
```

```bash
npx tailwindcss -i static/src/input.css -o static/css/app.css --minify
```

Then replace the two CDN tags with `{% static 'css/app.css' %}` and a local copy
of `flowbite.min.js`. WhiteNoise is already configured to serve them.

---

## Configuration

Everything is environment driven — see `.env.example`.

| Setting | Default | What it does |
| --- | --- | --- |
| `TASKS_BACKEND` | `database` | `database`, `immediate`, or `dummy` |
| `FFMPEG_BIN` / `FFPROBE_BIN` | `ffmpeg` / `ffprobe` | Binary paths |
| `TRANSCODE_CACHE_DIR` | `./cache` | Scratch space for in-flight encodes |
| `MAX_OUTPUT_SIZE_RATIO` | `1.0` | Discard a re-encode larger than this fraction of the source |
| `WORKER_OFFLINE_AFTER` | `45` | Seconds before a worker reads as offline |

### Hardware encoding

Set a profile's **Encoder** to NVENC, QuickSync, or VAAPI. `pipeline/ffmpeg.py`
maps the codec and accelerator to the right encoder and quality flag — `-crf`
for CPU encoders, `-cq` for NVENC, `-global_quality` for QSV, `-qp` for VAAPI.
The container needs device access (`--gpus all`, or `--device /dev/dri`).

---

## A note on SQLite

It works, and the settings enable WAL with a 20-second timeout, which is enough
for a couple of workers. Beyond that, workers writing progress every two seconds
will start colliding with page loads. Move to PostgreSQL before scaling out
encoders.

---

## Tests

```bash
./manage.py test pipeline
```

Twenty-one tests covering rule evaluation, task behaviour with mocked ffprobe,
flow branching, loop protection, the sanitising done on save, and that htmx
requests really do return fragments rather than whole pages.

---

## Layout

```
config/            settings, urls, wsgi/asgi
pipeline/
  models.py        Flow, Library, TranscodeProfile, MediaFile, Job, Worker
  tasks.py         scan_library, probe_file, run_transcode, sweeps
  flow_tasks.py    run_flow, and the dry run used during probing
  ffmpeg.py        ffprobe/ffmpeg wrapper, progress parsing, cancellation
  rules.py         one function per profile check (the no-flow path)
  flows/
    registry.py    node base classes, field and output schema
    nodes.py       the node library — one class per palette entry
    engine.py      the graph walker, dry run, validation
  views.py         pages and their htmx partials
  flow_views.py    editor, save, test run
  forms.py         Flowbite-styled model forms
  templatetags/    badges, durations, querystring helpers
templates/
  base.html        Flowbite shell, htmx wiring, modal and toast plumbing
  pages/           full pages, each holding its own partials
  partials/        fragments genuinely shared across pages
```
