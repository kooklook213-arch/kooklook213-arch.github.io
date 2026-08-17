--- character_modes.py (原始)


+++ character_modes.py (修改后)
#!/usr/bin/env python3
"""
Character Modes for Blockbench AI Animation Generator

Provides preset character configurations (Steve, Alex, Gigantic, Tiny)
and custom character mode support for different Minecraft model types.
"""

from typing import Dict, List, Optional, Any


class CharacterMode:
    """Represents a character configuration with bone scaling and proportions."""

    def __init__(self, name: str, scale: float, arm_width: float = 4.0,
                 description: str = ""):
        self.name = name
        self.scale = scale
        self.arm_width = arm_width
        self.description = description

    def apply_to_animation(self, animator) -> None:
        """Apply this character mode to an animation generator."""
        animator.character_mode = self
        animator._apply_character_scale()

    def get_bone_scale(self, bone_name: str) -> float:
        """Get scale factor for a specific bone."""
        if 'arm' in bone_name.lower():
            return self.scale * (self.arm_width / 4.0)
        return self.scale

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON export."""
        return {
            'name': self.name,
            'scale': self.scale,
            'arm_width': self.arm_width,
            'description': self.description
        }


# Predefined character modes
STEVE = CharacterMode(
    name="steve",
    scale=1.0,
    arm_width=4.0,
    description="Classic Minecraft Steve model with 4px wide arms"
)

ALEX = CharacterMode(
    name="alex",
    scale=1.0,
    arm_width=3.0,
    description="Slim Minecraft Alex model with 3px wide arms"
)

GIGANTIC = CharacterMode(
    name="gigantic",
    scale=2.0,
    arm_width=8.0,
    description="Epic gigantic character with 2x scale for dramatic animations"
)

TINY = CharacterMode(
    name="tiny",
    scale=0.5,
    arm_width=2.0,
    description="Cute chibi-style tiny character with 0.5x scale"
)

CHARACTER_MODES: Dict[str, CharacterMode] = {
    'steve': STEVE,
    'alex': ALEX,
    'gigantic': GIGANTIC,
    'tiny': TINY,
}


def get_character_mode(name: str, custom_scale: Optional[float] = None,
                       custom_arm_width: Optional[float] = None) -> CharacterMode:
    """
    Get a character mode by name or create a custom one.

    Args:
        name: Character mode name ('steve', 'alex', 'gigantic', 'tiny', 'custom')
        custom_scale: Custom scale factor (only used if name='custom')
        custom_arm_width: Custom arm width in pixels (only used if name='custom')

    Returns:
        CharacterMode instance

    Raises:
        ValueError: If character mode name is not recognized
    """
    name_lower = name.lower()

    if name_lower == 'custom':
        scale = custom_scale if custom_scale is not None else 1.0
        arm_width = custom_arm_width if custom_arm_width is not None else 4.0
        return CharacterMode(
            name='custom',
            scale=scale,
            arm_width=arm_width,
            description=f'Custom character with {scale}x scale'
        )

    if name_lower not in CHARACTER_MODES:
        available = ', '.join(CHARACTER_MODES.keys())
        raise ValueError(f"Unknown character mode '{name}'. Available: {available}")

    return CHARACTER_MODES[name_lower]


def list_character_modes() -> List[Dict[str, Any]]:
    """List all available character modes with their properties."""
    return [mode.to_dict() for mode in CHARACTER_MODES.values()]


def parse_character_from_prompt(prompt: str) -> Optional[str]:
    """
    Extract character mode from a natural language prompt.

    Args:
        prompt: User's natural language request

    Returns:
        Character mode name or None if not found
    """
    prompt_lower = prompt.lower()

    # Check for explicit character names
    if 'steve' in prompt_lower:
        return 'steve'
    if 'alex' in prompt_lower:
        return 'alex'
    if any(x in prompt_lower for x in ['gigantic', 'giant', 'huge', 'epic']):
        return 'gigantic'
    if any(x in prompt_lower for x in ['tiny', 'small', 'chibi', 'mini']):
        return 'tiny'

    return None


if __name__ == "__main__":
    # Demo: List all character modes
    print("Available Character Modes:")
    print("=" * 50)

    for mode in list_character_modes():
        print(f"\n{mode['name'].upper()}")
        print(f"  Scale: {mode['scale']}x")
        print(f"  Arm Width: {mode['arm_width']}px")
        print(f"  Description: {mode['description']}")

    print("\n" + "=" * 50)
    print("\nExample usage:")
    print("  steve = get_character_mode('steve')")
    print("  alex = get_character_mode('alex')")
    print("  giant = get_character_mode('gigantic')")
    print("  custom = get_character_mode('custom', custom_scale=1.5)")
