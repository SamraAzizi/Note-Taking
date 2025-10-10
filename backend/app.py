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