import React from 'react';
import './PredictionResults.css';

const PredictionResults = ({ predictions, onSave }) => {
  if (!predictions || !predictions.predictions || predictions.predictions.length === 0) {
    return (
      <div className="no-predictions">
        <p>No predictions available. Please try different symptoms.</p>
      </div>
    );
  }

  const { predictions: diseaseList, explanation } = predictions;

  // Sort predictions by confidence in descending order
  const sortedDiseases = [...diseaseList].sort((a, b) => b.confidence - a.confidence);
  
  // Get top 5 predictions
  const topPredictions = sortedDiseases.slice(0, 5);
  
  // Prepare symptom importance data
  const symptomImportance = Object.entries(explanation || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Top 10 most important symptoms

  return (
    <div className="prediction-results">
      <div className="results-header">
        <h3>Disease Prediction Results</h3>
        <button className="save-button" onClick={onSave}>
          Save to Medical Records
        </button>
      </div>
      
      <div className="results-container">
        <div className="diseases-section">
          <h4>Top Probable Conditions</h4>
          <div className="disease-cards">
            {topPredictions.map((disease, index) => (
              <div key={disease.disease} className={`disease-card rank-${index + 1}`}>
                <div className="disease-rank">{index + 1}</div>
                <div className="disease-info">
                  <h4>{disease.disease}</h4>
                  <div className="confidence-bar-container">
                    <div 
                      className="confidence-bar" 
                      style={{ width: `${disease.confidence}%` }}
                    ></div>
                    <span className="confidence-value">{disease.confidence.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="importance-section">
          <h4>Symptom Importance</h4>
          <div className="symptom-importance">
            {symptomImportance.map(([symptom, score]) => (
              <div key={symptom} className="importance-item">
                <div className="symptom-name">{symptom}</div>
                <div className="importance-bar-container">
                  <div 
                    className="importance-bar" 
                    style={{ width: `${score * 100}%` }}
                  ></div>
                  <span className="importance-value">{(score * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="results-disclaimer">
        <p>
          <strong>Important:</strong> These predictions are based on reported symptoms and should 
          not be considered a definitive diagnosis. Always consult with a healthcare professional.
        </p>
      </div>
    </div>
  );
};

export default PredictionResults;