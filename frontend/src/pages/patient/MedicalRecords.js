import React from 'react';
import { Link } from 'react-router-dom';
import MedicalRecordCard from './MedicalRecordCard';
import './MedicalRecords.css';

const MedicalRecordsList = ({ records = [], limit = null }) => {
  const displayRecords = limit ? records.slice(0, limit) : records;

  if (records.length === 0) {
    return (
      <div className="empty-records">
        <p>No medical records found.</p>
        <Link to="/medical-records/upload" className="upload-link">
          Upload your first medical record
        </Link>
      </div>
    );
  }

  return (
    <div className="medical-records-list">
      {displayRecords.map(record => (
        <MedicalRecordCard key={record.id} record={record} />
      ))}
      
      {limit && records.length > limit && (
        <div className="view-all-container">
          <Link to="/patient/medical-records" className="view-all-link">
            View all records ({records.length})
          </Link>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordsList;