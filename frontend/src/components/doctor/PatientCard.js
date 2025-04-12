import React from 'react';
import './PatientCard.css';

const PatientCard = ({ patient, onClick }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate days since last visit
  const calculateDaysSince = (dateString) => {
    const lastVisitDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - lastVisitDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysSinceLastVisit = calculateDaysSince(patient.lastVisit);
  
  // Determine status color
  const getStatusColor = () => {
    if (patient.status === 'Critical') return 'status-critical';
    if (patient.status === 'Stable') return 'status-stable';
    if (patient.status === 'Recovering') return 'status-recovering';
    return 'status-default';
  };

  return (
    <div className="patient-card" onClick={onClick}>
      <div className="patient-header">
        <h3 className="patient-name">{patient.name}</h3>
        <span className={`patient-status ${getStatusColor()}`}>
          {patient.status}
        </span>
      </div>
      
      <div className="patient-info">
        <div className="info-row">
          <span className="info-label">ID:</span>
          <span className="info-value">{patient.id}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Age:</span>
          <span className="info-value">{patient.age} years</span>
        </div>
        <div className="info-row">
          <span className="info-label">Gender:</span>
          <span className="info-value">{patient.gender}</span>
        </div>
        {patient.condition && (
          <div className="info-row">
            <span className="info-label">Condition:</span>
            <span className="info-value condition">{patient.condition}</span>
          </div>
        )}
      </div>
      
      <div className="patient-visit">
        <div className="visit-info">
          <span className="visit-label">Last Visit:</span>
          <span className="visit-date">{formatDate(patient.lastVisit)}</span>
        </div>
        <span className={`days-ago ${daysSinceLastVisit > 30 ? 'overdue' : ''}`}>
          {daysSinceLastVisit} days ago
        </span>
      </div>
      
      <div className="patient-actions">
        <span className="view-details">View Details</span>
      </div>
    </div>
  );
};

export default PatientCard;