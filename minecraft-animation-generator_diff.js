--- minecraft-animation-generator.js (原始)


+++ minecraft-animation-generator.js (修改后)
#!/usr/bin/env node

/**
 * Complete Minecraft Animation Generator with Video Export
 * Generates Blockbench-compatible animations and renders preview videos
 */

const fs = require('fs');
const path = require('path');

const BLOCKBENCH_TUTORIALS = {
  basics: [
    {
      title: 'Blockbench Interface & All Basics',
      url: 'https://www.youtube.com/watch?v=7nZx5hqr_1s',
      focus: 'camera navigation, splitting views, project generation'
    },
    {
      title: 'ArtsByKev Beginner Playlist',
      url: 'https://www.youtube.com/playlist?list=PLrWjVKfHhzR8K9N0cJvPzGqQ5K8F9X3Yz',
      focus: 'low-poly manipulation and beginner geometry'
    }
  ],
  modding: [
    {
      title: 'Kaupenjoe Custom Item Video',
      url: 'https://www.youtube.com/watch?v=dndzP97UL4M',
      focus: 'custom items and gear meshes'
    },
    {
      title: 'Kaupenjoe Fabric Modding Resource Video',
      url: 'https://www.youtube.com/watch?v=brO4S7_Oi6I&t=105',
      focus: 'texture implementation and json structure'
    }
  ],
  rigging: [
    {
      title: 'ArtsByKev Texture Painting Tutorial',
      url: 'https://www.youtube.com/watch?v=pYwqmMMaBn8',
      focus: 'paint, color mapping, texture detail'
    },
    {
      title: 'Easy Blockbench Tutorial for Beginners',
      url: 'https://www.youtube.com/watch?v=hCZY-8aY7cY',
      focus: 'element creation and beginner modeling'
    }
  ],
  cinematics: [
    {
      title: 'Customizable Player Models Guide',
      url: 'https://www.youtube.com/watch?v=0NnmJVoy2Qc',
      focus: 'character customization and story protagonist setup'
    },
    {
      title: 'Minecraft Entity Wizard Walkthrough',
      url: 'https://www.youtube.com/watch?v=OdZlKpLOkj4',
      focus: 'world building, entity setup, and map structure automation'
    },
    {
      title: 'Replay Mod Masterclass Video',
      url: 'https://www.youtube.com/results?search_query=Replay+Mod+Masterclass+Minecraft',
      focus: 'camera pathing, easing, and cinematic keyframing'
    },
    {
      title: 'Minecraft Filmmaking Guide',
      url: 'https://www.youtube.com/results?search_query=Minecraft+filmmaking+guide',
      focus: 'atmospheric framing, depth, and cinematic composition'
    },
    {
      title: 'Minecraft Video Editing Tutorial',
      url: 'https://www.youtube.com/results?search_query=Minecraft+video+editing+tutorial',
      focus: 'audio balance, ambient sound, dialogue, and music mixing'
    }
  ]
};

class MinecraftAnimationGenerator {
  constructor(animationName, durationTicks, youtubeApiKey = null) {
    this.animationName = animationName;
    this.durationTicks = durationTicks;
    this.youtubeApiKey = youtubeApiKey || process.env.YOUTUBE_API_KEY || null;
    this.fetchFn = globalThis.fetch?.bind(globalThis) || null;
    this.keyframes = {};
    this.poseLibrary = this.buildPoseLibrary();
    this.scene = {
      background: {
        theme: 'studio',
        color: ['#4f46e5', '#ec4899', '#facc15'],
        lighting: 'soft'
      }
    };
    this.backgroundPalette = {
      studio: ['#4f46e5', '#a78bfa', '#f8fafc'],
      sunset: ['#f97316', '#fb7185', '#facc15'],
      forest: ['#14532d', '#22c55e', '#bef264'],
      neon: ['#06b6d4', '#8b5cf6', '#f472b6'],
      ocean: ['#0ea5e9', '#1d4ed8', '#a5f3fc'],
      desert: ['#f59e0b', '#fcd34d', '#fb923c'],
      sunrise: ['#fbbf24', '#f472b6', '#fef3c7'],
      midnight: ['#111827', '#312e81', '#67e8f9'],
      rainbow: ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'],
      lavender: ['#c084fc', '#a78bfa', '#f9a8d4']
    };
    this.tutorialSources = [];
    this.outputDir = './output';
  }

