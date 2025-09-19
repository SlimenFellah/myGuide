import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  theme: 'light',
  sidebarOpen: false,
  notifications: [],
  loading: {
    global: false,
    components: {}
  },
  modals: {
    tripDetails: {
      isOpen: false,
      tripId: null
    },
    settings: {
      isOpen: false
    },
    profile: {
      isOpen: false
    }
  },
  errors: {
    global: null,
    components: {}
  },
  searchFilters: {
    location: '',
    dateRange: null,
    budget: null,
    category: 'all'
  },
  currentPage: 'dashboard',
  breadcrumbs: []
};

// App slice
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // Theme management
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    // Sidebar management
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    
    // Notification management
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        ...action.payload
      };
      state.notifications.unshift(notification);
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    
    // Loading management
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    setComponentLoading: (state, action) => {
      const { component, loading } = action.payload;
      state.loading.components[component] = loading;
    },
    clearComponentLoading: (state, action) => {
      delete state.loading.components[action.payload];
    },
    
    // Modal management
    openModal: (state, action) => {
      const { modalName, data } = action.payload;
      if (state.modals[modalName]) {
        state.modals[modalName].isOpen = true;
        if (data) {
          Object.assign(state.modals[modalName], data);
        }
      }
    },
    closeModal: (state, action) => {
      const modalName = action.payload;
      if (state.modals[modalName]) {
        state.modals[modalName].isOpen = false;
        // Reset modal data except isOpen
        const keys = Object.keys(state.modals[modalName]);
        keys.forEach(key => {
          if (key !== 'isOpen') {
            state.modals[modalName][key] = null;
          }
        });
      }
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modalName => {
        state.modals[modalName].isOpen = false;
      });
    },
    
    // Error management
    setGlobalError: (state, action) => {
      state.errors.global = action.payload;
    },
    setComponentError: (state, action) => {
      const { component, error } = action.payload;
      state.errors.components[component] = error;
    },
    clearGlobalError: (state) => {
      state.errors.global = null;
    },
    clearComponentError: (state, action) => {
      delete state.errors.components[action.payload];
    },
    clearAllErrors: (state) => {
      state.errors.global = null;
      state.errors.components = {};
    },
    
    // Search filters
    setSearchFilters: (state, action) => {
      state.searchFilters = { ...state.searchFilters, ...action.payload };
    },
    clearSearchFilters: (state) => {
      state.searchFilters = {
        location: '',
        dateRange: null,
        budget: null,
        category: 'all'
      };
    },
    
    // Navigation
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },
    addBreadcrumb: (state, action) => {
      state.breadcrumbs.push(action.payload);
    },
    
    // Reset app state
    resetAppState: (state) => {
      return { ...initialState, theme: state.theme };
    }
  }
});

// Export actions
export const {
  setTheme,
  toggleTheme,
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
  clearNotifications,
  markNotificationAsRead,
  setGlobalLoading,
  setComponentLoading,
  clearComponentLoading,
  openModal,
  closeModal,
  closeAllModals,
  setGlobalError,
  setComponentError,
  clearGlobalError,
  clearComponentError,
  clearAllErrors,
  setSearchFilters,
  clearSearchFilters,
  setCurrentPage,
  setBreadcrumbs,
  addBreadcrumb,
  resetAppState
} = appSlice.actions;

// Selectors
export const selectApp = (state) => state.app;
export const selectTheme = (state) => state.app.theme;
export const selectSidebarOpen = (state) => state.app.sidebarOpen;
export const selectNotifications = (state) => state.app.notifications;
export const selectUnreadNotifications = (state) => 
  state.app.notifications.filter(n => !n.read);
export const selectGlobalLoading = (state) => state.app.loading.global;
export const selectComponentLoading = (component) => (state) => 
  state.app.loading.components[component] || false;
export const selectModals = (state) => state.app.modals;
export const selectModal = (modalName) => (state) => 
  state.app.modals[modalName] || { isOpen: false };
export const selectGlobalError = (state) => state.app.errors.global;
export const selectComponentError = (component) => (state) => 
  state.app.errors.components[component];
export const selectSearchFilters = (state) => state.app.searchFilters;
export const selectCurrentPage = (state) => state.app.currentPage;
export const selectBreadcrumbs = (state) => state.app.breadcrumbs;

// Export reducer
export default appSlice.reducer;