import React, { useState, useEffect, useRef } from 'react';
import { Save, Plus, Search, Tag, Book, Star, Trash2, Download, Moon, Sun, Bold, Italic, Underline, List, ListOrdered, Code, Table, Link, Image, CheckSquare, Edit2, ChevronRight, ChevronDown, X, FileText, RefreshCw, Database } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

// API Functions
const api = {
  fetchNotebooks: async () => {
    const response = await fetch(`${API_URL}/notebooks`);
    if (!response.ok) throw new Error('Failed');
    return response.json();
  },
  createNotebook: async (notebook) => {
    const response = await fetch(`${API_URL}/notebooks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notebook)
    });
    if (!response.ok) throw new Error('Failed');
    return response.json();
  },
  fetchNotes: async () => {
    const response = await fetch(`${API_URL}/notes`);
    if (!response.ok) throw new Error('Failed');
    return response.json();
  },
  fetchNote: async (id) => {
    const response = await fetch(`${API_URL}/notes/${id}`);
    if (!response.ok) throw new Error('Failed');
    return response.json();
  },
  createNote: async (note) => {
    const response = await fetch(`${API_URL}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    });
    if (!response.ok) throw new Error('Failed');
    return response.json();
  },
  updateNote: async (id, note) => {
    const response = await fetch(`${API_URL}/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    });
    if (!response.ok) throw new Error('Failed');
    return response.json();
  },
  deleteNote: async (id) => {
    const response = await fetch(`${API_URL}/notes/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed');
  },
  toggleNoteStar: async (id) => {
    const response = await fetch(`${API_URL}/notes/${id}/star`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed');
    return response.json();
  },
  fetchTags: async () => {
    const response = await fetch(`${API_URL}/tags`);
    if (!response.ok) throw new Error('Failed');
    return response.json();
  },
  createTag: async (tag) => {
    const response = await fetch(`${API_URL}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tag)
    });
    if (!response.ok) throw new Error('Failed');
    return response.json();
  },
  fetchStats: async () => {
    const response = await fetch(`${API_URL}/stats`);
    if (!response.ok) throw new Error('Failed');
    return response.json();
  }
};

function App() {
  const [notebooks, setNotebooks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [tags, setTags] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [currentNotebook, setCurrentNotebook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotebookModal, setShowNotebookModal] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [newNotebookName, setNewNotebookName] = useState('');
  const [newNotebookColor, setNewNotebookColor] = useState('#3b82f6');
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [apiConnected, setApiConnected] = useState(false);
  
  const editorRef = useRef(null);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    loadData();
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') setDarkMode(true);
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [notebooksData, notesData, tagsData, statsData] = await Promise.all([
        api.fetchNotebooks(),
        api.fetchNotes(),
        api.fetchTags(),
        api.fetchStats()
      ]);
      
      setNotebooks(notebooksData);
      setNotes(notesData);
      setTags(tagsData);
      setStats(statsData);
      
      if (notebooksData.length > 0) {
        setCurrentNotebook(notebooksData[0]);
      }
      setApiConnected(true);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Cannot connect to backend. Make sure server is running on port 5000.');
      setApiConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentNote && (noteContent !== currentNote.content || noteTitle !== currentNote.title)) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveNote();
      }, 2000);
    }
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [noteContent, noteTitle]);

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const createNotebook = async () => {
    if (!newNotebookName.trim()) {
      alert('Please enter a notebook name');
      return;
    }
    
    const newNotebook = {
      id: 'nb_' + Date.now(),
      name: newNotebookName.trim(),
      color: newNotebookColor,
      created: new Date().toISOString(),
      notes: []
    };
    
    try {
      await api.createNotebook(newNotebook);
      await loadData();
      setShowNotebookModal(false);
      setNewNotebookName('');
      setNewNotebookColor('#3b82f6');
    } catch (error) {
      console.error('Error creating notebook:', error);
      alert('Failed to create notebook');
    }
  };

  const createNote = async () => {
    if (!currentNotebook) {
      alert('Please select a notebook first');
      return;
    }
    
    const newNote = {
      id: 'note_' + Date.now(),
      title: 'Untitled Note',
      content: '<p>Start typing your notes here...</p>',
      notebookId: currentNotebook.id,
      tags: [],
      starred: false,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    
    try {
      const createdNote = await api.createNote(newNote);
      await loadData();
      
      const updatedNotes = await api.fetchNotes();
      const note = updatedNotes.find(n => n.id === createdNote.id);
      if (note) {
        setCurrentNote(note);
        setNoteTitle(note.title);
        setNoteContent(note.content);
      }
      
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
        }
      }, 100);
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to create note');
    }
  };

  const saveNote = async () => {
    if (!currentNote) return;
    
    const updatedNote = {
      title: noteTitle || 'Untitled Note',
      content: noteContent,
      starred: currentNote.starred,
      tags: currentNote.tags
    };
    
    try {
      await api.updateNote(currentNote.id, updatedNote);
      const refreshedNote = await api.fetchNote(currentNote.id);
      
      setNotes(notes.map(n => n.id === refreshedNote.id ? refreshedNote : n));
      setCurrentNote(refreshedNote);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving note:', error);
      setError('Failed to save note');
    }
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await api.deleteNote(noteId);
      await loadData();
      
      if (currentNote?.id === noteId) {
        setCurrentNote(null);
        setNoteTitle('');
        setNoteContent('');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    }
  };

  const toggleStar = async (noteId) => {
    try {
      const updatedNote = await api.toggleNoteStar(noteId);
      setNotes(notes.map(n => n.id === noteId ? updatedNote : n));
      if (currentNote?.id === noteId) {
        setCurrentNote(updatedNote);
      }
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const addTagToNote = async () => {
    if (!currentNote || !tagInput.trim()) return;
    
    const tag = tagInput.trim().toLowerCase();
    
    if (!currentNote.tags.includes(tag)) {
      const updatedTags = [...currentNote.tags, tag];
      
      try {
        const existingTag = tags.find(t => t.id === tag);
        if (!existingTag) {
          const colors = ['#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
          await api.createTag({ id: tag, color: colors[tags.length % colors.length] });
        }
        
        await api.updateNote(currentNote.id, {
          title: currentNote.title,
          content: currentNote.content,
          starred: currentNote.starred,
          tags: updatedTags
        });
        
        await loadData();
        const refreshedNote = await api.fetchNote(currentNote.id);
        setCurrentNote(refreshedNote);
      } catch (error) {
        console.error('Error adding tag:', error);
      }
    }
    
    setTagInput('');
  };

  const removeTagFromNote = async (tag) => {
    if (!currentNote) return;
    
    const updatedTags = currentNote.tags.filter(t => t !== tag);
    
    try {
      await api.updateNote(currentNote.id, {
        title: currentNote.title,
        content: currentNote.content,
        starred: currentNote.starred,
        tags: updatedTags
      });
      
      await loadData();
      const refreshedNote = await api.fetchNote(currentNote.id);
      setCurrentNote(refreshedNote);
    } catch (error) {
      console.error('Error removing tag:', error);
    }
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const insertTable = () => {
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    if (rows && cols) {
      let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #ddd;"><tbody>';
      for (let i = 0; i < parseInt(rows); i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < parseInt(cols); j++) {
          tableHTML += '<td style="padding: 8px; border: 1px solid #ddd; min-width: 80px;">Cell</td>';
        }
        tableHTML += '</tr>';
      }
      tableHTML += '</tbody></table><p><br></p>';
      document.execCommand('insertHTML', false, tableHTML);
    }
  };

  const insertCodeBlock = () => {
    const codeHTML = `<pre style="background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 8px; overflow-x: auto; font-family: 'Courier New', monospace; margin: 10px 0;"><code contenteditable="true">// Write your code here</code></pre><p><br></p>`;
    document.execCommand('insertHTML', false, codeHTML);
  };

  const insertCheckbox = () => {
    const checkboxHTML = '<div style="margin: 5px 0; display: flex; align-items: center;"><input type="checkbox" style="margin-right: 8px;"><span contenteditable="true">Task item</span></div>';
    document.execCommand('insertHTML', false, checkboxHTML);
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:', 'https://');
    if (url && url.startsWith('http')) {
      const imgHTML = `<img src="${url}" style="max-width: 100%; height: auto; margin: 10px 0;" alt="image" />`;
      document.execCommand('insertHTML', false, imgHTML);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:', 'https://');
    if (url) {
      document.execCommand('createLink', false, url);
    }
  };

  const exportNote = (format) => {
    if (!currentNote) return;
    
    let content = '';
    let filename = `${currentNote.title.replace(/[^a-z0-9]/gi, '_')}.${format}`;
    let mimeType = 'text/plain';
    
    if (format === 'md') {
      content = `# ${currentNote.title}\n\n${noteContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')}`;
    } else if (format === 'html') {
      content = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${currentNote.title}</title></head><body><h1>${currentNote.title}</h1>${noteContent}</body></html>`;
      mimeType = 'text/html';
    } else if (format === 'txt') {
      content = `${currentNote.title}\n${'='.repeat(currentNote.title.length)}\n\n${noteContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')}`;
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNotebook = !currentNotebook || note.notebookId === currentNotebook.id;
    const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => note.tags.includes(tag));
    return matchesSearch && matchesNotebook && matchesTags;
  });

  const starredNotes = notes.filter(n => n.starred);

  const handleEditorInput = (e) => {
    setNoteContent(e.currentTarget.innerHTML);
  };

  const selectNote = async (note) => {
    if (currentNote) {
      await saveNote();
    }
    
    setCurrentNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setLastSaved(null);
  };

  if (loading) {
    return (
      <div className={`flex h-screen items-center justify-center ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-xl">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-4 rounded shadow-lg">
            <div className="flex items-start">
              <div className="ml-3">
                <p className="text-sm font-medium">{error}</p>
                <button onClick={loadData} className="mt-2 text-xs underline">Retry</button>
              </div>
              <button onClick={() => setError(null)} className="ml-auto"><X size={16} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col`}>
        <div className="p-4 border-b flex items-center justify-between">
          {!sidebarCollapsed && <h1 className="text-xl font-bold">MyNotes</h1>}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {!sidebarCollapsed && (
          <>
            <div className="p-4 border-b space-y-3">
              <button onClick={createNote} className="w-full bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2">
                <Plus size={16} /> New Note
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
                />
              </div>
            </div>

            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">NOTEBOOKS</span>
                <button onClick={() => setShowNotebookModal(true)}><Plus size={16} /></button>
              </div>
              {notebooks.map(nb => (
                <div
                  key={nb.id}
                  onClick={() => setCurrentNotebook(nb)}
                  className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer ${currentNotebook?.id === nb.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: nb.color }}></div>
                  <span className="text-sm flex-1">{nb.name}</span>
                  <span className="text-xs">{(nb.notes || []).length}</span>
                </div>
              ))}
            </div>

            <div className="p-4 flex-1">
              <span className="font-semibold text-sm">TAGS</span>
              {tags.filter(t => t.count > 0).map(tag => (
                <div key={tag.id} className="flex items-center gap-2 px-3 py-2">
                  <span className="text-sm">#{tag.id}</span>
                  <span className="text-xs">{tag.count}</span>
                </div>
              ))}
            </div>

            <div className="p-4 border-t">
              <button onClick={() => setDarkMode(!darkMode)} className="w-full px-3 py-2 rounded hover:bg-gray-100">
                {darkMode ? <Sun size={16} /> : <Moon size={16} />} {darkMode ? 'Light' : 'Dark'} Mode
              </button>
            </div>
          </>
        )}
      </div>

      {/* Note List */}
      <div className="w-80 bg-gray-100 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold">{currentNotebook ? currentNotebook.name : 'All Notes'} ({filteredNotes.length})</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              onClick={() => selectNote(note)}
              className={`p-4 border-b cursor-pointer ${currentNote?.id === note.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
            >
              <div className="flex justify-between mb-1">
                <h3 className="font-semibold truncate flex-1">{note.title}</h3>
                <div className="flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); toggleStar(note.id); }}>
                    <Star size={14} className={note.starred ? 'fill-yellow-500 text-yellow-500' : ''} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} className="text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: note.content }}></p>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {currentNote ? (
          <>
            <div className="p-4 border-b">
              <h2 className="text-2xl font-bold cursor-pointer" onClick={() => setEditingTitle(true)}>{noteTitle}</h2>
            </div>

            <div className="p-2 border-b flex gap-1">
              <button onClick={() => formatText('bold')} title="Bold"><Bold size={18} /></button>
              <button onClick={() => formatText('italic')} title="Italic"><Italic size={18} /></button>
              <button onClick={insertTable} title="Table"><Table size={18} /></button>
              <button onClick={insertCodeBlock} title="Code"><Code size={18} /></button>
              <button onClick={() => saveNote()} className="ml-auto px-4 py-2 bg-blue-600 text-white rounded">
                <Save size={16} /> Save
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div
                ref={editorRef}
                contentEditable
                onInput={handleEditorInput}
                dangerouslySetInnerHTML={{ __html: noteContent }}
                className="min-h-full outline-none"
                style={{ fontSize: '16px', lineHeight: '1.8' }}
              />
            </div>

            <div className="p-4 border-t flex justify-between">
              <div className="text-sm text-gray-600">
                Words: {noteContent.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w).length}
              </div>
              <div className="flex gap-2">
                <span className="text-sm">Tags:</span>
                {currentNote.tags && currentNote.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 bg-purple-100 rounded">
                    #{tag}
                    <button onClick={() => removeTagFromNote(tag)}><X size={12} /></button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTagToNote()}
                  className="w-32 px-2 py-1 text-sm rounded border"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Edit2 size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-xl mb-4">No Note Selected</p>
              <button onClick={createNote} className="px-6 py-3 bg-blue-600 text-white rounded-lg">
                Create Your First Note
              </button>
            </div>
          </div>
        )}
      </div>

      {showNotebookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Create Notebook</h3>
            <input
              type="text"
              placeholder="Notebook name"
              value={newNotebookName}
              onChange={(e) => setNewNotebookName(e.target.value)}
              className="w-full px-3 py-2 rounded border mb-4"
            />
            <div className="mb-4">
              <label className="block text-sm mb-2">Color</label>
              <div className="flex gap-2">
                {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map(color => (
                  <button
                    key={color}
                    onClick={() => setNewNotebookColor(color)}
                    className={`w-10 h-10 rounded-lg ${newNotebookColor === color ? 'ring-4 ring-blue-500' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={createNotebook} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded">
                Create
              </button>
              <button onClick={() => setShowNotebookModal(false)} className="px-4 py-2 rounded border">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;