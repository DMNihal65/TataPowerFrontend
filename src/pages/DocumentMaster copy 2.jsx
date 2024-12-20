import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001';

function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/get-files`, {
        part_numbers: ["1"]
      });
      setFiles(response.data);
    } catch (err) {
      setError('Error fetching files');
      console.error(err);
    }
    setLoading(false);
  };

  const openFile = (file) => {
    const fileUrl = `${API_URL}/file/${encodeURIComponent(file.file_name)}?filePath=${encodeURIComponent(file.file_path)}`;
    window.open(fileUrl, '_blank');
  };

  return (
    <div className="App">
      <h1>File Viewer</h1>
      <button onClick={fetchFiles} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Files'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {files.map((file, index) => (
          <li key={index}>
            <button onClick={() => openFile(file)}>{file.file_name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;