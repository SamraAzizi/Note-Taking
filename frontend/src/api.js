const API_URL = 'http://localhost:5000/api';

// Notebooks
export const fetchNotebooks = async () => {
  const response = await fetch(`${API_URL}/notebooks`);
  return response.json();
};

export const createNotebook = async (notebook) => {
  const response = await fetch(`${API_URL}/notebooks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notebook)
  });
  return response.json();
};


export const updateNotebook = async (id, notebook) => {
  const response = await fetch(`${API_URL}/notebooks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notebook)
  });
  return response.json();
};

export const deleteNotebook = async (id) => {
  await fetch(`${API_URL}/notebooks/${id}`, { method: 'DELETE' });
};


// Notes
export const fetchNotes = async () => {
  const response = await fetch(`${API_URL}/notes`);
  return response.json();
};

export const fetchNote = async (id) => {
  const response = await fetch(`${API_URL}/notes/${id}`);
  return response.json();
};

export const createNote = async (note) => {
  const response = await fetch(`${API_URL}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note)
  });
  return response.json();
};
