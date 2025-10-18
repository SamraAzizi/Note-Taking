import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [notebooks, setNotebooks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState(null);
  const [tags, setTags] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showNotebookForm, setShowNotebookForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotebook, setSelectedNotebook] = useState('');

  // Form states
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    notebookId: '',
    tags: []
  });
  const [notebookForm, setNotebookForm] = useState({
    name: '',
    color: '#3b82f6'
  });

  const [notebookForm, setNotebookForm] = useState({
    name: '',
    color: '#3b82f6'
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchNotebooks(),
        fetchNotes(),
        fetchStats(),
        fetchTags()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchNotebooks = async () => {
    const response = await axios.get(`${API_BASE}/notebooks`);
    setNotebooks(response.data);
  };

  const fetchNotes = async () => {
    const response = await axios.get(`${API_BASE}/notes`);
    setNotes(response.data);
  };

  const fetchStats = async () => {
    const response = await axios.get(`${API_BASE}/stats`);
    setStats(response.data);
  };

  const fetchTags = async () => {
    const response = await axios.get(`${API_BASE}/tags`);
    setTags(response.data);
  };

  // NOTE FUNCTIONS
  const createNote = async (e) => {
    e.preventDefault();
    try {
      const newNote = {
        id: `note-${Date.now()}`,

        title: noteForm.title,
        content: noteForm.content,
        notebookId: noteForm.notebookId,
        tags: noteForm.tags
      };
      
      await axios.post(`${API_BASE}/notes`, newNote);
      setNoteForm({ title: '', content: '', notebookId: '', tags: [] });
      setShowNoteForm(false);
      fetchAllData();
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const deleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await axios.delete(`${API_BASE}/notes/${noteId}`);
        fetchAllData();
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const toggleStar = async (noteId) => {
    try {
      await axios.post(`${API_BASE}/notes/${noteId}/star`);
      fetchAllData();
      } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  // NOTEBOOK FUNCTIONS
  const createNotebook = async (e) => {
    e.preventDefault();
    try {
      const newNotebook = {
        id: `notebook-${Date.now()}`,
        name: notebookForm.name,
        color: notebookForm.color
      };
      
      await axios.post(`${API_BASE}/notebooks`, newNotebook);
      setNotebookForm({ name: '', color: '#3b82f6' });
      setShowNotebookForm(false);
      fetchAllData();
    } catch (error) {
      console.error('Error creating notebook:', error);
    }
  };
  const deleteNotebook = async (notebookId) => {
    if (window.confirm('Are you sure you want to delete this notebook? All notes in it will also be deleted.')) {
      try {
        await axios.delete(`${API_BASE}/notebooks/${notebookId}`);
        fetchAllData();
      } catch (error) {
        console.error('Error deleting notebook:', error);
      }
    }
  };

  // SEARCH FUNCTION
  const searchNotes = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedNotebook) params.append('notebook', selectedNotebook);

      const response = await axios.get(`${API_BASE}/search?${params}`);
      setNotes(response.data);
    } catch (error) {
      console.error('Error searching notes:', error);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedNotebook('');
    fetchNotes();
  };

  return (
    <div className="container">
      {/* HEADER */}
      <div className="header">
        <h1>📝 Notes App</h1>
        <p>Your personal note-taking application</p>
        
        {/* SEARCH BAR */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select 
            value={selectedNotebook} 
            onChange={(e) => setSelectedNotebook(e.target.value)}
          >
            <option value="">All Notebooks</option>
            {notebooks.map(nb => (
              <option key={nb.id} value={nb.id}>{nb.name}</option>
            ))}
          </select>
          <button onClick={searchNotes}>Search</button>
          <button onClick={clearSearch}>Clear</button>
        </div>

        {/* ACTION BUTTONS */}
        <div className="action-buttons"></div>

        <button 
            className="btn-primary"
            onClick={() => setShowNoteForm(true)}
          >
            + New Note
          </button>
          <button 
            className="btn-secondary"
            onClick={() => setShowNotebookForm(true)}
          >
            + New Notebook
          </button>
        </div>
      </div>

      

{/* STATISTICS */}
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

      {/* NOTEBOOKS */}
      <h2>Notebooks</h2>
      <div className="notes-grid">
        {notebooks.map(notebook => (
          <div key={notebook.id} className="note-card" style={{ borderLeftColor: notebook.color }}>
            <div className="card-header">
              <h3>{notebook.name}</h3>
              <button 
                className="btn-danger btn-small"
                onClick={() => deleteNotebook(notebook.id)}
              >
                Delete
              </button>
            </div>
            <p>{notebook.notes.length} notes</p>
            <p style={{ color: notebook.color, fontSize: '12px' }}>
              Created: {new Date(notebook.created).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
       {/* NOTES */}
      <h2>Notes ({notes.length})</h2>
      <div className="notes-grid">
        {notes.map(note => (
          <div key={note.id} className="note-card">
            <div className="card-header">
              <h3>{note.title}</h3>
              <div>
                <button 
                  className="btn-small"
                  onClick={() => toggleStar(note.id)}
                >
                  {note.starred ? '★' : '☆'}
                </button>
                <button 
                  className="btn-danger btn-small"
                  onClick={() => deleteNote(note.id)}
                >

                   Delete
                </button>
              </div>
            </div>
            <p>{note.content.substring(0, 100)}...</p>
            <div className="tags">
              {note.tags && note.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>
              Updated: {new Date(note.updated).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* MODALS */}
      {showNoteForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>Create New Note</h3>
            <form onSubmit={createNote}>
              <input
                type="text"
                placeholder="Note Title"
                value={noteForm.title}
                onChange={(e) => setNoteForm({...noteForm, title: e.target.value})}
                required
              />
              <textarea
                </button>
      
      

