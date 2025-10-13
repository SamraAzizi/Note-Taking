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
