import React, { useState, useRef } from 'react';
import './FileUpload.css';

const FileUpload = ({ 
  onFileSelect, 
  acceptedFileTypes = '.pdf', 
  maxFileSize = 10, // in MB
  allowMultiple = false,
  uploadText = 'Drag and drop a file here, or click to select'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  
  const validateFile = (file) => {
    // Check file type
    const fileType = file.type;
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    const acceptedTypes = acceptedFileTypes.split(',').map(type => type.trim());
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        // Check by extension
        return fileExtension === type;
      } else {
        // Check by MIME type
        return fileType === type || fileType.startsWith(type.replace('*', ''));
      }
    });
    
    if (!isValidType) {
      setError(`Invalid file type. Accepted types: ${acceptedFileTypes}`);
      return false;
    }
    
    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxFileSize) {
      setError(`File size exceeds the limit of ${maxFileSize}MB`);
      return false;
    }
    
    return true;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError('');
    
    const files = Array.from(e.dataTransfer.files);
    
    if (!allowMultiple && files.length > 1) {
      setError('Only one file can be uploaded at a time');
      return;
    }
    
    const validFiles = files.filter(file => validateFile(file));
    
    if (validFiles.length > 0) {
      setSelectedFiles(allowMultiple ? [...selectedFiles, ...validFiles] : [validFiles[0]]);
      onFileSelect(allowMultiple ? validFiles : validFiles[0]);
    }
  };

  const handleFileSelect = (e) => {
    setError('');
    
    const files = Array.from(e.target.files);
    
    if (!allowMultiple && files.length > 1) {
      setError('Only one file can be uploaded at a time');
      return;
    }
    
    const validFiles = files.filter(file => validateFile(file));
    
    if (validFiles.length > 0) {
      setSelectedFiles(allowMultiple ? [...selectedFiles, ...validFiles] : [validFiles[0]]);
      onFileSelect(allowMultiple ? validFiles : validFiles[0]);
    }
  };

  const handleRemoveFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    onFileSelect(allowMultiple ? newFiles : newFiles[0] || null);
  };

  return (
    <div className="file-upload-container">
      <div 
        className={`file-upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <div className="file-upload-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </div>
        <p className="file-upload-text">{uploadText}</p>
        <p className="file-upload-info">
          Accepted file types: {acceptedFileTypes} (Max size: {maxFileSize}MB)
        </p>
        <input 
          type="file" 
          className="file-upload-input" 
          ref={fileInputRef}
          accept={acceptedFileTypes}
          multiple={allowMultiple}
          onChange={handleFileSelect}
        />
      </div>
      
      {error && <p className="file-upload-error">{error}</p>}
      
      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <h3>Selected Files:</h3>
          <ul className="file-list">
            {selectedFiles.map((file, index) => (
              <li key={index} className="file-item">
                <span className="file-name">{file.name}</span>
                <span className="file-size">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                <button 
                  className="file-remove" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;