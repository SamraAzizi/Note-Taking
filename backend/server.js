const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize data file
async function initDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    const initialData = { notebooks: [], notes: [], tags: [] };
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Read data
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return { notebooks: [], notes: [], tags: [] };
  }
}

// Write data
async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// ==================== NOTEBOOKS ====================

app.get('/api/notebooks', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.notebooks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notebooks' });
  }
});

app.post('/api/notebooks', async (req, res) => {
  try {
    const data = await readData();
    const newNotebook = {
      id: req.body.id,
      name: req.body.name,
      color: req.body.color || '#3b82f6',
      created: new Date().toISOString(),
      notes: []
    };
    data.notebooks.push(newNotebook);
    await writeData(data);
    res.status(201).json(newNotebook);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create notebook' });
  }
});

app.put('/api/notebooks/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.notebooks.findIndex(nb => nb.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Notebook not found' });
    
    data.notebooks[index] = {
      ...data.notebooks[index],
      name: req.body.name || data.notebooks[index].name,
      color: req.body.color || data.notebooks[index].color
    };
    await writeData(data);
    res.json(data.notebooks[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notebook' });
  }
});

app.delete('/api/notebooks/:id', async (req, res) => {
  try {
    const data = await readData();
    data.notebooks = data.notebooks.filter(nb => nb.id !== req.params.id);
    data.notes = data.notes.filter(note => note.notebookId !== req.params.id);
    await writeData(data);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notebook' });
  }
});

// ==================== NOTES ====================

app.get('/api/notes', async (req, res) => {
  try {
    const data = await readData();
    const sortedNotes = data.notes.sort((a, b) => 
      new Date(b.updated) - new Date(a.updated)
    );
    res.json(sortedNotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

app.get('/api/notes/:id', async (req, res) => {
  try {
    const data = await readData();
    const note = data.notes.find(n => n.id === req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const data = await readData();
    const newNote = {
      id: req.body.id,
      title: req.body.title,
      content: req.body.content || '',
      notebookId: req.body.notebookId,
      tags: req.body.tags || [],
      starred: req.body.starred || false,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    
    data.notes.push(newNote);
    
    // Update notebook's notes array
    const notebook = data.notebooks.find(nb => nb.id === newNote.notebookId);
    if (notebook) {
      notebook.notes = notebook.notes || [];
      notebook.notes.push(newNote.id);
    }
    
    // Update tags
    if (newNote.tags.length > 0) {
      for (const tagName of newNote.tags) {
        let tag = data.tags.find(t => t.id === tagName);
        if (!tag) {
          const colors = ['#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
          tag = { id: tagName, color: colors[data.tags.length % colors.length], count: 0 };
          data.tags.push(tag);
        }
        tag.count = (tag.count || 0) + 1;
      }
    }
    
    await writeData(data);
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.notes.findIndex(n => n.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Note not found' });
    
    const oldNote = data.notes[index];
    const oldTags = oldNote.tags || [];
    const newTags = req.body.tags || oldTags;
    
    // Update tag counts
    for (const tagName of oldTags) {
      const tag = data.tags.find(t => t.id === tagName);
      if (tag) tag.count = Math.max(0, (tag.count || 1) - 1);
    }
    
    for (const tagName of newTags) {
      let tag = data.tags.find(t => t.id === tagName);
      if (!tag) {
        const colors = ['#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
        tag = { id: tagName, color: colors[data.tags.length % colors.length], count: 0 };
        data.tags.push(tag);
      }
      tag.count = (tag.count || 0) + 1;
    }
    
    data.notes[index] = {
      ...oldNote,
      title: req.body.title || oldNote.title,
      content: req.body.content !== undefined ? req.body.content : oldNote.content,
      starred: req.body.starred !== undefined ? req.body.starred : oldNote.starred,
      tags: newTags,
      updated: new Date().toISOString()
    };
    
    await writeData(data);
    res.json(data.notes[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const data = await readData();
    const note = data.notes.find(n => n.id === req.params.id);
    
    if (note) {
      // Update tag counts
      for (const tagName of (note.tags || [])) {
        const tag = data.tags.find(t => t.id === tagName);
        if (tag) tag.count = Math.max(0, (tag.count || 1) - 1);
      }
      
      // Remove from notebook
      const notebook = data.notebooks.find(nb => nb.id === note.notebookId);
      if (notebook && notebook.notes) {
        notebook.notes = notebook.notes.filter(id => id !== req.params.id);
      }
    }
    
    data.notes = data.notes.filter(n => n.id !== req.params.id);
    await writeData(data);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

app.post('/api/notes/:id/star', async (req, res) => {
  try {
    const data = await readData();
    const note = data.notes.find(n => n.id === req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    
    note.starred = !note.starred;
    note.updated = new Date().toISOString();
    await writeData(data);
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle star' });
  }
});

// ==================== TAGS ====================

app.get('/api/tags', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.tags);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

app.post('/api/tags', async (req, res) => {
  try {
    const data = await readData();
    const existingTag = data.tags.find(t => t.id === req.body.id);
    if (existingTag) return res.json(existingTag);
    
    const newTag = {
      id: req.body.id,
      color: req.body.color || '#8b5cf6',
      count: 0
    };
    data.tags.push(newTag);
    await writeData(data);
    res.status(201).json(newTag);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

// ==================== SEARCH ====================

app.get('/api/search', async (req, res) => {
  try {
    const data = await readData();
    let filteredNotes = data.notes;
    
    const query = req.query.q;
    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredNotes = filteredNotes.filter(note =>
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery)
      );
    }
    
    const notebookId = req.query.notebook;
    if (notebookId) {
      filteredNotes = filteredNotes.filter(note => note.notebookId === notebookId);
    }
    
    const tags = req.query.tags;
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filteredNotes = filteredNotes.filter(note =>
        tagArray.every(tag => (note.tags || []).includes(tag))
      );
    }
    
    filteredNotes.sort((a, b) => new Date(b.updated) - new Date(a.updated));
    res.json(filteredNotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search notes' });
  }
});

// ==================== STATS ====================

app.get('/api/stats', async (req, res) => {
  try {
    const data = await readData();
    const stats = {
      totalNotebooks: data.notebooks.length,
      totalNotes: data.notes.length,
      starredNotes: data.notes.filter(n => n.starred).length,
      totalTags: data.tags.filter(t => t.count > 0).length
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Initialize and start
initDataFile().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Data file: ${DATA_FILE}`);
  });
});

module.exports = app;