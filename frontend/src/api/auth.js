import api from './axios';

export const authService = {
  /**
   * Login user with email and password
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{token: string, user: {email: string}}>}
   */
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', 
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Validate response structure
      if (!response.data?.access_token) {
        throw new Error('Authentication failed: No token received');
      }
      
      return {
        token: response.data.access_token,
        user: { email } // Minimal user data, will be completed in verifyToken
      };
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        errorMessage = error.response.data?.detail || 
                      error.response.data?.message || 
                      errorMessage;
      }
      
      console.error('Login error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Verify the current authentication token
   * @returns {Promise<{email: string, username?: string, role?: string}>}
   */
  async verifyToken() {
    try {
      const response = await api.get('/auth/verify');
      
      if (!response.data?.email) {
        throw new Error('Invalid user data received');
      }
      
      return response.data;
    } catch (error) {
      let errorMessage = 'Session verification failed';
      
      if (error.response) {
        errorMessage = error.response.data?.detail || 
                      error.response.data?.message || 
                      errorMessage;
      }
      
      console.error('Token verification error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Register a new user
   * @param {Object} userData 
   * @returns {Promise<{user: object}>}
   */
  async signup(userData) {
    try {
      const response = await api.post('/auth/signup', 
        userData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      let errorMessage = 'Signup failed. Please try again.';
      
      if (error.response) {
        errorMessage = error.response.data?.detail || 
                      error.response.data?.message || 
                      errorMessage;
      }
      
      console.error('Signup error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Send verification email
   * @param {string} userId 
   * @returns {Promise<{message: string}>}
   */
  async sendVerificationEmail(userId) {
    try {
      const response = await api.post('/auth/send-verification-email', 
        { user_id: userId },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      let errorMessage = 'Failed to send verification email';
      
      if (error.response) {
        errorMessage = error.response.data?.detail || 
                      error.response.data?.message || 
                      errorMessage;
      }
      
      console.error('Verification email error:', errorMessage);
      throw new Error(errorMessage);
    }
  }
};

// Export individual functions
export const login = authService.login;
export const signup = authService.signup;
export const verifyToken = authService.verifyToken;
export const sendVerificationEmail = authService.sendVerificationEmail;