import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { CheckCircle, Home, AccountBox } from '@mui/icons-material';
import subscriptionService from '../services/subscriptionService';
import { useSubscription } from '../hooks/useSubscription';

const SubscriptionSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refresh: refreshSubscription } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [verificationAttempted, setVerificationAttempted] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError('No session ID found. Please try again.');
      setLoading(false);
      return;
    }

    // Check if this session was already processed by checking localStorage
    const processedSessions = JSON.parse(localStorage.getItem('processedSessions') || '[]');
    const isAlreadyProcessed = processedSessions.includes(sessionId);

    if (isAlreadyProcessed) {
      // Session already processed, show success without calling API
      setAlreadyVerified(true);
      setSubscriptionData({ plan_name: 'Premium' });
      setLoading(false);
      refreshSubscription();
      return;
    }

    // Only verify if we haven't attempted verification yet
    if (!verificationAttempted) {
      setVerificationAttempted(true);
      verifyPayment(sessionId);
    }
  }, [searchParams, verificationAttempted]);

  const verifyPayment = async (sessionId) => {
    try {
      const result = await subscriptionService.verifyCheckoutSession(sessionId);
      setSubscriptionData(result);
      
      // Store this session as processed in localStorage
      const processedSessions = JSON.parse(localStorage.getItem('processedSessions') || '[]');
      if (!processedSessions.includes(sessionId)) {
        processedSessions.push(sessionId);
        localStorage.setItem('processedSessions', JSON.stringify(processedSessions));
      }
      
      // Refresh subscription data in the global hook
      refreshSubscription();
    } catch (err) {
      // Check if error is due to already verified session
      if (err.response?.status === 400 && err.response?.data?.error?.includes('duplicate key')) {
        setAlreadyVerified(true);
        setSubscriptionData({ plan_name: 'Premium' }); // Default fallback
        
        // Store this session as processed even if it was already verified
        const processedSessions = JSON.parse(localStorage.getItem('processedSessions') || '[]');
        if (!processedSessions.includes(sessionId)) {
          processedSessions.push(sessionId);
          localStorage.setItem('processedSessions', JSON.stringify(processedSessions));
        }
        
        // Still refresh subscription data even if already verified
        refreshSubscription();
      } else {
        setError('Failed to verify payment. Please contact support if you were charged.');
        console.error('Error verifying checkout session:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Verifying your payment...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={() => navigate('/subscription')}
            startIcon={<Home />}
          >
            Back to Subscription
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card sx={{ textAlign: 'center', p: 4 }}>
        <CardContent>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          
          <Typography variant="h4" gutterBottom fontWeight="bold" color="success.main">
            {alreadyVerified ? 'Payment Already Verified!' : 'Payment Successful!'}
          </Typography>
          
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            {alreadyVerified ? 'Your subscription is already active!' : 'Welcome to Premium!'}
          </Typography>

          {subscriptionData && (
            <Box sx={{ mb: 4 }}>
              <Chip 
                label={`${subscriptionData.plan_name} Plan`}
                color="primary"
                size="large"
                sx={{ mb: 2, fontWeight: 'bold' }}
              />
              <Typography variant="body1" color="text.secondary">
                {alreadyVerified 
                  ? 'You already have access to all premium features.'
                  : 'Your subscription is now active and you have access to all premium features.'
                }
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={() => navigate('/dashboard')}
              startIcon={<Home />}
              size="large"
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/subscription')}
              startIcon={<AccountBox />}
              size="large"
            >
              Manage Subscription
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SubscriptionSuccessPage;