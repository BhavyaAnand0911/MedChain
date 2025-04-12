import React, { useState } from 'react';
import PatientCard from './PatientCard';
import './PatientList.css';

const PatientList = ({ patients, onPatientClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedPatients = [...patients].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'lastVisit':
        comparison = new Date(a.lastVisit) - new Date(b.lastVisit);
        break;
      case 'age':
        comparison = a.age - b.age;
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const filteredPatients = sortedPatients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toString().includes(searchTerm) ||
    (patient.condition && patient.condition.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="patient-list">
      <div className="patient-list-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="sort-controls">
          <span>Sort by:</span>
          <button 
            className={`sort-button ${sortBy === 'name' ? 'active' : ''}`}
            onClick={() => handleSort('name')}
          >
            Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            className={`sort-button ${sortBy === 'lastVisit' ? 'active' : ''}`}
            onClick={() => handleSort('lastVisit')}
          >
            Last Visit {sortBy === 'lastVisit' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            className={`sort-button ${sortBy === 'age' ? 'active' : ''}`}
            onClick={() => handleSort('age')}
          >
            Age {sortBy === 'age' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="no-patients">
          <p>No patients match your search criteria</p>
        </div>
      ) : (
        <div className="patient-cards">
          {filteredPatients.map(patient => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onClick={() => onPatientClick(patient.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientList;