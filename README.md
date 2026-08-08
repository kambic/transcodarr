# Transcodarr

A Tdarr-style media transcode pipeline, built on Django 6.1.

Point it at a folder. It scans, probes every file with `ffprobe`, measures each
one against a target profile, and queues the ones that fall short. Workers run
`ffmpeg`, stream progress back, and replace the source file only if the result
is actually smaller.

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
Library (folder + profile)
   └── scan_library ──────► MediaFile rows
                               └── probe_file ──► ffprobe → rules.evaluate()
                                                     │
                                            needs_transcode?
                                                     │
                                          queue_transcode() → Job row
                                                     │
                                             run_transcode ──► ffmpeg
```

**`Job` versus `TaskResult`.** The Tasks framework owns scheduling, retries and
task state. The `Job` model owns everything the dashboard needs: progress, fps,
speed, ETA, byte counts, the exact command, and a log tail. They're linked by
`Job.task_result_id`. A `Job` row is created *before* the task is enqueued, so
work shows up in the queue immediately even when every worker is busy.

**Rules.** `pipeline/rules.py` holds one function per check — codec, container,
height, bitrate. Each returns a reason string on failure or `None` on pass. Add
a function, list it in `RULES`, and it applies on the next probe. The reason
string is what the UI shows ("Video is mpeg4, target is h264"), so write it for
a person.

**Safety rails.** Encodes are written to a cache directory and only moved into
place afterwards. If the result exceeds `MAX_OUTPUT_SIZE_RATIO` of the original,
the source is kept and the file is marked as meeting target. Cancelling sends
SIGTERM so ffmpeg closes the container cleanly, then deletes the partial file.

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

Nine tests covering rule evaluation, task behaviour with mocked ffprobe, and
that htmx requests really do return fragments rather than whole pages.

---

## Layout

```
config/            settings, urls, wsgi/asgi
pipeline/
  models.py        Library, TranscodeProfile, MediaFile, Job, Worker
  tasks.py         scan_library, probe_file, run_transcode, sweeps
  ffmpeg.py        ffprobe/ffmpeg wrapper, progress parsing, cancellation
  rules.py         one function per profile check
  views.py         pages and their htmx partials
  forms.py         Flowbite-styled model forms
  templatetags/    badges, durations, querystring helpers
templates/
  base.html        Flowbite shell, htmx wiring, modal and toast plumbing
  pages/           full pages, each holding its own partials
  partials/        fragments genuinely shared across pages
```
