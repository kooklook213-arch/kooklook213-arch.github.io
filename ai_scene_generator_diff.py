--- ai_scene_generator.py (原始)


+++ ai_scene_generator.py (修改后)
#!/usr/bin/env python3
"""
AI Scene Generator - Analyzes prompts and selects appropriate poses/themes.
"""

import json
from typing import List, Dict, Optional
from blockbench_ai_animation import MinecraftAnimationGenerator


class AISceneGenerator:
    """Generate animations from natural language prompts."""

    def __init__(self, prompt: str, duration_ticks: int = 120):
        self.prompt = prompt.lower()
        self.duration_ticks = duration_ticks
        self.generator = MinecraftAnimationGenerator("ai_scene", duration_ticks)

        # Topic mapping for pose selection
        self.topic_map = [
            {
                "keywords": ["crouch", "squat", "kneel", "sit", "seated", "rest"],
                "poses": ["crouch", "sit", "stare", "standing"],
                "theme": "sunset"
            },
            {
                "keywords": ["yoga", "stretch", "flex", "balance", "meditation", "zen"],
                "poses": ["yoga_warrior_ii", "yoga_tree", "yoga_downward_dog", "standing"],
                "theme": "lavender"
            },
            {
                "keywords": ["fight", "combat", "battle", "attack", "kick", "martial", "boxer", "guard"],
                "poses": ["front_kick", "martial_stance", "guard", "boxer", "running"],
                "theme": "neon"
            },
            {
                "keywords": ["camera", "cinematic", "story", "scene", "framing", "filming", "storytelling"],
                "poses": ["stare", "wave", "prayer", "greeting", "standing"],
                "theme": "sunrise"
            },
            {
                "keywords": ["wave", "hello", "greet", "talk", "salute"],
                "poses": ["wave", "greeting", "salute", "standing"],
                "theme": "ocean"
            },
            {
                "keywords": ["dance", "fitness", "aerobic", "exercise", "workout"],
                "poses": ["dance_1", "dance_2", "dance_3", "jump", "running"],
                "theme": "rainbow"
            },
            {
                "keywords": ["walk", "move", "travel", "journey", "explore"],
                "poses": ["running", "standing"],
                "theme": "forest",
                "procedural": True
            },
            {
                "keywords": ["jump", "leap", "hop", "bounce"],
                "poses": ["jump", "standing"],
                "theme": "sky"
            }
        ]

        # Analyze prompt
        self.identified_topics = self._identify_topics()
        self.selected_poses = self._select_poses()
        self.selected_theme = self._select_theme()

    def _identify_topics(self) -> List[str]:
        """Identify topics from the prompt."""
        topics = []
        for entry in self.topic_map:
            if any(keyword in self.prompt for keyword in entry["keywords"]):
                topics.extend(entry["keywords"][:2])  # Add first 2 matching keywords

        if not topics:
            topics = ["general", "animation"]

        return list(set(topics))[:5]  # Return up to 5 unique topics

    def _select_poses(self) -> List[str]:
        """Select poses based on identified topics."""
        selected = set()

        for entry in self.topic_map:
            if any(keyword in self.prompt for keyword in entry["keywords"]):
                selected.update(entry["poses"])

        if not selected:
            selected = {"standing", "stare", "wave"}

        return list(selected)[:6]  # Return up to 6 poses

    def _select_theme(self) -> str:
        """Select theme based on identified topics."""
        for entry in self.topic_map:
            if any(keyword in self.prompt for keyword in entry["keywords"]):
                return entry.get("theme", "studio")

        return "studio"

    def export_scene(self, filename: str) -> str:
        """Export the AI-generated scene to a file."""
        # Check if procedural animation is needed
        is_procedural = False
        for entry in self.topic_map:
            if any(keyword in self.prompt for keyword in entry["keywords"]):
                is_procedural = entry.get("procedural", False)
                break

        # Add selected poses
        for pose in self.selected_poses:
            try:
                self.generator.add_pose(pose)
            except ValueError:
                pass  # Skip unknown poses

        # Add procedural animations if needed
        if is_procedural or "walk" in self.prompt or "move" in self.prompt:
            self.generator.add_walking_cycle("leftArm", "rotation.x")
            self.generator.add_walking_cycle("rightArm", "rotation.x")
            self.generator.add_walking_cycle("leftLeg", "rotation.x")
            self.generator.add_walking_cycle("rightLeg", "rotation.x")
            self.generator.add_idle_animation("head", "rotation.y", amplitude=3)

        # Set theme
        self.generator.set_background_theme(self.selected_theme)

        # Update animation name
        topic_slug = self.identified_topics[0] if self.identified_topics else "scene"
        self.generator.animation_name = f"ai_scene_{topic_slug}"

        return self.generator.save_json(filename)

    def get_summary(self) -> Dict:
        """Get a summary of the AI analysis."""
        return {
            "prompt": self.prompt,
            "identified_topics": self.identified_topics,
            "selected_poses": self.selected_poses,
            "selected_theme": self.selected_theme,
            "duration_ticks": self.duration_ticks
        }


if __name__ == "__main__":
    # Test with sample prompts
    test_prompts = [
        "dancing and fitness activities",
        "storytelling with character emotions",
        "meditation and yoga practice",
        "combat fighting scene"
    ]

    for prompt in test_prompts:
        print(f"\n{'='*60}")
        print(f"Prompt: {prompt}")
        print('='*60)

        generator = AISceneGenerator(prompt, duration_ticks=120)
        summary = generator.get_summary()

        print(f"Topics: {summary['identified_topics']}")
        print(f"Theme: {summary['selected_theme']}")
        print(f"Poses: {summary['selected_poses']}")

        filename = f"ai_test_{summary['identified_topics'][0]}.json"
        generator.export_scene(filename)
