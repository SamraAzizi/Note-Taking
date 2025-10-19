import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [notebooks, setNotebooks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState(null);
  const [tags, setTags] = useState([]);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showNotebookForm, setShowNotebookForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotebookFilter, setSelectedNotebookFilter] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [editingNote, setEditingNote] = useState(null);
  const [editingNotebook, setEditingNotebook] = useState(null);

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

  const updateNote = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/notes/${editingNote.id}`, {
        title: noteForm.title,
        content: noteForm.content,
        notebookId: noteForm.notebookId,
        tags: noteForm.tags
      });
      
      setNoteForm({ title: '', content: '', notebookId: '', tags: [] });
      setEditingNote(null);
      fetchAllData();
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const deleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await axios.delete(`${API_BASE}/notes/${noteId}`);
        fetchAllData();
        if (selectedNote && selectedNote.id === noteId) {
          closeNoteDetail();
        }
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

  const viewNote = (note) => {
    setSelectedNote(note);
    setViewMode('detail');
  };

  const closeNoteDetail = () => {
    setSelectedNote(null);
    setViewMode('grid');
  };

  const editNote = (note) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      notebookId: note.notebook_id,
      tags: note.tags || []
    });
  };

  const cancelEditNote = () => {
    setEditingNote(null);
    setNoteForm({ title: '', content: '', notebookId: '', tags: [] });
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

  const updateNotebook = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/notebooks/${editingNotebook.id}`, {
        name: notebookForm.name,
        color: notebookForm.color
      });
      
      setNotebookForm({ name: '', color: '#3b82f6' });
      setEditingNotebook(null);
      fetchAllData();
    } catch (error) {
      console.error('Error updating notebook:', error);
    }
  };

  const viewNotebook = (notebook) => {
    setSelectedNotebook(notebook);
    setViewMode('notebook-detail');
  };

  const closeNotebookDetail = () => {
    setSelectedNotebook(null);
    setViewMode('grid');
  };

  const editNotebook = (notebook) => {
    setEditingNotebook(notebook);
    setNotebookForm({
      name: notebook.name,
      color: notebook.color
    });
  };

  const cancelEditNotebook = () => {
    setEditingNotebook(null);
    setNotebookForm({ name: '', color: '#3b82f6' });
  };

  const deleteNotebook = async (notebookId) => {
    if (window.confirm('Are you sure you want to delete this notebook? All notes in it will also be deleted.')) {
      try {
        await axios.delete(`${API_BASE}/notebooks/${notebookId}`);
        fetchAllData();
        if (selectedNotebook && selectedNotebook.id === notebookId) {
          closeNotebookDetail();
        }
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
      if (selectedNotebookFilter) params.append('notebook', selectedNotebookFilter);
      
      const response = await axios.get(`${API_BASE}/search?${params}`);
      setNotes(response.data);
    } catch (error) {
      console.error('Error searching notes:', error);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedNotebookFilter('');
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
            value={selectedNotebookFilter} 
            onChange={(e) => setSelectedNotebookFilter(e.target.value)}
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
        <div className="action-buttons">
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
          <div 
            key={notebook.id} 
            className="note-card" 
            style={{ borderLeftColor: notebook.color, cursor: 'pointer' }}
            onClick={() => viewNotebook(notebook)}
          >
            <div className="card-header">
              <h3>{notebook.name}</h3>
              <div className="card-header-buttons" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="btn-small btn-edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    editNotebook(notebook);
                  }}
                >
                  Edit
                </button>
                <button 
                  className="btn-danger btn-small"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotebook(notebook.id);
                  }}
                >
                  Delete
                </button>
              </div>
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
          <div 
            key={note.id} 
            className="note-card"
            onClick={() => viewNote(note)}
            style={{ cursor: 'pointer' }}
          >
            <div className="card-header">
              <h3>{note.title}</h3>
              <div className="card-header-buttons" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="btn-small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(note.id);
                  }}
                >
                  {note.starred ? '★' : '☆'}
                </button>
                <button 
                  className="btn-small btn-edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    editNote(note);
                  }}
                >
                  Edit
                </button>
                <button 
                  className="btn-danger btn-small"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            <p>{note.content.substring(0, 100)}{note.content.length > 100 ? '...' : ''}</p>
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

      {/* NOTE DETAIL VIEW */}
      {selectedNote && viewMode === 'detail' && (
        <div className="modal">
          <div className="modal-content note-detail">
            <div className="note-detail-header">
              <h2>{selectedNote.title}</h2>
              <div className="note-actions">
                <button 
                  className="btn-small"
                  onClick={() => toggleStar(selectedNote.id)}
                >
                  {selectedNote.starred ? '★ Unstar' : '☆ Star'}
                </button>
                <button 
                  className="btn-small btn-edit"
                  onClick={() => editNote(selectedNote)}
                >
                  Edit
                </button>
                <button 
                  className="btn-danger btn-small"
                  onClick={() => {
                    deleteNote(selectedNote.id);
                    closeNoteDetail();
                  }}
                >
                  Delete
                </button>
                <button 
                  className="btn-secondary btn-small"
                  onClick={closeNoteDetail}
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="note-meta">
              <span className="notebook-badge" style={{ 
                backgroundColor: notebooks.find(nb => nb.id === selectedNote.notebook_id)?.color || '#3b82f6',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                {notebooks.find(nb => nb.id === selectedNote.notebook_id)?.name || 'Unknown Notebook'}
              </span>
              <span className="note-date">
                Created: {new Date(selectedNote.created).toLocaleString()}
              </span>
              <span className="note-date">
                Updated: {new Date(selectedNote.updated).toLocaleString()}
              </span>
            </div>
            
            <div className="tags">
              {selectedNote.tags && selectedNote.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
            
            <div className="note-content">
              {selectedNote.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NOTEBOOK DETAIL VIEW */}
      {selectedNotebook && viewMode === 'notebook-detail' && (
        <div className="modal">
          <div className="modal-content notebook-detail">
            <div className="notebook-detail-header">
              <h2 style={{ color: selectedNotebook.color }}>
                {selectedNotebook.name}
              </h2>
              <div className="notebook-actions">
                <button 
                  className="btn-small btn-edit"
                  onClick={() => editNotebook(selectedNotebook)}
                >
                  Edit
                </button>
                <button 
                  className="btn-danger btn-small"
                  onClick={() => deleteNotebook(selectedNotebook.id)}
                >
                  Delete Notebook
                </button>
                <button 
                  className="btn-secondary btn-small"
                  onClick={closeNotebookDetail}
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="notebook-meta">
              <span className="notebook-color" style={{ 
                backgroundColor: selectedNotebook.color,
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'inline-block'
              }}></span>
              <span className="notebook-stats">
                {selectedNotebook.notes?.length || 0} notes
              </span>
              <span className="notebook-date">
                Created: {new Date(selectedNotebook.created).toLocaleDateString()}
              </span>
            </div>
            
            <h3>Notes in this Notebook</h3>
            <div className="notes-grid">
              {notes
                .filter(note => note.notebook_id === selectedNotebook.id)
                .map(note => (
                  <div 
                    key={note.id} 
                    className="note-card"
                    onClick={() => viewNote(note)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-header">
                      <h3>{note.title}</h3>
                      <div className="card-header-buttons" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="btn-small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(note.id);
                          }}
                        >
                          {note.starred ? '★' : '☆'}
                        </button>
                      </div>
                    </div>
                    <p>{note.content.substring(0, 100)}{note.content.length > 100 ? '...' : ''}</p>
                    <div className="tags">
                      {note.tags && note.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))
              }
              {(!selectedNotebook.notes || selectedNotebook.notes.length === 0) && (
                <p className="empty-state">No notes in this notebook yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE/EDIT NOTE MODAL */}
      {(showNoteForm || editingNote) && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingNote ? 'Edit Note' : 'Create New Note'}</h3>
            <form onSubmit={editingNote ? updateNote : createNote}>
              <input
                type="text"
                placeholder="Note Title"
                value={noteForm.title}
                onChange={(e) => setNoteForm({...noteForm, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Note Content"
                value={noteForm.content}
                onChange={(e) => setNoteForm({...noteForm, content: e.target.value})}
                rows="6"
                required
              />
              <select
                value={noteForm.notebookId}
                onChange={(e) => setNoteForm({...noteForm, notebookId: e.target.value})}
                required
              >
                <option value="">Select Notebook</option>
                {notebooks.map(nb => (
                  <option key={nb.id} value={nb.id}>{nb.name}</option>
                ))}
              </select>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingNote ? 'Update Note' : 'Create Note'}
                </button>
                <button type="button" onClick={editingNote ? cancelEditNote : () => setShowNoteForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE/EDIT NOTEBOOK MODAL */}
      {(showNotebookForm || editingNotebook) && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingNotebook ? 'Edit Notebook' : 'Create New Notebook'}</h3>
            <form onSubmit={editingNotebook ? updateNotebook : createNotebook}>
              <input
                type="text"
                placeholder="Notebook Name"
                value={notebookForm.name}
                onChange={(e) => setNotebookForm({...notebookForm, name: e.target.value})}
                required
              />
              <div className="color-picker">
                <label>Color:</label>
                <input
                  type="color"
                  value={notebookForm.color}
                  onChange={(e) => setNotebookForm({...notebookForm, color: e.target.value})}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingNotebook ? 'Update Notebook' : 'Create Notebook'}
                </button>
                <button type="button" onClick={editingNotebook ? cancelEditNotebook : () => setShowNotebookForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;