import { api } from './authService';

class SubscriptionService {
  // Get all subscription plans
  async getSubscriptionPlans() {
    try {
      const response = await api.get('/subscriptions/plans/');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  }

  // Get current user's subscription status
  async getUserSubscription() {
    try {
      const response = await api.get('/subscriptions/status/');
      return response.data;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      throw error;
    }
  }

  // Create payment intent for subscription
  async createPaymentIntent(planId) {
    try {
      const response = await api.post('/subscriptions/create-payment-intent/', {
        plan_id: planId
      });
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Confirm payment and activate subscription
  async confirmPayment(paymentIntentId) {
    try {
      const response = await api.post('/subscriptions/confirm-payment/', {
        payment_intent_id: paymentIntentId
      });
      return response.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  // Get payment history
  async getPaymentHistory() {
    try {
      const response = await api.get('/subscriptions/payment-history/');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription() {
    try {
      const response = await api.post('/subscriptions/cancel/');
      return response.data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }
}

export default new SubscriptionService();