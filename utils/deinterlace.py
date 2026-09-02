from pathlib import Path
from typing import Any, Dict, Optional, Tuple
import ffmpeg


class InterlacedTranscoder:
    """Probes video metadata and encodes media into interlaced H.265 or MPEG-2 TS."""

    def __init__(self, input_path: str | Path):
        self.input_path = Path(input_path).resolve()
        if not self.input_path.exists():
            raise FileNotFoundError(f"Input file not found: {self.input_path}")
        self._metadata: Optional[Dict[str, Any]] = None

    def probe(self) -> Dict[str, Any]:
        """Extracts stream metadata using ffprobe."""
        if self._metadata is None:
            self._metadata = ffmpeg.probe(str(self.input_path))
        return self._metadata

    def get_video_stream_info(self) -> Dict[str, Any]:
        """Returns the primary video stream metadata dictionary."""
        meta = self.probe()
        video_streams = [
            s for s in meta.get("streams", []) if s.get("codec_type") == "video"
        ]
        if not video_streams:
            raise ValueError("No video stream found in the media file.")
        return video_streams[0]

    def get_field_order(self) -> str:
        """Determines if video is interlaced ('tt', 'bb', 'tb', 'bt') or progressive ('progressive')."""
        info = self.get_video_stream_info()
        return info.get("field_order", "unknown")

    def transcode_h265_interlaced(
        self,
        output_path: str | Path,
        tff: bool = True,
        preset: str = "medium",
        crf: int = 23,
    ) -> None:
        """Encodes stream to Interlaced H.265/HEVC (MP4 container)."""
        output_path = str(output_path)
        field_flag = "tff" if tff else "bff"
        top_val = 1 if tff else 0

        stream = ffmpeg.input(str(self.input_path))

        # Build output graph with x265 interlaced parameters
        output = ffmpeg.output(
            stream.video,
            stream.audio,
            output_path,
            vcodec="libx265",
            acodec="copy",
            pix_fmt="yuv420p",
            preset=preset,
            crf=crf,
            top=top_val,
            **{"x265-params": f"interlaced={field_flag}:fields=1"},
        )

        ffmpeg.run(output.overwrite_output(), capture_stdout=True, capture_stderr=True)

    def transcode_mpeg2_ts_interlaced(
        self,
        output_path: str | Path,
        tff: bool = True,
        video_bitrate: str = "15M",
        maxrate: str = "18M",
        bufsize: str = "12M",
    ) -> None:
        """Encodes stream to Interlaced MPEG-2 Transport Stream (.ts)."""
        output_path = str(output_path)
        top_val = 1 if tff else 0

        stream = ffmpeg.input(str(self.input_path))

        output = ffmpeg.output(
            stream.video,
            stream.audio,
            output_path,
            vcodec="mpeg2video",
            acodec="mp2",
            format="mpegts",
            flags="+ilme+ildct",
            top=top_val,
            **{
                "b:v": video_bitrate,
                "maxrate": maxrate,
                "bufsize": bufsize,
            },
        )

        ffmpeg.run(output.overwrite_output(), capture_stdout=True, capture_stderr=True)


# --- Example Usage ---
if __name__ == "__main__":
    sample_file = "crew_1080i.y4m"

    try:
        transcoder = InterlacedTranscoder(sample_file)

        # 1. Probe video parameters
        video_info = transcoder.get_video_stream_info()
        print(f"Codec: {video_info.get('codec_name')}")
        print(f"Resolution: {video_info.get('width')}x{video_info.get('height')}")
        print(f"Field Order: {transcoder.get_field_order()}")

        # 2. Transcode to Interlaced H.265
        print("Transcoding to H.265 Interlaced...")
        transcoder.transcode_h265_interlaced(
            output_path="crew_h265_1080i.mp4", tff=True
        )

        # 3. Transcode to Interlaced MPEG-2 TS
        print("Transcoding to MPEG-2 TS Interlaced...")
        transcoder.transcode_mpeg2_ts_interlaced(
            output_path="crew_mpeg2_1080i.ts", tff=True
        )

        print("Transcoding finished successfully.")

    except Exception as e:
        print(f"Error: {e}")