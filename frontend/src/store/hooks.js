import { useDispatch, useSelector } from 'react-redux';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Custom hooks for common selectors
export const useAuth = () => {
  return useAppSelector((state) => state.auth);
};

export const useUser = () => {
  return useAppSelector((state) => state.user);
};

export const useApp = () => {
  return useAppSelector((state) => state.app);
};

// Specific auth hooks
export const useIsAuthenticated = () => {
  return useAppSelector((state) => state.auth.isAuthenticated);
};

export const useCurrentUser = () => {
  return useAppSelector((state) => state.auth.user);
};

export const useIsAdmin = () => {
  return useAppSelector((state) => state.auth.user?.is_admin || false);
};

export const useAuthLoading = () => {
  return useAppSelector((state) => state.auth.isLoading);
};

export const useAuthError = () => {
  return useAppSelector((state) => state.auth.error);
};

// App state hooks
export const useTheme = () => {
  return useAppSelector((state) => state.app.theme);
};

export const useNotifications = () => {
  return useAppSelector((state) => state.app.notifications);
};

export const useGlobalLoading = () => {
  return useAppSelector((state) => state.app.loading.global);
};

export const useComponentLoading = (component) => {
  return useAppSelector((state) => state.app.loading.components[component] || false);
};

export const useModal = (modalName) => {
  return useAppSelector((state) => state.app.modals[modalName] || { isOpen: false });
};

// User data hooks
export const useUserProfile = () => {
  return useAppSelector((state) => state.user.profile);
};

export const useUserTrips = () => {
  return useAppSelector((state) => state.user.trips);
};

export const useUserPreferences = () => {
  return useAppSelector((state) => state.user.preferences);
};

export const useSearchFilters = () => {
  return useAppSelector((state) => state.app.searchFilters);
};

// Error management hooks
export const useGlobalError = () => {
  return useAppSelector((state) => state.app.errors.global);
};

export const useComponentError = (component) => {
  return useAppSelector((state) => state.app.errors.components[component] || null);
};

// Tourism hooks
export const useTourismData = () => {
  return useAppSelector((state) => state.tourism);
};

export const useProvinces = () => {
  return useAppSelector((state) => state.tourism.provinces);
};

export const useDistricts = () => {
  return useAppSelector((state) => state.tourism.districts);
};

export const usePlaces = () => {
  return useAppSelector((state) => state.tourism.places);
};

export const useSearchResults = () => {
  return useAppSelector((state) => state.tourism.searchResults);
};

export const useTourismLoading = () => {
  return useAppSelector((state) => state.tourism.isLoading);
};

export const useTourismError = () => {
  return useAppSelector((state) => state.tourism.error);
};

// Chatbot hooks
export const useChatbotData = () => {
  return useAppSelector((state) => state.chatbot);
};

export const useConversations = () => {
  return useAppSelector((state) => state.chatbot.conversations);
};

export const useActiveConversation = () => {
  return useAppSelector((state) => state.chatbot.activeConversation);
};

export const useChatMessages = (conversationId) => {
  return useAppSelector((state) => state.chatbot.messages[conversationId] || []);
};

export const useChatLoading = () => {
  return useAppSelector((state) => state.chatbot.isLoading);
};

export const useChatSending = () => {
  return useAppSelector((state) => state.chatbot.isSending);
};

// Trip Planner hooks
export const useTripPlannerData = () => {
  return useAppSelector((state) => state.tripPlanner);
};

export const useTrips = () => {
  return useAppSelector((state) => state.tripPlanner.trips);
};

export const useSavedPlans = () => {
  return useAppSelector((state) => state.tripPlanner.savedPlans);
};

export const useActiveTrip = () => {
  return useAppSelector((state) => state.tripPlanner.activeTrip);
};

export const useGeneratedPlan = () => {
  return useAppSelector((state) => state.tripPlanner.generatedPlan);
};

export const useTripPlannerFormData = () => {
  return useAppSelector((state) => state.tripPlanner.tripPlannerData);
};

export const useFavorites = () => {
  return useAppSelector((state) => state.tripPlanner.favorites);
};

export const useTripPlannerLoading = () => {
  return useAppSelector((state) => state.tripPlanner.isLoading);
};

export const useTripGenerating = () => {
  return useAppSelector((state) => state.tripPlanner.isGenerating);
};