// Replace the useEffect for loading data:
useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    const [notebooksData, notesData, tagsData] = await Promise.all([
      fetchNotebooks(),
      fetchNotes(),
      fetchTags()
    ]);
    setNotebooks(notebooksData);
    setNotes(notesData);
    setTags(tagsData);
    
    if (notebooksData.length > 0) {
      setCurrentNotebook(notebooksData[0]);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
};



// Update createNotebook function:
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