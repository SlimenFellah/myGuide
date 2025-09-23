/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */

import { isTokenExpired, clearAuthData } from './tokenUtils';
import { store } from '../store';
import { clearAuth } from '../store/slices/authSlice';

/**
 * Enhanced token validation middleware
 * Provides comprehensive token checking and automatic cleanup
 */
export class AuthMiddleware {
  /**
   * Validate current authentication state
   * @returns {object} - Validation result with status and details
   */
  static validateAuthState() {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const userData = localStorage.getItem('user');

    // No tokens available
    if (!accessToken && !refreshToken) {
      return {
        isValid: false,
        reason: 'NO_TOKENS',
        shouldRedirect: true,
        action: 'CLEAR_AND_REDIRECT'
      };
    }

    // No access token but refresh token exists
    if (!accessToken && refreshToken) {
      return {
        isValid: false,
        reason: 'NO_ACCESS_TOKEN',
        shouldRedirect: false,
        action: 'ATTEMPT_REFRESH'
      };
    }

    // Check if access token is expired
    if (accessToken && isTokenExpired(accessToken)) {
      if (refreshToken) {
        return {
          isValid: false,
          reason: 'ACCESS_TOKEN_EXPIRED',
          shouldRedirect: false,
          action: 'ATTEMPT_REFRESH'
        };
      } else {
        return {
          isValid: false,
          reason: 'ACCESS_TOKEN_EXPIRED_NO_REFRESH',
          shouldRedirect: true,
          action: 'CLEAR_AND_REDIRECT'
        };
      }
    }

    // Check if user data is available
    if (!userData) {
      return {
        isValid: false,
        reason: 'NO_USER_DATA',
        shouldRedirect: true,
        action: 'CLEAR_AND_REDIRECT'
      };
    }

    // All checks passed
    return {
      isValid: true,
      reason: 'VALID',
      shouldRedirect: false,
      action: 'CONTINUE'
    };
  }

  /**
   * Check if current route should be protected
   * @param {string} pathname - Current route pathname
   * @returns {boolean} - True if route should be protected
   */
  static isProtectedRoute(pathname) {
    const protectedRoutes = [
      '/dashboard',
      '/explore',
      '/trip-planner',
      '/chatbot',
      '/admin',
      '/profile',
      '/settings'
    ];

    return protectedRoutes.some(route => pathname.startsWith(route));
  }

  /**
   * Check if current route is the landing page
   * @param {string} pathname - Current route pathname
   * @returns {boolean} - True if on landing page
   */
  static isLandingPage(pathname) {
    return pathname === '/' || pathname === '/landing';
  }

  /**
   * Check if current route is an auth page (login/register)
   * @param {string} pathname - Current route pathname
   * @returns {boolean} - True if on auth page
   */
  static isAuthPage(pathname) {
    return pathname === '/login' || pathname === '/register';
  }

  /**
   * Handle authentication validation result
   * @param {object} validationResult - Result from validateAuthState
   * @param {string} currentPath - Current route path
   * @returns {object} - Action to take
   */
  static handleValidationResult(validationResult, currentPath) {
    const { isValid, reason, shouldRedirect, action } = validationResult;

    // If valid, allow access
    if (isValid) {
      return { action: 'ALLOW', redirect: null };
    }

    // If on landing page, don't redirect unless explicitly needed
    if (this.isLandingPage(currentPath)) {
      if (action === 'CLEAR_AND_REDIRECT') {
        this.clearAuthState();
      }
      return { action: 'ALLOW', redirect: null };
    }

    // If on auth pages and tokens are invalid, clear them but allow access
    if (this.isAuthPage(currentPath)) {
      if (action === 'CLEAR_AND_REDIRECT') {
        this.clearAuthState();
      }
      return { action: 'ALLOW', redirect: null };
    }

    // For protected routes, handle based on validation result
    if (this.isProtectedRoute(currentPath)) {
      switch (action) {
        case 'CLEAR_AND_REDIRECT':
          this.clearAuthState();
          return { action: 'REDIRECT', redirect: '/login' };
        
        case 'ATTEMPT_REFRESH':
          return { action: 'REFRESH_TOKEN', redirect: null };
        
        default:
          return { action: 'REDIRECT', redirect: '/login' };
      }
    }

    // For other routes, allow access but clear invalid tokens
    if (action === 'CLEAR_AND_REDIRECT') {
      this.clearAuthState();
    }
    
    return { action: 'ALLOW', redirect: null };
  }

  /**
   * Clear authentication state from both localStorage and Redux store
   */
  static clearAuthState() {
    console.log('🧹 Clearing invalid authentication state');
    
    // Clear localStorage
    clearAuthData();
    
    // Clear Redux store
    try {
      store.dispatch(clearAuth());
    } catch (error) {
      console.error('Error clearing Redux auth state:', error);
    }
  }

  /**
   * Perform comprehensive authentication check
   * @param {string} currentPath - Current route path
   * @returns {Promise<object>} - Result of authentication check
   */
  static async performAuthCheck(currentPath) {
    try {
      console.log(`🔐 Performing auth check for path: ${currentPath}`);
      
      const validationResult = this.validateAuthState();
      console.log(`📊 Validation result:`, validationResult);
      
      const actionResult = this.handleValidationResult(validationResult, currentPath);
      console.log(`🎯 Action result:`, actionResult);
      
      return {
        success: true,
        ...actionResult,
        validationDetails: validationResult
      };
    } catch (error) {
      console.error('❌ Error during auth check:', error);
      
      // On error, clear auth state and redirect if on protected route
      this.clearAuthState();
      
      return {
        success: false,
        action: this.isProtectedRoute(currentPath) ? 'REDIRECT' : 'ALLOW',
        redirect: this.isProtectedRoute(currentPath) ? '/login' : null,
        error: error.message
      };
    }
  }

  /**
   * Check if user has admin privileges
   * @returns {boolean} - True if user is admin
   */
  static isAdmin() {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return false;
      
      const user = JSON.parse(userData);
      return user?.is_admin === true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Validate admin access for admin routes
   * @param {string} currentPath - Current route path
   * @returns {object} - Admin validation result
   */
  static validateAdminAccess(currentPath) {
    if (!currentPath.startsWith('/admin')) {
      return { isAdminRoute: false, hasAccess: true };
    }

    const isAdmin = this.isAdmin();
    
    return {
      isAdminRoute: true,
      hasAccess: isAdmin,
      redirect: isAdmin ? null : '/dashboard'
    };
  }
}

/**
 * Convenience function for quick auth validation
 * @param {string} currentPath - Current route path
 * @returns {Promise<object>} - Auth check result
 */
export const validateAuth = (currentPath) => {
  return AuthMiddleware.performAuthCheck(currentPath);
};

/**
 * Convenience function for admin validation
 * @param {string} currentPath - Current route path
 * @returns {object} - Admin validation result
 */
export const validateAdminAccess = (currentPath) => {
  return AuthMiddleware.validateAdminAccess(currentPath);
};

export default AuthMiddleware;