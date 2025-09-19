/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, Typography, Box } from '@mui/material';
import { useLocation } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  componentDidUpdate(prevProps) {
    // Reset error state when location changes
    if (prevProps.locationKey !== this.props.locationKey && this.state.hasError) {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader sx={{ textAlign: 'center' }}>
              <Box sx={{ mx: 'auto', mb: 2, p: 1.5, bgcolor: 'error.light', borderRadius: '50%', width: 'fit-content' }}>
                <AlertTriangle size={32} color="#d32f2f" />
              </Box>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                Something went wrong
              </Typography>
              <Typography variant="body2" color="text.secondary">
                 We encountered an unexpected error. Please try refreshing the page.
               </Typography>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={this.handleRetry}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                className="w-full"
                variant="outline"
              >
                Refresh Page
              </Button>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-3 bg-gray-100 rounded text-sm">
                  <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                    Error Details (Development)
                  </summary>
                  <pre className="whitespace-pre-wrap text-xs text-gray-600 overflow-auto max-h-32">
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to provide location key
const ErrorBoundaryWithRouter = ({ children }) => {
  const location = useLocation();
  return (
    <ErrorBoundary locationKey={location.pathname}>
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundaryWithRouter;