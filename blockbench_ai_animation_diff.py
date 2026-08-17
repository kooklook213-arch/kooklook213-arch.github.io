--- blockbench_ai_animation.py (原始)


+++ blockbench_ai_animation.py (修改后)
#!/usr/bin/env python3
"""
Blockbench AI Animation Generator - Core Module
Generates Blockbench-compatible animation JSON files with AI-assisted pose selection.
"""

import json
import math
import os
from typing import Optional, List, Dict, Any


class MinecraftAnimationGenerator:
    """Generate Blockbench-compatible animation files."""

    def __init__(self, animation_name: str, duration_ticks: int = 20):
        self.animation_name = animation_name
        self.duration_ticks = duration_ticks
        self.keyframes: Dict[str, List[Dict]] = {}
        self.pose_library = self._build_pose_library()
        self.scene = {
            "background": {
                "theme": "studio",
                "color": ["#4f46e5", "#a78bfa", "#f8fafc"],
                "lighting": "soft"
            }
        }
        self.background_palette = {
            "studio": ["#4f46e5", "#a78bfa", "#f8fafc"],
            "sunset": ["#f97316", "#fb7185", "#facc15"],
            "forest": ["#14532d", "#22c55e", "#bef264"],
            "neon": ["#06b6d4", "#8b5cf6", "#f472b6"],
            "ocean": ["#0ea5e9", "#1d4ed8", "#a5f3fc"],
            "desert": ["#f59e0b", "#fcd34d", "#fb923c"],
            "sunrise": ["#fbbf24", "#f472b6", "#fef3c7"],
            "midnight": ["#111827", "#312e81", "#67e8f9"],
            "rainbow": ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7"],
            "lavender": ["#c084fc", "#a78bfa", "#f9a8d4"]
        }

    def _build_pose_library(self) -> Dict[str, Dict]:
        """Build the internal pose library."""
        library = {
            "standing": {
                "body": {"rotation.x": 0, "rotation.y": 0, "rotation.z": 0},
                "head": {"rotation.x": 0, "rotation.y": 0, "rotation.z": 0},
                "leftArm": {"rotation.x": 0, "rotation.y": 0, "rotation.z": -10},
                "rightArm": {"rotation.x": 0, "rotation.y": 0, "rotation.z": 10},
                "leftLeg": {"rotation.x": 0, "rotation.y": 0, "rotation.z": 2},
                "rightLeg": {"rotation.x": 0, "rotation.y": 0, "rotation.z": -2}
            },
            "crouch": {
                "body": {"rotation.x": -15, "position.y": -8},
                "leftArm": {"rotation.x": 20, "rotation.z": -18},
                "rightArm": {"rotation.x": 20, "rotation.z": 18},
                "leftLeg": {"rotation.x": 35, "rotation.z": 10},
                "rightLeg": {"rotation.x": 35, "rotation.z": -10}
            },
            "sit": {
                "body": {"rotation.x": 25, "position.y": -6},
                "leftArm": {"rotation.x": 15, "rotation.z": -12},
                "rightArm": {"rotation.x": 15, "rotation.z": 12},
                "leftLeg": {"rotation.x": 80, "rotation.z": 10},
                "rightLeg": {"rotation.x": 80, "rotation.z": -10}
            },
            "stare": {
                "head": {"rotation.x": 2, "rotation.y": 0},
                "body": {"rotation.x": 0},
                "leftArm": {"rotation.x": 0, "rotation.z": -10},
                "rightArm": {"rotation.x": 0, "rotation.z": 10}
            },
            "wave": {
                "leftArm": {"rotation.x": -45, "rotation.z": -80},
                "body": {"rotation.y": 10}
            },
            "prayer": {
                "body": {"rotation.x": 0},
                "leftArm": {"rotation.x": -15, "rotation.z": -55},
                "rightArm": {"rotation.x": -15, "rotation.z": 55}
            },
            "jump": {
                "body": {"rotation.x": 10, "position.y": 18},
                "leftArm": {"rotation.x": -25, "rotation.z": -20},
                "rightArm": {"rotation.x": -25, "rotation.z": 20},
                "leftLeg": {"rotation.x": -30},
                "rightLeg": {"rotation.x": -30}
            },
            "running": {
                "body": {"rotation.x": 8},
                "leftArm": {"rotation.x": 55, "rotation.z": -12},
                "rightArm": {"rotation.x": -55, "rotation.z": 12},
                "leftLeg": {"rotation.x": -55, "rotation.z": 4},
                "rightLeg": {"rotation.x": 55, "rotation.z": -4}
            },
            "yoga_warrior_ii": {
                "body": {"rotation.z": 18, "rotation.x": 5},
                "leftArm": {"rotation.z": -55, "rotation.x": 25},
                "rightArm": {"rotation.z": 55, "rotation.x": -25},
                "leftLeg": {"rotation.x": 35, "rotation.z": -20},
                "rightLeg": {"rotation.x": -25, "rotation.z": 20}
            },
            "yoga_tree": {
                "body": {"rotation.x": 0},
                "leftArm": {"rotation.z": -45, "rotation.x": -10},
                "rightArm": {"rotation.z": 45, "rotation.x": 10},
                "leftLeg": {"rotation.x": 5, "rotation.z": 15},
                "rightLeg": {"rotation.x": -5, "rotation.z": -15}
            },
            "yoga_downward_dog": {
                "body": {"rotation.x": 25},
                "leftArm": {"rotation.x": 65, "rotation.z": -20},
                "rightArm": {"rotation.x": 65, "rotation.z": 20},
                "leftLeg": {"rotation.x": -65, "rotation.z": 10},
                "rightLeg": {"rotation.x": -65, "rotation.z": -10}
            },
            "salute": {
                "leftArm": {"rotation.x": -55, "rotation.z": -60},
                "head": {"rotation.y": -10}
            },
            "greeting": {
                "body": {"rotation.y": 15},
                "leftArm": {"rotation.x": -35, "rotation.z": -50},
                "head": {"rotation.y": 12}
            },
            "front_kick": {
                "leftLeg": {"rotation.x": -85, "rotation.z": 10},
                "body": {"rotation.x": 10}
            },
            "martial_stance": {
                "body": {"rotation.x": 5, "rotation.z": 10},
                "leftArm": {"rotation.x": -30, "rotation.z": -45},
                "rightArm": {"rotation.x": 30, "rotation.z": 45},
                "leftLeg": {"rotation.x": 20, "rotation.z": -15},
                "rightLeg": {"rotation.x": -20, "rotation.z": 15}
            },
            "guard": {
                "body": {"rotation.x": -10},
                "leftArm": {"rotation.x": -40, "rotation.z": -50},
                "rightArm": {"rotation.x": -40, "rotation.z": 50},
                "head": {"rotation.x": 5}
            },
            "boxer": {
                "body": {"rotation.x": -5, "rotation.z": 8},
                "leftArm": {"rotation.x": -35, "rotation.z": -40},
                "rightArm": {"rotation.x": 35, "rotation.z": 40},
                "leftLeg": {"rotation.x": 15, "rotation.z": -10},
                "rightLeg": {"rotation.x": -15, "rotation.z": 10}
            },
            "dance_1": {
                "body": {"rotation.y": 20, "rotation.x": 5},
                "leftArm": {"rotation.x": -60, "rotation.z": -70},
                "rightArm": {"rotation.x": 60, "rotation.z": 70},
                "leftLeg": {"rotation.x": -40, "rotation.z": 20},
                "rightLeg": {"rotation.x": 40, "rotation.z": -20}
            },
            "dance_2": {
                "body": {"rotation.y": -20, "rotation.x": -5},
                "leftArm": {"rotation.x": 60, "rotation.z": 70},
                "rightArm": {"rotation.x": -60, "rotation.z": -70},
                "leftLeg": {"rotation.x": 40, "rotation.z": -20},
                "rightLeg": {"rotation.x": -40, "rotation.z": 20}
            },
            "dance_3": {
                "body": {"rotation.z": 25},
                "leftArm": {"rotation.x": -50, "rotation.y": 30},
                "rightArm": {"rotation.x": 50, "rotation.y": -30},
                "leftLeg": {"rotation.x": -30},
                "rightLeg": {"rotation.x": 30}
            }
        }

        # Add loop variants
        for name in ["standing_loop", "crouch_loop", "sit_loop", "stare_loop"]:
            library[name] = library[name.replace("_loop", "")]

        # Add extra placeholder poses
        for i in range(1, 121):
            library[f"pose_{i}"] = dict(library["standing"])

        return library

    def set_background_theme(self, theme_name: str, custom_colors: Optional[List[str]] = None) -> 'MinecraftAnimationGenerator':
        """Set the background theme."""
        palette = custom_colors or self.background_palette.get(theme_name, self.background_palette["studio"])
        self.scene = {
            "background": {
                "theme": theme_name,
                "color": palette,
                "lighting": "soft"
            }
        }
        return self

    def add_pose(self, pose_name: str, bone_overrides: Optional[Dict] = None) -> 'MinecraftAnimationGenerator':
        """Add a pose to the animation."""
        if pose_name not in self.pose_library:
            raise ValueError(f"Unknown pose '{pose_name}'. Use list_pose_names().")

        pose = json.loads(json.dumps(self.pose_library[pose_name]))
        if bone_overrides:
            merged = dict(pose)
            for bone, overrides in bone_overrides.items():
                merged[bone] = {**(merged.get(bone, {})), **overrides}
            pose = merged

        for bone_name, axes in pose.items():
            if bone_name not in self.keyframes:
                self.keyframes[bone_name] = []

            # Clear existing keyframes for this bone
            self.keyframes[bone_name] = [
                {"timestamp": 0, **axes},
                {"timestamp": self.duration_ticks - 1, **axes}
            ]

        return self

    def add_walking_cycle(self, body_part: str, axis: str = "rotation.x") -> 'MinecraftAnimationGenerator':
        """Add a procedural walking cycle."""
        keyframes = []
        for tick in range(0, self.duration_ticks, 10):
            progress = tick / max(self.duration_ticks, 1)
            angle = math.sin(progress * math.pi * 2) * 45
            keyframe = {"timestamp": tick}
            keyframe[axis] = angle
            keyframes.append(keyframe)
        self.keyframes[body_part] = keyframes
        return self

    def add_idle_animation(self, body_part: str, axis: str = "rotation.x", amplitude: float = 5) -> 'MinecraftAnimationGenerator':
        """Add a subtle idle animation."""
        keyframes = []
        for tick in range(0, self.duration_ticks, 20):
            progress = (tick / max(self.duration_ticks, 1)) % 1
            angle = math.sin(progress * math.pi * 2) * amplitude
            keyframe = {"timestamp": tick}
            keyframe[axis] = angle
            keyframes.append(keyframe)
        self.keyframes[body_part] = keyframes
        return self

    def list_pose_names(self) -> List[str]:
        """List all available pose names."""
        return sorted(self.pose_library.keys())

    def export_for_blockbench(self) -> Dict[str, Any]:
        """Export animation data in Blockbench format."""
        animation_data = {
            "format_version": "1.8.0",
            "scene": self.scene,
            "animations": {
                self.animation_name: {
                    "loop": True,
                    "animation_length": self.duration_ticks / 20,
                    "bones": {}
                }
            }
        }

        for bone_name, keyframes in self.keyframes.items():
            bone_data = {"rotation": [], "position": []}

            for keyframe in keyframes:
                # Handle rotation
                if any(f"rotation.{ax}" in keyframe for ax in ["x", "y", "z"]):
                    bone_data["rotation"].append({
                        "time": keyframe["timestamp"] / 20,
                        "angle": [
                            keyframe.get("rotation.x", 0),
                            keyframe.get("rotation.y", 0),
                            keyframe.get("rotation.z", 0)
                        ]
                    })

                # Handle position
                if any(f"position.{ax}" in keyframe for ax in ["x", "y", "z"]):
                    bone_data["position"].append({
                        "time": keyframe["timestamp"] / 20,
                        "x": keyframe.get("position.x", 0),
                        "y": keyframe.get("position.y", 0),
                        "z": keyframe.get("position.z", 0)
                    })

            animation_data["animations"][self.animation_name]["bones"][bone_name] = bone_data

        return animation_data

    def save_json(self, filename: str) -> str:
        """Save animation to JSON file."""
        data = self.export_for_blockbench()

        # Ensure directory exists
        dir_path = os.path.dirname(filename)
        if dir_path and dir_path != ".":
            os.makedirs(dir_path, exist_ok=True)

        safe_filename = filename if "/" in filename else f"./{filename}"
        temp_filename = f"{safe_filename}.tmp-{os.getpid()}"

        with open(temp_filename, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

        os.rename(temp_filename, safe_filename)
        print(f"✓ Animation saved to {safe_filename}")
        return safe_filename


if __name__ == "__main__":
    # Quick test
    animator = MinecraftAnimationGenerator("test_pose", duration_ticks=20)
    animator.add_pose("standing")
    animator.set_background_theme("studio")
    animator.save_json("test_output.json")
    print(f"Available poses: {len(animator.list_pose_names())}")
