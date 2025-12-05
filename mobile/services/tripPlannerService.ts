import api from './api'

export const tripPlannerService = {
  async generateTripPlan(tripData: Record<string, any>) {
    try {
      const res = await api.post('/trip-planner/generate-trip-plan/', tripData)
      return { success: true, data: res.data }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || 'Failed to generate trip plan' }
    }
  },

  async getTripPlans() {
    try {
      const res = await api.get('/trip-planner/trip-plans/')
      return { success: true, data: res.data }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || 'Failed to fetch trip plans' }
    }
  },
}

export default tripPlannerService
