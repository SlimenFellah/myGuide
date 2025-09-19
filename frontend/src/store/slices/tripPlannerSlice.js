import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tripPlannerService } from '../../services';

// Async thunks for trip planner functionality
export const generateTripPlan = createAsyncThunk(
  'tripPlanner/generatePlan',
  async (tripData, { rejectWithValue }) => {
    try {
      const response = await tripPlannerService.generateTrip(tripData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to generate trip plan' });
    }
  }
);

export const saveTripPlan = createAsyncThunk(
  'tripPlanner/savePlan',
  async (tripPlan, { rejectWithValue }) => {
    try {
      const response = await tripPlannerService.saveTrip(tripPlan);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to save trip plan' });
    }
  }
);

export const fetchSavedTrips = createAsyncThunk(
  'tripPlanner/fetchSavedTrips',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tripPlannerService.getSavedTrips();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch saved trips' });
    }
  }
);

export const deleteTripPlan = createAsyncThunk(
  'tripPlanner/deletePlan',
  async (tripId, { rejectWithValue }) => {
    try {
      await tripPlannerService.deleteTrip(tripId);
      return tripId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete trip plan' });
    }
  }
);

export const addToFavorites = createAsyncThunk(
  'tripPlanner/addToFavorites',
  async (placeId, { rejectWithValue }) => {
    try {
      const response = await tripPlannerService.addToFavorites(placeId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to add to favorites' });
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  'tripPlanner/removeFromFavorites',
  async (placeId, { rejectWithValue }) => {
    try {
      await tripPlannerService.removeFromFavorites(placeId);
      return placeId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to remove from favorites' });
    }
  }
);

export const fetchFavorites = createAsyncThunk(
  'tripPlanner/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tripPlannerService.getFavorites();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch favorites' });
    }
  }
);

// Initial state
const initialState = {
  // Trip data
  trips: [],
  savedPlans: [],
  activeTrip: null,
  generatedPlan: null,
  
  // Trip planner form data
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
  
  // Favorites
  favorites: [],
  
  // Loading states
  isLoading: false,
  isGenerating: false,
  isSaving: false,
  
  // Error states
  error: null,
  generateError: null,
  saveError: null
};

// Trip planner slice
const tripPlannerSlice = createSlice({
  name: 'tripPlanner',
  initialState,
  reducers: {
    // Trip planner data management
    updateTripPlannerData: (state, action) => {
      state.tripPlannerData = { ...state.tripPlannerData, ...action.payload };
    },
    resetTripPlannerData: (state) => {
      state.tripPlannerData = initialState.tripPlannerData;
    },
    
    // Trip management
    setActiveTrip: (state, action) => {
      state.activeTrip = action.payload;
    },
    clearActiveTrip: (state) => {
      state.activeTrip = null;
    },
    
    // Generated plan management
    setGeneratedPlan: (state, action) => {
      state.generatedPlan = action.payload;
    },
    clearGeneratedPlan: (state) => {
      state.generatedPlan = null;
    },
    
    // Local favorites management (optimistic updates)
    addToFavoritesLocal: (state, action) => {
      const place = action.payload;
      if (!state.favorites.find(fav => fav.id === place.id)) {
        state.favorites.push(place);
      }
    },
    removeFromFavoritesLocal: (state, action) => {
      const placeId = action.payload;
      state.favorites = state.favorites.filter(fav => fav.id !== placeId);
    },
    
    // Error management
    clearError: (state) => {
      state.error = null;
    },
    clearGenerateError: (state) => {
      state.generateError = null;
    },
    clearSaveError: (state) => {
      state.saveError = null;
    }
  },
  extraReducers: (builder) => {
    // Generate trip plan
    builder
      .addCase(generateTripPlan.pending, (state) => {
        state.isGenerating = true;
        state.generateError = null;
      })
      .addCase(generateTripPlan.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.generatedPlan = action.payload;
      })
      .addCase(generateTripPlan.rejected, (state, action) => {
        state.isGenerating = false;
        state.generateError = action.payload?.message || 'Failed to generate trip plan';
      })
      
      // Save trip plan
      .addCase(saveTripPlan.pending, (state) => {
        state.isSaving = true;
        state.saveError = null;
      })
      .addCase(saveTripPlan.fulfilled, (state, action) => {
        state.isSaving = false;
        const savedTrip = action.payload;
        state.savedPlans.unshift(savedTrip);
        state.trips.unshift(savedTrip);
      })
      .addCase(saveTripPlan.rejected, (state, action) => {
        state.isSaving = false;
        state.saveError = action.payload?.message || 'Failed to save trip plan';
      })
      
      // Fetch saved trips
      .addCase(fetchSavedTrips.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSavedTrips.fulfilled, (state, action) => {
        state.isLoading = false;
        state.savedPlans = action.payload;
        state.trips = action.payload;
      })
      .addCase(fetchSavedTrips.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch saved trips';
      })
      
      // Delete trip plan
      .addCase(deleteTripPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTripPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        const tripId = action.payload;
        state.savedPlans = state.savedPlans.filter(trip => trip.id !== tripId);
        state.trips = state.trips.filter(trip => trip.id !== tripId);
        if (state.activeTrip?.id === tripId) {
          state.activeTrip = null;
        }
      })
      .addCase(deleteTripPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to delete trip plan';
      })
      
      // Add to favorites
      .addCase(addToFavorites.fulfilled, (state, action) => {
        const favorite = action.payload;
        if (!state.favorites.find(fav => fav.id === favorite.id)) {
          state.favorites.push(favorite);
        }
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to add to favorites';
      })
      
      // Remove from favorites
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        const placeId = action.payload;
        state.favorites = state.favorites.filter(fav => fav.id !== placeId);
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to remove from favorites';
      })
      
      // Fetch favorites
      .addCase(fetchFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch favorites';
      });
  }
});

export const {
  updateTripPlannerData,
  resetTripPlannerData,
  setActiveTrip,
  clearActiveTrip,
  setGeneratedPlan,
  clearGeneratedPlan,
  addToFavoritesLocal,
  removeFromFavoritesLocal,
  clearError,
  clearGenerateError,
  clearSaveError
} = tripPlannerSlice.actions;

export default tripPlannerSlice.reducer;