import axios from '../api/axios';

// Function to get patient dashboard data
export const getPatientDashboard = async () => {
  try {
    const token = localStorage.getItem('medchain_token');
    const response = await axios.get('/patients/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Ensure first_name and last_name exist
    const data = response.data || {};
    return {
      ...data,
      full_name: [data.first_name, data.last_name].join(' ') || data.username
    };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Function to update patient profile
export const updatePatientProfile = async (patientId, profileData) => {
  try {
    const token = localStorage.getItem('medchain_token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.put(`/patients/${patientId}`, profileData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating patient profile:', error);
    throw error;
  }
};

// Function to get patient's medical history
export const getPatientMedicalHistory = async (patientId) => {
  try {
    const token = localStorage.getItem('medchain_token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.get(`/patients/${patientId}/medical-history`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching patient medical history:', error);
    throw error;
  }
};

// Function to get specific medical record
export const getMedicalRecord = async (recordId) => {
  try {
    const token = localStorage.getItem('medchain_token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.get(`/medical_chatbot/record/${recordId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {  
    console.error('Error fetching medical record:', error);
    throw error;
  }
};


// Function to add emergency contact for patient
export const addEmergencyContact = async (patientId, contactData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.post(`/patients/${patientId}/emergency-contacts`, contactData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error adding emergency contact:', error);
    throw error;
  }
};

// Function to get patient's emergency contacts
export const getEmergencyContacts = async (patientId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.get(`/patients/${patientId}/emergency-contacts`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    throw error;
  }
};

export const checkProfileExists = async () => {
  const token = localStorage.getItem('medchain_token');
  const response = await axios.get('/patients/profile/exists', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

export const createPatientProfile = async (profileData) => {
  const token = localStorage.getItem('medchain_token');
  const response = await axios.post('/patients/profile', profileData, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

export const uploadMedicalRecord = async (formData) => {
  const token = localStorage.getItem('medchain_token');
  const response = await axios.post('/medical_chatbot/upload', formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const askChatbot = async (recordId, query) => {
  const token = localStorage.getItem('medchain_token');
  const response = await axios.post('/medical_chatbot/ask', {
    record_id: recordId,
    query: query,
    user_id: localStorage.getItem('username') || 'anonymous'
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};
export const askGeneralChatbot = async (query, userId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.post('/medical_chatbot/general', {
      query: query,
      user_id: userId || ''
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error asking general chatbot:', error);
    throw error;
  }
};