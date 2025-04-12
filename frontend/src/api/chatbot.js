import axios from '../api/axios';

// Function to upload a medical record PDF
export const uploadMedicalRecord = async (file, username) => {
  try {
    const token = localStorage.getItem('medchain_token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', username);
    
    // Add patient_id if available from user context
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      formData.append('patient_id', user.id);
    }
    
    const response = await axios.post('/medical_chatbot/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading medical record:', error);
    throw error;
  }
};

// Function to ask a question about a medical record
export const askChatbot = async (recordId, query, userId) => {
  try {
    const token = localStorage.getItem('medchain_token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const formData = new FormData();
    formData.append('record_id', recordId.toString());
    formData.append('query', query);
    formData.append('user_id', userId || '');
    
    const response = await axios.post('/medical_chatbot/ask', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error asking chatbot:', error);
    throw error;
  }
};

// Function to check the health status of the chatbot service
export const checkChatbotHealth = async () => {
  try {
    const response = await axios.get('/medical_chatbot/health');
    return response.data;
  } catch (error) {
    console.error('Error checking chatbot health:', error);
    return { status: 'error', message: error.message };
  }
};

// Function to get a list of medical records for a patient
// export const getPatientMedicalRecords = async (patientId) => {
//   try {
//     const token = localStorage.getItem('medchain_token');
//     if (!token) {
//       throw new Error('Authentication required');
//     }
    
//     const response = await axios.get(`/medical_chatbot/records/${patientId}`, {
//       headers: {
//         'Authorization': `Bearer ${token}`
//       }
//     });
    
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching medical records:', error);
//     throw error;
//   }
// };

// Function to get a specific medical record by ID
export const getMedicalRecordById = async (recordId) => {
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