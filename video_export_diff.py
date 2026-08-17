--- video_export.py (原始)


+++ video_export.py (修改后)
#!/usr/bin/env python3
"""
Video Export for Blockbench AI Animation Generator

Handles video rendering configuration, file size estimation, and long animation
segmentation for exporting animations to MP4/WebM format.
"""

from typing import Dict, List, Optional, Any, Tuple
import math


class VideoExportConfig:
    """Configuration for video export settings."""

    RESOLUTIONS = {
        '720p': (1280, 720),
        '1080p': (1920, 1080),
        '1440p': (2560, 1440),
        '4k': (3840, 2160),
    }

    FRAMERATES = [24, 30, 60]
    QUALITIES = ['fast', 'medium', 'slow']

    def __init__(self, resolution: str = '1080p', framerate: int = 30,
                 quality: str = 'medium'):
        self.resolution = resolution
        self.framerate = framerate
        self.quality = quality

        if resolution not in self.RESOLUTIONS:
            raise ValueError(f"Invalid resolution '{resolution}'. "
                           f"Available: {', '.join(self.RESOLUTIONS.keys())}")

        if framerate not in self.FRAMERATES:
            raise ValueError(f"Invalid framerate {framerate}. "
                           f"Available: {', '.join(map(str, self.FRAMERATES))}")

        if quality not in self.QUALITIES:
            raise ValueError(f"Invalid quality '{quality}'. "
                           f"Available: {', '.join(self.QUALITIES)}")

    def get_dimensions(self) -> Tuple[int, int]:
        """Get width and height for the selected resolution."""
        return self.RESOLUTIONS[self.resolution]

    def estimate_file_size_mb(self, duration_seconds: float) -> float:
        """
        Estimate output file size in megabytes.

        Args:
            duration_seconds: Duration of the video in seconds

        Returns:
            Estimated file size in MB
        """
        width, height = self.get_dimensions()
        pixels = width * height

        # Bitrate multipliers based on quality
        quality_multipliers = {
            'fast': 0.5,
            'medium': 1.0,
            'slow': 1.5
        }

        # Base bitrate: ~0.1 bits per pixel per frame
        base_bitrate = pixels * self.framerate * 0.1
        adjusted_bitrate = base_bitrate * quality_multipliers[self.quality]

        # Convert to MB: bits * seconds / 8 / 1024 / 1024
        size_mb = (adjusted_bitrate * duration_seconds) / 8 / 1024 / 1024

        return round(size_mb, 2)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON export."""
        width, height = self.get_dimensions()
        return {
            'resolution': self.resolution,
            'width': width,
            'height': height,
            'framerate': self.framerate,
            'quality': self.quality
        }


class AnimationVideoExporter:
    """Handles video export operations for animations."""

    def __init__(self, animation_data: Dict[str, Any]):
        self.animation_data = animation_data
        self.config = VideoExportConfig()
        self.segments: List[Dict[str, Any]] = []

    def set_resolution(self, resolution: str) -> 'AnimationVideoExporter':
        """Set video resolution (720p, 1080p, 1440p, 4k)."""
        self.config = VideoExportConfig(
            resolution=resolution,
            framerate=self.config.framerate,
            quality=self.config.quality
        )
        return self

    def set_framerate(self, framerate: int) -> 'AnimationVideoExporter':
        """Set video framerate (24, 30, or 60 fps)."""
        self.config = VideoExportConfig(
            resolution=self.config.resolution,
            framerate=framerate,
            quality=self.config.quality
        )
        return self

    def set_quality(self, quality: str) -> 'AnimationVideoExporter':
        """Set encoding quality (fast, medium, slow)."""
        self.config = VideoExportConfig(
            resolution=self.config.resolution,
            framerate=self.config.framerate,
            quality=quality
        )
        return self

    def get_duration_seconds(self) -> float:
        """Get total animation duration in seconds."""
        if 'animations' not in self.animation_data:
            return 0.0

        first_anim = next(iter(self.animation_data['animations'].values()), None)
        if not first_anim:
            return 0.0

        return first_anim.get('animation_length', 0.0)

    def segment_animation(self, max_segment_seconds: float = 60.0) -> List[Dict[str, Any]]:
        """
        Split long animations into manageable segments.

        Args:
            max_segment_seconds: Maximum duration per segment (default 60s)

        Returns:
            List of segment configurations
        """
        total_duration = self.get_duration_seconds()

        if total_duration <= max_segment_seconds:
            self.segments = [{
                'index': 0,
                'start_time': 0.0,
                'end_time': total_duration,
                'duration': total_duration
            }]
            return self.segments

        num_segments = math.ceil(total_duration / max_segment_seconds)
        segment_duration = total_duration / num_segments

        self.segments = []
        for i in range(num_segments):
            start_time = i * segment_duration
            end_time = min((i + 1) * segment_duration, total_duration)

            self.segments.append({
                'index': i,
                'start_time': start_time,
                'end_time': end_time,
                'duration': end_time - start_time,
                'total_segments': num_segments
            })

        return self.segments

    def get_export_metadata(self) -> Dict[str, Any]:
        """Get complete export metadata including all settings."""
        duration = self.get_duration_seconds()
        file_size = self.config.estimate_file_size_mb(duration)

        metadata = {
            'animation_name': list(self.animation_data.get('animations', {}).keys())[0] if self.animation_data.get('animations') else 'unknown',
            'duration_seconds': duration,
            'export_config': self.config.to_dict(),
            'estimated_file_size_mb': file_size,
            'segments': self.segments if self.segments else self.segment_animation()
        }

        return metadata

    def export_to_mp4(self, output_path: str) -> Dict[str, Any]:
        """
        Generate export instructions for MP4 rendering.

        Note: Actual video rendering requires external tools like ffmpeg
        or Blockbench's built-in video exporter. This method provides
        the configuration and metadata needed for rendering.

        Args:
            output_path: Path for the output MP4 file

        Returns:
            Dictionary with export information and instructions
        """
        metadata = self.get_export_metadata()

        export_info = {
            'output_path': output_path,
            'format': 'mp4',
            'codec': 'h264',
            **metadata
        }

        # Add rendering instructions
        export_info['instructions'] = {
            'step_1': 'Open animation in Blockbench',
            'step_2': 'Go to File → Export → Export Video',
            'step_3': f'Set resolution to {self.config.resolution}',
            'step_4': f'Set framerate to {self.config.framerate} fps',
            'step_5': f'Expected file size: ~{metadata["estimated_file_size_mb"]} MB',
            'step_6': 'Click Render and wait for completion'
        }

        return export_info

    def generate_ffmpeg_command(self, input_frames_pattern: str,
                                output_path: str) -> str:
        """
        Generate ffmpeg command for rendering from frame sequence.

        Args:
            input_frames_pattern: Pattern for input frames (e.g., 'frame_%04d.png')
            output_path: Output video path

        Returns:
            Complete ffmpeg command string
        """
        width, height = self.config.get_dimensions()

        # Quality presets for ffmpeg
        quality_presets = {
            'fast': 'ultrafast',
            'medium': 'medium',
            'slow': 'slow'
        }

        preset = quality_presets[self.config.quality]

        command = (
            f"ffmpeg -framerate {self.config.framerate} "
            f"-i {input_frames_pattern} "
            f"-c:v libx264 -preset {preset} -crf 23 "
            f"-vf scale={width}:{height} "
            f"-pix_fmt yuv420p "
            f"-y {output_path}"
        )

        return command

    def to_dict(self) -> Dict[str, Any]:
        """Convert exporter state to dictionary."""
        return {
            'animation_data': self.animation_data,
            'config': self.config.to_dict(),
            'segments': self.segments,
            'metadata': self.get_export_metadata()
        }


def calculate_render_time_estimate(duration_seconds: float,
                                   quality: str = 'medium') -> str:
    """
    Estimate rendering time based on duration and quality.

    Args:
        duration_seconds: Animation duration in seconds
        quality: Quality setting (fast, medium, slow)

    Returns:
        Human-readable time estimate
    """
    # Rough estimates based on typical rendering speeds
    speed_multipliers = {
        'fast': 0.5,      # Real-time rendering
        'medium': 1.5,    # 1.5x real-time
        'slow': 3.0       # 3x real-time
    }

    multiplier = speed_multipliers.get(quality, 1.5)
    render_seconds = duration_seconds * multiplier

    if render_seconds < 60:
        return f"{render_seconds:.0f} seconds"
    elif render_seconds < 3600:
        return f"{render_seconds / 60:.1f} minutes"
    else:
        return f"{render_seconds / 3600:.1f} hours"


if __name__ == "__main__":
    # Demo: Show video export capabilities
    print("Video Export Configuration Demo")
    print("=" * 60)

    # Create sample animation data
    sample_data = {
        'animations': {
            'demo_animation': {
                'animation_length': 300.0  # 5 minutes
            }
        }
    }

    exporter = AnimationVideoExporter(sample_data)

    print("\nDefault Settings:")
    print(f"  Resolution: {exporter.config.resolution}")
    print(f"  Framerate: {exporter.config.framerate} fps")
    print(f"  Quality: {exporter.config.quality}")

    print("\nTesting Different Resolutions:")
    for res in ['720p', '1080p', '4k']:
        test_exporter = AnimationVideoExporter(sample_data)
        test_exporter.set_resolution(res)
        duration = test_exporter.get_duration_seconds()
        size = test_exporter.config.estimate_file_size_mb(duration)
        render_time = calculate_render_time_estimate(duration, 'medium')
        print(f"  {res}: ~{size} MB, render time: ~{render_time}")

    print("\nFile Size Estimates (10 minute animation):")
    test_data = {'animations': {'test': {'animation_length': 600.0}}}
    for quality in ['fast', 'medium', 'slow']:
        test_exporter = AnimationVideoExporter(test_data)
        test_exporter.set_quality(quality)
        size = test_exporter.config.estimate_file_size_mb(600.0)
        print(f"  {quality.upper()}: ~{size} MB")

    print("\n" + "=" * 60)
    print("\nUsage Example:")
    print("  exporter = AnimationVideoExporter(animation_data)")
    print("  exporter.set_resolution('1080p').set_framerate(30)")
    print("  metadata = exporter.get_export_metadata()")
    print("  export_info = exporter.export_to_mp4('output.mp4')")
