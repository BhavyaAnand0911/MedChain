import React from 'react';
import { Link } from 'react-router-dom';
import './MedicalRecordCard.css';

const MedicalRecordCard = ({ record }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="medical-record-card">
      <div className="record-icon">
        <i className="icon-file-pdf"></i>
      </div>
      <div className="record-details">
        <h3 className="record-title">{record.title || 'Medical Record'}</h3>
        <p className="record-date">Uploaded on {formatDate(record.uploadDate)}</p>
        {record.description && (
          <p className="record-description">{truncateText(record.description)}</p>
        )}
        <div className="record-meta">
          <span className={`verification-badge ${record.verified ? 'verified' : 'unverified'}`}>
            {record.verified ? 'Blockchain Verified' : 'Verification Pending'}
          </span>
          <span className="record-size">{record.fileSize}</span>
        </div>
      </div>
      <div className="record-actions">
        <Link to={`/patient/chatbot/${record.id}`} className="action-button chat-button">
          Chat
        </Link>
        <Link to={`/patient/medical-records/${record.id}`} className="action-button view-button">
          View
        </Link>
      </div>
    </div>
  );
};

export default MedicalRecordCard;