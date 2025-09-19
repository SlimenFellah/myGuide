/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useIsAuthenticated, useCurrentUser, useAuthLoading } from '../store/hooks';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();
  const loading = useAuthLoading();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !user?.is_admin) {
    // Redirect to dashboard if user is not admin
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;