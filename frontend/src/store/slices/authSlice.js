import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import { clearAuthData, isTokenExpired, initializeTokenRefresh, ensureValidToken } from '../../utils/tokenUtils';

// Async thunks for authentication
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      if (response.success) {
        return response.data; // Return the actual data (access, refresh, user)
      } else {
        return rejectWithValue({ message: response.error });
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Registration failed' });
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      const response = await authService.refreshToken(refreshToken);
      localStorage.setItem('access_token', response.access);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Token refresh failed' });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return {};
    } catch (error) {
      // Even if logout fails on server, clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return {};
    }
  }
);

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to prevent premature redirects
  error: null,
  tokens: {
    access: localStorage.getItem('access_token'),
    refresh: localStorage.getItem('refresh_token')
  }
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearAuth: (state) => {
       state.isAuthenticated = false;
       state.user = null;
       state.tokens = { access: null, refresh: null };
       state.error = null;
       localStorage.removeItem('user');
       localStorage.removeItem('access_token');
       localStorage.removeItem('refresh_token');
     },
    setTokens: (state, action) => {
      const { access, refresh } = action.payload;
      
      // Validate tokens before setting
      if (access && !isTokenExpired(access)) {
        state.tokens.access = access;
        localStorage.setItem('access_token', access);
        
        // Initialize automatic refresh for new token
        initializeTokenRefresh();
      }
      
      if (refresh && !isTokenExpired(refresh)) {
        state.tokens.refresh = refresh;
        localStorage.setItem('refresh_token', refresh);
      }
      
      // If both tokens are invalid, clear auth state
      if ((!access || isTokenExpired(access)) && (!refresh || isTokenExpired(refresh))) {
        state.user = null;
        state.tokens = { access: null, refresh: null };
        state.isAuthenticated = false;
        clearAuthData();
      }
    },
    initializeAuth: (state) => {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          // Check if token is expired
          if (isTokenExpired(token)) {
            // Clear expired tokens
            clearAuthData();
            state.isAuthenticated = false;
            state.user = null;
            state.tokens = { access: null, refresh: null };
          } else {
            const parsedUser = JSON.parse(userData);
            state.user = parsedUser;
            state.isAuthenticated = true;
            state.tokens.access = token;
            state.tokens.refresh = refreshToken;
            
            // Initialize automatic token refresh
            initializeTokenRefresh();
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          clearAuthData();
          state.isAuthenticated = false;
          state.user = null;
          state.tokens = { access: null, refresh: null };
        }
      } else {
        state.isAuthenticated = false;
        state.user = null;
      }
      state.isLoading = false; // Always set loading to false after initialization
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.tokens = {
          access: action.payload.access,
          refresh: action.payload.refresh
        };
        state.error = null;
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload?.message || 'Login failed';
      })
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Don't auto-login after registration
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Registration failed';
      })
      // Refresh token cases
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tokens.access = action.payload.access;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.tokens = { access: null, refresh: null };
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      })
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.tokens = { access: null, refresh: null };
        state.error = null;
        localStorage.removeItem('user');
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.tokens = { access: null, refresh: null };
        state.error = null;
        localStorage.removeItem('user');
      });
  }
});

// Export actions
export const { clearError, setUser, clearAuth, setTokens, initializeAuth } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectTokens = (state) => state.auth.tokens;
export const selectIsAdmin = (state) => state.auth.user?.is_admin || false;

// Export reducer
export default authSlice.reducer;