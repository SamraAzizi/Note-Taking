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