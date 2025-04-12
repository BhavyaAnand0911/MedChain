export const API_CONFIG = {
    USE_MOCK: true, // Switch to false when backend is ready
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    MOCK_DELAY: 500, // Simulated network delay in ms
    MOCK_USER: {
      id: 'mock123',
      email: 'mock@example.com',
      role: 'patient'
    }
  };