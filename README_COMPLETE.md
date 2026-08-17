# 🎬 Blockbench AI Animation Generator

**Complete Production-Ready System for Creating Minecraft Animations with AI**

Generate professional Blockbench-compatible animations using natural language prompts. Perfect for YouTube content creators, Minecraft animators, and digital artists.

---

## ✨ Features

### 🤖 AI-Powered Chat Interface
- **Natural Language Processing**: Just describe what you want ("Create a 10 minute yoga animation")
- **Smart Pose Selection**: AI automatically chooses relevant poses based on your prompt
- **Character Customization**: Steve, Alex, Gigantic, Tiny, or custom scales
- **Theme Selection**: 10 vibrant color palettes (studio, sunset, forest, neon, ocean, etc.)

### 🎭 Extensive Pose Library
- **215+ Poses** across multiple categories:
  - Yoga (20 poses): warrior_ii, tree, downward_dog, goddess, childs_pose...
  - Combat (18 poses): kick, martial_stance, boxing_guard, karate_stance...
  - Dance (100 poses): dance_pose_1 through dance_pose_100
  - Fitness (8 poses): burpee, plank, lunges, jumping_jack...
  - Minecraft (15 poses): standing, walking, running, crouch, jump...
  - Storytelling (8 poses): wave, greeting, prayer, point, salute...
  - Meditation (12 poses): meditating, lotus_pose, yoga_childs_pose...

### 🎨 Video Export Capabilities
- **Multiple Resolutions**: 720p, 1080p (default), 1440p, 4K
- **Variable Framerates**: 24, 30 (default), 60 fps
- **Quality Settings**: fast, medium (default), slow
- **Long Animation Support**: Up to 120 minutes with automatic segmentation
- **File Size Estimation**: Know your output size before rendering

### 🌐 Web-Based Chat Interface
- Beautiful responsive UI (desktop & mobile)
- Quick action buttons for common animation types
- Real-time generation with download links
- Settings panel for customization

---

## 🚀 Quick Start (3 Steps)

### 1. Install Dependencies
```bash
pip install flask werkzeug
```

### 2. Start Web Server
```bash
python ai_chat_server.py
```
Server opens at: **http://localhost:5000**

### 3. Generate Your First Animation
Type in the chat:
> "Create a 10 minute yoga animation with Alex character"

Click **Download Animation JSON**, then import into Blockbench!

---

## 📁 Project Structure

```
blockbench-ai-animation/
├── blockbench_ai_animation.py    # Core animation engine (25KB)
├── ai_scene_generator.py         # AI topic-based scene generation
├── character_modes.py            # Character presets (Steve/Alex/Gigantic/Tiny)
├── video_export.py               # Video rendering & export config
├── ai_chat_server.py             # Flask web server with chat interface
├── examples.py                   # 7 comprehensive usage examples
├── requirements.txt              # Python dependencies
├── templates/
│   └── index.html                # Beautiful chat UI
├── generated_animations/         # Output folder for animations
└── README_COMPLETE.md            # This file
```

---

## 💬 Usage Examples

### Via Web Interface
Open http://localhost:5000 and try these prompts:

```
• "Create a 10 minute yoga and meditation animation"
• "Generate a 5 minute combat fight scene with gigantic character"
• "Make an 8 minute dance choreography with neon theme"
• "Create a 15 minute fitness workout animation"
• "Generate a storytelling scene with emotions"
```

### Via Python API

```python
from ai_scene_generator import AISceneGenerator

# Simple generation
generator = AISceneGenerator("yoga and meditation", duration_ticks=12000)
animator = generator.generate_scene()
animator.save_json("yoga_animation.json")

# With custom settings
from blockbench_ai_animation import MinecraftAnimationGenerator
from character_modes import get_character_mode

anim = MinecraftAnimationGenerator("my_scene", duration_ticks=10000)
anim.add_pose("yoga_warrior_ii")
anim.add_pose("crouch")
anim.set_background_theme("sunset")

# Apply character mode
character = get_character_mode("gigantic")
character.apply_to_animation(anim)

anim.save_json("custom_animation.json")
```

### Command Line Examples

```bash
# Run all examples
python examples.py

# List available poses
python -c "from blockbench_ai_animation import MinecraftAnimationGenerator; print(MinecraftAnimationGenerator('x', 20).list_pose_names())"

# List themes
python -c "from blockbench_ai_animation import MinecraftAnimationGenerator; print(list(MinecraftAnimationGenerator('x', 20).background_palette.keys()))"
```

---

## 🎯 Supported Commands

### Basic Requests
- "Create a yoga animation"
- "Generate a 10 minute animation"
- "Make a 8 minute fight scene"

