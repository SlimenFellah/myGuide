import api from './api'

export const subscriptionService = {
  async getSubscriptionPlans() {
    const res = await api.get('/subscriptions/plans/')
    return res.data
  },

  async getUserSubscription() {
    const res = await api.get('/subscriptions/status/')
    return res.data
  },
}

export default subscriptionService
