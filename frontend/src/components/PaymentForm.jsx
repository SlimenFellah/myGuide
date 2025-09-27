import React, { useState } from 'react';
import {
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { Lock } from '@mui/icons-material';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: false,
};

const PaymentForm = ({ clientSecret, onSuccess, onError, selectedPlan }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          }
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        onError(stripeError);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      onError(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Complete Your Payment
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Subscribe to {selectedPlan?.name} - ${selectedPlan?.price}
          {selectedPlan?.duration_days === 30 ? '/month' : 
           selectedPlan?.duration_days === 365 ? '/year' : ''}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
            Card Information
          </Typography>
          <Box
            sx={{
              p: 2,
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              '&:focus-within': {
                borderColor: '#1976d2',
                borderWidth: 2,
              }
            }}
          >
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={!stripe || processing}
          startIcon={processing ? <CircularProgress size={20} /> : <Lock />}
          sx={{ 
            py: 1.5,
            fontWeight: 'bold',
            textTransform: 'none'
          }}
        >
          {processing ? 'Processing Payment...' : `Pay $${selectedPlan?.price}`}
        </Button>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            <Lock fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
            Your payment information is secure and encrypted
          </Typography>
        </Box>
      </form>
    </Paper>
  );
};

export default PaymentForm;