import asyncio
import os
import re
import socket
import tempfile
from pathlib import Path
from typing import Any, Callable, Dict, Optional

import ffmpeg


class InterlacedTranscoder:
    """Asynchronous video transcoder supporting progressive, interlaced, and VAAPI modes."""

    def __init__(
        self, input_path: str | Path, vaapi_device: str = "/dev/dri/renderD128"
    ):
        self.input_path = Path(input_path).resolve()
        self.vaapi_device = vaapi_device
        if not self.input_path.exists():
            raise FileNotFoundError(f"Input file not found: {self.input_path}")

    def probe(self) -> Dict[str, Any]:
        """Runs ffprobe on the input media file."""
        return ffmpeg.probe(str(self.input_path))

    def get_duration(self) -> float:
        """Extracts total duration in seconds."""
        meta = self.probe()
        format_info = meta.get("format", {})
        return float(format_info.get("duration", 0.0))

    async def _run_with_progress(
        self,
        output_stream: Any,
        progress_callback: Optional[Callable[[float], None]] = None,
    ) -> None:
        """Executes FFmpeg asynchronously while parsing progress via a UNIX domain socket."""
        total_duration = self.get_duration()

        with tempfile.TemporaryDirectory() as tmp_dir:
            sock_path = os.path.join(tmp_dir, "ffmpeg_progress.sock")

            server = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            server.bind(sock_path)
            server.listen(1)
            server.setblocking(False)

            # 1. Attach global arguments directly to the OutputStream node
            output_stream = output_stream.global_args(
                "-progress", f"unix://{sock_path}"
            )

            # 2. Compile stream to arguments
            args = ffmpeg.compile(output_stream.overwrite_output())

            # 3. Spawn subprocess
            proc = await asyncio.create_subprocess_exec(
                args[0],
                *args[1:],
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            loop = asyncio.get_running_loop()
            conn, _ = await loop.sock_accept(server)
            conn.setblocking(False)

            buffer = ""
            while True:
                try:
                    data = await loop.sock_recv(conn, 1024)
                    if not data:
                        break
                    buffer += data.decode("utf-8")

                    lines = buffer.split("\n")
                    buffer = lines.pop()

                    for line in lines:
                        if "out_time_ms=" in line:
                            val = line.split("=")[1].strip()
                            if val.isdigit():
                                current_sec = float(val) / 1000000.0
                                if total_duration > 0 and progress_callback:
                                    pct = min(
                                        100.0, (current_sec / total_duration) * 100.0
                                    )
                                    progress_callback(pct)
                except Exception:
                    break

            await proc.wait()
            conn.close()
            server.close()

            if proc.returncode != 0:
                _, stderr = await proc.communicate()
                raise RuntimeError(
                    f"FFmpeg process returned non-zero exit code {proc.returncode}:\n{stderr.decode('utf-8')}"
                )

    # --- Encoding Pipelines ---
    def _has_audio(self) -> bool:
        """Checks if the input file contains an audio stream."""
        try:
            meta = self.probe()
            return any(s.get("codec_type") == "audio" for s in meta.get("streams", []))
        except Exception:
            return False

    def transcode_progressive(
        self,
        output_path: str | Path,
        vcodec: str = "libx265",
        crf: int = 23,
    ) -> None:




        input = ffmpeg.input(self.input_path)
        audio = input.audio.filter("aecho", 0.8, 0.9, 1000, 0.3)
        video = input.video.hflip()
        out = ffmpeg.output(audio, video, 'out.mp4')




        # await self._run_with_progress(process, progress_callback)

    async def transcode_interlaced(
        self,
        output_path: str | Path,
        format_type: str = "mp4",
        tff: bool = True,
        progress_callback: Optional[Callable[[float], None]] = None,
    ) -> None:
        stream = ffmpeg.input(str(self.input_path))
        top_val = 1 if tff else 0

        if format_type == "mp4":
            field_flag = "tff" if tff else "bff"
            out = ffmpeg.output(
                stream.video,
                stream.audio,
                str(output_path),
                vcodec="libx265",
                acodec="copy",
                top=top_val,
                pix_fmt="yuv420p",
                **{"x265-params": f"interlaced={field_flag}:fields=1"},
            )
        elif format_type == "mpegts":
            out = ffmpeg.output(
                stream.video,
                stream.audio,
                str(output_path),
                vcodec="mpeg2video",
                acodec="mp2",
                format="mpegts",
                flags="+ilme+ildct",
                top=top_val,
                **{"b:v": "15M", "maxrate": "18M", "bufsize": "12M"},
            )
        else:
            raise ValueError(f"Unsupported format type: {format_type}")

        await self._run_with_progress(out, progress_callback)

    async def transcode_vaapi_hw(
        self,
        output_path: str | Path,
        codec: str = "hevc_vaapi",  # 'hevc_vaapi', 'h264_vaapi'
        qp: int = 25,
        progress_callback: Optional[Callable[[float], None]] = None,
    ) -> None:
        """Encodes output using Linux VAAPI hardware acceleration."""
        stream = ffmpeg.input(str(self.input_path))

        # Construct hardware device pipeline and scale/upload filter graph
        out = (
            ffmpeg.output(
                stream.video,
                stream.audio,
                str(output_path),
                vcodec=codec,
                acodec="copy",
                qp=qp,
                vf="format=nv12,hwupload",
            )
            .global_args("-vaapi_device", self.vaapi_device)
            .global_args("-filter_hw_device", self.vaapi_device)
        )

        await self._run_with_progress(out, progress_callback)


# --- Example Execution Pipeline ---
def main():
    input_file = "/home/kamba/code/projects/transcodarr/lib/blender/crew_4cif.y4m"
    progressive_out = "crew_progressive.mp4"
    vaapi_out = "/home/kamba/code/projects/transcodarr/lib/output/crew_vaapi.mp4"

    def print_progress(percent: float):
        print(f"\rEncoding Progress: {percent:.2f}%", end="", flush=True)

    transcoder = InterlacedTranscoder(input_file)

    # 1. Progressive Encoding with Async Progress Bar
    print("=== Starting Async Progressive Transcode ===")
    res = transcoder.transcode_progressive(vaapi_out, crf=22)
    print("\nEncoding complete.\n")

    # 2. Inspecting Quality with StreamInspector
    print("=== Inspecting Progressive Stream Quality ===")
    inspector = StreamInspector(reference_path=input_file, target_path=progressive_out)
    report = inspector.inspect_quality(ssim_threshold=0.88)
    print(f"Inspection Result: {report}")

    # 3. VAAPI Hardware Transcode
    if Path("/dev/dri/renderD128").exists():
        print("\n=== Starting VAAPI HW Accelerated Transcode ===")
        transcoder.transcode_vaapi_hw(
            vaapi_out, qp=28, progress_callback=print_progress
        )
        print("\nVAAPI Encoding complete.\n")


if __name__ == "__main__":
    main()
    #asyncio.run(main())
