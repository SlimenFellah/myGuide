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

// Handle response errors and token refresh with enhanced error handling
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 errors with token refresh logic
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Check if we're trying to refresh the refresh token itself
        if (originalRequest.url?.includes('/auth/token/refresh/')) {
          throw new Error('Refresh token is invalid');
        }
        
        // Make direct axios call to avoid circular dependency
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        // Update Redux store if available
        if (window.__REDUX_STORE__) {
          window.__REDUX_STORE__.dispatch({
            type: 'auth/setTokens',
            payload: { access, refresh: refreshToken }
          });
        }
        
        // Process queued requests
        processQueue(null, access);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Process queued requests with error
        processQueue(refreshError, null);
        
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Only redirect if not on landing page or login page
        const currentPath = window.location.pathname;
        const publicPaths = ['/', '/login', '/register', '/about', '/contact'];
        
        if (!publicPaths.includes(currentPath)) {
          // Dispatch logout action to Redux store if available
          if (window.__REDUX_STORE__) {
            window.__REDUX_STORE__.dispatch({ type: 'auth/clearAuth' });
          }
          
          // Redirect to login with return URL
          const returnUrl = encodeURIComponent(currentPath);
          window.location.href = `/login?returnUrl=${returnUrl}`;
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login/', {
        email,
        password,
      });
      
      const { access, refresh, user } = response.data;
      
      // Store tokens and user data
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.response?.data?.message || 'Login failed',
      };
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/auth/register/', userData);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/profile/');
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.response?.data?.message || 'Failed to get user data',
      };
    }
  },

  async updateProfile(userData) {
    try {
      const response = await api.put('/auth/profile/', userData);
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data));
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.response?.data?.message || 'Profile update failed',
      };
    }
  },

  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.put('/auth/change-password/', {
        old_password: currentPassword,
        new_password: newPassword,
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.response?.data?.message || 'Password change failed',
      };
    }
  },

  async logout() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout/', {
          refresh: refreshToken
        });
      }
    } catch (error) {
      // Ignore logout errors
    } finally {
      // Clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  // Check token status
  checkTokenStatus: async () => {
    try {
      const response = await api.get('/auth/token/status/');
      return response.data;
    } catch (error) {
      console.error('Token status check failed:', error);
      throw error;
    }
  },

  // Validate specific token
  validateToken: async (token) => {
    try {
      const response = await api.post('/auth/token/validate/', { token });
      return response.data;
    } catch (error) {
      console.error('Token validation failed:', error);
      throw error;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export { api };
export default api;