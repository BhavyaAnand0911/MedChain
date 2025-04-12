import React, { createContext, useState, useEffect, useCallback } from 'react';
import { login, signup, verifyToken } from '../api/auth';
import { getToken, setToken, removeToken } from '../utils/tokenUtils';

export const AuthContext = createContext();

/**
 * AuthProvider component that manages authentication state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Verify authentication token and load user data
   */
  const verifyAuthToken = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return null;
    }

    try {
      const userData = await verifyToken();
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Token verification failed:', err.message);
      removeToken();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check authentication on initial load
  useEffect(() => {
    verifyAuthToken();
  }, [verifyAuthToken]);

  /**
   * Login user with email and password
   */
  const loginUser = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Step 1: Get token from login endpoint
      const { token } = await login(email, password);
      
      // Step 2: Store the token
      setToken(token);
      
      // Step 3: Verify token to get complete user data
      const userData = await verifyAuthToken();
      
      if (!userData) {
        throw new Error('Authentication failed');
      }
      
      return userData;
    } catch (err) {
      console.error('Login error:', err.message);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new user
   */
  const signupUser = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await signup(userData);
      return response.user;
    } catch (err) {
      console.error('Signup error:', err.message);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout current user
   */
  const logoutUser = () => {
    removeToken();
    setUser(null);
    setError(null);
  };

  /**
   * Refresh user data
   */
  const refreshUser = async () => {
    try {
      await verifyAuthToken();
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  // Context value
  const value = {
    user,                   // Current user data
    loading,                // Loading state
    error,                  // Authentication error
    isAuthenticated: !!user,// Authentication status
    loginUser,              // Login function
    signupUser,             // Signup function
    logoutUser,             // Logout function
    refreshUser             // Refresh user data
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};