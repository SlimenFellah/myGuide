/*
 * Developed & maintained by Slimene Fellah — Available for freelance work at slimenefellah.dev
 */
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import theme from './theme/theme';
import AppRoutes from './routes/routes';
import NotificationSystem from './components/NotificationSystem';
import { Provider } from 'react-redux';
import { store } from './store';
import { useTokenExpiration } from './hooks/useTokenExpiration';

import { useAppDispatch } from './store/hooks';
import { initializeAuth } from './store/slices/authSlice';
import { initializeTokenRefresh } from './utils/tokenUtils';
import { handleAuthRedirect } from './utils/routeRedirect';

// Component to initialize Redux auth state and token refresh
function AppInitializer({ children }) {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    // Initialize auth state from localStorage
    dispatch(initializeAuth());
    
    // Initialize automatic token refresh
    initializeTokenRefresh();
    
    // Set up global Redux store reference for interceptors
    window.__REDUX_STORE__ = store;
    
    // Cleanup on unmount
    return () => {
      delete window.__REDUX_STORE__;
    };
  }, [dispatch]);
  
  return children;
}

// Component to handle routes with location-based key for proper re-rendering
function AppRoutesWrapper() {
  const location = useLocation();
  
  // Enable token expiration monitoring for protected routes
  // useTokenExpiration(true, 60000, 300000); // Temporarily disabled to prevent 401 errors during testing
  
  // Handle route-based authentication redirects
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Skip redirect handling for public routes
    const publicPaths = ['/', '/login', '/register', '/about', '/contact'];
    if (publicPaths.includes(currentPath)) {
      return;
    }
    
    // Check authentication status and handle redirects if needed
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    if (!token && currentPath !== '/login') {
      // No token and trying to access protected route
      const returnUrl = encodeURIComponent(currentPath);
      window.location.href = `/login?returnUrl=${returnUrl}`;
    }
  }, [location.pathname]);
  
  return <AppRoutes />;
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
              <AppRoutesWrapper />
            </Router>
          </Box>
        </ThemeProvider>
      </AppInitializer>
    </Provider>
  );
}

export default App;
