// Blockbench Animation Generator - Main Application Logic

let animationLibrary = [];
let currentAnimation = null;
let currentCategory = 'all';
let scene, camera, renderer, cube;
let isPlaying = false;
let animationFrame = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  loadLibrary();
  setupEventListeners();
});

// Load animation library from JSON
async function loadLibrary() {
  try {
    const response = await fetch('data/library.json');
    animationLibrary = await response.json();
    
    // Update stats
    document.getElementById('totalAnimations').textContent = animationLibrary.length;
    document.getElementById('yogaCount').textContent = animationLibrary.filter(a => a.category === 'yoga').length;
    document.getElementById('fightCount').textContent = animationLibrary.filter(a => a.category === 'fight').length;
    document.getElementById('danceCount').textContent = animationLibrary.filter(a => a.category === 'dance').length;
    
    renderLibrary(animationLibrary);
  } catch (error) {
    console.error('Error loading library:', error);
    document.getElementById('libraryGrid').innerHTML = `
      <div class="no-results">
        <p>Error loading animations. Please make sure library.json exists in the data folder.</p>
        <p><a href="data/library.json" target="_blank">Download library.json directly</a></p>
      </div>
    `;
  }
}

// Render animation cards
function renderLibrary(animations) {
  const grid = document.getElementById('libraryGrid');
  
  if (animations.length === 0) {
    grid.innerHTML = '<div class="no-results">No animations found matching your filters.</div>';
    return;
  }
  
  grid.innerHTML = animations.map(anim => `
    <div class="animation-card" onclick="selectAnimation('${anim.file}')">
      <h3>${anim.name}</h3>
      <p>${anim.description}</p>
      <div class="card-meta">
        <span class="duration-badge">⏱ ${anim.duration_minutes} min</span>
        <span class="theme-badge" style="background: ${anim.colors[0]}20; color: ${anim.colors[0]}">${anim.theme}</span>
        <span class="duration-badge">📁 ${anim.category}</span>
      </div>
    </div>
  `).join('');
}

// Filter animations
function filterAnimations() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const durationFilter = document.getElementById('durationFilter').value;
  const themeFilter = document.getElementById('themeFilter').value;
  
  let filtered = animationLibrary;
  
  // Category filter
  if (currentCategory !== 'all') {
    filtered = filtered.filter(a => a.category === currentCategory);
  }
  
  // Search filter
  if (searchTerm) {
    filtered = filtered.filter(a => 
      a.name.toLowerCase().includes(searchTerm) ||
      a.description.toLowerCase().includes(searchTerm) ||
      a.category.toLowerCase().includes(searchTerm)
    );
  }
  
  // Duration filter
  if (durationFilter !== 'all') {
    filtered = filtered.filter(a => {
      if (durationFilter === 'short') return a.duration_minutes < 5;
      if (durationFilter === 'medium') return a.duration_minutes >= 5 && a.duration_minutes <= 15;
      if (durationFilter === 'long') return a.duration_minutes > 15;
      return true;
    });
  }
  
  // Theme filter
  if (themeFilter !== 'all') {
    filtered = filtered.filter(a => a.theme === themeFilter);
  }
  
  renderLibrary(filtered);
}

