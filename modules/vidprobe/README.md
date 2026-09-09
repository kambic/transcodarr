# vidprobe

A Typer + Rich CLI for probing video files and live streams, collecting stream
parameters and quality statistics, comparing two encoding configurations side by
side, and running the everyday FFmpeg edits (language stripping, metadata,
cutting, thumbnails, sprites) — against any of several registered FFmpeg builds.

Everything is derived from `ffprobe`/`ffmpeg`, so anything FFmpeg can open works:
local files, HLS/DASH URLs, RTSP cameras, RTMP, SRT, UDP/MPEG-TS multicast.

## Install

```bash
pip install -e .        # installs a `vidprobe` command
# or, without installing:
pip install -r requirements.txt && python -m vidprobe --help
```

FFmpeg must be on `PATH` (or set `VIDPROBE_FFMPEG` / `VIDPROBE_FFPROBE`).
For VMAF you need a build compiled with `--enable-libvmaf`; without it PSNR and
SSIM still work and VMAF is skipped with a warning.

```bash
vidprobe doctor      # check what the active ffmpeg build supports
vidprobe builds      # list every build in your config and whether it works
```

## Configuration

```bash
vidprobe config init          # writes ~/.config/vidprobe/config.toml
vidprobe config show          # what is active right now, and where it came from
vidprobe config path          # every location that gets searched
```

Searched in order: `$VIDPROBE_CONFIG`, `./vidprobe.toml`, `./.vidprobe.toml`,
`~/.config/vidprobe/config.toml`, `/etc/vidprobe/config.toml`. Override with
`-c/--config`.

The main reason for the config is registering **multiple FFmpeg builds** so you
can test an optimized binary against your distro one:

```toml
[general]
default_build = "system"
output_dir = "/var/tmp/vidprobe"

[builds.system]
label = "distro ffmpeg"
ffmpeg = "ffmpeg"

[builds.jellyfin]
label = "jellyfin-ffmpeg (QSV/VAAPI)"
ffmpeg = "/usr/lib/jellyfin-ffmpeg/ffmpeg"      # ffprobe assumed alongside it

[builds.btbn]
label = "BtbN static + libvmaf"
ffmpeg = "~/opt/ffmpeg-master/bin/ffmpeg"
extra_args = ["-threads", "0"]
env = { LD_LIBRARY_PATH = "/opt/ffmpeg-master/lib" }

[languages]
preferred = ["eng", "slv"]     # 'en', 'english' and 'eng' all normalise the same
keep_undetermined = true
fallback_keep_first = true
apply_to = ["audio", "subtitle"]

[thumbnails]
width = 320
count = 12
scene_threshold = 0.35
sprite_columns = 5
sprite_rows = 5

[cut]
duration = 60.0
```

Every command takes `-B/--build NAME` to run against a specific build:

```bash
vidprobe -B btbn compare a.mp4 b.mp4 --reference source.mov
```

Global flags (before the command): `--config`, `--build`, `--dry-run`,
`--show-command/-v`, `--no-color`, `--width`.

## Commands

### `probe` — inspect one input

```bash
vidprobe probe input.mp4
vidprobe probe rtsp://cam.local/stream1 --duration 15
vidprobe probe https://host/master.m3u8 --json report.json
vidprobe probe udp://239.0.0.1:1234 -d 20
```

Reports:

- **container** — format, duration, size, overall bitrate, probe score, tags,
  and how long connecting + probing took (useful as a stream-startup metric)
- **video** — codec/profile/level, resolution, coded size, frame rate, pixel
  format with derived chroma subsampling and bit depth, bitrate, **bits per
  pixel**, SAR/DAR, scan type, reference frames, colour range/space/primaries/
  transfer, HDR detection, encoder tag
