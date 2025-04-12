import axios from 'axios';
import { API_CONFIG } from '../config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default {
  // Auth
  signupUser: (userData) => api.post('/auth/signup', userData),
  loginUser: (credentials) => api.post('/auth/login', credentials),
  logoutUser: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),

  // Medical Records
  getMedicalRecords: (patientId) => api.get(`/records?patientId=${patientId}`),
  addMedicalRecord: (record) => api.post('/records', record),

  // Doctors
  getDoctors: () => api.get('/doctors'),
  getDoctor: (id) => api.get(`/doctors/${id}`),

};