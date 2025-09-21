/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export const adminService = {
  // Get admin dashboard data
  getAdminData: async () => {
    try {
      const response = await api.get('/admin/dashboard/');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin data:', error);
      throw error;
    }
  },

  // Place management
  places: {
    // Create a new place
    create: async (placeData) => {
      try {
        const response = await api.post('/tourism/places/create/', placeData);
        return response.data;
      } catch (error) {
        console.error('Error creating place:', error);
        throw error;
      }
    },

    // Update an existing place
    update: async (placeId, placeData) => {
      try {
        const response = await api.put(`/tourism/places/${placeId}/update/`, placeData);
        return response.data;
      } catch (error) {
        console.error('Error updating place:', error);
        throw error;
      }
    },

    // Delete a place
    delete: async (placeId) => {
      try {
        const response = await api.delete(`/tourism/places/${placeId}/delete/`);
        return response.data;
      } catch (error) {
        console.error('Error deleting place:', error);
        throw error;
      }
    },

    // Get place details
    get: async (placeId) => {
      try {
        const response = await api.get(`/tourism/places/${placeId}/`);
        return response.data;
      } catch (error) {
        console.error('Error fetching place:', error);
        throw error;
      }
    },

    // Approve a place
    approve: async (placeId) => {
      try {
        const response = await api.patch(`/tourism/places/${placeId}/`, {
          status: 'approved'
        });
        return response.data;
      } catch (error) {
        console.error('Error approving place:', error);
        throw error;
      }
    },

    // Reject a place
    reject: async (placeId) => {
      try {
        const response = await api.patch(`/tourism/places/${placeId}/`, {
          status: 'rejected'
        });
        return response.data;
      } catch (error) {
        console.error('Error rejecting place:', error);
        throw error;
      }
    }
  },

  // Feedback management
  feedbacks: {
    // Delete a feedback
    delete: async (feedbackId) => {
      try {
        const response = await api.delete(`/tourism/feedbacks/${feedbackId}/`);
        return response.data;
      } catch (error) {
        console.error('Error deleting feedback:', error);
        throw error;
      }
    },

    // Approve a feedback
    approve: async (feedbackId) => {
      try {
        const response = await api.patch(`/tourism/feedbacks/${feedbackId}/`, {
          status: 'approved'
        });
        return response.data;
      } catch (error) {
        console.error('Error approving feedback:', error);
        throw error;
      }
    },

    // Reject a feedback
    reject: async (feedbackId) => {
      try {
        const response = await api.patch(`/tourism/feedbacks/${feedbackId}/`, {
          status: 'rejected'
        });
        return response.data;
      } catch (error) {
        console.error('Error rejecting feedback:', error);
        throw error;
      }
    }
  },

  // User management
  users: {
    // Get all users
    getAll: async () => {
      try {
        const response = await api.get('/auth/admin/users/');
        return response.data;
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
    },

    // Update user status
    updateStatus: async (userId, status) => {
      try {
        const response = await api.patch(`/auth/admin/users/${userId}/`, {
          is_active: status === 'active'
        });
        return response.data;
      } catch (error) {
        console.error('Error updating user status:', error);
        throw error;
      }
    },

    // Update user role
    updateRole: async (userId, role) => {
      try {
        const response = await api.patch(`/auth/admin/users/${userId}/`, {
          is_admin: role === 'admin'
        });
        return response.data;
      } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
      }
    },

    // Delete a user
    delete: async (userId) => {
      try {
        const response = await api.delete(`/auth/admin/users/${userId}/`);
        return response.data;
      } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
    },

    // Get user details
    get: async (userId) => {
      try {
        const response = await api.get(`/auth/admin/users/${userId}/`);
        return response.data;
      } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
      }
    }
  }
};

export default adminService;