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