// Select and preview animation
async function selectAnimation(filename) {
  try {
    const response = await fetch(`animations/${filename}`);
    currentAnimation = await response.json();
    
    // Show preview section
    document.getElementById('previewSection').style.display = 'block';
    document.getElementById('previewTitle').textContent = filename.replace('.json', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Update details
    const animData = animationLibrary.find(a => a.file === filename) || {};
    document.getElementById('detailDuration').textContent = `${animData.duration_minutes || (currentAnimation.animations[Object.keys(currentAnimation.animations)[0]]?.animation_length * 20 / 60)?.toFixed(1)} min`;
    document.getElementById('detailTheme').textContent = currentAnimation.scene?.background?.theme || 'default';
    document.getElementById('detailTheme').style.background = (currentAnimation.scene?.background?.color?.[0] || '#4f46e5') + '40';
    document.getElementById('detailTheme').style.color = currentAnimation.scene?.background?.color?.[0] || '#4f46e5';
    
    const bones = currentAnimation.animations[Object.keys(currentAnimation.animations)[0]]?.bones || {};
    document.getElementById('detailBones').textContent = Object.keys(bones).length;
    
    let totalKeyframes = 0;
    Object.values(bones).forEach(bone => {
      totalKeyframes += (bone.rotation?.length || 0) + (bone.position?.length || 0);
    });
    document.getElementById('detailKeyframes').textContent = totalKeyframes;
    
    // Scroll to preview
    document.getElementById('previewSection').scrollIntoView({ behavior: 'smooth' });
    
    // Initialize Three.js preview (simplified - just show info for now)
    initPreview();
    
  } catch (error) {
    console.error('Error loading animation:', error);
    alert('Error loading animation preview. You can still download the file.');
  }
}

// Initialize Three.js preview
function initPreview() {
  const container = document.getElementById('previewContainer');
  container.innerHTML = '';
  
  // Create simple visualization
  const info = document.createElement('div');
  info.style.cssText = 'color: #a78bfa; text-align: center; padding: 100px 20px; font-size: 1.2rem;';
  info.innerHTML = `
    <div style="font-size: 3rem; margin-bottom: 20px;">🎬</div>
    <div>Animation loaded successfully!</div>
    <div style="font-size: 0.9rem; margin-top: 10px; color: #67e8f9;">
      Full 3D preview requires a Minecraft model.<br>
      Download the JSON and import into Blockbench for full preview.
    </div>
  `;
  container.appendChild(info);
  
  // Reset timeline
  document.getElementById('timeline').value = 0;
  document.getElementById('timeDisplay').textContent = '0.0s / 0.0s';
  isPlaying = false;
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Category buttons
  document.querySelectorAll('.categories button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.categories button').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.dataset.category;
      filterAnimations();
    });
  });
  
  // Filters
  document.getElementById('searchInput').addEventListener('input', filterAnimations);
  document.getElementById('durationFilter').addEventListener('change', filterAnimations);
  document.getElementById('themeFilter').addEventListener('change', filterAnimations);
  
  // Preview controls
  document.getElementById('playBtn').addEventListener('click', () => {
    isPlaying = true;
    // In a full implementation, this would play the animation
    alert('Play functionality requires a loaded 3D model. Download the JSON and open in Blockbench for full playback.');
  });
  
  document.getElementById('pauseBtn').addEventListener('click', () => {
    isPlaying = false;
  });
  
  document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('timeline').value = 0;
    document.getElementById('timeDisplay').textContent = '0.0s / 0.0s';
    isPlaying = false;
  });
  
  document.getElementById('timeline').addEventListener('input', (e) => {
    const progress = e.target.value / 100;
    if (currentAnimation) {
      const animName = Object.keys(currentAnimation.animations)[0];
      const length = currentAnimation.animations[animName]?.animation_length || 1;
      const currentTime = progress * length;
      document.getElementById('timeDisplay').textContent = `${currentTime.toFixed(1)}s / ${length.toFixed(1)}s`;
    }
  });
  
  // Download button
  document.getElementById('downloadJson').addEventListener('click', downloadJSON);
  
  // Copy link button
  document.getElementById('copyLink').addEventListener('click', () => {
    const url = window.location.href.split('#')[0];
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    }).catch(err => {
      console.error('Error copying link:', err);
    });
  });
}

// Download JSON file
function downloadJSON() {
  if (!currentAnimation) {
    alert('Please select an animation first.');
    return;
  }
  
  const dataStr = JSON.stringify(currentAnimation, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'blockbench_animation.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Make selectAnimation globally available
window.selectAnimation = selectAnimation;
