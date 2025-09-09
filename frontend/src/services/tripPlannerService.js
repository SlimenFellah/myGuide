/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import api from './authService';

export const tripPlannerService = {
  // Generate trip plan
  async generateTripPlan(tripData) {
    try {
      const response = await api.post('/trip-planner/generate/', tripData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to generate trip plan',
      };
    }
  },

  // Get user's trip plans
  async getTripPlans() {
    try {
      const response = await api.get('/trip-planner/plans/');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch trip plans',
      };
    }
  },

  // Get specific trip plan
  async getTripPlan(planId) {
    try {
      const response = await api.get(`/trip-planner/plans/${planId}/`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch trip plan',
      };
    }
  },

  // Update trip plan
  async updateTripPlan(planId, planData) {
    try {
      const response = await api.put(`/trip-planner/plans/${planId}/`, planData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to update trip plan',
      };
    }
  },

  // Delete trip plan
  async deleteTripPlan(planId) {
    try {
      await api.delete(`/trip-planner/plans/${planId}/`);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to delete trip plan',
      };
    }
  },

  // Save trip plan
  async saveTripPlan(planData) {
    try {
      const response = await api.post('/trip-planner/plans/', planData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to save trip plan',
      };
    }
  },

  // Get trip templates
  async getTripTemplates() {
    try {
      const response = await api.get('/trip-planner/templates/');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch trip templates',
      };
    }
  },

  // Get template by ID
  async getTripTemplate(templateId) {
    try {
      const response = await api.get(`/trip-planner/templates/${templateId}/`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch trip template',
      };
    }
  },

  // Create trip from template
  async createFromTemplate(templateId, customizations = {}) {
    try {
      const response = await api.post(`/trip-planner/templates/${templateId}/create/`, customizations);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to create trip from template',
      };
    }
  },

  // Add activity to trip plan
  async addActivity(planId, activityData) {
    try {
      const response = await api.post(`/trip-planner/plans/${planId}/activities/`, activityData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to add activity',
      };
    }
  },

  // Update activity
  async updateActivity(planId, activityId, activityData) {
    try {
      const response = await api.put(`/trip-planner/plans/${planId}/activities/${activityId}/`, activityData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to update activity',
      };
    }
  },

  // Remove activity
  async removeActivity(planId, activityId) {
    try {
      await api.delete(`/trip-planner/plans/${planId}/activities/${activityId}/`);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to remove activity',
      };
    }
  },

  // Get trip recommendations
  async getTripRecommendations(preferences) {
    try {
      const response = await api.post('/trip-planner/recommendations/', preferences);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to get recommendations',
      };
    }
  },

  // Calculate trip cost
  async calculateTripCost(planId) {
    try {
      const response = await api.get(`/trip-planner/plans/${planId}/cost/`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to calculate trip cost',
      };
    }
  },

  // Share trip plan
  async shareTripPlan(planId, shareData) {
    try {
      const response = await api.post(`/trip-planner/plans/${planId}/share/`, shareData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to share trip plan',
      };
    }
  },

  // Export trip plan
  async exportTripPlan(planId, format = 'pdf') {
    try {
      const response = await api.get(`/trip-planner/plans/${planId}/export/?format=${format}`, {
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to export trip plan',
      };
    }
  },

  // Get trip statistics
  async getTripStats() {
    try {
      const response = await api.get('/trip-planner/stats/');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch trip statistics',
      };
    }
  },
};

export default tripPlannerService;