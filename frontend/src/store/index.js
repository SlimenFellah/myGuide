import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import appReducer from './slices/appSlice';
import tourismReducer from './slices/tourismSlice';
import chatbotReducer from './slices/chatbotSlice';
import tripPlannerReducer from './slices/tripPlannerSlice';

// Configure the Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    app: appReducer,
    tourism: tourismReducer,
    chatbot: chatbotReducer,
    tripPlanner: tripPlannerReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Expose store to window for axios interceptor access
if (typeof window !== 'undefined') {
  window.__REDUX_STORE__ = store;
}

// Types would be exported here if using TypeScript
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

export default store;