/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { tourismService, chatbotService, tripPlannerService } from '../services';

// Initial state
const initialState = {
  // UI State
  loading: false,
  error: null,
  notification: null,
  
  // Tourism Data
  provinces: [],
  districts: [],
  municipalities: [],
  places: [],
  selectedProvince: null,
  selectedDistrict: null,
  selectedPlace: null,
  
  // Search & Filters
  searchQuery: '',
  filters: {
    category: '',
    priceRange: '',
    rating: 0,
    location: ''
  },
  
  // Chatbot State
  conversations: [],
  activeConversation: null,
  chatLoading: false,
  
  // Trip Planner State
  trips: [],
  activeTrip: null,
  savedPlans: [],
  favorites: [],
  tripPlannerData: {
    province: '',
    tripType: '',
    startDate: '',
    endDate: '',
    budget: '',
    groupSize: 1,
    preferences: {},
    allergies: '',
    additionalNotes: ''
  },
  
  // User Preferences
  preferences: {
    theme: 'light',
    language: 'en',
    notifications: true
  }
};

// Action types
const ActionTypes = {
  // UI Actions
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_NOTIFICATION: 'SET_NOTIFICATION',
  CLEAR_ERROR: 'CLEAR_ERROR',
  CLEAR_NOTIFICATION: 'CLEAR_NOTIFICATION',
  
  // Tourism Actions
  SET_PROVINCES: 'SET_PROVINCES',
  SET_DISTRICTS: 'SET_DISTRICTS',
  SET_MUNICIPALITIES: 'SET_MUNICIPALITIES',
  SET_PLACES: 'SET_PLACES',
  SET_SELECTED_PROVINCE: 'SET_SELECTED_PROVINCE',
  SET_SELECTED_DISTRICT: 'SET_SELECTED_DISTRICT',
  SET_SELECTED_PLACE: 'SET_SELECTED_PLACE',
  
  // Search & Filter Actions
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  
  // Chatbot Actions
  SET_CONVERSATIONS: 'SET_CONVERSATIONS',
  SET_ACTIVE_CONVERSATION: 'SET_ACTIVE_CONVERSATION',
  ADD_MESSAGE: 'ADD_MESSAGE',
  ADD_CHAT_MESSAGE: 'ADD_CHAT_MESSAGE',
  SET_CHAT_LOADING: 'SET_CHAT_LOADING',
  
  // Trip Planner Actions
  SET_TRIPS: 'SET_TRIPS',
  SET_ACTIVE_TRIP: 'SET_ACTIVE_TRIP',
  SET_SAVED_PLANS: 'SET_SAVED_PLANS',
  SET_FAVORITES: 'SET_FAVORITES',
  ADD_TO_FAVORITES: 'ADD_TO_FAVORITES',
  REMOVE_FROM_FAVORITES: 'REMOVE_FROM_FAVORITES',
  UPDATE_TRIP_PLANNER_DATA: 'UPDATE_TRIP_PLANNER_DATA',
  RESET_TRIP_PLANNER_DATA: 'RESET_TRIP_PLANNER_DATA',
  
  // Preferences Actions
  SET_PREFERENCES: 'SET_PREFERENCES',
  UPDATE_PREFERENCE: 'UPDATE_PREFERENCE'
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    // UI Actions
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ActionTypes.SET_NOTIFICATION:
      return { ...state, notification: action.payload };
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    case ActionTypes.CLEAR_NOTIFICATION:
      return { ...state, notification: null };
    
    // Tourism Actions
    case ActionTypes.SET_PROVINCES:
      return { ...state, provinces: action.payload };
    case ActionTypes.SET_DISTRICTS:
      return { ...state, districts: action.payload };
    case ActionTypes.SET_MUNICIPALITIES:
      return { ...state, municipalities: action.payload };
    case ActionTypes.SET_PLACES:
      return { ...state, places: action.payload };
    case ActionTypes.SET_SELECTED_PROVINCE:
      return { ...state, selectedProvince: action.payload, selectedDistrict: null, selectedPlace: null };
    case ActionTypes.SET_SELECTED_DISTRICT:
      return { ...state, selectedDistrict: action.payload, selectedPlace: null };
    case ActionTypes.SET_SELECTED_PLACE:
      return { ...state, selectedPlace: action.payload };
    
    // Search & Filter Actions
    case ActionTypes.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };
    case ActionTypes.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case ActionTypes.CLEAR_FILTERS:
      return { ...state, filters: initialState.filters, searchQuery: '' };
    
    // Chatbot Actions
    case ActionTypes.SET_CONVERSATIONS:
      return { ...state, conversations: action.payload };
    case ActionTypes.SET_ACTIVE_CONVERSATION:
      return { ...state, activeConversation: action.payload };
    case ActionTypes.ADD_MESSAGE:
      if (state.activeConversation) {
        const updatedConversation = {
          ...state.activeConversation,
          messages: [...(state.activeConversation.messages || []), action.payload]
        };
        return { ...state, activeConversation: updatedConversation };
      }
      return state;
    case ActionTypes.ADD_CHAT_MESSAGE:
      if (state.activeConversation) {
        const updatedConversation = {
          ...state.activeConversation,
          messages: [...(state.activeConversation.messages || []), action.payload]
        };
        return { ...state, activeConversation: updatedConversation };
      }
      return state;
    case ActionTypes.SET_CHAT_LOADING:
      return { ...state, chatLoading: action.payload };
    
    // Trip Planner Actions
    case ActionTypes.SET_TRIPS:
      return { ...state, trips: action.payload };
    case ActionTypes.SET_ACTIVE_TRIP:
      return { ...state, activeTrip: action.payload };
    case ActionTypes.SET_SAVED_PLANS:
      return { ...state, savedPlans: action.payload };
    case ActionTypes.SET_FAVORITES:
      return { ...state, favorites: action.payload };
    case ActionTypes.ADD_TO_FAVORITES:
      return { ...state, favorites: [...state.favorites, action.payload] };
    case ActionTypes.REMOVE_FROM_FAVORITES:
      return { ...state, favorites: state.favorites.filter(item => item.id !== action.payload) };
    case ActionTypes.UPDATE_TRIP_PLANNER_DATA:
      return { 
        ...state, 
        tripPlannerData: { ...state.tripPlannerData, ...action.payload } 
      };
    case ActionTypes.RESET_TRIP_PLANNER_DATA:
      return { ...state, tripPlannerData: initialState.tripPlannerData };
    
    // Preferences Actions
    case ActionTypes.SET_PREFERENCES:
      return { ...state, preferences: action.payload };
    case ActionTypes.UPDATE_PREFERENCE:
      return { 
        ...state, 
        preferences: { ...state.preferences, [action.key]: action.value } 
      };
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Custom hook to use the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Keep the old export for backward compatibility
export const useApp = useAppContext;

