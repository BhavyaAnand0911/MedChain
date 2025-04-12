import axios from '../api/axios';

// Function to get doctor dashboard data
export const getDoctorDashboard = async () => {
  try {
    const token = localStorage.getItem('medchain_token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.get('/doctors/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor dashboard:', error);
    throw error;
  }
};

// Function to get a list of patients for a doctor
export const getDoctorPatients = async (searchTerm = '', filter = 'all') => {
  try {
    const token = localStorage.getItem('medchain_token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.get('/doctors/patients', {
      params: {
        search: searchTerm,
        filter: filter
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    throw error;
  }
};

// Function to get a specific patient's details
export const getPatientDetails = async (patientId) => {
  try {
    const token = localStorage.getItem('medchain_token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.get(`/doctors/patients/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching patient details:', error);
    throw error;
  }
};

// Function to add a medical note for a patient
export const addPatientNote = async (patientId, note) => {
  try {
    const token = localStorage.getItem('medchain_token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.post(`/doctors/patients/${patientId}/notes`, {
      note
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error adding patient note:', error);
    throw error;
  }
};

// Function to update doctor profile
export const updateDoctorProfile = async (doctorId, profileData) => {
  try {
    const token = localStorage.getItem('medchain_token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.put(`/doctors/${doctorId}`, profileData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    throw error;
  }
};

// Function to get doctor's appointment schedule
export const getDoctorSchedule = async (startDate, endDate) => {
  try {
    const token = localStorage.getItem('medchain_token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.get('/doctors/schedule', {
      params: {
        start_date: startDate,
        end_date: endDate
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor schedule:', error);
    throw error;
  }
};

