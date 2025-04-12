import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MedicalRecordsList from '../../components/patient/MedicalRecordsList';
import DiseaseSymptomSelector from '../../components/patient/DiseaseSymptomSelector';
import PredictionResults from '../../components/patient/PredictionResults';
import './PatientDetails.css';

const PatientDetails = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`/api/doctors/patients/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setPatient(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load patient details');
        setLoading(false);
        console.error('Error fetching patient details:', err);
      }
    };

    fetchPatientDetails();
  }, [patientId, navigate]);

  const handleSymptomChange = (symptoms) => {
    setSelectedSymptoms(symptoms);
  };

  const handlePrediction = async () => {
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom');
      return;
    }

    try {
      setPredictionLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post('/api/predict_disease/', {
        symptoms: selectedSymptoms
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPredictions(response.data);
      setPredictionLoading(false);
    } catch (err) {
      setError('Failed to predict disease');
      setPredictionLoading(false);
      console.error('Error predicting disease:', err);
    }
  };

  const handleAddNote = async (note) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(`/api/doctors/patients/${patientId}/notes`, {
        note
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh patient data
      const response = await axios.get(`/api/doctors/patients/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPatient(response.data);
    } catch (err) {
      setError('Failed to add note');
      console.error('Error adding note:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading patient details...</div>;
  }

  if (!patient) {
    return <div className="error">Patient not found</div>;
  }

  return (
    <div className="patient-details">
      <div className="back-button" onClick={() => navigate('/doctor/dashboard')}>
        &larr; Back to Dashboard
      </div>
      
      <div className="patient-header">
        <h1>{patient.firstName} {patient.lastName}</h1>
        <div className="patient-info">
          <p><strong>Email:</strong> {patient.email}</p>
          <p><strong>Age:</strong> {patient.age}</p>
          <p><strong>Gender:</strong> {patient.gender}</p>
          <p><strong>Blood Type:</strong> {patient.bloodType}</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <div className="section">
        <h2>Medical Records</h2>
        <MedicalRecordsList 
          records={patient.medicalRecords || []} 
          isDoctor={true}
        />
      </div>
      
      <div className="section">
        <h2>Doctor's Notes</h2>
        <div className="notes-container">
          {patient.notes && patient.notes.length > 0 ? (
            <div className="notes-list">
              {patient.notes.map((note, index) => (
                <div key={index} className="note-item">
                  <p className="note-date">{new Date(note.date).toLocaleDateString()}</p>
                  <p className="note-text">{note.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No notes available</p>
          )}
          
          <div className="add-note">
            <h3>Add New Note</h3>
            <textarea 
              id="newNote" 
              rows="4" 
              placeholder="Enter your medical observations here..."
            ></textarea>
            <button 
              onClick={() => handleAddNote(document.getElementById('newNote').value)}
              className="button primary"
            >
              Save Note
            </button>
          </div>
        </div>
      </div>
      
      <div className="section">
        <h2>Disease Prediction</h2>
        <DiseaseSymptomSelector 
          onSymptomChange={handleSymptomChange} 
          selectedSymptoms={selectedSymptoms}
        />
        
        <button 
          onClick={handlePrediction} 
          className="button primary"
          disabled={selectedSymptoms.length === 0 || predictionLoading}
        >
          {predictionLoading ? 'Processing...' : 'Predict Disease'}
        </button>
        
        {predictions && (
          <PredictionResults predictions={predictions} />
        )}
      </div>
    </div>
  );
};

export default PatientDetails;