// App Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators
  const actions = {
    // UI Actions
    setLoading: (loading) => dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
    setNotification: (notification) => dispatch({ type: ActionTypes.SET_NOTIFICATION, payload: notification }),
    clearError: () => dispatch({ type: ActionTypes.CLEAR_ERROR }),
    clearNotification: () => dispatch({ type: ActionTypes.CLEAR_NOTIFICATION }),
    
    // Tourism Actions
    setProvinces: (provinces) => dispatch({ type: ActionTypes.SET_PROVINCES, payload: provinces }),
    setDistricts: (districts) => dispatch({ type: ActionTypes.SET_DISTRICTS, payload: districts }),
    setMunicipalities: (municipalities) => dispatch({ type: ActionTypes.SET_MUNICIPALITIES, payload: municipalities }),
    setPlaces: (places) => dispatch({ type: ActionTypes.SET_PLACES, payload: places }),
    setSelectedProvince: (province) => dispatch({ type: ActionTypes.SET_SELECTED_PROVINCE, payload: province }),
    setSelectedDistrict: (district) => dispatch({ type: ActionTypes.SET_SELECTED_DISTRICT, payload: district }),
    setSelectedPlace: (place) => dispatch({ type: ActionTypes.SET_SELECTED_PLACE, payload: place }),
    
    // Search & Filter Actions
    setSearchQuery: (query) => dispatch({ type: ActionTypes.SET_SEARCH_QUERY, payload: query }),
    setFilters: (filters) => dispatch({ type: ActionTypes.SET_FILTERS, payload: filters }),
    clearFilters: () => dispatch({ type: ActionTypes.CLEAR_FILTERS }),
    
    // Chatbot Actions
    setConversations: (conversations) => dispatch({ type: ActionTypes.SET_CONVERSATIONS, payload: conversations }),
    setActiveConversation: (conversation) => dispatch({ type: ActionTypes.SET_ACTIVE_CONVERSATION, payload: conversation }),
    addMessage: (message) => dispatch({ type: ActionTypes.ADD_MESSAGE, payload: message }),
    setChatLoading: (loading) => dispatch({ type: ActionTypes.SET_CHAT_LOADING, payload: loading }),
    
    // Trip Planner Actions
    setTrips: (trips) => dispatch({ type: ActionTypes.SET_TRIPS, payload: trips }),
    setActiveTrip: (trip) => dispatch({ type: ActionTypes.SET_ACTIVE_TRIP, payload: trip }),
    updateTripPlannerData: (data) => dispatch({ type: ActionTypes.UPDATE_TRIP_PLANNER_DATA, payload: data }),
    resetTripPlannerData: () => dispatch({ type: ActionTypes.RESET_TRIP_PLANNER_DATA }),
    
    // Preferences Actions
    setPreferences: (preferences) => dispatch({ type: ActionTypes.SET_PREFERENCES, payload: preferences }),
    updatePreference: (key, value) => dispatch({ type: ActionTypes.UPDATE_PREFERENCE, key, value }),
    
    // API Actions
    async fetchProvinces() {
      // Prevent duplicate API calls if provinces are already loaded
      if (state.provinces.length > 0) {
        return;
      }
      
      actions.setLoading(true);
      try {
        const result = await tourismService.getProvinces();
        if (result.success) {
          actions.setProvinces(result.data);
        } else {
          actions.setError(result.error);
        }
      } catch (error) {
        actions.setError('Failed to fetch provinces');
      } finally {
        actions.setLoading(false);
      }
    },
    
    async fetchDistricts(provinceId) {
      actions.setLoading(true);
      try {
        const result = await tourismService.getDistricts(provinceId);
        if (result.success) {
          actions.setDistricts(result.data);
        } else {
          actions.setError(result.error);
        }
      } catch (error) {
        actions.setError('Failed to fetch districts');
      } finally {
        actions.setLoading(false);
      }
    },
    
    async fetchPlaces(filters = {}) {
      actions.setLoading(true);
      try {
        const result = await tourismService.getPlaces(filters);
        if (result.success) {
          actions.setPlaces(result.data);
        } else {
          actions.setError(result.error);
        }
      } catch (error) {
        actions.setError('Failed to fetch places');
      } finally {
        actions.setLoading(false);
      }
    },
    
    async searchPlaces(filters = {}) {
      actions.setLoading(true);
      try {
        const { search, ...otherFilters } = filters;
        const result = await tourismService.searchPlaces(search || '', otherFilters);
        if (result.success) {
          actions.setPlaces(result.data);
        } else {
          actions.setError(result.error);
        }
      } catch (error) {
        actions.setError('Failed to search places');
      } finally {
        actions.setLoading(false);
      }
    },
    
    async sendChatMessage(conversationId, message) {
      actions.setChatLoading(true);
      try {
        const result = await chatbotService.sendMessage(message, conversationId);
        if (result.success) {
          // Transform API response to message format
          const botMessage = {
            id: result.data.message_id,
            content: result.data.response,
            type: 'assistant',
            timestamp: new Date(),
            confidence_score: result.data.confidence_score,
            sources: result.data.sources || [],
            suggestions: result.data.suggestions || []
          };
          actions.addMessage(botMessage);
          return botMessage;
        } else {
          actions.setError(result.error);
          return null;
        }
      } catch (error) {
        actions.setError('Failed to send message');
        return null;
      } finally {
        actions.setChatLoading(false);
      }
    },

    async generateTripPlan(tripData) {
      actions.setLoading(true);
      try {
        const result = await tripPlannerService.generateTripPlan(tripData);
        if (result.success) {
          actions.setActiveTrip(result.data);
          return result.data;
        } else {
          actions.setError(result.error);
          throw new Error(result.error);
        }
      } catch (error) {
        actions.setError('Failed to generate trip plan');
        throw error;
      } finally {
        actions.setLoading(false);
      }
    },

    async saveTripPlan(tripData) {
      actions.setLoading(true);
      try {
        const result = await tripPlannerService.saveTripPlan(tripData);
        if (result.success) {
          // Add to saved plans
          const currentSavedPlans = state.savedPlans || [];
          dispatch({ 
            type: ActionTypes.SET_SAVED_PLANS, 
            payload: [...currentSavedPlans, result.data] 
          });
          return result.data;
        } else {
          actions.setError(result.error);
          throw new Error(result.error);
        }
      } catch (error) {
        actions.setError('Failed to save trip plan');
        throw error;
      } finally {
        actions.setLoading(false);
      }
    },

    fetchSavedPlans: useCallback(async () => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      try {
        // Fetch user's own trip plans instead of saved public trip plans
        const result = await tripPlannerService.getTripPlans();
        if (result.success) {
          dispatch({ 
            type: ActionTypes.SET_SAVED_PLANS, 
            payload: result.data.results || result.data || [] 
          });
          return result.data;
        } else {
          dispatch({ type: ActionTypes.SET_ERROR, payload: result.error });
          throw new Error(result.error);
        }
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: 'Failed to fetch trip plans' });
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    }, [dispatch])
  };

  // Load initial data
  useEffect(() => {
    actions.fetchProvinces();
  }, []);

  const value = {
    state,
    dispatch,
    ...actions
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;