import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import tourismService from '@/services/tourismService'

export interface TourismState {
    places: any[]
    featuredPlaces: any[]
    provinces: any[]
    isLoading: boolean
    error: string | null
}

const initialState: TourismState = {
    places: [],
    featuredPlaces: [],
    provinces: [],
    isLoading: false,
    error: null,
}

export const getPlaces = createAsyncThunk('tourism/getPlaces', async (filters: any, { rejectWithValue }) => {
    try {
        const response = await tourismService.getPlaces(filters)
        if (response.success) return response.data
        return rejectWithValue(response.error)
    } catch (error: any) {
        return rejectWithValue(error.message)
    }
})

export const getPopularPlaces = createAsyncThunk('tourism/getPopular', async (_, { rejectWithValue }) => {
    try {
        const response = await tourismService.getPopularPlaces()
        if (response.success) return response.data
        return rejectWithValue(response.error)
    } catch (error: any) {
        return rejectWithValue(error.message)
    }
})

const tourismSlice = createSlice({
    name: 'tourism',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getPlaces.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getPlaces.fulfilled, (state, action) => {
                state.isLoading = false
                state.places = action.payload
            })
            .addCase(getPlaces.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
            .addCase(getPopularPlaces.fulfilled, (state, action) => {
                state.featuredPlaces = action.payload
            })
    },
})

export default tourismSlice.reducer
