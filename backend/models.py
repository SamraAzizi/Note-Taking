from datetime import datetime
from database import db

class Notebook(db.Model):
    __tablename__ = 'notebooks'
    
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    color = db.Column(db.String(20), default='#3b82f6')
    created = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.relationship('Note', backref='notebook', lazy=True, cascade='all, delete-orphan')
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'color': self.color,
            'created': self.created.isoformat(),
            'notes': [note.id for note in self.notes]
        }


class Note(db.Model):
    __tablename__ = 'notes'
    id = db.Column(db.String(50), primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, default='')
    notebook_id = db.Column(db.String(50), db.ForeignKey('notebooks.id'), nullable=False)
    starred = db.Column(db.Boolean, default=False)
    created = db.Column(db.DateTime, default=datetime.utcnow)
    updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with tags
    tags = db.relationship('NoteTag', backref='note', lazy=True, cascade='all, delete-orphan')
    