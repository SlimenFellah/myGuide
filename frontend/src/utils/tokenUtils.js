/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */

import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

/**
 * Utility functions for JWT token management and validation
 */

/**
 * Decode JWT token
 * @param {string} token - JWT token to decode
 * @returns {object|null} - Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired, false if valid
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Get token expiration time in milliseconds
 * @param {string} token - JWT token
 * @returns {number|null} - Expiration time in milliseconds or null
 */
export const getTokenExpiration = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return null;
    
    return decoded.exp * 1000; // Convert to milliseconds
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
};

/**
 * Get time until token expires in milliseconds
 * @param {string} token - JWT token
 * @returns {number} - Time until expiration in milliseconds (0 if expired)
 */
export const getTimeUntilExpiration = (token) => {
  try {
    const expiration = getTokenExpiration(token);
    if (!expiration) return 0;
    
    const timeUntilExpiration = expiration - Date.now();
    return Math.max(0, timeUntilExpiration);
  } catch (error) {
    console.error('Error calculating time until expiration:', error);
    return 0;
  }
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

/**
 * Get access token from localStorage
 * @returns {string|null} - Access token or null if not found
 */
export const getAccessToken = () => {
  return localStorage.getItem('access_token');
};

// Removed duplicate function - using getTimeUntilExpiration directly

/**
 * Check if user is authenticated with valid token
 * @returns {boolean} - True if authenticated with valid token
 */
export const isAuthenticated = () => {
  const token = getAccessToken();
  return token && !isTokenExpired(token);
};

/**
 * Automatic token refresh with proper error handling
 * @returns {Promise<string|null>} - New access token or null if refresh failed
 */
export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    // Check if refresh token is expired
    if (isTokenExpired(refreshToken)) {
      throw new Error('Refresh token is expired');
    }
    
    const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
      refresh: refreshToken
    });
    
    const { access } = response.data;
    
    if (!access) {
      throw new Error('No access token received from refresh');
    }
    
    // Store new access token
    localStorage.setItem('access_token', access);
    
    // Update Redux store if available
    if (window.__REDUX_STORE__) {
      window.__REDUX_STORE__.dispatch({
        type: 'auth/setTokens',
        payload: { access, refresh: refreshToken }
      });
    }
    
    return access;
    
  } catch (error) {
    console.error('Token refresh failed:', error);
    
    // Clear invalid tokens
    clearAuthData();
    
    // Dispatch logout action if Redux store is available
    if (window.__REDUX_STORE__) {
      window.__REDUX_STORE__.dispatch({ type: 'auth/clearAuth' });
    }
    
    return null;
  }
};

/**
 * Schedule automatic token refresh before expiration
 * @param {string} token - Access token to schedule refresh for
 */
export const scheduleTokenRefresh = (token) => {
  if (!token || isTokenExpired(token)) {
    return;
  }
  
  const timeUntilExpiry = getTimeUntilExpiration(token);
  
  // Schedule refresh 5 minutes before expiration (or halfway if token expires sooner)
  const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, timeUntilExpiry / 2);
  
  if (refreshTime > 0) {
    setTimeout(async () => {
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Schedule next refresh
        scheduleTokenRefresh(newToken);
      }
    }, refreshTime);
  }
};

/**
 * Initialize automatic token refresh on app startup
 */
export const initializeTokenRefresh = () => {
  const token = getAccessToken();
  if (token && !isTokenExpired(token)) {
    scheduleTokenRefresh(token);
  }
};

/**
 * Validate token and refresh if needed
 * @returns {Promise<boolean>} - True if valid token is available
 */
export const ensureValidToken = async () => {
  const token = getAccessToken();
  
  if (!token) {
    return false;
  }
  
  if (!isTokenExpired(token)) {
    return true;
  }
  
  // Token is expired, try to refresh
  const newToken = await refreshAccessToken();
  return newToken !== null;
};