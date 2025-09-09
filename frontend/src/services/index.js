/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */

// Export all API services
export { authService } from './authService';
export { default as tourismService } from './tourismService';
export { default as chatbotService } from './chatbotService';
export { default as tripPlannerService } from './tripPlannerService';

// Export the main API instance
export { default as api } from './authService';

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Helper functions
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.detail || error.response.data?.message || 'An error occurred';
  } else if (error.request) {
    // Request was made but no response received
    return 'Network error. Please check your connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};

export const formatApiResponse = (response) => {
  return {
    success: true,
    data: response.data,
    status: response.status,
    headers: response.headers,
  };
};

export const formatApiError = (error) => {
  return {
    success: false,
    error: handleApiError(error),
    status: error.response?.status,
    data: error.response?.data,
  };
};