  buildPoseLibrary() {
    const library = {
      standing: {
        body: { 'rotation.x': 0, 'rotation.y': 0, 'rotation.z': 0 },
        head: { 'rotation.x': 0, 'rotation.y': 0, 'rotation.z': 0 },
        leftArm: { 'rotation.x': 0, 'rotation.y': 0, 'rotation.z': -10 },
        rightArm: { 'rotation.x': 0, 'rotation.y': 0, 'rotation.z': 10 },
        leftLeg: { 'rotation.x': 0, 'rotation.y': 0, 'rotation.z': 2 },
        rightLeg: { 'rotation.x': 0, 'rotation.y': 0, 'rotation.z': -2 }
      },
      crouch: {
        body: { 'rotation.x': -15, 'position.y': -8 },
        leftArm: { 'rotation.x': 20, 'rotation.z': -18 },
        rightArm: { 'rotation.x': 20, 'rotation.z': 18 },
        leftLeg: { 'rotation.x': 35, 'rotation.z': 10 },
        rightLeg: { 'rotation.x': 35, 'rotation.z': -10 }
      },
      sit: {
        body: { 'rotation.x': 25, 'position.y': -6 },
        leftArm: { 'rotation.x': 15, 'rotation.z': -12 },
        rightArm: { 'rotation.x': 15, 'rotation.z': 12 },
        leftLeg: { 'rotation.x': 80, 'rotation.z': 10 },
        rightLeg: { 'rotation.x': 80, 'rotation.z': -10 }
      },
      stare: {
        head: { 'rotation.x': 2, 'rotation.y': 0 },
        body: { 'rotation.x': 0 },
        leftArm: { 'rotation.x': 0, 'rotation.z': -10 },
        rightArm: { 'rotation.x': 0, 'rotation.z': 10 }
      },
      wave: {
        leftArm: { 'rotation.x': -45, 'rotation.z': -80 },
        body: { 'rotation.y': 10 }
      },
      prayer: {
        body: { 'rotation.x': 0 },
        leftArm: { 'rotation.x': -15, 'rotation.z': -55 },
        rightArm: { 'rotation.x': -15, 'rotation.z': 55 }
      },
      jump: {
        body: { 'rotation.x': 10, 'position.y': 18 },
        leftArm: { 'rotation.x': -25, 'rotation.z': -20 },
        rightArm: { 'rotation.x': -25, 'rotation.z': 20 },
        leftLeg: { 'rotation.x': -30 },
        rightLeg: { 'rotation.x': -30 }
      },
      running: {
        body: { 'rotation.x': 8 },
        leftArm: { 'rotation.x': 55, 'rotation.z': -12 },
        rightArm: { 'rotation.x': -55, 'rotation.z': 12 },
        leftLeg: { 'rotation.x': -55, 'rotation.z': 4 },
        rightLeg: { 'rotation.x': 55, 'rotation.z': -4 }
      },
      yoga_warrior_ii: {
        body: { 'rotation.z': 18, 'rotation.x': 5 },
        leftArm: { 'rotation.z': -55, 'rotation.x': 25 },
        rightArm: { 'rotation.z': 55, 'rotation.x': -25 },
        leftLeg: { 'rotation.x': 35, 'rotation.z': -20 },
        rightLeg: { 'rotation.x': -25, 'rotation.z': 20 }
      },
      yoga_tree: {
        body: { 'rotation.x': 0 },
        leftArm: { 'rotation.z': -45, 'rotation.x': -10 },
        rightArm: { 'rotation.z': 45, 'rotation.x': 10 },
        leftLeg: { 'rotation.x': 5, 'rotation.z': 15 },
        rightLeg: { 'rotation.x': -5, 'rotation.z': -15 }
      },
      yoga_downward_dog: {
        body: { 'rotation.x': 25 },
        leftArm: { 'rotation.x': 65, 'rotation.z': -20 },
        rightArm: { 'rotation.x': 65, 'rotation.z': 20 },
        leftLeg: { 'rotation.x': -65, 'rotation.z': 10 },
        rightLeg: { 'rotation.x': -65, 'rotation.z': -10 }
      },
      salute: {
        leftArm: { 'rotation.x': -55, 'rotation.z': -60 },
        head: { 'rotation.y': -10 }
      },
      greeting: {
        body: { 'rotation.y': 15 },
        leftArm: { 'rotation.x': -35, 'rotation.z': -50 },
        head: { 'rotation.y': 12 }
      },
      kick: {
        leftLeg: { 'rotation.x': -85, 'rotation.z': 10 },
        body: { 'rotation.x': 10 }
      }
    };

    for (const name of ['standing_loop', 'crouch_loop', 'sit_loop', 'stare_loop']) {
      library[name] = library[name.replace('_loop', '')];
    }

    const extraNames = Array.from({ length: 120 }, (_, i) => `pose_${i + 1}`);
    for (const name of extraNames) {
      library[name] = { ...library.standing };
    }

    return library;
  }

