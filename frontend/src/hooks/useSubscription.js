import { useState, useEffect } from 'react';
import subscriptionService from '../services/subscriptionService';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getUserSubscription();
      setSubscription(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch subscription');
      console.error('Error fetching subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const isPremium = () => {
    return subscription?.status === 'active' && 
           subscription?.subscription_plan?.name !== 'Free';
  };

  const isActive = () => {
    return subscription?.status === 'active';
  };

  const getPlanName = () => {
    return subscription?.subscription_plan?.name || 'Free';
  };

  const getExpiryDate = () => {
    return subscription?.end_date ? new Date(subscription.end_date) : null;
  };

  const isExpiringSoon = () => {
    const expiryDate = getExpiryDate();
    if (!expiryDate) return false;
    
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const refresh = () => {
    fetchSubscription();
  };

  return {
    subscription,
    loading,
    error,
    isPremium: isPremium(),
    isActive: isActive(),
    planName: getPlanName(),
    expiryDate: getExpiryDate(),
    isExpiringSoon: isExpiringSoon(),
    refresh
  };
};