### Advanced Requests
- "Create a 20 minute storytelling animation with Alex character"
- "Generate a 10 minute dance with neon theme and gigantic character"
- "Make a 30 minute fitness animation with ocean theme"

### Quick Actions (UI Buttons)
- 🧘 Yoga Animation
- ⚔️ Fight Scene
- 💃 Dance
- 💪 Fitness
- 📖 Story Scene

---

## 🔧 Technical Specifications

### Animation Parameters
| Parameter | Range | Default |
|-----------|-------|---------|
| Duration | 1-120 minutes | 10 minutes |
| Ticks per Second | 20 | 20 |
| Total Ticks (10 min) | 12,000 | - |
| Total Ticks (60 min) | 72,000 | - |

### Character Modes
| Mode | Scale | Arm Width | Description |
|------|-------|-----------|-------------|
| Steve | 1.0x | 4px | Classic Minecraft |
| Alex | 1.0x | 3px | Slim variant |
| Gigantic | 2.0x | 8px | Epic/dramatic |
| Tiny | 0.5x | 2px | Cute/chibi |
| Custom | Any | Any | User-defined |

### Video Export Settings
| Setting | Options | Default |
|---------|---------|---------|
| Resolution | 720p, 1080p, 1440p, 4K | 1080p |
| Framerate | 24, 30, 60 fps | 30 fps |
| Quality | fast, medium, slow | medium |

### File Size Estimates (10 minute animation)
| Quality | 1080p Size | Render Time |
|---------|------------|-------------|
| Fast | ~270 MB | ~7.5 minutes |
| Medium | ~540 MB | ~15 minutes |
| Slow | ~810 MB | ~30 minutes |

---

## 🎬 Blockbench Integration Workflow

### Step-by-Step Guide

1. **Generate Animation**
   - Use web chat interface or Python API
   - Download the `.json` file

