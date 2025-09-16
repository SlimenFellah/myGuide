/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
export { authService, api } from './authService';
export { tourismService } from './tourismService';
export { chatbotService } from './chatbotService';
export { tripPlannerService } from './tripPlannerService';
export { apiService } from './apiService';

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Helper functions
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.detail || error.response.data?.message || 'Server error occurred';
  } else if (error.request) {
    // Request was made but no response received
    return 'Network error - please check your connection';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};

export const formatApiResponse = (data, success = true, message = '') => {
  return {
    success,
    data,
    message,
    timestamp: new Date().toISOString()
  };
};

// Default export for convenience
export { apiService as default } from './apiService';