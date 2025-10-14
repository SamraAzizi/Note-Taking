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