2. **Open Blockbench**
   - Go to [blockbench.net](https://blockbench.net)
   - Create new model or open existing one

3. **Import Animation**
   - File → Import → Import Animation
   - Select your downloaded `.json` file
   - Confirm import

4. **Preview Animation**
   - Go to Timeline tab
   - Watch animation play on your model
   - Adjust keyframes if needed

5. **Export Video**
   - Export → Export Video
   - Choose resolution & framerate
   - Click Render
   - Save as MP4/WebM

6. **Upload to YouTube** (Optional)
   - Add voice-over in CapCut or similar editor
   - Upload to YouTube with proper tags
   - Share with your audience!

---

## 🧪 Testing

Run the test suite:
```bash
pytest tests/
```

Expected output:
```
===== 5 passed in 0.02s =====
```

Tests cover:
- ✅ Blockbench format validation
- ✅ JSON file writing
- ✅ Pose library completeness
- ✅ Background theme metadata
- ✅ Human pose variety

---

## 📚 API Reference

### AISceneGenerator
```python
generator = AISceneGenerator(prompt, duration_ticks=12000)
animator = generator.generate_scene()
animator.save_json("output.json")
```

**Properties:**
- `identified_topics`: List of detected topics from prompt
- `selected_poses`: Poses chosen by AI
- `selected_theme`: Auto-selected color theme

### MinecraftAnimationGenerator
```python
anim = MinecraftAnimationGenerator(name, duration_ticks=100)
anim.add_pose("yoga_warrior_ii")
anim.add_walking_cycle("leftArm", "rotation.x")
anim.set_background_theme("neon")
anim.save_json("animation.json")
```

**Methods:**
- `add_pose(pose_name)`: Add a pose to the animation
- `add_walking_cycle(body_part, axis)`: Procedural walking motion
- `add_idle_animation(body_part, axis, amplitude)`: Subtle idle movement
- `set_background_theme(theme, colors)`: Set scene background
- `export_for_blockbench()`: Get JSON-ready dict
- `save_json(filename)`: Save to file

### Character Modes
```python
from character_modes import get_character_mode, list_character_modes

# Get preset
steve = get_character_mode("steve")
alex = get_character_mode("alex")
giant = get_character_mode("gigantic")

# Custom mode
custom = get_character_mode("custom", custom_scale=1.5, custom_arm_width=5.0)

# List all
modes = list_character_modes()
```

### Video Export
```python
from video_export import AnimationVideoExporter

exporter = AnimationVideoExporter(animation_data)
exporter.set_resolution("1080p").set_framerate(30).set_quality("medium")
metadata = exporter.get_export_metadata()
export_info = exporter.export_to_mp4("output.mp4")
```

---

## 🌐 Puter.js Integration (Advanced)

Deploy this system as a Puter OS app for browser-based operation:

### What is Puter.js?
Browser-based OS API providing:
- File system access (read/write/delete)
- Shell command execution (Python, ffmpeg)
- App launching & integration
- System notifications

### Deployment Steps

1. **Prepare Files**
   - Copy all Python modules
   - Copy `templates/index.html`
   - Copy `requirements.txt`

2. **Create puter.json Manifest**
```json
{
  "name": "Blockbench AI Animation Generator",
  "version": "1.0.0",
  "main": "ai_chat_server.py",
  "launch": "python ai_chat_server.py",
  "window": { "width": 1200, "height": 800 },
  "permissions": ["fs:read", "fs:write", "shell:execute"]
}
```

3. **Integrate Puter.js**
   - Add puter.js library to HTML
   - Use `puter.fs.write()` to save animations
   - Use `puter.shell.run()` to execute Python

4. **Submit to Puter App Store**
   - Create developer account
   - Package application
   - Submit for review

See `PUTER_JS_CAPABILITIES.md` for detailed guide.

---

## 🎨 Available Themes

| Theme | Colors | Best For |
|-------|--------|----------|
| studio | Purple gradient | Professional demos |
| sunset | Orange/pink/yellow | Warm scenes |
| forest | Green gradient | Nature content |
| neon | Cyan/purple/pink | Gaming/energetic |
| ocean | Blue gradient | Calm/water scenes |
| desert | Orange/yellow | Western/arid |
| sunrise | Yellow/pink/cream | Morning/hopeful |
| midnight | Dark blue/purple | Night/mystery |
| rainbow | Multi-color | Fun/celebration |
| lavender | Purple/pink | Relaxation/yoga |

---

## 🛠️ Troubleshooting

### Common Issues

**"Module not found" error**
```bash
pip install flask werkzeug
```

**Animations don't load in Blockbench**
- Ensure file format is v1.8.0 (check `format_version` in JSON)
- Verify bone names match your model
- Try re-importing the file

**Web server won't start**
```bash
# Check if port 5000 is in use
lsof -i :5000
# Kill the process or change port in ai_chat_server.py
```

**Animation too long/slow**
- Reduce duration (start with 1-5 minutes)
- Use fewer poses
- Lower video quality setting

**File size too large**
- Use lower resolution (720p instead of 1080p)
- Reduce framerate (24 fps instead of 60)
- Use "fast" quality preset

---

## 📈 Performance Benchmarks

| Task | Time | Memory |
|------|------|--------|
| Generate simple pose | <0.1s | <10MB |
| Generate 10-min animation | <1s | <50MB |
| Web interface response | <100ms | - |
| JSON file write (10 min) | <0.5s | - |
| Video render estimate | 5-30 min | Varies |

---

## 🎓 Learning Resources

### Recommended Tutorials
- **Blockbench Basics**: Interface navigation, camera controls
- **Custom Items**: Gear meshes and item modeling
- **Texture Painting**: Color mapping and detail work
- **Entity Wizard**: World building and automation
- **Replay Mod**: Camera pathing and keyframing
- **Minecraft Filmmaking**: Composition and framing
- **Video Editing**: Audio mixing and effects

### See Also
- [Blockbench Official Docs](https://blockbench.net/wiki/)
- [Minecraft Animation Community](https://www.minecraftforum.net/)
- [YouTube Creator Academy](https://creatoracademy.youtube.com/)

---

## 🚀 Next Steps

### Immediate
- ✅ Generate your first animation
- ✅ Import into Blockbench
- ✅ Export to video
- ✅ Upload to YouTube

### Short-Term Enhancements
- [ ] Add more pose categories
- [ ] Implement custom pose recording
- [ ] Add animation timeline editor
- [ ] Support multiple characters
- [ ] Advanced theme creation tool

### Medium-Term Scaling
- [ ] Deploy to cloud (Heroku, AWS, Google Cloud)
- [ ] Add user accounts & animation library
- [ ] Create mobile app wrapper
- [ ] Build animation marketplace
- [ ] YouTube auto-upload integration

### Long-Term Vision
- [ ] Full Puter OS integration
- [ ] Real-time collaboration features
- [ ] AI-powered pose interpolation
- [ ] Voice-to-animation conversion
- [ ] AR/VR preview support

---

## 📄 License

MIT License - Free for personal and commercial use.

---

## 🙏 Credits

Built with ❤️ for the Minecraft animation community.

**Contributors Welcome!** Submit PRs for:
- New poses
- Additional themes
- Bug fixes
- Documentation improvements
- Feature enhancements

---

## 📞 Support

- **Documentation**: See this file + `SYSTEM_GUIDE.md`
- **Examples**: Run `python examples.py`
- **Issues**: Check troubleshooting section above
- **Community**: Join Minecraft animation forums

---

**Happy Animating! 🎬✨**
