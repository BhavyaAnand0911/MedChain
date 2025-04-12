import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import './UploadMedicalRecord.css';

const UploadMedicalRecord = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('username', localStorage.getItem('username') || 'anonymous');

      const token = localStorage.getItem('medchain_token');
      const response = await axios.post('/medical_chatbot/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Navigate directly to chatbot with the new record ID
      navigate(`/chatbot/${response.data.record_id}`);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.response?.data?.detail || 'Failed to upload medical record');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Medical Record</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="medicalRecord">Select PDF file:</label>
          <input
            type="file"
            id="medicalRecord"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
        
        {file && (
          <div className="file-info">
            <p>Selected file: {file.name}</p>
            <p>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}

        {uploadError && <div className="error-message">{uploadError}</div>}

        <button 
          type="submit" 
          className="upload-btn"
          disabled={isUploading || !file}
        >
          {isUploading ? 'Uploading...' : 'Upload Record'}
        </button>
      </form>
    </div>
  );
};

export default UploadMedicalRecord;