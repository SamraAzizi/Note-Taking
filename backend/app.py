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