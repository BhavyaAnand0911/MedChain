export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  export const validatePassword = (password) => {
    return password.length >= 8;
  };
  
  export const validateUsername = (username) => {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
  };
  
  export const validateMedicalRecord = (file) => {
    if (!file) return { valid: false, error: 'No file selected' };
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Only PDF files are allowed' };
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return { valid: false, error: 'File size must be less than 5MB' };
    }
    return { valid: true, error: null };
  };
  
  export const validateSymptoms = (symptoms) => {
    return symptoms.length > 0;
  };