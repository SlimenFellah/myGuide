/*
 * Developed & maintained by Slimene Fellah — Available for freelance work at slimenefellah.dev
 */
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import theme from './theme/theme';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ExplorePage from './pages/ExplorePage';
import TripPlannerPage from './pages/TripPlannerPage';
import ChatbotPage from './pages/ChatbotPage';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardRouter from './components/DashboardRouter';
import NotificationSystem from './components/NotificationSystem';
import ErrorBoundary from './components/ErrorBoundary';
import { Provider } from 'react-redux';
import { store } from './store';

import { useAppDispatch } from './store/hooks';
import { initializeAuth } from './store/slices/authSlice';

// Component to initialize Redux auth state
function AppInitializer({ children }) {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);
  
  return children;
}

// Component to handle routes with location-based key for proper re-rendering
function AppRoutes() {
  const location = useLocation();
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
            <Navbar />
            <ErrorBoundary>
              <DashboardRouter />
            </ErrorBoundary>
          </Box>
        </ProtectedRoute>
      } />
      
      <Route path="/explore" element={
        <ProtectedRoute>
          <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
            <Navbar />
            <ErrorBoundary>
              <ExplorePage />
            </ErrorBoundary>
          </Box>
        </ProtectedRoute>
      } />
      
      <Route path="/trip-planner" element={
        <ProtectedRoute>
          <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
            <Navbar />
            <ErrorBoundary>
              <TripPlannerPage />
            </ErrorBoundary>
          </Box>
        </ProtectedRoute>
      } />
      
      <Route path="/chatbot" element={
        <ProtectedRoute>
          <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
            <Navbar />
            <ErrorBoundary>
              <ChatbotPage />
            </ErrorBoundary>
          </Box>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
            <Navbar />
            <ErrorBoundary>
              <ProfilePage />
            </ErrorBoundary>
          </Box>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
            <Navbar />
            <ErrorBoundary>
              <SettingsPage />
            </ErrorBoundary>
          </Box>
        </ProtectedRoute>
      } />
      
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin={true}>
          <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
            <Navbar />
            <ErrorBoundary>
              <AdminDashboard />
            </ErrorBoundary>
          </Box>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box 
          sx={{ 
            minHeight: '100vh', 
            backgroundColor: 'background.paper', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Loading MyGuide...
            </Typography>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <Provider store={store}>
      <AppInitializer>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box className="App">
            <Router>
              <NotificationSystem />
              <AppRoutes />
            </Router>
          </Box>
        </ThemeProvider>
      </AppInitializer>
    </Provider>
  );
}

export default App;