- **audio & other tracks** — codec, sample rate, layout, bitrate, language
- **stream behaviour** (packet-level pass over the first N seconds) — measured
  fps, average/peak/min bitrate, peak-to-average ratio, rate variability with a
  CBR/capped-VBR/VBR classification, GOP length min/avg/max in frames and
  seconds, keyframe count, longest B-frame run, I/P/B mix, packet size spread,
  PTS gap detection, and a bitrate sparkline

Use `--quick` for metadata only (no packet pass), `--json PATH` to save the
report, `--raw` to embed the raw ffprobe output in it.

### `compare` — two encoding configs head to head

```bash
# quick A/B, scored with A as the stand-in reference
vidprobe compare x264_crf23.mp4 x265_crf28.mp4

# proper comparison: both encodes scored against the original source
vidprobe compare cfg_a.mp4 cfg_b.mp4 --reference source.mov

vidprobe compare a.mp4 b.mp4 --diff-only -m vmaf,ssim --qduration 30 \
    --label-a "veryfast CRF23" --label-b "medium CRF28" --json ab.json
```

Output sections:

1. **summaries** — the headline settings of each encode plus its bitrate curve
2. **parameter diff** — every container/video/GOP/audio parameter with changed
   rows marked, percentage deltas, and the better value highlighted where one
   direction is objectively preferable (`--diff-only` hides identical rows)
3. **quality** — VMAF (mean, harmonic mean, worst frame), PSNR, SSIM
4. **efficiency scoreboard** — bitrate, size, bits per pixel, quality metrics
   and **VMAF per Mb/s**, with a winner per row
5. **verdict** — plain-language notes on bitrate savings, codec/resolution
   differences, quality gaps, GOP structure and rate stability

With `--reference`, both encodes are compared against the same source and each
is rescaled to the reference geometry, so a 540p encode can be fairly scored
against a 720p one. Without it, B is measured against A and the numbers are
relative rather than absolute (noted in the output).

Quality measurement is the slow part: `--qduration` limits how many seconds are
scored (default 20, `0` for the whole file), `--threads` sets libvmaf workers,
and `--no-quality` skips it entirely.

### `monitor` — live stream health dashboard

```bash
vidprobe monitor srt://host:9000
vidprobe monitor udp://239.0.0.1:1234 --decode -d 60
```

Continuously updating panel: stream time, bitrate with a rolling sparkline,
bytes received, realtime factor (goes red if the stream falls behind), and
recent decoder messages. `--decode` adds true frame counts, fps and drop/dup
counters at the cost of CPU. Ctrl-C to stop.

### `strip-langs` — keep only the preferred languages

```bash
vidprobe strip-langs movie.mkv                      # uses [languages] from the config
vidprobe strip-langs movie.mkv -l eng -l slv        # override the preference list
vidprobe strip-langs movie.mkv --plan               # show the decision table, change nothing
vidprobe strip-langs movie.mkv --drop-commentary --kinds audio
```

Prints a keep/drop table with the reason for every stream, then remuxes with
`-c copy` (no re-encode). Language codes are normalised, so `en`, `eng` and
`english` are the same thing, as are `de`/`deu`/`ger`. Video is never dropped.
If nothing matches the preference list, the first (or default) stream of that
kind is kept as a fallback rather than producing a file with no audio at all.

### `strip-audio` — remove audio tracks

```bash
vidprobe strip-audio clip.mp4                       # drop every audio track
vidprobe strip-audio movie.mkv --keep-first         # keep only the default track
vidprobe strip-audio movie.mkv --keep-lang eng      # keep English audio
vidprobe strip-audio movie.mkv --keep 0 --keep 2    # keep audio tracks 0 and 2
vidprobe strip-audio movie.mkv --drop-commentary    # drop just the commentary
```

### `metadata` — edit tags without re-encoding

```bash
vidprobe metadata movie.mkv --show                  # current tags + stream listing
vidprobe metadata movie.mkv --title "Director's Cut" -s "artist=Someone"
vidprobe metadata movie.mkv -s "comment="           # empty value removes a tag
vidprobe metadata movie.mkv -S "1:language=slv" -S "1:title=Slovenski"
vidprobe metadata movie.mkv --default-audio 1 --default-sub 0
vidprobe metadata movie.mkv --clear --clear-chapters
```

