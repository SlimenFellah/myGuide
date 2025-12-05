import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import tripPlannerReducer, { TripPlannerState } from './tripPlannerSlice'
import tourismReducer, { TourismState } from './tourismSlice'
import chatbotReducer, { ChatbotState } from './chatbotSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        tripPlanner: tripPlannerReducer,
        tourism: tourismReducer,
        chatbot: chatbotReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
