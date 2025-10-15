import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [notebooks, setNotebooks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchNotebooks();
    fetchNotes();
    fetchStats();
  }, []);

  const fetchNotebooks = async () => {
    try {
      const response = await axios.get(`${API_BASE}/notebooks`);
      setNotebooks(response.data);
    } catch (error) {
      console.error('Error fetching notebooks:', error);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await axios.get(`${API_BASE}/notes`);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>📝 Notes App</h1>
        <p>Your personal note-taking application</p>
      </div>

      {stats && (
        <div className="stats">
          <div className="stat-card">
            <h3>Notebooks</h3>
            <p>{stats.totalNotebooks}</p>
          </div>
          <div className="stat-card">
            <h3>Total Notes</h3>
            <p>{stats.totalNotes}</p>
          </div>
          <div className="stat-card">
            <h3>Starred</h3>
            <p>{stats.starredNotes}</p>
          </div>
          <div className="stat-card">
            <h3>Tags</h3>
            <p>{stats.totalTags}</p>
          </div>
        </div>
      )}

      <h2>Notebooks</h2>
      <div className="notes-grid">
        {notebooks.map(notebook => (
          <div key={notebook.id} className="note-card" style={{ borderLeftColor: notebook.color }}>
            <h3>{notebook.name}</h3>
            <p>{notebook.notes.length} notes</p>
            <p style={{ color: notebook.color, fontSize: '12px' }}>
              Created: {new Date(notebook.created).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      <h2>Recent Notes</h2>
      <div className="notes-grid">
        {notes.map(note => (
          <div key={note.id} className="note-card">
            <h3>{note.title}</h3>
            <p>{note.content.substring(0, 100)}...</p>
            <div className="tags">
              {note.tags && note.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>
              Updated: {new Date(note.updated).toLocaleDateString()}
              {note.starred && ' ⭐'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;