`--default-audio/--default-sub` take a 0-based index *within that stream kind*
(the way players number tracks) and set the flag exclusively, clearing it from
the other tracks of the same kind.

### `cut` — seek and extract a segment

```bash
vidprobe cut movie.mkv -s 12:30                     # 60s from 12:30 (config default)
vidprobe cut movie.mkv -s 1:30 -d 90                # 90 seconds
vidprobe cut movie.mkv -s 0:10 -e 0:25              # explicit range
vidprobe cut movie.mkv -s 5:00 --accurate --crf 18  # frame-exact (re-encodes)
vidprobe cut movie.mkv -s 5:00 --no-audio
```

Start/length accept `90`, `1:30`, `00:01:30.5` or `1h2m3s`. Stream copy is the
default and is nearly instant, but it can only start on a keyframe — vidprobe
probes the nearest one first and warns you how far the cut will drift:

```
stream copy snaps to the previous keyframe at 00:00:22.000 (1.00s early)
- use --accurate for a frame-exact cut
```

### `thumbs` — extract stills

```bash
vidprobe thumbs movie.mkv                           # quick mode, count from config
vidprobe thumbs movie.mkv -m scene --scene-threshold 0.4
vidprobe thumbs movie.mkv -m interval -i 30 -w 480
vidprobe thumbs movie.mkv -m iframe -n 20           # keyframes only, fastest
vidprobe thumbs movie.mkv --at 12:30 -f png         # one frame at a timestamp
```

| mode | what it does |
| --- | --- |
| `quick` | spreads `--count` frames evenly, picking the most representative frame of each window so you do not get black frames or duplicates |
| `scene` | scene-change detection above `--scene-threshold` |
| `interval` | one frame every `--interval` seconds |
| `iframe` | keyframes only — no full decode, by far the fastest |
| `single` | one frame at `--at` (selected automatically when `--at` is given) |



### `sprite` — sprite sheets + WebVTT

```bash
vidprobe sprite movie.mkv                           # grid from config
vidprobe sprite movie.mkv -i 5 --cols 10 --rows 10 -w 160
vidprobe sprite movie.mkv --vtt-prefix "https://cdn.example.com/thumbs/"
```

Produces tiled JPEG sheets plus a `sprite.vtt` whose cues point at
`sheet.jpg#xywh=x,y,w,h` — the format video players use for scrub-bar previews.
`--vtt-prefix` prepends a CDN path to the cue URLs.

### `abr` — ABR ladder and switching quality

Adaptive streaming fails in ways a per-file probe cannot see: renditions that
cannot be switched between, manifests that lie about their bitrate, and rungs
that cost bandwidth without buying quality. These three commands cover that.

```bash
vidprobe abr ladder master.m3u8                       # full review
vidprobe abr ladder master.m3u8 -r source.mov         # + rate-quality curve
vidprobe abr ladder stream.mpd                        # DASH works too
vidprobe abr ladder r360.mp4 r720.mp4 r1080.mp4       # ad-hoc, no manifest
vidprobe abr align master.m3u8 -w 60                  # just the switch points
vidprobe abr switch low.m3u8 high.m3u8 --at 0:30 -r source.mov
```

**`abr ladder`** parses the master playlist (or MPD, or a plain list of
rendition files), probes every rung, and reports declared vs measured vs peak
bitrate, bits per pixel, the step ratio between neighbours and each rung's GOP.
It then reviews the ladder:

- rung spacing — flags steps under 1.3x (redundant) and over 2.5x (visible jump)
- resolution that fails to rise with bitrate, and duplicate rungs at one size
- mixed codecs or frame rates across the ladder, which many devices cannot switch between
- `BANDWIDTH` under-declared against the measured peak — the manifest lie that
  causes rebuffering, since players size their buffer from the declared value
