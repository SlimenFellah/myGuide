import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import tripPlannerService from '@/services/tripPlannerService'

export interface TripPlannerState {
    plans: any[]
    currentPlan: any | null
    isLoading: boolean
    error: string | null
    formData: {
        province: string
        tripType: string
        startDate: string
        endDate: string
        budget: string
        groupSize: number
        preferences: Record<string, boolean>
        allergies: string
        additionalNotes: string
    }
}

const initialState: TripPlannerState = {
    plans: [],
    currentPlan: null,
    isLoading: false,
    error: null,
    formData: {
        province: '',
        tripType: '',
        startDate: '',
        endDate: '',
        budget: '',
        groupSize: 1,
        preferences: {
            quietPlaces: false,
            restaurants: false,
            parks: false,
            historicSites: false,
            entertainment: false,
            shopping: false,
        },
        allergies: '',
        additionalNotes: '',
    },
}

export const generateTripPlan = createAsyncThunk(
    'tripPlanner/generate',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await tripPlannerService.generateTripPlan(data)
            if (response.success) return response.data
            return rejectWithValue(response.error)
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    }
)

export const getTripPlans = createAsyncThunk('tripPlanner/getAll', async (_, { rejectWithValue }) => {
    try {
        const response = await tripPlannerService.getTripPlans()
        if (response.success) return response.data
        return rejectWithValue(response.error)
    } catch (error: any) {
        return rejectWithValue(error.message)
    }
})

const tripPlannerSlice = createSlice({
    name: 'tripPlanner',
    initialState,
    reducers: {
        updateFormData: (state, action: PayloadAction<Partial<TripPlannerState['formData']>>) => {
            state.formData = { ...state.formData, ...action.payload }
            if (action.payload.preferences) {
                state.formData.preferences = { ...state.formData.preferences, ...action.payload.preferences }
            }
        },
        resetFormData: (state) => {
            state.formData = initialState.formData
        },
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(generateTripPlan.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(generateTripPlan.fulfilled, (state, action) => {
                state.isLoading = false
                state.currentPlan = action.payload
                state.plans.unshift(action.payload)
            })
            .addCase(generateTripPlan.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
            .addCase(getTripPlans.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getTripPlans.fulfilled, (state, action) => {
                state.isLoading = false
                state.plans = action.payload
            })
            .addCase(getTripPlans.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
    },
})

export const { updateFormData, resetFormData, clearError } = tripPlannerSlice.actions
export default tripPlannerSlice.reducer
