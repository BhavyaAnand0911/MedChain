import { useState } from 'react';
import axios from '../api/axios';
import { validateSymptoms } from '../utils/validation';

const useDiseasePrediction = () => {
  const [predictions, setPredictions] = useState([]);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const predictDisease = async (symptoms) => {
    if (!validateSymptoms(symptoms)) {
      setError('Please select at least one symptom');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/predict_disease/', { symptoms });
      setPredictions(response.data.predictions);
      setExplanation(response.data.explanation);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to predict disease');
    } finally {
      setLoading(false);
    }
  };

  const resetPrediction = () => {
    setPredictions([]);
    setExplanation(null);
    setError(null);
  };

  return {
    predictions,
    explanation,
    loading,
    error,
    predictDisease,
    resetPrediction,
  };
};

export default useDiseasePrediction;