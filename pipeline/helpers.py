import contextlib
import os
import shutil
import socket
import tempfile
import shlex
from pathlib import Path

import ffmpeg

from . import settings
from .encoders import encoder_for
from .probe import Probe


def build_stream(
    profile, source: Path, destination: Path, probe_data: Probe | None = None
):
    """Assemble the ffmpeg-python stream graph for one file, using chaining."""
    encoder = encoder_for(profile.video_codec, profile.hw_accel)

    # --- hwaccel must precede -i, so it's passed as input() kwargs ---
    input_kwargs = {}
    if profile.hw_accel == "nvenc":
        input_kwargs["hwaccel"] = "cuda"
    elif profile.hw_accel == "qsv":
        input_kwargs["hwaccel"] = "qsv"
    elif profile.hw_accel == "vaapi":
        input_kwargs["hwaccel"] = "vaapi"
        input_kwargs["hwaccel_output_format"] = "vaapi"

    stream = ffmpeg.input(str(source), **input_kwargs)

    # --- optional scale filter, chained in ---
    if (
        profile.max_height
        and probe_data
        and probe_data.height
        and probe_data.height > profile.max_height
    ):
        if profile.hw_accel == "vaapi":
            stream = stream.filter("scale_vaapi", -2, profile.max_height)
        else:
            stream = stream.filter("scale", -2, profile.max_height)

    # --- output kwargs, built per encoder family ---
    output_kwargs = {
        "map": "0",
        "c": "copy",
        "c:v": encoder,
    }

    if encoder.startswith(("libx26", "libsvt")):
        output_kwargs["crf"] = profile.quality
        output_kwargs["preset"] = profile.preset
    elif encoder.endswith("_nvenc"):
        output_kwargs["rc"] = "vbr"
        output_kwargs["cq"] = profile.quality
        output_kwargs["preset"] = "p5"
    elif encoder.endswith("_qsv"):
        output_kwargs["global_quality"] = profile.quality
        output_kwargs["preset"] = profile.preset
    elif encoder.endswith("_vaapi"):
        output_kwargs["rc_mode"] = "CQP"
        output_kwargs["qp"] = profile.quality

    if profile.audio_codec and profile.audio_codec != "copy":
        output_kwargs["c:a"] = profile.audio_codec

    stream = stream.output(str(destination), **output_kwargs)

    stream = stream.global_args("-hide_banner", "-nostdin", "-nostats")

    if profile.extra_args:
        stream = stream.global_args(*shlex.split(profile.extra_args))

    return stream.overwrite_output()


# --- progress plumbing, mirroring the ffmpeg-python show_progress.py example ---


@contextlib.contextmanager
def _tmpdir_scope():
    tmpdir = tempfile.mkdtemp()
    try:
        yield tmpdir
    finally:
        shutil.rmtree(tmpdir)


def _do_watch_progress(sock, handler, should_cancel=None):
    connection, _ = sock.accept()
    data = b""
    try:
        while True:
            if should_cancel and should_cancel():
                break
            more_data = connection.recv(16)
            if not more_data:
                break
            data += more_data
            lines = data.split(b"\n")
            for line in lines[:-1]:
                line = line.decode()
                key, _, value = line.partition("=")
                handler(key or None, value or None)
            data = lines[-1]
    finally:
        connection.close()


@contextlib.contextmanager
def _watch_progress(handler, should_cancel=None):
    with _tmpdir_scope() as tmpdir:
        socket_filename = os.path.join(tmpdir, "sock")
        sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        with contextlib.closing(sock):
            sock.bind(socket_filename)
            sock.listen(1)
            import gevent

            child = gevent.spawn(_do_watch_progress, sock, handler, should_cancel)
            try:
                yield socket_filename
            except Exception:
                gevent.kill(child)
                raise


def run(
    profile,
    source: Path,
    destination: Path,
    probe_data: Probe | None = None,
    on_progress=None,
    should_cancel=None,
):
    """Build and run the ffmpeg-python stream, reporting progress via socket."""
    stream = build_stream(profile, source, destination, probe_data)

    def handler(key, value):
        if key == "out_time_ms" and value and on_progress:
            seconds = float(value) / 1_000_000
            on_progress(seconds)
        elif key == "progress" and value == "end" and on_progress and probe_data:
            on_progress(probe_data.duration_seconds)

    with _watch_progress(handler, should_cancel) as socket_filename:
        stream = stream.global_args("-progress", "unix://{}".format(socket_filename))
        try:
            stream.run(capture_stdout=True, capture_stderr=True)
        except ffmpeg.Error as e:
            raise RuntimeError(e.stderr.decode(errors="replace")) from e