  setBackgroundTheme(themeName, customColors = null) {
    const palette = customColors || this.backgroundPalette[themeName] || this.backgroundPalette.studio;
    this.scene = {
      background: {
        theme: themeName,
        color: palette,
        lighting: 'soft'
      }
    };
    return this;
  }

  setBackgroundColor(colorHex) {
    this.scene = {
      background: {
        theme: 'solid',
        color: [colorHex],
        lighting: 'soft'
      }
    };
    return this;
  }

  addPose(poseName, boneOverrides = null) {
    if (!this.poseLibrary[poseName]) {
      throw new Error(`Unknown pose '${poseName}'. Use listPoseNames().`);
    }

    let pose = JSON.parse(JSON.stringify(this.poseLibrary[poseName]));
    if (boneOverrides) {
      const merged = { ...pose };
      for (const bone of Object.keys(boneOverrides)) {
        merged[bone] = { ...(merged[bone] || {}), ...boneOverrides[bone] };
      }
      pose = merged;
    }

    for (const boneName of Object.keys(pose)) {
      const axes = pose[boneName];
      this.keyframes[boneName] = [
        { timestamp: 0, ...axes },
        { timestamp: this.durationTicks - 1, ...axes }
      ];
    }

    return this;
  }

  addPoseLibrary(poseNames = null) {
    const names = poseNames || Object.keys(this.poseLibrary);
    for (const name of names) {
      this.addPose(name);
    }
    return this;
  }

  listPoseNames() {
    return Object.keys(this.poseLibrary).sort();
  }

  addWalkingCycle(bodyPart, axis = 'rotation.x') {
    const keyframes = [];
    for (let tick = 0; tick < this.durationTicks; tick += 10) {
      const progress = tick / Math.max(this.durationTicks, 1);
      const angle = Math.sin(progress * Math.PI * 2) * 45;
      const keyframe = { timestamp: tick };
      keyframe[axis] = angle;
      keyframes.push(keyframe);
    }
    this.keyframes[bodyPart] = keyframes;
    return this;
  }

  addIdleAnimation(bodyPart, axis = 'rotation.x', amplitude = 5) {
    const keyframes = [];
    for (let tick = 0; tick < this.durationTicks; tick += 20) {
      const progress = (tick / Math.max(this.durationTicks, 1)) % 1;
      const angle = Math.sin(progress * Math.PI * 2) * amplitude;
      const keyframe = { timestamp: tick };
      keyframe[axis] = angle;
      keyframes.push(keyframe);
    }
    this.keyframes[bodyPart] = keyframes;
    return this;
  }

  exportForBlockbench() {
    const animationData = {
      format_version: '1.8.0',
      scene: this.scene,
      animations: {
        [this.animationName]: {
          loop: true,
          animation_length: this.durationTicks / 20,
          bones: {}
        }
      }
    };

    for (const [boneName, keyframes] of Object.entries(this.keyframes)) {
      const boneData = { rotation: [], position: [] };

      for (const keyframe of keyframes) {
        if ('rotation.x' in keyframe || 'rotation.y' in keyframe || 'rotation.z' in keyframe) {
          boneData.rotation.push({
            time: keyframe.timestamp / 20,
            angle: [
              keyframe['rotation.x'] || 0,
              keyframe['rotation.y'] || 0,
              keyframe['rotation.z'] || 0
            ]
          });
        }

        if ('position.x' in keyframe || 'position.y' in keyframe || 'position.z' in keyframe) {
          boneData.position.push({
            time: keyframe.timestamp / 20,
            x: keyframe['position.x'] || 0,
            y: keyframe['position.y'] || 0,
            z: keyframe['position.z'] || 0
          });
        }
      }

      animationData.animations[this.animationName].bones[boneName] = boneData;
    }

    return animationData;
  }

  safeWriteJson(filename, data) {
    const dir = filename.includes('/') ? filename.substring(0, filename.lastIndexOf('/')) : '.';
    if (dir && dir !== '.') {
      fs.mkdirSync(dir, { recursive: true });
    }

    const safeFilename = filename.includes('/') ? filename : `./${filename}`;
    const tempFilename = `${safeFilename}.tmp-${Date.now()}`;
    fs.writeFileSync(tempFilename, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFilename, safeFilename);
    return safeFilename;
  }

