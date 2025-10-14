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