- segment counts, boundary alignment and `TARGETDURATION` compliance
- whether audio is a separate rendition group or muxed into every variant

With `--reference` it also scores each rung against the source and draws the
rate-quality curve, flagging rungs that add no measurable quality, rungs that
are strictly dominated (lower quality *and* higher bitrate than a rung below),
and steps large enough to be visible when a player switches.

**`abr align`** is the switching-critical check on its own: every rendition must
place an IDR frame at the same timestamps, or a player either stalls waiting for
a usable boundary or shows a glitch. It reports each rung's keyframe count,
median GOP, how many switch points it shares with the reference rung, and the
worst drift:

```
✗   keyframes not aligned
    renditions disagree by up to 1017 ms; only 4 common switch point(s).
    Re-encode the ladder with forced IDR frames at identical timestamps
    (-force_key_frames 'expr:gte(t,n_forced*N)' on every rung).
```

**`abr switch`** simulates one switch. It verifies both rungs actually start a
keyframe at the requested position — and if not, tells you the nearest point
they *do* share — then measures quality either side of the boundary against the
source to show the step a viewer experiences. `--clip out.mp4` renders the
spliced switch so you can watch it.

`ladder` and `align` exit non-zero when a check fails, so they drop straight
into CI as an encode-ladder gate.

### `bench` — race your FFmpeg builds

```bash
vidprobe bench source.mkv -t decode -n 3            # decoder throughput
vidprobe bench source.mkv -t encode --preset medium --crf 23 -d 60
vidprobe bench source.mkv -t scale --scale-width 1280
vidprobe bench source.mkv -t thumbs --only system --only btbn
```

Runs the identical workload through every configured build and reports best,
median, realtime speed and output size, normalised against the fastest.
Differences within 2% are reported as a tie rather than dressed up as a result.
Tasks: `decode`, `encode`, `remux`, `scale`, `thumbs`.

## Notes

- Network inputs get `-rw_timeout` and RTSP gets forced TCP transport, so a dead
  socket fails fast instead of hanging.
- When a stream does not declare a video bitrate (common with MPEG-TS), the
  measured packet bitrate is used instead and flagged in the warnings.
- Quality metrics need seekable, frame-aligned inputs; `compare` skips them
  automatically for live sources.
- ABR keyframe alignment is judged with a 50 ms tolerance by default
  (`--tolerance`), which is roughly one frame at 25 fps.
- `--dry-run` prints the exact ffmpeg command for any mutating command without
  touching a file; `-v/--show-command` prints it after the fact.
- Editing commands never overwrite their input — vidprobe refuses if the output
  path resolves to the source file.
- Everything is also available as a library:

```python
from vidprobe import load_config
from vidprobe import probe
from vidprobe import measure
from vidprobe.compare import compare

a, b = probe("a.mp4"), probe("b.mp4")
q = measure("b.mp4", "source.mov", metrics=("psnr", "ssim"), duration=10)
result = compare(a, b, quality_b=q)
print(result.verdict)

# stream filtering against the config's language policy
from vidprobe.streams import list_streams, plan_languages
from vidprobe import apply_plan

config = load_config()
plan = plan_languages(list_streams("movie.mkv"), config.languages)
print([s.index for s in plan.dropped])
apply_plan("movie.mkv", plan, "movie.trimmed.mkv")

# ABR ladder analysis
from vidprobe import load_ladder, fill_variant, analyse_ladder, analyse_alignment

ladder = load_ladder(["master.m3u8"])
for variant in ladder.variants:
    fill_variant(variant, window=30, timeout=20, analyze=5)
ladder.checks = analyse_ladder(ladder)
alignment = analyse_alignment(ladder)
print(alignment.switchable, alignment.common_points)

# run anything against a specific build
from vidprobe import using_build

with using_build(config.build("btbn")):
    probe("movie.mkv")
```
