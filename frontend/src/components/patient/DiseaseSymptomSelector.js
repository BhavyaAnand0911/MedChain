import React, { useState, useEffect } from 'react';
import './DiseaseSymptomSelector.css';

const COMMON_SYMPTOMS = [
  'Fever', 'Cough', 'Fatigue', 'Shortness of breath', 'Headache',
  'Sore throat', 'Muscle pain', 'Joint pain', 'Chest pain', 'Nausea',
  'Vomiting', 'Diarrhea', 'Abdominal pain', 'Back pain', 'Dizziness',
  'Skin rash', 'Chills', 'Loss of appetite', 'Weight loss', 'Night sweats',
  'Blurred vision', 'Swelling', 'Numbness', 'Tingling', 'Confusion',
  'Memory problems', 'Anxiety', 'Depression', 'Insomnia', 'Sweating'
];

const DiseaseSymptomSelector = ({ selectedSymptoms, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedSymptoms, setDisplayedSymptoms] = useState(COMMON_SYMPTOMS);

  useEffect(() => {
    if (searchTerm) {
      const filtered = COMMON_SYMPTOMS.filter(symptom =>
        symptom.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setDisplayedSymptoms(filtered);
    } else {
      setDisplayedSymptoms(COMMON_SYMPTOMS);
    }
  }, [searchTerm]);

  const handleSymptomToggle = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      onChange(selectedSymptoms.filter(s => s !== symptom));
    } else {
      onChange([...selectedSymptoms, symptom]);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearAll = () => {
    onChange([]);
    setSearchTerm('');
  };

  return (
    <div className="symptom-selector-container">
      <div className="search-container">
        <div className="search-input-wrapper">
          <span className="material-icons search-icon">search</span>
          <input
            type="text"
            className="symptom-search"
            placeholder="Search symptoms..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button 
              className="clear-search-button"
              onClick={() => setSearchTerm('')}
            >
              <span className="material-icons">close</span>
            </button>
          )}
        </div>
        <button 
          className="clear-all-button"
          onClick={handleClearAll}
          disabled={selectedSymptoms.length === 0}
        >
          <span className="material-icons">clear_all</span>
          Clear All
        </button>
      </div>
      
      <div className="selected-symptoms-container">
        <h4 className="selected-symptoms-title">
          Selected Symptoms
          <span className="selected-count">{selectedSymptoms.length}</span>
        </h4>
        <div className="selected-symptoms-list">
          {selectedSymptoms.length > 0 ? (
            selectedSymptoms.map(symptom => (
              <div key={symptom} className="selected-symptom-tag">
                {symptom}
                <button 
                  className="remove-symptom-button" 
                  onClick={() => handleSymptomToggle(symptom)}
                >
                  <span className="material-icons">close</span>
                </button>
              </div>
            ))
          ) : (
            <div className="no-symptoms-message">
              <span className="material-icons">info</span>
              No symptoms selected
            </div>
          )}
        </div>
      </div>
      
      <div className="symptoms-grid">
        {displayedSymptoms.map(symptom => (
          <button
            key={symptom}
            className={`symptom-item ${selectedSymptoms.includes(symptom) ? 'selected' : ''}`}
            onClick={() => handleSymptomToggle(symptom)}
          >
            {symptom}
            {selectedSymptoms.includes(symptom) && (
              <span className="material-icons check-icon">check</span>
            )}
          </button>
        ))}
        
        {displayedSymptoms.length === 0 && (
          <div className="no-results-message">
            <span className="material-icons">search_off</span>
            No symptoms found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};

export default DiseaseSymptomSelector;