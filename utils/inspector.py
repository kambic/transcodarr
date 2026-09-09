from pathlib import Path
import ffmpeg
import re

class StreamInspector:
    """Analyzes output stream quality relative to the input reference stream."""

    def __init__(self, reference_path: str | Path, target_path: str | Path):
        self.ref_path = Path(reference_path).resolve()
        self.target_path = Path(target_path).resolve()

        if not self.ref_path.exists() or not self.target_path.exists():
            raise FileNotFoundError("Reference or target file does not exist.")

    def compute_ssim(self) -> float:
        """Calculates mean SSIM score between reference and target stream."""
        ref = ffmpeg.input(str(self.ref_path))
        target = ffmpeg.input(str(self.target_path))

        # Run SSIM filter via ffmpeg null sink
        out = ffmpeg.filter([ref.video, target.video], "ssim")
        output = ffmpeg.output(out, "-", f="null")

        _, stderr = ffmpeg.run(output, capture_stdout=True, capture_stderr=True)
        log = stderr.decode("utf-8")

        # Parse SSIM All mean score (e.g., SSIM All:0.941234)
        match = re.search(r"All:(\d+\.\d+)", log)
        if match:
            return float(match.group(1))
        raise RuntimeError("Failed to parse SSIM metrics from ffmpeg log.")

    def compute_vmaf(self, model_path = None) -> float:
        """Calculates VMAF score (0-100) between reference and target stream."""
        ref = ffmpeg.input(str(self.ref_path))
        target = ffmpeg.input(str(self.target_path))

        vmaf_args = ""
        if model_path:
            vmaf_args = f":model_path={model_path}"

        out = ffmpeg.filter([target.video, ref.video], "libvmaf", vmaf_args)
        output = ffmpeg.output(out, "-", f="null")

        _, stderr = ffmpeg.run(output, capture_stdout=True, capture_stderr=True)
        log = stderr.decode("utf-8")

        match = re.search(r"VMAF score:\s*(\d+\.\d+)", log)
        if match:
            return float(match.group(1))
        raise RuntimeError("Failed to parse VMAF metric from ffmpeg log.")

    def inspect_quality(
        self, ssim_threshold: float = 0.85, vmaf_threshold: float = 70.0
    ):
        """Evaluates output stream degradation against configurable threshold limits."""
        ssim_score = self.compute_ssim()

        # Check for heavy quality loss / pixelation
        pixelated = ssim_score < ssim_threshold

        report = {
            "ssim": ssim_score,
            "pixelated_or_degraded": pixelated,
            "status": "PASS" if not pixelated else "WARNING",
        }

        if pixelated:
            print(
                f"\n[WARNING] Quality degradation detected! Output SSIM ({ssim_score:.4f}) "
                f"is below threshold ({ssim_threshold}). Video may appear pixelated or degraded.\n"
                f"Consider lowering CRF/QP or increasing target bitrate."
            )

        return report

