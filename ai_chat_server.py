#!/usr/bin/env python3
"""
AI Chat Server for Blockbench Animation Generator

Flask-based web server providing a chat interface for generating
Minecraft animations using natural language prompts.
"""

import os
import json
from flask import Flask, render_template, request, jsonify, send_file
from werkzeug.utils import secure_filename

from blockbench_ai_animation import MinecraftAnimationGenerator
from ai_scene_generator import AISceneGenerator
from character_modes import get_character_mode, parse_character_from_prompt
from video_export import AnimationVideoExporter

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'generated_animations'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


@app.route('/')
def index():
    """Serve the main chat interface."""
    return render_template('index.html')


@app.route('/api/generate', methods=['POST'])
def generate_animation():
    """Generate animation from user prompt."""
    try:
        data = request.get_json()
        prompt = data.get('prompt', '')
        duration_minutes = int(data.get('duration', 10))
        character_name = data.get('character', 'steve')
        theme = data.get('theme', None)
        
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        # Convert minutes to ticks (20 ticks per second)
        duration_ticks = duration_minutes * 60 * 20
        
        # Use AI scene generator to parse prompt and create animation
        generator = AISceneGenerator(prompt, duration_ticks=duration_ticks)
        animator = generator.generate_scene()
        
        # Apply character mode if specified
        if character_name:
            try:
                character = get_character_mode(character_name)
                # Note: Character mode application would need integration in animator
            except ValueError:
                pass  # Use default if character not found
        
        # Apply custom theme if specified
        if theme and theme != 'auto':
            animator.set_background_theme(theme)
        
        # Generate filename
        safe_name = '_'.join(prompt.lower().split()[:5])[:50]
        filename = f"{safe_name}.json"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Save animation
        animator.save_json(filepath)
        
        # Get export metadata
        animation_data = animator.export_for_blockbench()
        exporter = AnimationVideoExporter(animation_data)
        metadata = exporter.get_export_metadata()
        
        return jsonify({
            'success': True,
            'filename': filename,
            'download_url': f'/api/download/{filename}',
            'duration_seconds': metadata['duration_seconds'],
            'estimated_size_mb': metadata['estimated_file_size_mb'],
            'poses_used': len(generator.selected_poses),
            'theme': generator.selected_theme,
            'topics': generator.identified_topics
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/download/<filename>')
def download_file(filename):
    """Download generated animation file."""
    filename = secure_filename(filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404
    
    return send_file(
        filepath,
        mimetype='application/json',
        as_attachment=True,
        download_name=filename
    )


@app.route('/api/poses')
def list_poses():
    """List all available poses."""
    animator = MinecraftAnimationGenerator('temp', 20)
    poses = animator.list_pose_names()
    
    # Categorize poses
    categories = {
        'yoga': [p for p in poses if 'yoga' in p],
        'combat': [p for p in poses if any(x in p for x in ['kick', 'martial', 'stance', 'guard', 'boxer'])],
        'dance': [p for p in poses if 'dance' in p][:20],
        'minecraft': [p for p in poses if p in ['standing', 'walking', 'running', 'crouch', 'sit', 'jump']],
        'other': [p for p in poses if not any(x in p for x in ['yoga', 'dance', 'kick', 'martial', 'stance', 'guard', 'boxer', 'standing', 'walking', 'running', 'crouch', 'sit', 'jump'])][:20]
    }
    
    return jsonify(categories)


@app.route('/api/themes')
def list_themes():
    """List all available themes."""
    animator = MinecraftAnimationGenerator('temp', 20)
    themes = {}
    
    for name, colors in animator.background_palette.items():
        themes[name] = colors
    
    return jsonify(themes)


@app.route('/api/characters')
def list_characters():
    """List all available character modes."""
    from character_modes import list_character_modes
    return jsonify(list_character_modes())


if __name__ == '__main__':
    print("=" * 60)
    print("🎬 Blockbench AI Animation Generator - Web Server")
    print("=" * 60)
    print("\nStarting server at http://localhost:5000")
    print("\nFeatures:")
    print("  • Chat interface for natural language animation requests")
    print("  • AI-powered pose selection based on prompt")
    print("  • Character mode support (Steve, Alex, Gigantic, Tiny)")
    print("  • Multiple color themes")
    print("  • Video export metadata generation")
    print("\nPress Ctrl+C to stop the server\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
