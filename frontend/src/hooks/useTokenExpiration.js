/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTokenExpired, getTokenExpiration, getTimeUntilExpiration } from '../utils/tokenUtils';
import { authService } from '../services/authService';

/**
 * Custom hook for monitoring token expiration and automatic logout
 * @param {boolean} enabled - Whether to enable token monitoring (default: true)
 * @param {number} checkInterval - Interval to check token in milliseconds (default: 60000 - 1 minute)
 * @param {number} warningTime - Time before expiration to show warning in milliseconds (default: 300000 - 5 minutes)
 */
export const useTokenExpiration = (enabled = true, checkInterval = 60000, warningTime = 300000) => {
  const navigate = useNavigate();
  const intervalRef = useRef(null);
  const warningShownRef = useRef(false);

  const handleTokenExpiration = async () => {
    try {
      // Clear auth data
      clearAuthData();
      
      // Call logout service to blacklist tokens on backend
      await authService.logout();
      
      // Show session expired message
      const event = new CustomEvent('sessionExpired', {
        detail: { message: 'Your session has expired. Please log in again.' }
      });
      window.dispatchEvent(event);
      
      // Redirect to login
      navigate('/login', { 
        replace: true,
        state: { message: 'Your session has expired. Please log in again.' }
      });
    } catch (error) {
      console.error('Error during token expiration handling:', error);
      // Still redirect to login even if logout fails
      navigate('/login', { 
        replace: true,
        state: { message: 'Your session has expired. Please log in again.' }
      });
    }
  };

  const showExpirationWarning = () => {
    if (!warningShownRef.current) {
      warningShownRef.current = true;
      
      const event = new CustomEvent('sessionWarning', {
        detail: { message: 'Your session will expire in 5 minutes. Please save your work.' }
      });
      window.dispatchEvent(event);
    }
  };

  const checkTokenStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        if (enabled) {
          handleTokenExpiration();
        }
        return;
      }

      // First check locally
      if (isTokenExpired(token)) {
        handleTokenExpiration();
        return;
      }

      // Then check with backend for more accurate validation
      try {
        const tokenStatus = await authService.checkTokenStatus();
        
        if (!tokenStatus.valid) {
          handleTokenExpiration();
          return;
        }

        // Check if token expires soon and show warning
        if (tokenStatus.expires_soon && tokenStatus.expires_in) {
          const minutesLeft = Math.floor(tokenStatus.expires_in / 60);
          if (!warningShownRef.current) {
            warningShownRef.current = true;
            const event = new CustomEvent('sessionWarning', {
              detail: { message: `Your session will expire in ${minutesLeft} minutes. Please save your work.` }
            });
            window.dispatchEvent(event);
          }
        } else {
          // Reset warning flag if token has more time left
          warningShownRef.current = false;
        }
      } catch (backendError) {
        // If backend check fails, fall back to local validation
         console.warn('Backend token validation failed, using local validation:', backendError);
         
         const expirationTime = getTokenExpiration(token);
         if (expirationTime) {
           const timeUntilExpiry = expirationTime - Date.now();
           
           if (timeUntilExpiry <= warningTime && timeUntilExpiry > 0) {
             showExpirationWarning();
           }

           // Reset warning flag if token has more than warning time left
           if (timeUntilExpiry > warningTime) {
             warningShownRef.current = false;
           }
         }
      }
    } catch (error) {
      console.error('Token expiration check failed:', error);
      // Don't logout on check errors unless token is clearly invalid
    }
  };

  useEffect(() => {
    if (!enabled) return;

    // Initial check
    checkTokenStatus();

    // Set up interval for periodic checks
    intervalRef.current = setInterval(checkTokenStatus, checkInterval);

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, checkInterval, warningTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    checkTokenStatus,
    handleTokenExpiration
  };
};