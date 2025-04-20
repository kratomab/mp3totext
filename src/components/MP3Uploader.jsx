import React, { useState } from 'react';

const MP3Uploader = () => {
  const [fileName, setFileName] = useState('');

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: 24, borderRadius: 8, maxWidth: 400, margin: '32px auto' }}>
      <h2>Upload MP3</h2>
      <input 
        type="file" 
        accept="audio/mp3" 
        onChange={handleChange}
      />
      {fileName && (
        <div style={{ marginTop: 16 }}>
          <strong>File dipilih:</strong> {fileName}
        </div>
      )}
    </div>
  );
};

export default MP3Uploader;