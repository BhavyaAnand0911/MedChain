// Get token from localStorage
export const getToken = () => {
    return localStorage.getItem('medchain_token');
  };
  
  // Set token in localStorage
  export const setToken = (token) => {
    localStorage.setItem('medchain_token', token);
  };
  
  // Remove token from localStorage
  export const removeToken = () => {
    localStorage.removeItem('medchain_token');
  };
  
  // Check if token is expired
  export const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      // Token is in format: header.payload.signature
      const payload = token.split('.')[1];
      // Decode the base64 payload
      const decodedPayload = JSON.parse(atob(payload));
      
      // Check if token has expired
      const currentTime = Math.floor(Date.now() / 1000);
      return decodedPayload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  };