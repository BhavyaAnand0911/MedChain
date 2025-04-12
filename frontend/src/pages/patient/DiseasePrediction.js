import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DiseaseSymptomSelector from '../../components/patient/DiseaseSymptomSelector';
import PredictionResults from '../../components/patient/PredictionResults';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import { predictDisease } from '../../api/disease';
import './DiseasePrediction.css';

const DiseasePrediction = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSymptomChange = (symptoms) => {
    setSelectedSymptoms(symptoms);
    if (predictions) setPredictions(null);
  };

  const handlePredictionSubmit = async () => {
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await predictDisease(selectedSymptoms);
      setPredictions(result);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get disease predictions. Please try again.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrediction = () => {
    // Future implementation: Save prediction to user's record
    alert('Prediction saved to your medical records');
  };

  return (
    <div className="disease-prediction-page">
      <PageHeader 
        title="Disease Prediction" 
        subtitle="AI-powered symptom analysis for potential conditions"
      />
      
      <div className="disease-prediction-container">
        <div className="prediction-info-card">
          <div className="info-icon">
            <span className="material-icons">insights</span>
          </div>
          <div className="info-content">
            <h2>AI-Powered Disease Prediction</h2>
            <p>
              Select your symptoms from the list below, and our AI system will analyze potential
              diseases based on your input. This tool uses machine learning to identify
              possible conditions that match your symptoms.
            </p>
            <div className="disclaimer">
              <span className="material-icons">warning</span>
              <div>
                <strong>Important Note:</strong> This prediction is for informational purposes only and should not
                replace professional medical advice. Always consult with a healthcare provider.
              </div>
            </div>
          </div>
        </div>
        
        <div className="symptoms-section">
          <h3 className="section-title">Select Your Symptoms</h3>
          <DiseaseSymptomSelector 
            selectedSymptoms={selectedSymptoms}
            onChange={handleSymptomChange}
          />
          
          <div className="prediction-action">
            <button 
              className="predict-button"
              onClick={handlePredictionSubmit}
              disabled={selectedSymptoms.length === 0 || loading}
            >
              {loading ? (
                <>
                  <span className="material-icons spin">autorenew</span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span className="material-icons">search</span>
                  Predict Disease
                </>
              )}
            </button>
          </div>
          
          {error && <ErrorMessage message={error} />}
        </div>
        
        {loading && <Loader />}
        
        {predictions && (
          <div className="prediction-results-container">
            <PredictionResults 
              predictions={predictions} 
              onSave={handleSavePrediction}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DiseasePrediction;