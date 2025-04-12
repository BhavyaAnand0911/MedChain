import axios from '../api/axios';

// Function to predict disease based on symptoms
export const predictDisease = async (symptoms) => {
  try {
    const token = localStorage.getItem('medchain_token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.post('/predict_disease/', {
      symptoms
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error predicting disease:', error);
    throw error;
  }
};

// Function to get common symptoms for the symptom selector
export const getCommonSymptoms = async () => {
  try {
    const token = localStorage.getItem('medchain_token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.get('/predict_disease/symptoms', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching symptoms:', error);
    throw error;
  }
};

// Function to save a disease prediction to a patient's record
export const savePrediction = async (patientId, predictionData) => {
  try {
    const token = localStorage.getItem('medchain_token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.post(`/predict_disease/save/${patientId}`, {
      prediction: predictionData
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error saving prediction:', error);
    throw error;
  }
};

// Function to get prediction history for a patient
export const getPredictionHistory = async (patientId) => {
  try {
    const token = localStorage.getItem('medchain_token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.get(`/predict_disease/history/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching prediction history:', error);
    throw error;
  }
};