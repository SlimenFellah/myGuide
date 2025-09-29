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
  StepLabel,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { Check, Star, Cancel, Upgrade } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SubscriptionCard from '../components/SubscriptionCard';
import PaymentForm from '../components/PaymentForm';
import subscriptionService from '../services/subscriptionService';
import { useSubscription } from '../hooks/useSubscription';

// Initialize Stripe (you'll need to add your publishable key to environment variables)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const steps = ['Select Plan', 'Payment', 'Confirmation'];

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { subscription, isPremium, planName, loading: subscriptionLoading, refresh: refreshSubscription } = useSubscription();
  const [plans, setPlans] = useState([]);
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
      const plansData = await subscriptionService.getSubscriptionPlans();
      // Handle paginated response - extract results array
      setPlans(plansData.results || plansData);
      // Refresh subscription data
      refreshSubscription();
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
        refreshSubscription(); // Refresh data
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
      setPaymentProcessing(true);
      
      // Create checkout session and redirect to Stripe Checkout
      const checkoutData = await subscriptionService.createCheckoutSession(plan.id);
      
      // Redirect to Stripe Checkout
      window.location.href = checkoutData.checkout_url;
      
    } catch (err) {
      setError('Failed to initialize payment. Please try again.');
      console.error('Error creating checkout session:', err);
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
    return subscription?.plan_id || null;
  };

  const handleCancelSubscription = async () => {
    try {
      await subscriptionService.cancelSubscription();
      await fetchData(); // Refresh data
      setError(null);
    } catch (err) {
      setError('Failed to cancel subscription. Please try again.');
    }
  };

  // Premium User Dashboard Component
  const PremiumDashboard = () => (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
          <Star sx={{ color: 'gold', fontSize: 32 }} />
          <Typography variant="h3" component="h1" fontWeight="bold" color="primary.main">
            Premium Member
          </Typography>
          <Star sx={{ color: 'gold', fontSize: 32 }} />
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          You're enjoying all premium features! Manage your subscription below.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Current Subscription Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', border: '2px solid', borderColor: 'primary.main' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Chip 
                  label="ACTIVE" 
                  color="success" 
                  size="small" 
                  sx={{ fontWeight: 'bold' }}
                />
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  {planName} Plan
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {subscription?.end_date 
                  ? `Expires on ${new Date(subscription.end_date).toLocaleDateString()}`
                  : 'Forever'
                }
              </Typography>

              <Typography variant="h6" sx={{ mb: 2 }}>Premium Features:</Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Check color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Unlimited trip plans" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Check color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Unlimited chatbot messages" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Check color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Export trips to PDF" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Check color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Priority support" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Check color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Advanced AI features" />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                onClick={handleCancelSubscription}
                fullWidth
                sx={{ mt: 2 }}
              >
                Cancel Subscription
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Upgrade Options */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                Upgrade Options
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Want to switch to a different plan? Choose from our available options.
              </Typography>

              <Grid container spacing={2}>
                {plans.filter(plan => plan.id !== getCurrentPlanId()).map((plan) => (
                  <Grid item xs={12} key={plan.id}>
                    <SubscriptionCard
                      plan={plan}
                      isCurrentPlan={false}
                      onSelectPlan={handleSelectPlan}
                      loading={paymentProcessing}
                      compact={true}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  // Show premium dashboard for premium users
  if (isPremium) {
    return <PremiumDashboard />;
  }

  // Show regular subscription page for free users
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

      {subscription && (
        <Alert severity="info" sx={{ mb: 4 }}>
          Current Plan: {subscription.plan_name || 'Free'} 
          {subscription.is_active && subscription.expires_on ? (
            ` (expires on ${new Date(subscription.expires_on).toLocaleDateString()})`
          ) : subscription.is_active ? (
            ' (Forever)'
          ) : ''}
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