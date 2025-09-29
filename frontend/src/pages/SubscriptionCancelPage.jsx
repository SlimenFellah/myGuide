import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent
} from '@mui/material';
import { Cancel, ArrowBack, CreditCard } from '@mui/icons-material';

const SubscriptionCancelPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card sx={{ textAlign: 'center', p: 4 }}>
        <CardContent>
          <Cancel sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
          
          <Typography variant="h4" gutterBottom fontWeight="bold" color="warning.main">
            Payment Cancelled
          </Typography>
          
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Your payment was cancelled. No charges were made.
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            You can try again anytime to upgrade to premium and unlock all features.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={() => navigate('/subscription')}
              startIcon={<CreditCard />}
              size="large"
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
              startIcon={<ArrowBack />}
              size="large"
            >
              Back to Dashboard
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SubscriptionCancelPage;