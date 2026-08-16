# GitHub-Ready Blockbench AI Studio (Cloudflare Pages)

Copy each section into a file with the matching filename.

## File tree

```text
your-project/
  index.html
  package.json
  .gitignore
  .env.example
  README.md
  functions/
    _middleware.js
    api/
      render-scene.js
      check-status.js
```

## `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Blockbench AI Studio</title>
  <script src="https://js.puter.com/v2/"></script>
  <style>
    :root {
      --bg: #121316;
      --panel: #1c1d21;
      --panel-2: #17181c;
      --border: #2e3035;
      --accent: #5e6ad2;
      --text: #f7f8f8;
      --muted: #8a8f98;
      --success: #98c379;
      --error: #e06c75;
      --warning: #e5c07b;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: Arial, sans-serif;
      display: grid;
      grid-template-columns: 340px 1fr 360px;
      height: 100vh;
      overflow: hidden;
    }
    .sidebar, .chatbar {
      background: var(--panel);
      padding: 20px;
      overflow-y: auto;
    }
    .sidebar { border-right: 1px solid var(--border); }
    .chatbar { border-left: 1px solid var(--border); display: flex; flex-direction: column; gap: 12px; }
    .workspace { padding: 20px; overflow: hidden; }
    h2 {
      font-size: 12px;
      color: var(--muted);
      margin: 0 0 10px;
      text-transform: uppercase;
      letter-spacing: .06em;
    }
    textarea, input, select {
      width: 100%;
      background: #16171a;
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 14px;
    }
    textarea { resize: vertical; min-height: 90px; }
    .btn {
      width: 100%;
      border: 0;
      border-radius: 6px;
      padding: 12px;
      background: var(--accent);
      color: white;
      cursor: pointer;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .btn.secondary { background: var(--success); color: #121316; }
    .btn.warning { background: var(--warning); color: #121316; }
    .btn.small {
      width: auto;
      padding: 8px 12px;
      margin: 0;
      font-size: 12px;
    }
    .btn.danger { background: #b94b5b; color: white; }
    .timeline {
      height: 100%;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .timeline-header {
      padding: 14px 18px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      color: var(--muted);
      font-size: 12px;
      font-family: monospace;
      gap: 12px;
    }
    .timeline-body {
      flex: 1;
      overflow-y: auto;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .scene-row {
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px;
      background: #131416;
    }
    .scene-top {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }
    .scene-title {
      color: var(--accent);
      font-family: monospace;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .media-deck {
      display: flex;
      gap: 12px;
      margin-top: 12px;
    }
    .video-box, .audio-box {
      border: 1px solid var(--border);
      border-radius: 6px;
      background: #0b0c0e;
      min-height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      color: var(--muted);
      text-align: center;
    }
    .video-box { flex: 2; overflow: hidden; }
    .audio-box { flex: 1; background: #0f1013; flex-direction: column; }
    video { width: 100%; height: 100%; object-fit: cover; }
    audio { width: 100%; }
    .muted { color: var(--muted); font-size: 12px; }
    .error { color: var(--error); font-size: 12px; }
    .success { color: var(--success); font-size: 12px; }
    .loader {
      border: 2px solid #2a2d33;
      border-top: 2px solid var(--accent);
      border-radius: 50%;
      width: 20px;
      height: 20px;
      animation: spin 1s linear infinite;
      margin-right: 8px;
    }
    .inline-row {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .memory-box, .chat-box {
      background: var(--panel-2);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px;
    }
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-height: 220px;
      max-height: 50vh;
    }
    .chat-msg {
      border: 1px solid var(--border);
      background: #14161a;
      border-radius: 8px;
      padding: 10px;
      white-space: pre-wrap;
      font-size: 13px;
      line-height: 1.4;
    }
    .chat-msg.user { border-color: #3b4272; }
    .chat-msg.assistant { border-color: #30513b; }
    .row {
      display: flex;
      gap: 8px;
    }
    .row > * { flex: 1; }
    @media (max-width: 1200px) {
      body { grid-template-columns: 320px 1fr; }
      .chatbar { display: none; }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="sidebar">
    <h2>Bones</h2>
    <input id="boneInput" value="root, body, head, left_arm, right_arm, left_leg, right_leg" />

    <h2>Story prompt</h2>
    <textarea id="storyPrompt" placeholder="Describe your 8-minute Blockbench animation story..."></textarea>

    <h2>Style</h2>
    <select id="styleChoice">
      <option value="Blockbench voxel animation">Blockbench voxel animation</option>
      <option value="Voxel cinematic">Voxel cinematic</option>
      <option value="3D cartoon">3D cartoon</option>
    </select>

    <button class="btn" id="compileBtn">Compile timeline</button>
    <button class="btn secondary" id="bbExportBtn">Download Blockbench JSON</button>
    <button class="btn warning" id="clearAllBtn">Clear saved data</button>

    <div class="memory-box">
      <h2>Character memory</h2>
      <textarea id="characterBible" placeholder="Main character design, clothing, personality..."></textarea>

      <h2>World memory</h2>
      <textarea id="worldBible" placeholder="World rules, locations, factions, lore..."></textarea>

      <h2>Style memory</h2>
      <textarea id="styleBible" placeholder="Camera style, pacing, lighting, animation rules..."></textarea>
    </div>
  </div>

  <div class="workspace">
    <div class="timeline">
      <div class="timeline-header">
        <span id="statusHeader">Status: Idle</span>
        <span id="durationCounter">Total Duration: 0s / 480s</span>
      </div>
      <div class="timeline-body" id="sceneTimeline">
        <div class="muted">No timeline yet.</div>
      </div>
    </div>
  </div>

  <div class="chatbar">
    <h2>AI director chat</h2>

    <div class="chat-box chat-messages" id="chatMessages"></div>

    <textarea id="chatInput" placeholder="Examples:
- make scene 4 more intense
- give the hero red armor
- add more fighting in the middle
- remember that the villain has blue eyes"></textarea>

    <div class="row">
      <button class="btn" id="sendChatBtn">Send</button>
      <button class="btn secondary" id="saveMemoryBtn">Save memory</button>
    </div>
  </div>

  <script>
    let currentTimeline = [];
    let studioMemory = {
      characterBible: '',
      worldBible: '',
      styleBible: '',
      continuityRules: [],
      chatHistory: []
    };

    const STORAGE_KEY = 'blockbench_ai_studio_timeline_cf_v1';
    const MEMORY_KEY = 'blockbench_ai_studio_memory_cf_v1';

    document.getElementById('compileBtn').addEventListener('click', generateTimeline);
    document.getElementById('bbExportBtn').addEventListener('click', exportBlockbenchFormat);
    document.getElementById('sendChatBtn').addEventListener('click', sendChatMessage);
    document.getElementById('saveMemoryBtn').addEventListener('click', saveMemoryFromInputs);
    document.getElementById('clearAllBtn').addEventListener('click', clearAllSavedData);

    ['characterBible', 'worldBible', 'styleBible'].forEach(id => {
      document.getElementById(id).addEventListener('input', saveMemoryFromInputs);
    });

    loadMemory();
    loadTimelineFromStorage();
    renderChatHistory();

    function getAllowedBones() {
      return document.getElementById('boneInput').value
        .split(',')
        .map(b => b.trim())
        .filter(Boolean);
    }

    function saveMemoryFromInputs() {
      studioMemory.characterBible = document.getElementById('characterBible').value.trim();
      studioMemory.worldBible = document.getElementById('worldBible').value.trim();
      studioMemory.styleBible = document.getElementById('styleBible').value.trim();
      persistMemory();
    }

    function loadMemoryIntoInputs() {
      document.getElementById('characterBible').value = studioMemory.characterBible || '';
      document.getElementById('worldBible').value = studioMemory.worldBible || '';
      document.getElementById('styleBible').value = studioMemory.styleBible || '';
    }

    function persistMemory() {
      localStorage.setItem(MEMORY_KEY, JSON.stringify(studioMemory));
    }

    function loadMemory() {
      try {
        const raw = localStorage.getItem(MEMORY_KEY);
        if (raw) studioMemory = JSON.parse(raw);
      } catch {}
      loadMemoryIntoInputs();
    }

    function getMemoryContext() {
      return `
CHARACTER MEMORY:
${studioMemory.characterBible || 'None yet.'}

WORLD MEMORY:
${studioMemory.worldBible || 'None yet.'}

STYLE MEMORY:
${studioMemory.styleBible || 'None yet.'}

CONTINUITY RULES:
${(studioMemory.continuityRules || []).join('\n') || 'Keep characters, clothing, colors, and tone consistent.'}
`.trim();
    }

    async function generateTimeline() {
      saveMemoryFromInputs();

      const prompt = document.getElementById('storyPrompt').value.trim();
      const style = document.getElementById('styleChoice').value;
      const bones = getAllowedBones();
      const timelineElement = document.getElementById('sceneTimeline');
      const statusHeader = document.getElementById('statusHeader');

      if (!prompt) {
        alert('Please enter a story prompt.');
        return;
      }

      statusHeader.innerText = 'Status: Generating timeline...';
      timelineElement.innerHTML = '<div class="muted">Generating valid JSON timeline...</div>';

      const systemRules = `
You are a 3D animation runtime engine.

Output ONLY a valid JSON array.
No notes.
No markdown.
No backticks.

${getMemoryContext()}

Character skeletal configuration: ${JSON.stringify(bones)}
Story concept: "${prompt}"
Visual style: "${style}"

Rules:
- Return an array of scene objects
- Each scene duration must be an integer between 8 and 12
- Total duration should target 480 seconds
- Keep character descriptions consistent with memory
- Include audio effect prompts
- Include simple Blockbench-style bone keyframes

JSON schema target:
[
  {
    "scene": 1,
    "duration": 10,
    "prompt": "Voxel style cinematic shot description text here",
    "audio_fx_prompt": "Ambient background sound effects track descriptions",
    "blockbench_keyframes": {
      "body": {
        "rotation": {
          "0.0": [0, 0, 0],
          "5.0": [10, 20, -30]
        }
      },
      "head": {
        "rotation": {
          "0.0": [0, 0, 0],
          "5.0": [0, 15, 0]
        }
      }
    }
  }
]
`;

      try {
        const response = await puter.ai.chat(systemRules, { model: 'claude-3-5-sonnet' });
        let cleanText = response?.message?.content?.trim() || '';

        if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
        }

        const parsedData = JSON.parse(cleanText);
        currentTimeline = validateAndBalanceTimeline(parsedData);
        persistTimeline();
        renderTimelineUI();
        statusHeader.innerText = 'Status: Timeline ready';
        pushAssistantMessage('I generated a new timeline using your saved memory.');
      } catch (err) {
        statusHeader.innerText = 'Status: Generation failed';
        timelineElement.innerHTML = `<div class="error">Compilation Error: ${escapeHtml(err.message)}</div>`;
      }
    }

    function validateAndBalanceTimeline(timeline) {
      if (!Array.isArray(timeline) || timeline.length === 0) {
        throw new Error('Timeline must be a non-empty array.');
      }

      const allowedBones = getAllowedBones();

      for (let i = 0; i < timeline.length; i++) {
        const scene = timeline[i];

        if (typeof scene.scene !== 'number') scene.scene = i + 1;
        if (typeof scene.duration !== 'number' || Number.isNaN(scene.duration)) scene.duration = 10;
        if (scene.duration < 8) scene.duration = 8;
        if (scene.duration > 12) scene.duration = 12;

        if (typeof scene.prompt !== 'string' || !scene.prompt.trim()) {
          throw new Error(`Scene ${i + 1} is missing prompt.`);
        }

        if (typeof scene.audio_fx_prompt !== 'string') scene.audio_fx_prompt = '';

        scene.blockbench_keyframes = normalizeBlockbenchKeyframes(
          scene.blockbench_keyframes,
          scene.duration,
          allowedBones
        );

        if (typeof scene.rendered_video_url !== 'string') scene.rendered_video_url = '';
        if (typeof scene.rendered_audio_url !== 'string') scene.rendered_audio_url = '';
      }

      let total = timeline.reduce((sum, s) => sum + Number(s.duration || 0), 0);

      while (total < 480) {
        let changed = false;
        for (const scene of timeline) {
          if (scene.duration < 12 && total < 480) {
            scene.duration++;
            total++;
            changed = true;
          }
        }
        if (!changed) break;
      }

      while (total > 480) {
        let changed = false;
        for (const scene of timeline) {
          if (scene.duration > 8 && total > 480) {
            scene.duration--;
            total--;
            changed = true;
          }
        }
        if (!changed) break;
      }

      refreshSceneNumbers();
      updateDurationCounter();
      return timeline;
    }

    function normalizeBlockbenchKeyframes(rawKeyframes, sceneDuration, allowedBones) {
      if (!rawKeyframes || typeof rawKeyframes !== 'object' || Array.isArray(rawKeyframes)) return {};
      const result = {};

      for (const [boneName, channels] of Object.entries(rawKeyframes)) {
        if (!allowedBones.includes(boneName)) continue;
        if (!channels || typeof channels !== 'object' || Array.isArray(channels)) continue;

        const boneOut = {};
        for (const channelName of ['rotation', 'position', 'scale']) {
          if (!channels[channelName]) continue;
          const normalized = normalizeChannelMap(channels[channelName], sceneDuration);
          if (Object.keys(normalized).length) boneOut[channelName] = normalized;
        }
        if (Object.keys(boneOut).length) result[boneName] = boneOut;
      }

      return result;
    }

    function normalizeChannelMap(channelMap, sceneDuration) {
      if (!channelMap || typeof channelMap !== 'object' || Array.isArray(channelMap)) return {};
      const entries = [];

      for (const [timeKey, vector] of Object.entries(channelMap)) {
        const time = Number(timeKey);
        if (Number.isNaN(time)) continue;
        if (!Array.isArray(vector) || vector.length !== 3) continue;

        const cleanVector = vector.map(n => Number.isFinite(Number(n)) ? Number(n) : 0);
        const clampedTime = Math.max(0, Math.min(sceneDuration, time));
        entries.push([clampedTime, cleanVector]);
      }

      entries.sort((a, b) => a[0] - b[0]);

      const result = {};
      for (const [time, vector] of entries) result[time.toFixed(2)] = vector;
      return result;
    }

    function renderTimelineUI() {
      const container = document.getElementById('sceneTimeline');
      container.innerHTML = '';

      if (!currentTimeline.length) {
        container.innerHTML = '<div class="muted">No timeline yet.</div>';
        updateDurationCounter();
        return;
      }

      currentTimeline.forEach((block, idx) => {
        const row = document.createElement('div');
        row.className = 'scene-row';
        row.innerHTML = `
          <div class="scene-top">
            <div style="flex:1;">
              <div class="scene-title">SCENE ${idx + 1} [${block.duration}s]</div>

              <div class="muted" style="margin-bottom:6px;">Visual prompt</div>
              <textarea style="min-height:80px;margin-bottom:8px;" oninput="updateScenePrompt(${idx}, this.value)">${escapeHtml(block.prompt)}</textarea>

              <div class="muted" style="margin-bottom:6px;">Audio prompt</div>
              <textarea style="min-height:70px;margin-bottom:8px;" oninput="updateSceneAudioPrompt(${idx}, this.value)">${escapeHtml(block.audio_fx_prompt)}</textarea>

              <div class="muted" style="margin-bottom:6px;">Duration</div>
              <input type="number" min="8" max="12" value="${block.duration}" oninput="updateSceneDuration(${idx}, this.value)" />
            </div>

            <div style="display:flex;flex-direction:column;gap:8px;align-items:stretch;">
              <button class="btn small" onclick="dispatchRenderPipeline(${idx})">Render</button>
              <button class="btn small" onclick="cloneScene(${idx})">Clone</button>
              <button class="btn small" onclick="moveScene(${idx}, -1)">Up</button>
              <button class="btn small" onclick="moveScene(${idx}, 1)">Down</button>
              <button class="btn small danger" onclick="deleteScene(${idx})">Delete</button>
            </div>
          </div>

          <div class="media-deck">
            <div class="video-box" id="v-box-${idx}">
              ${block.rendered_video_url
                ? `<video src="${block.rendered_video_url}" controls autoplay loop muted></video>`
                : 'Video idle'}
            </div>
            <div class="audio-box" id="a-box-${idx}">
              ${block.rendered_audio_url
                ? `<div class="success">Audio ready</div><audio src="${block.rendered_audio_url}" controls></audio>`
                : 'Audio idle'}
            </div>
          </div>
        `;
        container.appendChild(row);
      });

      updateDurationCounter();
    }

    function cloneScene(index) {
      const source = currentTimeline[index];
      if (!source) return;

      const clone = JSON.parse(JSON.stringify(source));
      clone.scene = Date.now();
      clone.rendered_video_url = '';
      clone.rendered_audio_url = '';

      currentTimeline.splice(index + 1, 0, clone);
      refreshSceneNumbers();
      persistTimeline();
      renderTimelineUI();
      setStatus('Status: Scene cloned');
    }

    function deleteScene(index) {
      if (currentTimeline.length <= 1) {
        alert('You cannot delete the last remaining scene.');
        return;
      }
      currentTimeline.splice(index, 1);
      refreshSceneNumbers();
      persistTimeline();
      renderTimelineUI();
      setStatus('Status: Scene deleted');
    }

    function moveScene(index, direction) {
      const target = index + direction;
      if (target < 0 || target >= currentTimeline.length) return;

      [currentTimeline[index], currentTimeline[target]] = [currentTimeline[target], currentTimeline[index]];
      refreshSceneNumbers();
      persistTimeline();
      renderTimelineUI();
      setStatus('Status: Scene moved');
    }

    function updateScenePrompt(index, value) {
      if (!currentTimeline[index]) return;
      currentTimeline[index].prompt = value;
      currentTimeline[index].rendered_video_url = '';
      persistTimeline();
    }

    function updateSceneAudioPrompt(index, value) {
      if (!currentTimeline[index]) return;
      currentTimeline[index].audio_fx_prompt = value;
      currentTimeline[index].rendered_audio_url = '';
      persistTimeline();
    }

    function updateSceneDuration(index, value) {
      if (!currentTimeline[index]) return;
      const num = Math.max(8, Math.min(12, Number(value) || 10));
      currentTimeline[index].duration = num;
      persistTimeline();
      updateDurationCounter();
    }

    function refreshSceneNumbers() {
      currentTimeline.forEach((scene, i) => scene.scene = i + 1);
    }

    function persistTimeline() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentTimeline));
    }

    function loadTimelineFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          currentTimeline = parsed;
          refreshSceneNumbers();
          renderTimelineUI();
          setStatus('Status: Timeline restored from local storage');
        }
      } catch {}
    }

    function clearAllSavedData() {
      if (!confirm('Clear saved timeline and memory?')) return;
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(MEMORY_KEY);
      currentTimeline = [];
      studioMemory = {
        characterBible: '',
        worldBible: '',
        styleBible: '',
        continuityRules: [],
        chatHistory: []
      };
      loadMemoryIntoInputs();
      renderTimelineUI();
      renderChatHistory();
      setStatus('Status: Saved data cleared');
    }

    function updateDurationCounter() {
      const total = currentTimeline.reduce((sum, s) => sum + Number(s.duration || 0), 0);
      document.getElementById('durationCounter').innerText = `Total Duration: ${total}s / 480s`;
    }

    function setStatus(text) {
      document.getElementById('statusHeader').innerText = text;
    }

    async function dispatchRenderPipeline(index) {
      const block = currentTimeline[index];
      const vBox = document.getElementById(`v-box-${index}`);
      const aBox = document.getElementById(`a-box-${index}`);

      vBox.innerHTML = '<div class="inline-row"><div class="loader"></div><span>Queueing video...</span></div>';
      aBox.innerHTML = '<div class="inline-row"><div class="loader"></div><span>Queueing audio...</span></div>';

      try {
        const response = await fetch('/api/render-scene', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: block.prompt,
            audio_prompt: block.audio_fx_prompt
          })
        });

        const data = await response.json();
        if (!response.ok || data.error) throw new Error(data.error || 'Render request failed.');

        pollAssetLane(data.video_request_id, vBox, 'video', index);
        pollAssetLane(data.audio_request_id, aBox, 'audio', index);
      } catch (err) {
        vBox.innerHTML = `<div class="error">${escapeHtml(err.message)}</div>`;
        aBox.innerHTML = `<div class="error">${escapeHtml(err.message)}</div>`;
      }
    }

    function pollAssetLane(requestId, targetElement, type, index) {
      let attempts = 0;
      const maxAttempts = 120;

      const tracker = setInterval(async () => {
        attempts++;
        if (attempts > maxAttempts) {
          clearInterval(tracker);
          targetElement.innerHTML = '<div class="error">Render timeout reached.</div>';
          return;
        }

        try {
          const res = await fetch(`/api/check-status?id=${encodeURIComponent(requestId)}&type=${encodeURIComponent(type)}`);
          const data = await res.json();
          if (!res.ok || data.error) throw new Error(data.error || 'Polling failed.');

          if (data.status === 'COMPLETED') {
            clearInterval(tracker);
            if (type === 'video') {
              currentTimeline[index].rendered_video_url = data.url || '';
              persistTimeline();
              targetElement.innerHTML = `<video src="${data.url}" controls autoplay loop muted></video>`;
            } else {
              currentTimeline[index].rendered_audio_url = data.url || '';
              persistTimeline();
              targetElement.innerHTML = `<div class="success">Audio ready</div><audio src="${data.url}" controls></audio>`;
            }
          } else if (data.status === 'FAILED') {
            clearInterval(tracker);
            targetElement.innerHTML = '<div class="error">Asset generation failed.</div>';
          }
        } catch {
          clearInterval(tracker);
          targetElement.innerHTML = '<div class="error">Polling track lost.</div>';
        }
      }, 5000);
    }

    function exportBlockbenchFormat() {
      if (!currentTimeline.length) {
        alert('No active timeline to export.');
        return;
      }

      const output = {
        format_version: "1.8.0",
        animations: {
          "animation.studio.mastercut_8min": {
            animation_length: 480,
            loop: true,
            bones: {}
          }
        }
      };

      const animation = output.animations["animation.studio.mastercut_8min"];
      let timelineCursor = 0;

      currentTimeline.forEach(scene => {
        const duration = Number(scene.duration) || 0;
        const keyframes = scene.blockbench_keyframes || {};

        for (const [boneName, channels] of Object.entries(keyframes)) {
          if (!animation.bones[boneName]) animation.bones[boneName] = {};
          for (const channelName of ['rotation', 'position', 'scale']) {
            if (!channels[channelName]) continue;
            if (!animation.bones[boneName][channelName]) animation.bones[boneName][channelName] = {};
            for (const [localTime, vector] of Object.entries(channels[channelName])) {
              const globalTime = (timelineCursor + parseFloat(localTime)).toFixed(2);
              animation.bones[boneName][channelName][globalTime] = vector;
            }
          }
        }

        timelineCursor += duration;
      });

      const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'studio_mastercut_animation.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }

    function pushUserMessage(text) {
      studioMemory.chatHistory.push({ role: 'user', content: text });
      persistMemory();
      renderChatHistory();
    }

    function pushAssistantMessage(text) {
      studioMemory.chatHistory.push({ role: 'assistant', content: text });
      persistMemory();
      renderChatHistory();
    }

    function renderChatHistory() {
      const box = document.getElementById('chatMessages');
      box.innerHTML = '';

      const items = studioMemory.chatHistory || [];
      if (!items.length) {
        box.innerHTML = '<div class="muted">No chat yet.</div>';
        return;
      }

      items.forEach(msg => {
        const div = document.createElement('div');
        div.className = `chat-msg ${msg.role}`;
        div.textContent = msg.content;
        box.appendChild(div);
      });

      box.scrollTop = box.scrollHeight;
    }

    async function sendChatMessage() {
      saveMemoryFromInputs();

      const input = document.getElementById('chatInput');
      const message = input.value.trim();
      if (!message) return;

      input.value = '';
      pushUserMessage(message);
      setStatus('Status: AI director is thinking...');

      const timelineSummary = currentTimeline.map(scene => ({
        scene: scene.scene,
        duration: scene.duration,
        prompt: scene.prompt,
        audio_fx_prompt: scene.audio_fx_prompt
      }));

      const prompt = `
You are an AI animation director for a Blockbench-style story editor.

${getMemoryContext()}

Current timeline:
${JSON.stringify(timelineSummary, null, 2)}

User request:
${message}

Return ONLY valid JSON with this schema:
{
  "message": "short plain-English reply",
  "memory_updates": {
    "characterBible": "optional string or empty",
    "worldBible": "optional string or empty",
    "styleBible": "optional string or empty",
    "continuityRules": ["optional", "rules"]
  },
  "timeline_actions": [
    {
      "type": "update_scene",
      "scene": 1,
      "prompt": "optional updated prompt",
      "audio_fx_prompt": "optional updated audio prompt",
      "duration": 10
    },
    {
      "type": "bulk_replace",
      "find": "old phrase",
      "replace": "new phrase"
    },
    {
      "type": "append_scene",
      "scene_data": {
        "scene": 999,
        "duration": 10,
        "prompt": "new scene prompt",
        "audio_fx_prompt": "new audio prompt",
        "blockbench_keyframes": {}
      }
    }
  ]
}
`;

      try {
        const response = await puter.ai.chat(prompt, { model: 'claude-3-5-sonnet' });
        let text = response?.message?.content?.trim() || '';

        if (text.startsWith('```')) {
          text = text.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
        }

        const result = JSON.parse(text);
        applyChatResult(result);
        pushAssistantMessage(result.message || 'Updated the project.');
        setStatus('Status: Chat changes applied');
      } catch (err) {
        pushAssistantMessage(`I couldn’t apply that cleanly: ${err.message}`);
        setStatus('Status: Chat update failed');
      }
    }

    function applyChatResult(result) {
      const updates = result.memory_updates || {};

      if (updates.characterBible) studioMemory.characterBible = updates.characterBible;
      if (updates.worldBible) studioMemory.worldBible = updates.worldBible;
      if (updates.styleBible) studioMemory.styleBible = updates.styleBible;
      if (Array.isArray(updates.continuityRules) && updates.continuityRules.length) {
        studioMemory.continuityRules = updates.continuityRules;
      }

      loadMemoryIntoInputs();

      const actions = Array.isArray(result.timeline_actions) ? result.timeline_actions : [];

      for (const action of actions) {
        if (action.type === 'update_scene') {
          const idx = currentTimeline.findIndex(s => s.scene === Number(action.scene));
          if (idx !== -1) {
            if (typeof action.prompt === 'string' && action.prompt.trim()) currentTimeline[idx].prompt = action.prompt;
            if (typeof action.audio_fx_prompt === 'string') currentTimeline[idx].audio_fx_prompt = action.audio_fx_prompt;
            if (typeof action.duration === 'number') currentTimeline[idx].duration = Math.max(8, Math.min(12, action.duration));
            currentTimeline[idx].rendered_video_url = '';
            currentTimeline[idx].rendered_audio_url = '';
          }
        }

        if (action.type === 'bulk_replace' && action.find) {
          currentTimeline.forEach(scene => {
            scene.prompt = String(scene.prompt).split(action.find).join(action.replace || '');
            scene.audio_fx_prompt = String(scene.audio_fx_prompt).split(action.find).join(action.replace || '');
            scene.rendered_video_url = '';
            scene.rendered_audio_url = '';
          });
        }

        if (action.type === 'append_scene' && action.scene_data) {
          const scene = action.scene_data;
          currentTimeline.push({
            scene: currentTimeline.length + 1,
            duration: Math.max(8, Math.min(12, Number(scene.duration) || 10)),
            prompt: String(scene.prompt || 'New scene'),
            audio_fx_prompt: String(scene.audio_fx_prompt || ''),
            blockbench_keyframes: scene.blockbench_keyframes || {},
            rendered_video_url: '',
            rendered_audio_url: ''
          });
        }
      }

      currentTimeline = validateAndBalanceTimeline(currentTimeline);
      persistTimeline();
      persistMemory();
      renderTimelineUI();
    }

    function escapeHtml(str) {
      return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    }
  </script>
</body>
</html>
```

## `functions/_middleware.js`

```js
export async function onRequest(context) {
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }

  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
```

## `functions/api/render-scene.js`

```js
export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    if (!env.FAL_KEY) {
      return json({ error: "Missing FAL_KEY secret." }, 500);
    }

    const body = await request.json();
    const prompt = String(body?.prompt || "").trim();
    const audioPrompt = String(body?.audio_prompt || "").trim();

    if (!prompt || !audioPrompt) {
      return json({ error: "Missing prompt or audio_prompt." }, 400);
    }

    const videoRoute = "fal-ai/luma-dream-machine";
    const audioRoute = "fal-ai/elevenlabs/sound-effects";

    const [videoResp, audioResp] = await Promise.all([
      fetch(`https://queue.fal.run/${videoRoute}`, {
        method: "POST",
        headers: {
          "Authorization": `Key ${env.FAL_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt, aspect_ratio: "16:9" })
      }),
      fetch(`https://queue.fal.run/${audioRoute}`, {
        method: "POST",
        headers: {
          "Authorization": `Key ${env.FAL_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: audioPrompt })
      })
    ]);

    const videoData = await videoResp.json().catch(() => ({}));
    const audioData = await audioResp.json().catch(() => ({}));

    if (!videoResp.ok || !audioResp.ok) {
      return json({
        error: "Failed to start render jobs.",
        video: videoData,
        audio: audioData
      }, 500);
    }

    return json({
      video_request_id: videoData.request_id,
      audio_request_id: audioData.request_id
    });
  } catch (err) {
    return json({ error: err.message || "Unexpected error." }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
```

## `functions/api/check-status.js`

```js
export async function onRequestGet(context) {
  try {
    const { request, env } = context;

    if (!env.FAL_KEY) {
      return json({ error: "Missing FAL_KEY secret." }, 500);
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const type = url.searchParams.get("type");

    const routes = {
      video: "fal-ai/luma-dream-machine",
      audio: "fal-ai/elevenlabs/sound-effects"
    };

    if (!id || !type || !routes[type]) {
      return json({ error: "Invalid id or type." }, 400);
    }

    const resp = await fetch(`https://queue.fal.run/${routes[type]}/requests/${id}`, {
      headers: { "Authorization": `Key ${env.FAL_KEY}` }
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      return json({ error: "Failed to check render status.", details: data }, 500);
    }

    let assetUrl = null;

    if (data.status === "COMPLETED") {
      if (type === "video") {
        assetUrl = data?.video?.url || data?.output?.video?.url || data?.output?.url || null;
      } else {
        assetUrl = data?.audio?.url || data?.output?.audio?.url || data?.output?.url || null;
      }
    }

    return json({ status: data.status || "UNKNOWN", url: assetUrl });
  } catch (err) {
    return json({ error: err.message || "Unexpected error." }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
```

## `package.json`

```json
{
  "name": "blockbench-ai-cloudflare-pages",
  "version": "1.0.0",
  "private": true
}
```

## `.gitignore`

```gitignore
node_modules
.env
.wrangler
```

## `.env.example`

```env
FAL_KEY=your_fal_key_here
```

## `README.md`

```md
# Blockbench AI Studio — Cloudflare Pages Version

This version is built for:
- GitHub repo storage
- Cloudflare Pages hosting
- Cloudflare Pages Functions backend routes

## Features
- Puter.js story-to-scene generation
- AI director chat with memory
- Scene editing, clone, delete, move
- Render video/audio through backend functions
- Export Blockbench-style animation JSON
- Local browser memory with localStorage

## Files
- `index.html` — app UI
- `functions/api/render-scene.js` — starts render jobs
- `functions/api/check-status.js` — polls render status
- `functions/_middleware.js` — CORS handling

## Deploy steps
1. Push this repo to GitHub.
2. Log in to Cloudflare.
3. Go to **Workers & Pages**.
4. Click **Create application**.
5. Click **Pages**.
6. Click **Connect to Git**.
7. Select your GitHub repo.
8. Build settings:
   - Framework preset: `None`
   - Build command: leave blank
   - Build output directory: `/`
9. Add environment variable:
   - Name: `FAL_KEY`
   - Value: your real Fal key
10. Save and deploy.

## Notes
- GitHub Pages alone will not run these backend files.
- This version does not include MP4 export.
- Memory is stored in the browser with localStorage.
```
