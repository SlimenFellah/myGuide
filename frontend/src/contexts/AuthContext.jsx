/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      
      if (response.success) {
        const { user: userData, access, refresh } = response.data;
        
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Transform userData to match backend expectations
      const [firstName, ...lastNameParts] = userData.name.trim().split(' ');
      const lastName = lastNameParts.join(' ') || firstName; // Use firstName as lastName if only one name provided
      
      const transformedData = {
        username: userData.email, // Use email as username
        email: userData.email,
        first_name: firstName,
        last_name: lastName,
        password: userData.password,
        password_confirm: userData.password_confirm
      };
      
      const response = await authService.register(transformedData);
      
      if (response.success) {
        // Registration successful, but don't auto-login
        // User needs to login manually after registration
        return { success: true };
      } else {
        // Handle specific error messages
        let errorMessage = 'Registration failed. Please try again.';
        if (response.error) {
          if (typeof response.error === 'string') {
            errorMessage = response.error;
          } else if (response.error.email) {
            errorMessage = Array.isArray(response.error.email) 
              ? response.error.email[0] 
              : response.error.email;
          } else if (response.error.username) {
            errorMessage = Array.isArray(response.error.username) 
              ? response.error.username[0] 
              : response.error.username;
          } else if (response.error.password) {
            errorMessage = Array.isArray(response.error.password) 
              ? response.error.password[0] 
              : response.error.password;
          } else if (response.error.non_field_errors) {
            errorMessage = Array.isArray(response.error.non_field_errors) 
              ? response.error.non_field_errors[0] 
              : response.error.non_field_errors;
          }
        }
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const isAdmin = () => {
    return user && user.is_admin === true;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};