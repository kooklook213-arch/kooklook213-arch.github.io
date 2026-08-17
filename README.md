# Minecraft Animation Generator

A complete standalone Node.js tool for generating Blockbench-compatible animations with video preview capabilities, YouTube upload preparation, and CapCut voice-over integration.

## Features

- **Blockbench Animation Export**: Generate `.bbanimation` JSON files compatible with Blockbench
- **HTML Preview Page**: Interactive preview page with animation stats and download options
- **YouTube Upload Guide**: Built-in instructions for uploading to YouTube
- **CapCut Integration**: Voice-over editing guide for CapCut
- **Pose Library**: 15+ pre-built poses (standing, crouch, sit, wave, yoga poses, etc.)
- **Animation Types**: Walking cycles, idle animations, custom poses
- **Background Themes**: Multiple color themes (sunset, forest, neon, ocean, etc.)
- **Tutorial Links**: Curated Blockbench and Minecraft filmmaking tutorials

## Installation

No installation required! Just ensure you have Node.js installed.

```bash
# Check Node.js version
node --version
```

## Usage

### Quick Demo

```bash
node minecraft-animation-generator.js demo
```

This generates a demo animation with walking cycles and poses.

### Commands

```bash
# Show help
node minecraft-animation-generator.js help

# Generate demo animation
node minecraft-animation-generator.js demo

# Generate custom preview
node minecraft-animation-generator.js preview <name> [ticks]

# Start preview server
node minecraft-animation-generator.js serve [port]
```

### Examples

```bash
# Generate a custom animation named "my_walk" with 9600 ticks
node minecraft-animation-generator.js preview my_walk 9600

# Start preview server on port 8080
node minecraft-animation-generator.js serve 8080
```

## Output Files

After running the generator, you'll find:

1. **`output/<name>.bbanimation`** - Blockbench animation file (import into Blockbench)
2. **`output/<name>_preview.html`** - Interactive preview page

## Workflow

### 1. Generate Animation

```bash
node minecraft-animation-generator.js demo
```

### 2. Open Preview Page

Open `output/minecraft_pose_pack_preview.html` in your browser to:
- View animation statistics
- Download the Blockbench file
- Access YouTube upload instructions
- Get CapCut voice-over guide

### 3. Import into Blockbench

1. Open [Blockbench](https://www.blockbench.net/)
2. Go to `File` → `Import` → `Animation`
3. Select the `.bbanimation` file
4. Preview and adjust as needed

### 4. Record with Replay Mod (Optional)

For video output:

1. Install [Minecraft Replay Mod](https://www.replaymod.com/)
2. Load your animation in Minecraft
3. Record using Replay Mod's camera tools
4. Export as MP4

### 5. Edit Voice-over in CapCut

1. Open CapCut (Desktop or Mobile)
2. Import your recorded video
3. Click "Audio" → "Record" for voice-over
4. Or use Text-to-Speech feature
5. Adjust audio levels
6. Export final video

### 6. Upload to YouTube

1. Go to [YouTube Studio](https://studio.youtube.com/)
2. Click CREATE → Upload video
3. Add title, description, tags
4. Choose visibility and publish

## Programmatic Usage

```javascript
const { MinecraftAnimationGenerator } = require('./minecraft-animation-generator');

// Create generator
const generator = new MinecraftAnimationGenerator('my_animation', 4800);

// Set theme
generator.setBackgroundTheme('sunset');

// Add animations
generator.addWalkingCycle('leftArm', 'rotation.x');
generator.addWalkingCycle('rightArm', 'rotation.x');
generator.addIdleAnimation('head', 'rotation.y', 3);
generator.addPose('crouch');

// Save files
generator.saveJson('my_animation.json');
generator.generatePreviewPage('./output');
```

## Available Poses

- `standing` - Neutral standing pose
- `crouch` - Crouching/squatting
- `sit` - Sitting position
- `stare` - Focused gaze
- `wave` - Waving hand
- `prayer` - Prayer/meditation pose
- `jump` - Mid-jump position
- `running` - Running stance
- `yoga_warrior_ii` - Yoga Warrior II pose
- `yoga_tree` - Yoga Tree pose
- `yoga_downward_dog` - Yoga Downward Dog pose
- `salute` - Saluting gesture
- `greeting` - Greeting bow
- `kick` - Kicking motion

## Background Themes

- `studio` - Professional studio lighting
- `sunset` - Warm sunset colors
- `forest` - Natural green tones
- `neon` - Vibrant neon colors
- `ocean` - Blue ocean palette
- `desert` - Warm desert sands
- `sunrise` - Morning sunrise hues
- `midnight` - Dark night theme
- `rainbow` - Multi-color gradient
- `lavender` - Soft purple tones

## Tutorial Resources

The generator includes links to curated tutorials:

### Basics
- Blockbench Interface & All Basics
- ArtsByKev Beginner Playlist

### Modding
- Kaupenjoe Custom Item Video
- Kaupenjoe Fabric Modding Resource Video

### Rigging & Texturing
- ArtsByKev Texture Painting Tutorial
- Easy Blockbench Tutorial for Beginners

### Cinematics
- Customizable Player Models Guide
- Minecraft Entity Wizard Walkthrough
- Replay Mod Masterclass Video
- Minecraft Filmmaking Guide
- Minecraft Video Editing Tutorial

## API Reference

### Constructor

```javascript
new MinecraftAnimationGenerator(animationName, durationTicks, youtubeApiKey)
```

- `animationName` (string): Name of the animation
- `durationTicks` (number): Duration in ticks (20 ticks = 1 second)
- `youtubeApiKey` (string, optional): YouTube API key for fetching tutorials

### Methods

| Method | Description |
|--------|-------------|
| `setBackgroundTheme(themeName, customColors)` | Set background theme |
| `setBackgroundColor(colorHex)` | Set solid background color |
| `addPose(poseName, boneOverrides)` | Add a pose from library |
| `addPoseLibrary(poseNames)` | Add multiple poses |
| `listPoseNames()` | List all available poses |
| `addWalkingCycle(bodyPart, axis)` | Add walking animation |
| `addIdleAnimation(bodyPart, axis, amplitude)` | Add idle bobbing |
| `exportForBlockbench()` | Export as Blockbench format |
| `saveJson(filename)` | Save JSON file |
| `generatePreviewPage(outputPath)` | Generate HTML preview |
| `generateShareableLink(port)` | Start preview server |
| `choosePosesForResearch(text)` | Auto-select poses based on topic |
| `fetchYouTubeLearningData(query)` | Fetch YouTube tutorials (requires API key) |

## File Structure

```
workspace/
├── minecraft-animation-generator.js   # Main generator script
├── output/                            # Generated files
│   ├── <name>.bbanimation            # Blockbench animation file
│   └── <name>_preview.html           # Preview page
├── minecraft_walk_animation.json      # Example JSON output
└── README.md                          # This file
```

## Requirements

- Node.js v14 or higher
- Modern web browser (for preview page)
- Blockbench (optional, for importing animations)
- Minecraft with Replay Mod (optional, for recording)
- CapCut (optional, for voice-over editing)

## License

MIT

## Support

For issues or questions, please check the included tutorial links or visit:
- [Blockbench Documentation](https://www.blockbench.net/wiki/)
- [Replay Mod Wiki](https://wiki.replaymod.com/)
- [CapCut Help Center](https://www.capcut.com/help)
