/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import { authService } from './authService';
import { tourismService } from './tourismService';
import { chatbotService } from './chatbotService';
import { tripPlannerService } from './tripPlannerService';

// Unified API service that integrates with AppContext
export const apiService = {
  // Authentication methods
  auth: {
    login: authService.login,
    register: authService.register,
    logout: authService.logout,
    refreshToken: authService.refreshToken,
    getCurrentUser: authService.getCurrentUser,
    updateProfile: authService.updateProfile,
    changePassword: authService.changePassword,
    resetPassword: authService.resetPassword,
    confirmResetPassword: authService.confirmResetPassword,
  },

  // Tourism data methods
  tourism: {
    getProvinces: tourismService.getProvinces,
    getDistricts: tourismService.getDistricts,
    getPlaces: tourismService.getPlaces,
    getPlace: tourismService.getPlace,
    searchPlaces: tourismService.searchPlaces,
    getPlacesByCategory: tourismService.getPlacesByCategory,
    getPopularPlaces: tourismService.getPopularPlaces,
    getNearbyPlaces: tourismService.getNearbyPlaces,
    submitFeedback: tourismService.submitFeedback,
    ratePlaces: tourismService.ratePlaces,
    getPlaceReviews: tourismService.getPlaceReviews,
    addPlaceReview: tourismService.addPlaceReview,
    getFavorites: tourismService.getFavorites,
    addToFavorites: tourismService.addToFavorites,
    removeFromFavorites: tourismService.removeFromFavorites,
  },

  // Chatbot methods
  chatbot: {
    sendMessage: chatbotService.sendMessage,
    getConversations: chatbotService.getConversations,
    getConversation: chatbotService.getConversation,
    createConversation: chatbotService.createConversation,
    deleteConversation: chatbotService.deleteConversation,
    clearConversation: chatbotService.clearConversation,
    getQuickReplies: chatbotService.getQuickReplies,
    getChatHistory: chatbotService.getChatHistory,
    exportChatHistory: chatbotService.exportChatHistory,
  },

  // Trip planner methods
  tripPlanner: {
    generateTripPlan: tripPlannerService.generateTripPlan,
    getTripPlans: tripPlannerService.getTripPlans,
    getTripPlan: tripPlannerService.getTripPlan,
    updateTripPlan: tripPlannerService.updateTripPlan,
    deleteTripPlan: tripPlannerService.deleteTripPlan,
    saveTripPlan: tripPlannerService.saveTripPlan,
    getTripTemplates: tripPlannerService.getTripTemplates,
    getTripTemplate: tripPlannerService.getTripTemplate,
    createFromTemplate: tripPlannerService.createFromTemplate,
    addActivity: tripPlannerService.addActivity,
    updateActivity: tripPlannerService.updateActivity,
    removeActivity: tripPlannerService.removeActivity,
    getTripRecommendations: tripPlannerService.getTripRecommendations,
    calculateTripCost: tripPlannerService.calculateTripCost,
    shareTripPlan: tripPlannerService.shareTripPlan,
    exportTripPlan: tripPlannerService.exportTripPlan,
    getTripStats: tripPlannerService.getTripStats,
  },

  // Helper methods for state management integration
  async withErrorHandling(apiCall, dispatch, errorAction) {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await apiCall();
      
      if (result.success) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return result;
      } else {
        dispatch({ type: errorAction, payload: result.error });
        dispatch({ type: 'ADD_NOTIFICATION', payload: {
          type: 'error',
          message: result.error
        }});
        return result;
      }
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred';
      dispatch({ type: errorAction, payload: errorMessage });
      dispatch({ type: 'ADD_NOTIFICATION', payload: {
        type: 'error',
        message: errorMessage
      }});
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: errorMessage };
    }
  },

  // Batch operations for better performance
  async batchFetch(requests, dispatch) {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const results = await Promise.allSettled(requests);
      
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
      const failed = results.filter(r => r.status === 'rejected' || !r.value.success);
      
      if (failed.length > 0) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: {
          type: 'warning',
          message: `${failed.length} requests failed out of ${requests.length}`
        }});
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
      return { successful: successful.map(r => r.value), failed };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'ADD_NOTIFICATION', payload: {
        type: 'error',
        message: 'Batch operation failed'
      }});
      throw error;
    }
  },

  // Cache management
  cache: {
    set(key, data, ttl = 300000) { // 5 minutes default
      const item = {
        data,
        timestamp: Date.now(),
        ttl
      };
      localStorage.setItem(`myguide_cache_${key}`, JSON.stringify(item));
    },

    get(key) {
      try {
        const item = JSON.parse(localStorage.getItem(`myguide_cache_${key}`));
        if (!item) return null;
        
        if (Date.now() - item.timestamp > item.ttl) {
          localStorage.removeItem(`myguide_cache_${key}`);
          return null;
        }
        
        return item.data;
      } catch {
        return null;
      }
    },

    clear(pattern = '') {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('myguide_cache_') && key.includes(pattern)
      );
      keys.forEach(key => localStorage.removeItem(key));
    }
  }
};

export default apiService;