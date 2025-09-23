/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useIsAuthenticated, useCurrentUser, useAuthLoading } from '../store/hooks';
import { useEffect, useState } from 'react';
import { AuthMiddleware } from '../utils/authMiddleware';
import { useAppDispatch } from '../store/hooks';
import { refreshToken } from '../store/slices/authSlice';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();
  const loading = useAuthLoading();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [authCheckResult, setAuthCheckResult] = useState(null);

  useEffect(() => {
    const performAuthCheck = async () => {
      try {
        console.log('🔐 ProtectedRoute: Performing auth check for', location.pathname);
        const result = await AuthMiddleware.performAuthCheck(location.pathname);
        
        // Handle token refresh if needed
        if (result.action === 'REFRESH_TOKEN') {
          console.log('🔄 ProtectedRoute: Attempting token refresh');
          try {
            await dispatch(refreshToken()).unwrap();
            // After successful refresh, re-check auth
            const recheckResult = await AuthMiddleware.performAuthCheck(location.pathname);
            setAuthCheckResult(recheckResult);
          } catch (refreshError) {
            console.error('❌ ProtectedRoute: Token refresh failed', refreshError);
            // If refresh fails, clear auth and redirect
            AuthMiddleware.clearAuthState();
            setAuthCheckResult({
              action: 'REDIRECT',
              redirect: '/login'
            });
          }
        } else {
          setAuthCheckResult(result);
        }
      } catch (error) {
        console.error('❌ ProtectedRoute: Auth check failed', error);
        setAuthCheckResult({
          action: 'REDIRECT',
          redirect: '/login'
        });
      } finally {
        setAuthCheckComplete(true);
      }
    };

    performAuthCheck();
  }, [location.pathname, dispatch]);

  // Show loading while auth check is in progress
  if (loading || !authCheckComplete) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating authentication...</p>
        </div>
      </div>
    );
  }

  // Handle auth check results
  if (authCheckResult?.action === 'REDIRECT' && authCheckResult.redirect) {
    console.log('🔄 ProtectedRoute: Redirecting to', authCheckResult.redirect);
    return <Navigate to={authCheckResult.redirect} state={{ from: location }} replace />;
  }

  // Fallback to Redux state if auth check allows but Redux says not authenticated
  if (!isAuthenticated) {
    console.log('⚠️ ProtectedRoute: Redux state shows not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin access for admin routes
  if (requireAdmin) {
    const adminCheck = AuthMiddleware.validateAdminAccess(location.pathname);
    if (adminCheck.isAdminRoute && !adminCheck.hasAccess) {
      console.log('🚫 ProtectedRoute: Admin access denied, redirecting to dashboard');
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Additional admin check using user data
  if (requireAdmin && !user?.is_admin) {
    console.log('🚫 ProtectedRoute: User is not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ ProtectedRoute: Access granted for', location.pathname);
  return children;
};

export default ProtectedRoute;