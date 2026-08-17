#!/usr/bin/env python3
"""
Usage Examples: Blockbench AI Animation Generator
Shows how to use the generator from Python code.
"""

from blockbench_ai_animation import MinecraftAnimationGenerator
from ai_scene_generator import AISceneGenerator


def example_1_simple_pose():
    """Example 1: Add a single pose and export."""
    print("=" * 60)
    print("EXAMPLE 1: Simple Pose Export")
    print("=" * 60)

    animator = MinecraftAnimationGenerator("standing_pose", duration_ticks=20)
    animator.add_pose("standing")
    animator.set_background_theme("studio")
    animator.save_json("example_1_standing.json")
    print("✓ Created: example_1_standing.json\n")


def example_2_multi_pose_animation():
    """Example 2: Combine multiple poses into one animation."""
    print("=" * 60)
    print("EXAMPLE 2: Multi-Pose Animation Sequence")
    print("=" * 60)

    animator = MinecraftAnimationGenerator("combat_sequence", duration_ticks=60)
    animator.add_pose("standing")
    animator.add_pose("front_kick")
    animator.add_pose("martial_stance")
    animator.set_background_theme("neon", custom_colors=["#06b6d4", "#f472b6", "#8b5cf6"])
    animator.save_json("example_2_combat.json")
    print("✓ Created: example_2_combat.json\n")


def example_3_yoga_sequence():
    """Example 3: Yoga pose flow."""
    print("=" * 60)
    print("EXAMPLE 3: Yoga Sequence")
    print("=" * 60)

    animator = MinecraftAnimationGenerator("yoga_flow", duration_ticks=80)
    animator.add_pose("yoga_warrior_ii")
    animator.add_pose("yoga_tree")
    animator.add_pose("yoga_downward_dog")
    animator.set_background_theme("lavender")
    animator.save_json("example_3_yoga.json")
    print("✓ Created: example_3_yoga.json\n")


def example_4_ai_from_prompt():
    """Example 4: AI-generated scene from a research prompt."""
    print("=" * 60)
    print("EXAMPLE 4: AI-Generated Scene from Research Prompt")
    print("=" * 60)

    prompts = [
        "dancing and fitness activities",
        "storytelling with character emotions",
        "meditation and yoga practice",
    ]

    for prompt in prompts:
        print(f"\n  Prompt: '{prompt}'")
        generator = AISceneGenerator(prompt, duration_ticks=120)
        print(f"  → Topics: {generator.identified_topics}")
        print(f"  → Theme: {generator.selected_theme}")
        print(f"  → Poses: {len(generator.selected_poses)} selected")

        filename = f"example_4_ai_{generator.identified_topics[0]}.json"
        generator.export_scene(filename)
        print(f"  ✓ Created: {filename}")

    print()


def example_5_custom_walking_cycle():
    """Example 5: Procedural animation (walking cycle)."""
    print("=" * 60)
    print("EXAMPLE 5: Procedural Walking Cycle")
    print("=" * 60)

    animator = MinecraftAnimationGenerator("walk_cycle", duration_ticks=40)
    animator.add_walking_cycle("leftArm", "rotation.x")
    animator.add_walking_cycle("rightArm", "rotation.x")
    animator.add_walking_cycle("leftLeg", "rotation.x")
    animator.add_walking_cycle("rightLeg", "rotation.x")
    animator.add_idle_animation("head", "rotation.y", amplitude=3)
    animator.set_background_theme("forest")
    animator.save_json("example_5_walk.json")
    print("✓ Created: example_5_walk.json\n")


def example_6_list_all_poses():
    """Example 6: Inspect the pose library."""
    print("=" * 60)
    print("EXAMPLE 6: Exploring the Pose Library")
    print("=" * 60)

    animator = MinecraftAnimationGenerator("pose_explorer", duration_ticks=20)
    poses = animator.list_pose_names()

    print(f"Total poses available: {len(poses)}\n")
    print("Sample categories:")
    print(f"  Yoga: {[p for p in poses if 'yoga' in p]}")
    print(f"  Combat: {[p for p in poses if any(x in p for x in ['kick', 'martial', 'stance', 'guard', 'boxer'])]}")
    print(f"  Dance: {[p for p in poses if 'dance' in p][:5]}")
    print()


def example_7_list_themes():
    """Example 7: Explore available color themes."""
    print("=" * 60)
    print("EXAMPLE 7: Exploring Color Themes")
    print("=" * 60)

    animator = MinecraftAnimationGenerator("theme_explorer", duration_ticks=20)

    print("Available themes and colors:")
    for theme_name, colors in animator.background_palette.items():
        print(f"  {theme_name:15} → {' | '.join(colors[:2])}")
    print()


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("BLOCKBENCH AI ANIMATION GENERATOR - USAGE EXAMPLES")
    print("=" * 60 + "\n")

    example_1_simple_pose()
    example_2_multi_pose_animation()
    example_3_yoga_sequence()
    example_4_ai_from_prompt()
    example_5_custom_walking_cycle()
    example_6_list_all_poses()
    example_7_list_themes()

    print("=" * 60)
    print("✓ All examples completed! Check the generated .json files.")
    print("=" * 60)
