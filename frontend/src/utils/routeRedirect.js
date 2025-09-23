import { isAuthenticated } from './tokenUtils';

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/about',
  '/contact',
  '/privacy',
  '/terms'
];

/**
 * Admin-only routes that require admin privileges
 */
export const ADMIN_ROUTES = [
  '/admin',
  '/admin/dashboard',
  '/admin/users',
  '/admin/places',
  '/admin/feedbacks',
  '/admin/settings'
];

/**
 * Protected routes that require authentication
 */
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/bookings',
  '/favorites',
  ...ADMIN_ROUTES
];

/**
 * Check if a route is public (doesn't require authentication)
 * @param {string} path - Current route path
 * @returns {boolean} - True if route is public
 */
export const isPublicRoute = (path) => {
  return PUBLIC_ROUTES.some(route => {
    if (route === '/') {
      return path === '/' || path === '';
    }
    return path.startsWith(route);
  });
};

/**
 * Check if a route requires admin privileges
 * @param {string} path - Current route path
 * @returns {boolean} - True if route requires admin privileges
 */
export const isAdminRoute = (path) => {
  return ADMIN_ROUTES.some(route => path.startsWith(route));
};

/**
 * Check if a route is protected (requires authentication)
 * @param {string} path - Current route path
 * @returns {boolean} - True if route is protected
 */
export const isProtectedRoute = (path) => {
  return PROTECTED_ROUTES.some(route => path.startsWith(route));
};

/**
 * Handle authentication-based redirects
 * @param {string} currentPath - Current route path
 * @param {boolean} userIsAuthenticated - User authentication status
 * @param {boolean} userIsAdmin - User admin status
 * @returns {string|null} - Redirect path or null if no redirect needed
 */
export const getAuthRedirect = (currentPath, userIsAuthenticated = null, userIsAdmin = false) => {
  // Use provided auth status or check from token
  const authStatus = userIsAuthenticated !== null ? userIsAuthenticated : isAuthenticated();
  
  // If user is not authenticated and trying to access protected route
  if (!authStatus && isProtectedRoute(currentPath)) {
    const returnUrl = encodeURIComponent(currentPath);
    return `/login?returnUrl=${returnUrl}`;
  }
  
  // If user is authenticated but not admin and trying to access admin route
  if (authStatus && !userIsAdmin && isAdminRoute(currentPath)) {
    return '/dashboard';
  }
  
  // If user is authenticated and trying to access login/register pages
  if (authStatus && (currentPath === '/login' || currentPath === '/register')) {
    return '/dashboard';
  }
  
  return null;
};

/**
 * Perform redirect if needed
 * @param {string} currentPath - Current route path
 * @param {boolean} userIsAuthenticated - User authentication status
 * @param {boolean} userIsAdmin - User admin status
 * @param {function} navigate - Navigation function (from useNavigate)
 */
export const handleAuthRedirect = (currentPath, userIsAuthenticated, userIsAdmin, navigate) => {
  const redirectPath = getAuthRedirect(currentPath, userIsAuthenticated, userIsAdmin);
  
  if (redirectPath) {
    navigate(redirectPath, { replace: true });
    return true;
  }
  
  return false;
};

/**
 * Force logout and redirect to login
 * @param {function} navigate - Navigation function (from useNavigate)
 * @param {string} currentPath - Current route path
 * @param {function} dispatch - Redux dispatch function
 */
export const forceLogoutRedirect = (navigate, currentPath = '', dispatch = null) => {
  // Clear authentication data
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  
  // Dispatch logout action if Redux dispatch is available
  if (dispatch) {
    dispatch({ type: 'auth/clearAuth' });
  }
  
  // Only redirect if not on a public route
  if (!isPublicRoute(currentPath)) {
    const returnUrl = encodeURIComponent(currentPath);
    navigate(`/login?returnUrl=${returnUrl}`, { replace: true });
  }
};

/**
 * Get return URL from query parameters
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {string} - Return URL or default dashboard
 */
export const getReturnUrl = (searchParams) => {
  const returnUrl = searchParams.get('returnUrl');
  
  if (returnUrl) {
    const decodedUrl = decodeURIComponent(returnUrl);
    // Ensure return URL is safe (not external)
    if (decodedUrl.startsWith('/') && !decodedUrl.startsWith('//')) {
      return decodedUrl;
    }
  }
  
  return '/dashboard';
};

/**
 * Route guard hook for components
 * @param {string} currentPath - Current route path
 * @param {boolean} userIsAuthenticated - User authentication status
 * @param {boolean} userIsAdmin - User admin status
 * @returns {object} - Route guard result
 */
export const useRouteGuard = (currentPath, userIsAuthenticated, userIsAdmin) => {
  const shouldRedirect = !isPublicRoute(currentPath) && !userIsAuthenticated;
  const shouldRedirectAdmin = userIsAuthenticated && !userIsAdmin && isAdminRoute(currentPath);
  const redirectPath = getAuthRedirect(currentPath, userIsAuthenticated, userIsAdmin);
  
  return {
    shouldRedirect: shouldRedirect || shouldRedirectAdmin,
    redirectPath,
    isPublic: isPublicRoute(currentPath),
    isProtected: isProtectedRoute(currentPath),
    isAdmin: isAdminRoute(currentPath),
    canAccess: isPublicRoute(currentPath) || 
               (userIsAuthenticated && (!isAdminRoute(currentPath) || userIsAdmin))
  };
};