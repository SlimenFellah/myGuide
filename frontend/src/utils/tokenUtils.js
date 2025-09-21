/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */

/**
 * Utility functions for JWT token management and validation
 */

/**
 * Decode JWT token payload without verification
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
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
 * Check if user is authenticated with valid token
 * @returns {boolean} - True if authenticated with valid token
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  if (!token) return false;
  
  return !isTokenExpired(token);
};