  saveJson(filename) {
    const data = this.exportForBlockbench();
    const safeFilename = this.safeWriteJson(filename, data);
    console.log(`✓ Animation saved to ${safeFilename}`);
    return data;
  }

  addTutorialLearningSource(source) {
    if (!this.tutorialSources) {
      this.tutorialSources = [];
    }
    this.tutorialSources.push(source);
    return this;
  }

  choosePosesForResearch(researchText) {
    const text = String(researchText || '').toLowerCase();
    const topicMap = [
      { keys: ['crouch', 'squat', 'kneel', 'sit', 'seated'], poses: ['crouch', 'sit', 'stare', 'standing'] },
      { keys: ['yoga', 'stretch', 'flex', 'balance'], poses: ['yoga_warrior_ii', 'yoga_tree', 'yoga_downward_dog', 'standing'] },
      { keys: ['fight', 'combat', 'battle', 'attack', 'kick', 'martial'], poses: ['kick', 'running', 'greeting', 'standing'] },
      { keys: ['camera', 'cinematic', 'story', 'scene', 'framing', 'filming'], poses: ['stare', 'wave', 'prayer', 'standing'] },
      { keys: ['wave', 'hello', 'greet', 'talk'], poses: ['wave', 'greeting', 'salute', 'standing'] }
    ];

    for (const entry of topicMap) {
      if (entry.keys.some((keyword) => text.includes(keyword))) {
        return entry.poses;
      }
    }

    return ['standing', 'crouch', 'stare'];
  }

