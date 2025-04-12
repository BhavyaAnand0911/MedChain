import React from 'react';
import './MedicalRecordCard.css';

const MedicalRecordCard = ({ record, onClick }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getVerificationStatusClass = () => {
    if (!record.blockchain_tx) return 'not-verified';
    if (record.blockchain_verified) return 'verified';
    return 'pending';
  };

  const getVerificationStatusText = () => {
    if (!record.blockchain_tx) return 'Not Verified';
    if (record.blockchain_verified) return 'Blockchain Verified';
    return 'Verification Pending';
  };

  const truncateFileName = (filename) => {
    if (filename.length <= 25) return filename;
    const extension = filename.split('.').pop();
    const name = filename.substring(0, filename.length - extension.length - 1);
    return `${name.substring(0, 20)}...${extension}`;
  };

  return (
    <div className="medical-record-card" onClick={onClick}>
      <div className="record-icon">
        <span className="file-icon">📄</span>
      </div>
      <div className="record-details">
        <h4 className="record-title">{truncateFileName(record.filename || 'Unknown File')}</h4>
        <div className="record-meta">
          <span className="record-date">
            Uploaded: {formatDate(record.upload_date)}
          </span>
          <span className="record-size">
            {record.text_length ? `${Math.round(record.text_length / 1000)}K chars` : 'Size unknown'}
          </span>
        </div>
        <div 
          className={`verification-status ${getVerificationStatusClass()}`}
        >
          {getVerificationStatusText()}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordCard;