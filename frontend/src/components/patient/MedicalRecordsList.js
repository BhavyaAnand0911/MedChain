import React from 'react';
import { Link } from 'react-router-dom';
import './MedicalRecordsList.css';

const MedicalRecordsList = ({ records, limit }) => {
  const displayedRecords = limit ? records.slice(0, limit) : records;

  return (
    <div className="medical-records-list">
      {displayedRecords.length === 0 ? (
        <p className="no-records">No medical records found</p>
      ) : (
        <ul className="records-grid">
          {displayedRecords.map(record => (
            <li key={record.id} className="record-card">
              <Link to={`/medical-records/${record.id}`} className="record-link">
                <div className="record-header">
                  <h3 className="record-title">{record.patient_name}</h3>
                  <span className={`record-status ${record.blockchain_hash ? 'verified' : 'pending'}`}>
                    {record.blockchain_hash ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <p className="record-date">
                  {new Date(record.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                {record.diagnosis && (
                  <div className="record-field">
                    <span className="field-label">Diagnosis:</span>
                    <span className="field-value">{record.diagnosis}</span>
                  </div>
                )}
                {record.medications && (
                  <div className="record-field">
                    <span className="field-label">Medications:</span>
                    <span className="field-value">{record.medications}</span>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {limit && records.length > limit && (
        <Link to="/medical-records" className="view-all-link">
          View All Records →
        </Link>
      )}
    </div>
  );
};

export default MedicalRecordsList;