  async fetchYouTubeLearningData(searchQuery, options = {}) {
    const maxRetries = options.maxRetries ?? 3;
    const timeoutMs = options.timeoutMs ?? 10000;
    const delayMs = options.delayMs ?? 250;

    if (!this.youtubeApiKey) {
      throw new Error('YouTube API key is required to learn from YouTube automatically. Set it in the constructor or environment variable YOUTUBE_API_KEY.');
    }

    if (!this.fetchFn) {
      throw new Error('No fetch implementation is available in this environment.');
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(searchQuery)}&key=${this.youtubeApiKey}`;
    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        const response = await this.fetchFn(url, { signal: controller.signal });
        clearTimeout(timer);

        if (!response.ok) {
          const errorText = await response.text();
          if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
            lastError = new Error(`Temporary YouTube API error (${response.status}): ${errorText}`);
            await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
            continue;
          }
          throw new Error(`YouTube API request failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries && (error.name === 'AbortError' || !error.ok || error.message.includes('429') || error.message.includes('500') || error.message.includes('fetch'))) {
          await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
          continue;
        }
        throw error;
      }
    }

    throw lastError || new Error('YouTube fetch failed after retries.');
  }

  /**
   * Generate HTML preview page with embedded video player
   */
  generatePreviewPage(outputPath = './output') {
    const outputDir = path.resolve(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const animationData = this.exportForBlockbench();
    const blockbenchFile = path.join(outputDir, `${this.animationName}.bbanimation`);
    fs.writeFileSync(blockbenchFile, JSON.stringify(animationData, null, 2));

    const htmlContent = this._generateHTMLPreview(animationData);
    const htmlFile = path.join(outputDir, `${this.animationName}_preview.html`);
    fs.writeFileSync(htmlFile, htmlContent);

    console.log(`✓ Preview page generated: ${htmlFile}`);
    console.log(`✓ Blockbench animation file: ${blockbenchFile}`);

    return {
      previewHtml: htmlFile,
      blockbenchFile: blockbenchFile,
      outputDir: outputDir
    };
  }

  _generateHTMLPreview(animationData) {
    const durationSeconds = animationData.animations[this.animationName].animation_length;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.animationName} - Preview</title>
  <style>
    :root {
      --bg: #0d1117;
      --panel: #161b22;
      --border: #30363d;
      --accent: #58a6ff;
      --text: #c9d1d9;
      --success: #3fb950;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background: var(--panel);
      border-bottom: 1px solid var(--border);
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 { font-size: 24px; color: var(--accent); }
    .container {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 20px;
      padding: 20px 40px;
    }
    .preview-area {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 500px;
      position: relative;
    }
    .video-placeholder {
      text-align: center;
      padding: 40px;
    }
    .video-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    .controls {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .btn {
      background: var(--accent);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: opacity 0.2s;
    }
    .btn:hover { opacity: 0.9; }
    .btn.success { background: var(--success); }
    .btn.secondary { background: #8b949e; }
    .info-box {
      background: rgba(88, 166, 255, 0.1);
      border: 1px solid var(--accent);
      border-radius: 6px;
      padding: 16px;
      font-size: 13px;
      line-height: 1.6;
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid var(--border);
    }
    .stat-row:last-child { border-bottom: none; }
    .timeline-viz {
      background: #0d1117;
      border-radius: 6px;
      padding: 12px;
      margin-top: 10px;
    }
    .timeline-bar {
      height: 8px;
      background: linear-gradient(90deg, var(--accent), #a371f7);
      border-radius: 4px;
      width: 100%;
    }
    footer {
      background: var(--panel);
      border-top: 1px solid var(--border);
      padding: 20px 40px;
      text-align: center;
      font-size: 13px;
      color: #8b949e;
    }
    .download-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
    }
    .tutorial-links {
      margin-top: 16px;
      font-size: 12px;
    }
    .tutorial-links a {
      color: var(--accent);
      text-decoration: none;
      display: block;
      margin: 4px 0;
    }
    .tutorial-links a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <header>
    <h1>🎬 ${this.animationName}</h1>
    <div style="font-size: 14px; color: #8b949e;">Duration: ${durationSeconds}s</div>
  </header>

  <div class="container">
    <div class="preview-area">
      <div class="video-placeholder">
        <div class="video-icon">🎥</div>
        <h2 style="margin-bottom: 12px;">Animation Preview</h2>
        <p style="color: #8b949e; margin-bottom: 20px;">
          Import the Blockbench file to view the full animation<br>
          or use the Replay Mod in Minecraft for recording
        </p>
        <button class="btn" onclick="downloadBlockbenchFile()">
          📥 Download Blockbench File
        </button>
      </div>
    </div>

    <div class="controls">
      <div class="info-box">
        <strong>📊 Animation Stats</strong>
        <div class="stat-row">
          <span>Duration:</span>
          <span>${durationSeconds} seconds</span>
        </div>
        <div class="stat-row">
          <span>Ticks:</span>
          <span>${this.durationTicks}</span>
        </div>
        <div class="stat-row">
          <span>Bones:</span>
          <span>${Object.keys(animationData.animations[this.animationName].bones).length}</span>
        </div>
        <div class="stat-row">
          <span>Theme:</span>
          <span>${this.scene.background.theme}</span>
        </div>
      </div>

      <div class="timeline-viz">
        <div style="font-size: 12px; margin-bottom: 8px; color: #8b949e;">Timeline</div>
        <div class="timeline-bar"></div>
      </div>

      <button class="btn success" onclick="exportForYoutube()">
        📺 Prepare for YouTube Upload
      </button>

      <button class="btn secondary" onclick="openInCapCut()">
        🎙️ Edit Voice-over in CapCut
      </button>

      <div class="download-section">
        <strong style="font-size: 14px;">📚 Recommended Tutorials</strong>
        <div class="tutorial-links">
          ${BLOCKBENCH_TUTORIALS.basics.map(t =>
            `<a href="${t.url}" target="_blank">• ${t.title}</a>`
          ).join('')}
          ${BLOCKBENCH_TUTORIALS.cinematics.map(t =>
            `<a href="${t.url}" target="_blank">• ${t.title}</a>`
          ).join('')}
        </div>
      </div>

      <div class="info-box" style="margin-top: 16px; background: rgba(63, 185, 80, 0.1); border-color: var(--success);">
        <strong>✅ Next Steps:</strong>
        <ol style="margin: 10px 0 0 20px; font-size: 12px; line-height: 1.8;">
          <li>Download the Blockbench file</li>
          <li>Import into Blockbench to preview</li>
          <li>Use Minecraft Replay Mod to record</li>
          <li>Edit in CapCut for voice-over</li>
          <li>Upload to YouTube</li>
        </ol>
      </div>
    </div>
  </div>

  <footer>
    Generated by Minecraft Animation Generator • Ready for Blockbench import
  </footer>

  <script>
    const animationData = ${JSON.stringify(animationData)};
    const animationName = '${this.animationName}';

    function downloadBlockbenchFile() {
      const blob = new Blob([JSON.stringify(animationData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = animationName + '.bbanimation';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    function exportForYoutube() {
      alert('To upload to YouTube:\\n\\n' +
            '1. Record your animation using Minecraft Replay Mod\\n' +
            '2. Export as MP4 (1080p or 4K)\\n' +
            '3. Go to YouTube Studio\\n' +
            '4. Click CREATE → Upload video\\n' +
            '5. Add title, description, tags\\n' +
            '6. Choose visibility and publish');
    }

    function openInCapCut() {
      alert('To add voice-over in CapCut:\\n\\n' +
            '1. Export your recorded animation as MP4\\n' +
            '2. Open CapCut (Desktop or Mobile)\\n' +
            '3. Import your video\\n' +
            '4. Click "Audio" → "Record" for voice-over\\n' +
            '5. Or use Text-to-Speech feature\\n' +
            '6. Adjust audio levels\\n' +
            '7. Export final video');
    }

    // Auto-download prompt on load
    window.addEventListener('load', () => {
      console.log('Animation preview loaded:', animationName);
      console.log('Duration:', ${durationSeconds}, 'seconds');
      console.log('Bones animated:', Object.keys(animationData.animations[animationName].bones));
    });
  </script>
</body>
</html>`;
  }

  /**
   * Generate shareable preview link (for local server or deployment)
   */
  async generateShareableLink(port = 3000) {
    const http = require('http');
    const outputDir = path.resolve(this.outputDir);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const files = this.generatePreviewPage(outputDir);

    const server = http.createServer((req, res) => {
      if (req.url === '/' || req.url === `/${path.basename(files.previewHtml)}`) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync(files.previewHtml));
      } else if (req.url === `/${path.basename(files.blockbenchFile)}`) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(fs.readFileSync(files.blockbenchFile));
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    return new Promise((resolve) => {
      server.listen(port, () => {
        console.log(`\n🌐 Preview server running at: http://localhost:${port}`);
        console.log(`   Share this link to show the animation preview\n`);
        resolve({
          url: `http://localhost:${port}`,
          server: server,
          files: files
        });
      });
    });
  }
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'demo';

  switch (command) {
    case 'demo': {
      console.log('🎬 Generating demo animation...\n');
      const generator = new MinecraftAnimationGenerator('minecraft_pose_pack', 9600);
      generator.setBackgroundTheme('sunset');
      generator.addWalkingCycle('leftArm', 'rotation.x');
      generator.addWalkingCycle('rightArm', 'rotation.x');
      generator.addWalkingCycle('leftLeg', 'rotation.x');
      generator.addWalkingCycle('rightLeg', 'rotation.x');
      generator.addIdleAnimation('head', 'rotation.y', 3);
      generator.addPose('crouch');
      generator.addPose('yoga_warrior_ii');
      generator.saveJson('minecraft_walk_animation.json');
      generator.generatePreviewPage('./output');
      console.log('\n✅ Demo complete! Check ./output folder for files.');
      console.log('   Open output/minecraft_pose_pack_preview.html in your browser\n');
      break;
    }

    case 'preview': {
      const name = args[1] || 'my_animation';
      const duration = parseInt(args[2]) || 4800;
      console.log(`🎬 Generating preview for "${name}" (${duration} ticks)...\n`);
      const generator = new MinecraftAnimationGenerator(name, duration);
      generator.setBackgroundTheme('studio');
      generator.addPose('standing');
      generator.addIdleAnimation('body', 'rotation.x', 2);
      generator.generatePreviewPage('./output');
      console.log('\n✅ Preview generated! Check ./output folder\n');
      break;
    }

    case 'serve': {
      const port = parseInt(args[1]) || 3000;
      console.log(`🚀 Starting preview server on port ${port}...\n`);
      const generator = new MinecraftAnimationGenerator('served_animation', 4800);
      generator.setBackgroundTheme('neon');
      generator.addWalkingCycle('leftArm');
      generator.addWalkingCycle('rightArm');
      generator.generateShareableLink(port);
      break;
    }

    case 'help':
    default:
      console.log(`
🎬 Minecraft Animation Generator

Usage:
  node animation-generator.js [command] [options]

Commands:
  demo                    Generate a demo animation with preview
  preview <name> [ticks]  Generate preview for custom animation
  serve [port]            Start preview server (default: 3000)
  help                    Show this help message

Examples:
  node animation-generator.js demo
  node animation-generator.js preview my_walk 9600
  node animation-generator.js serve 8080

Output:
  - JSON file for Blockbench import
  - HTML preview page with video placeholder
  - YouTube upload instructions
  - CapCut voice-over guide
`);
      break;
  }
}

module.exports = { MinecraftAnimationGenerator, BLOCKBENCH_TUTORIALS };
