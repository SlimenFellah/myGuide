/*
 * Developed & maintained by Slimene Fellah — Available for freelance work at slimenefellah.dev
 */
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

// Page Components
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import Dashboard from '../pages/Dashboard';
import ExplorePage from '../pages/ExplorePage';
import TripPlannerPage from '../pages/TripPlannerPage';
import ChatbotPage from '../pages/ChatbotPage';
import AdminDashboard from '../pages/AdminDashboard';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import MyTripsPage from '../pages/MyTripsPage';
import SubscriptionPage from '../pages/SubscriptionPage';

// Components
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardRouter from '../components/DashboardRouter';
import ErrorBoundary from '../components/ErrorBoundary';
import Navbar from '../components/Navbar';

// Route configuration objects
export const publicRoutes = [
  {
    path: '/',
    element: <LandingPage />,
    name: 'Landing'
  },
  {
    path: '/login',
    element: <LoginPage />,
    name: 'Login'
  },
  {
    path: '/register',
    element: <RegisterPage />,
    name: 'Register'
  }
];

export const protectedRoutes = [
  {
    path: '/dashboard',
    element: <DashboardRouter />,
    name: 'Dashboard'
  },
  {
    path: '/explore',
    element: <ExplorePage />,
    name: 'Explore'
  },
  {
    path: '/trip-planner',
    element: <TripPlannerPage />,
    name: 'Trip Planner'
  },
  {
    path: '/chatbot',
    element: <ChatbotPage />,
    name: 'Chatbot'
  },
  {
    path: '/profile',
    element: <ProfilePage />,
    name: 'Profile'
  },
  {
    path: '/settings',
    element: <SettingsPage />,
    name: 'Settings'
  },
  {
    path: '/my-trips',
    element: <MyTripsPage />,
    name: 'My Trips'
  },
  {
    path: '/subscription',
    element: <SubscriptionPage />,
    name: 'Subscription'
  }
];

export const adminRoutes = [
  {
    path: '/admin',
    element: <AdminDashboard />,
    name: 'Admin Dashboard',
    requireAdmin: true
  }
];

// Helper component to wrap protected routes with common layout
const ProtectedLayout = ({ children }) => (
  <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
    <Navbar />
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  </Box>
);

// Main AppRoutes component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      {publicRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={route.element}
        />
      ))}
      
      {/* Protected Routes */}
      {protectedRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                {route.element}
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
      ))}
      
      {/* Admin Routes */}
      {adminRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute requireAdmin={route.requireAdmin}>
              <ProtectedLayout>
                {route.element}
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
      ))}
    </Routes>
  );
};

export default AppRoutes;