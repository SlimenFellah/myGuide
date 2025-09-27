import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import {
  Container,
  Typography,
  Grid,
  Box,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SubscriptionCard from '../components/SubscriptionCard';
import PaymentForm from '../components/PaymentForm';
import subscriptionService from '../services/subscriptionService';

// Initialize Stripe (you'll need to add your publishable key to environment variables)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const steps = ['Select Plan', 'Payment', 'Confirmation'];

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansData, subscriptionData] = await Promise.all([
        subscriptionService.getSubscriptionPlans(),
        subscriptionService.getUserSubscription()
      ]);
      setPlans(plansData);
      setUserSubscription(subscriptionData);
    } catch (err) {
      setError('Failed to load subscription data. Please try again.');
      console.error('Error fetching subscription data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan) => {
    if (plan.price === 0) {
      // Handle free plan selection
      try {
        setPaymentProcessing(true);
        // For free plans, we might just need to update the user's subscription
        await fetchData(); // Refresh data
        setError(null);
      } catch (err) {
        setError('Failed to select free plan. Please try again.');
      } finally {
        setPaymentProcessing(false);
      }
      return;
    }

    try {
      setSelectedPlan(plan);
      setActiveStep(1);
      setPaymentProcessing(true);
      
      const paymentData = await subscriptionService.createPaymentIntent(plan.id);
      setClientSecret(paymentData.client_secret);
      setPaymentDialog(true);
    } catch (err) {
      setError('Failed to initialize payment. Please try again.');
      console.error('Error creating payment intent:', err);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      setActiveStep(2);
      await subscriptionService.confirmPayment(paymentIntent.id);
      
      // Refresh subscription data
      await fetchData();
      
      setTimeout(() => {
        setPaymentDialog(false);
        setActiveStep(0);
        setSelectedPlan(null);
        setClientSecret('');
      }, 3000);
    } catch (err) {
      setError('Payment succeeded but subscription activation failed. Please contact support.');
      console.error('Error confirming payment:', err);
    }
  };

  const handlePaymentError = (error) => {
    setError(`Payment failed: ${error.message}`);
    setActiveStep(1);
  };

  const handleCloseDialog = () => {
    setPaymentDialog(false);
    setActiveStep(0);
    setSelectedPlan(null);
    setClientSecret('');
  };

  const getCurrentPlanId = () => {
    return userSubscription?.subscription_plan?.id;
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Choose Your Plan
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Unlock premium features and get the most out of your travel planning experience
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {userSubscription && (
        <Alert severity="info" sx={{ mb: 4 }}>
          Current Plan: {userSubscription.subscription_plan?.name || 'Free'} 
          {userSubscription.status === 'active' && userSubscription.end_date && (
            ` (expires on ${new Date(userSubscription.end_date).toLocaleDateString()})`
          )}
        </Alert>
      )}

      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.id}>
            <SubscriptionCard
              plan={plan}
              isCurrentPlan={getCurrentPlanId() === plan.id}
              onSelectPlan={handleSelectPlan}
              loading={paymentProcessing}
            />
          </Grid>
        ))}
      </Grid>

      {/* Payment Dialog */}
      <Dialog 
        open={paymentDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown={activeStep === 2}
      >
        <DialogTitle>
          <Box sx={{ width: '100%' }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {activeStep === 1 && clientSecret && (
            <Elements stripe={stripePromise}>
              <PaymentForm
                clientSecret={clientSecret}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                selectedPlan={selectedPlan}
              />
            </Elements>
          )}
          
          {activeStep === 2 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h5" color="success.main" gutterBottom>
                Payment Successful!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Your subscription has been activated. You now have access to all premium features.
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        {activeStep !== 2 && (
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
          </DialogActions>
        )}
      </Dialog>
    </Container>
  );
};

export default SubscriptionPage;