from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os

# Import your existing modules
from backend.database import db, init_db
from backend.models import Notebook, Note, Tag, NoteTag

app = Flask(__name__)

# Vercel-compatible database configuration
if 'VERCEL' in os.environ:
    # Use PostgreSQL or external database in production
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:////tmp/notes.db')
else:
    # Local development
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///notes.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')

CORS(app)

# Initialize database
init_db(app)

# ==================== ALL YOUR EXISTING ROUTES ====================
# KEEP ALL YOUR EXISTING ROUTES EXACTLY AS THEY ARE
# (get_notebooks, create_notebook, get_notes, etc.)

@app.route('/')
def home():
    return jsonify({
        "message": "Notes API is running on Vercel!",
        "endpoints": {
            "notebooks": "/api/notebooks",
            "notes": "/api/notes", 
            "tags": "/api/tags",
            "search": "/api/search",
            "stats": "/api/stats"
        }
    })

# KEEP ALL YOUR OTHER ROUTES EXACTLY AS YOU HAVE THEM
# get_notebooks, create_notebook, update_notebook, delete_notebook
# get_notes, get_note, create_note, update_note, delete_note  
# toggle_star, get_tags, create_tag, search_notes, get_stats
# error handlers

def create_sample_data():
    """Create sample data if database is empty"""
    try:
        if Notebook.query.count() == 0:
            print("Creating sample data...")
            
            # Create notebooks
            notebook1 = Notebook(id="notebook-1", name="Personal Notes", color="#3b82f6")
            notebook2 = Notebook(id="notebook-2", name="Work Notes", color="#ef4444")
            notebook3 = Notebook(id="notebook-3", name="Ideas", color="#10b981")
            
            db.session.add_all([notebook1, notebook2, notebook3])
            
            # Create notes
            note1 = Note(
                id="note-1",
                title="Welcome to Notes App",
                content="This is your first note. You can edit, delete, or organize notes into notebooks.",
                notebook_id="notebook-1",
                starred=True
            )
            
            note2 = Note(
                id="note-2",
                title="Meeting Agenda",
                content="1. Project updates\n2. Timeline review\n3. Next steps",
                notebook_id="notebook-2"
            )
            
            db.session.add_all([note1, note2])
            db.session.commit()
            print("Sample data created successfully!")
    except Exception as e:
        print(f"Error creating sample data: {e}")

# Initialize app
with app.app_context():
    create_sample_data()

# Remove the __main__ block since Vercel uses the handler