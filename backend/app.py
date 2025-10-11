from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from database import db, init_db
from models import Notebook, Note, Tag, NoteTag

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///notes.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-here'

CORS(app)
init_db(app)
# ==================== NOTEBOOKS ====================

@app.route('/api/notebooks', methods=['GET'])
def get_notebooks():
    notebooks = Notebook.query.all()
    return jsonify([nb.to_dict() for nb in notebooks])

@app.route('/api/notebooks', methods=['POST'])
def create_notebook():
    data = request.json
    notebook = Notebook(
        id=data['id'],
        name=data['name'],
        color=data.get('color', '#3b82f6')
    )

    db.session.add(notebook)
    db.session.commit()
    return jsonify(notebook.to_dict()), 201

@app.route('/api/notebooks/<notebook_id>', methods=['PUT'])
def update_notebook(notebook_id):
    notebook = Notebook.query.get_or_404(notebook_id)
    data = request.json
    notebook.name = data.get('name', notebook.name)
    notebook.color = data.get('color', notebook.color)
    db.session.commit()
    return jsonify(notebook.to_dict())

@app.route('/api/notebooks/<notebook_id>', methods=['DELETE'])
def delete_notebook(notebook_id):
    notebook = Notebook.query.get_or_404(notebook_id)
    db.session.delete(notebook)
    db.session.commit()
    return '', 204

# ==================== NOTES ====================

@app.route('/api/notes', methods=['GET'])
def get_notes():
    notes = Note.query.order_by(Note.updated.desc()).all()
    return jsonify([note.to_dict() for note in notes])

@app.route('/api/notes/<note_id>', methods=['GET'])
def get_note(note_id):
    note = Note.query.get_or_404(note_id)
    return jsonify(note.to_dict())

@app.route('/api/notes', methods=['POST'])
def create_note():
    data = request.json
    note = Note(
        id=data['id'],
        title=data['title'],
        content=data.get('content', ''),
        notebook_id=data['notebookId'],
        starred=data.get('starred', False)
    )
    db.session.add(note)
    
    # Add tags if provided
    if 'tags' in data:
        for tag_name in data['tags']:
            # Create tag if it doesn't exist
            tag = Tag.query.get(tag_name)
            if not tag:
                tag = Tag(id=tag_name)
                db.session.add(tag)

                # Create note-tag relationship
            note_tag = NoteTag(note_id=note.id, tag_name=tag_name)
            db.session.add(note_tag)
    
    db.session.commit()
    return jsonify(note.to_dict()), 201

@app.route('/api/notes/<note_id>', methods=['PUT'])
def update_note(note_id):
    note = Note.query.get_or_404(note_id)
    data = request.json
    
    note.title = data.get('title', note.title)
    note.content = data.get('content', note.content)
    note.starred = data.get('starred', note.starred)
    note.updated = datetime.utcnow()

    # Update tags
    if 'tags' in data:
        # Remove old tags
        NoteTag.query.filter_by(note_id=note_id).delete()
        
        # Add new tags
        for tag_name in data['tags']:
            tag = Tag.query.get(tag_name)
            if not tag:
                tag = Tag(id=tag_name)
                db.session.add(tag)
            
            note_tag = NoteTag(note_id=note.id, tag_name=tag_name)
            db.session.add(note_tag)
    
    db.session.commit()
    return jsonify(note.to_dict())

@app.route('/api/notes/<note_id>', methods=['DELETE'])
def delete_note(note_id):
    note = Note.query.get_or_404(note_id)
    db.session.delete(note)
    db.session.commit()
    return '', 204

@app.route('/api/notes/<note_id>/star', methods=['POST'])
def toggle_star(note_id):
    note = Note.query.get_or_404(note_id)
    note.starred = not note.starred
    db.session.commit()
    return jsonify(note.to_dict())

# ==================== TAGS ====================

@app.route('/api/tags', methods=['GET'])
def get_tags():
    tags = Tag.query.all()
    return jsonify([tag.to_dict() for tag in tags])

@app.route('/api/tags', methods=['POST'])
def create_tag():
    data = request.json
    tag = Tag(
        id=data['id'],
        color=data.get('color', '#8b5cf6')
    )

    db.session.add(tag)
    db.session.commit()
    return jsonify(tag.to_dict()), 201

# ==================== SEARCH ====================

@app.route('/api/search', methods=['GET'])
def search_notes():
    query = request.args.get('q', '')

    notebook_id = request.args.get('notebook')
    tag_names = request.args.getlist('tags')
    
    notes_query = Note.query
    
    # Search in title and content
    if query:
        notes_query = notes_query.filter(
            (Note.title.ilike(f'%{query}%')) | 
            (Note.content.ilike(f'%{query}%'))
        )

        # Filter by notebook
    if notebook_id:
        notes_query = notes_query.filter_by(notebook_id=notebook_id)
    
    # Filter by tags
    if tag_names:
        for tag_name in tag_names:
            notes_query = notes_query.join(NoteTag).filter(NoteTag.tag_name == tag_name)
    
    notes = notes_query.order_by(Note.updated.desc()).all()
    return jsonify([note.to_dict() for note in notes])

# ==================== STATISTICS ====================

@app.route('/api/stats', methods=['GET'])
def get_stats():
    total_notebooks = Notebook.query.count()
    total_notes = Note.query.count()
    starred_notes = Note.query.filter_by(starred=True).count()
    total_tags = Tag.query.count()
    