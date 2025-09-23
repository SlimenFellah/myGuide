/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useIsAuthenticated } from '../store/hooks';
import { refreshToken, clearAuth } from '../store/slices/authSlice';
import { AuthMiddleware } from '../utils/authMiddleware';
import { isTokenExpired, getTimeUntilExpiration } from '../utils/tokenUtils';

/**
 * Custom hook for real-time token validation and authentication monitoring
 * @param {object} options - Configuration options
 * @param {boolean} options.enableAutoRefresh - Enable automatic token refresh
 * @param {number} options.refreshThreshold - Time in ms before expiration to refresh (default: 5 minutes)
 * @param {boolean} options.enablePeriodicCheck - Enable periodic token validation
 * @param {number} options.checkInterval - Interval in ms for periodic checks (default: 1 minute)
 * @returns {object} - Token validation state and methods
 */
export const useTokenValidation = (options = {}) => {
  const {
    enableAutoRefresh = true,
    refreshThreshold = 5 * 60 * 1000, // 5 minutes
    enablePeriodicCheck = true,
    checkInterval = 60 * 1000 // 1 minute
  } = options;

  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  
  const [validationState, setValidationState] = useState({
    isValid: false,
    isChecking: false,
    lastCheck: null,
    error: null,
    tokenExpiration: null,
    timeUntilExpiration: null
  });

  const refreshTimeoutRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const isRefreshingRef = useRef(false);

  /**
   * Perform token validation check
   */
  const validateToken = useCallback(async () => {
    if (validationState.isChecking) return;

    setValidationState(prev => ({ ...prev, isChecking: true, error: null }));

    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setValidationState({
          isValid: false,
          isChecking: false,
          lastCheck: new Date(),
          error: 'No access token found',
          tokenExpiration: null,
          timeUntilExpiration: 0
        });
        return { isValid: false, reason: 'NO_TOKEN' };
      }

      const expired = isTokenExpired(token);
      const timeUntilExp = getTimeUntilExpiration(token);
      
      const result = {
        isValid: !expired,
        isChecking: false,
        lastCheck: new Date(),
        error: expired ? 'Token expired' : null,
        tokenExpiration: new Date(Date.now() + timeUntilExp),
        timeUntilExpiration: timeUntilExp
      };

      setValidationState(result);
      
      return {
        isValid: !expired,
        reason: expired ? 'EXPIRED' : 'VALID',
        timeUntilExpiration: timeUntilExp
      };
    } catch (error) {
      console.error('❌ Token validation error:', error);
      
      const errorResult = {
        isValid: false,
        isChecking: false,
        lastCheck: new Date(),
        error: error.message,
        tokenExpiration: null,
        timeUntilExpiration: 0
      };
      
      setValidationState(errorResult);
      
      return { isValid: false, reason: 'ERROR', error: error.message };
    }
  }, [validationState.isChecking]);

  /**
   * Attempt to refresh the access token
   */
  const attemptTokenRefresh = useCallback(async () => {
    if (isRefreshingRef.current) {
      console.log('🔄 Token refresh already in progress, skipping');
      return { success: false, reason: 'ALREADY_REFRESHING' };
    }

    isRefreshingRef.current = true;
    
    try {
      console.log('🔄 Attempting token refresh');
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      await dispatch(refreshToken()).unwrap();
      
      console.log('✅ Token refresh successful');
      
      // Re-validate after refresh
      await validateToken();
      
      return { success: true, reason: 'REFRESHED' };
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      
      // Clear auth state on refresh failure
      AuthMiddleware.clearAuthState();
      
      setValidationState({
        isValid: false,
        isChecking: false,
        lastCheck: new Date(),
        error: 'Token refresh failed',
        tokenExpiration: null,
        timeUntilExpiration: 0
      });
      
      return { success: false, reason: 'REFRESH_FAILED', error: error.message };
    } finally {
      isRefreshingRef.current = false;
    }
  }, [dispatch, validateToken]);

  /**
   * Handle authentication failure
   */
  const handleAuthFailure = useCallback((reason) => {
    console.log(`🚫 Authentication failure: ${reason}`);
    
    // Clear auth state
    AuthMiddleware.clearAuthState();
    
    // Only redirect if on a protected route and not already on auth pages
    const currentPath = location.pathname;
    const isProtected = AuthMiddleware.isProtectedRoute(currentPath);
    const isAuthPage = AuthMiddleware.isAuthPage(currentPath);
    const isLanding = AuthMiddleware.isLandingPage(currentPath);
    
    if (isProtected && !isAuthPage && !isLanding) {
      console.log('🔄 Redirecting to login due to auth failure');
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [location, navigate]);

  /**
   * Schedule automatic token refresh
   */
  const scheduleTokenRefresh = useCallback((timeUntilExpiration) => {
    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    if (!enableAutoRefresh || timeUntilExpiration <= 0) {
      return;
    }

    // Schedule refresh before token expires
    const refreshTime = Math.max(0, timeUntilExpiration - refreshThreshold);
    
    console.log(`⏰ Scheduling token refresh in ${Math.round(refreshTime / 1000)} seconds`);
    
    refreshTimeoutRef.current = setTimeout(async () => {
      console.log('⏰ Auto-refresh timer triggered');
      const refreshResult = await attemptTokenRefresh();
      
      if (!refreshResult.success) {
        handleAuthFailure('AUTO_REFRESH_FAILED');
      }
    }, refreshTime);
  }, [enableAutoRefresh, refreshThreshold, attemptTokenRefresh, handleAuthFailure]);

  /**
   * Perform comprehensive authentication check
   */
  const performAuthCheck = useCallback(async () => {
    const validationResult = await validateToken();
    
    if (!validationResult.isValid) {
      if (validationResult.reason === 'EXPIRED') {
        // Try to refresh expired token
        const refreshResult = await attemptTokenRefresh();
        
        if (!refreshResult.success) {
          handleAuthFailure('TOKEN_EXPIRED_REFRESH_FAILED');
          return { isValid: false, action: 'REDIRECT_TO_LOGIN' };
        }
        
        return { isValid: true, action: 'TOKEN_REFRESHED' };
      } else {
        handleAuthFailure(validationResult.reason);
        return { isValid: false, action: 'REDIRECT_TO_LOGIN' };
      }
    }

    // Schedule auto-refresh for valid tokens
    if (enableAutoRefresh && validationResult.timeUntilExpiration > 0) {
      scheduleTokenRefresh(validationResult.timeUntilExpiration);
    }

    return { isValid: true, action: 'CONTINUE' };
  }, [validateToken, attemptTokenRefresh, handleAuthFailure, enableAutoRefresh, scheduleTokenRefresh]);

  // Initial validation and setup
  useEffect(() => {
    if (isAuthenticated) {
      performAuthCheck();
    }
  }, [isAuthenticated, performAuthCheck]);

  // Periodic token validation
  useEffect(() => {
    if (!enablePeriodicCheck || !isAuthenticated) {
      return;
    }

    checkIntervalRef.current = setInterval(async () => {
      console.log('🔍 Periodic token validation check');
      await performAuthCheck();
    }, checkInterval);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [enablePeriodicCheck, checkInterval, isAuthenticated, performAuthCheck]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  return {
    // State
    ...validationState,
    isAuthenticated,
    
    // Methods
    validateToken,
    attemptTokenRefresh,
    performAuthCheck,
    
    // Utilities
    scheduleRefresh: scheduleTokenRefresh,
    clearValidation: () => setValidationState({
      isValid: false,
      isChecking: false,
      lastCheck: null,
      error: null,
      tokenExpiration: null,
      timeUntilExpiration: null
    })
  };
};

/**
 * Simplified hook for basic token validation
 * @returns {object} - Basic validation state
 */
export const useBasicTokenValidation = () => {
  return useTokenValidation({
    enableAutoRefresh: false,
    enablePeriodicCheck: false
  });
};

/**
 * Hook for admin route token validation
 * @returns {object} - Admin validation state
 */
export const useAdminTokenValidation = () => {
  const location = useLocation();
  const tokenValidation = useTokenValidation();
  
  const [adminValidation, setAdminValidation] = useState({
    isAdminRoute: false,
    hasAdminAccess: false,
    shouldRedirect: false,
    redirectTo: null
  });

  useEffect(() => {
    const adminCheck = AuthMiddleware.validateAdminAccess(location.pathname);
    setAdminValidation({
      isAdminRoute: adminCheck.isAdminRoute,
      hasAdminAccess: adminCheck.hasAccess,
      shouldRedirect: adminCheck.isAdminRoute && !adminCheck.hasAccess,
      redirectTo: adminCheck.redirect
    });
  }, [location.pathname]);

  return {
    ...tokenValidation,
    ...adminValidation
  };
};

export default useTokenValidation;