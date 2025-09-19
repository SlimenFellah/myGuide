import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tourismService } from '../../services';

// Async thunks for tourism data
export const fetchProvinces = createAsyncThunk(
  'tourism/fetchProvinces',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tourismService.getProvinces();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch provinces' });
    }
  }
);

export const fetchDistricts = createAsyncThunk(
  'tourism/fetchDistricts',
  async (provinceId, { rejectWithValue }) => {
    try {
      const response = await tourismService.getDistricts(provinceId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch districts' });
    }
  }
);

export const fetchMunicipalities = createAsyncThunk(
  'tourism/fetchMunicipalities',
  async (districtId, { rejectWithValue }) => {
    try {
      const response = await tourismService.getMunicipalities(districtId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch municipalities' });
    }
  }
);

export const fetchPlaces = createAsyncThunk(
  'tourism/fetchPlaces',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await tourismService.getPlaces(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch places' });
    }
  }
);

export const searchPlaces = createAsyncThunk(
  'tourism/searchPlaces',
  async ({ query, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await tourismService.searchPlaces(query, filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to search places' });
    }
  }
);

// Initial state
const initialState = {
  // Data
  provinces: [],
  districts: [],
  municipalities: [],
  places: [],
  
  // Selected items
  selectedProvince: null,
  selectedDistrict: null,
  selectedPlace: null,
  
  // Search & Filters
  searchQuery: '',
  searchResults: [],
  filters: {
    category: '',
    priceRange: '',
    rating: 0,
    location: ''
  },
  
  // Loading states
  isLoading: false,
  isSearching: false,
  
  // Error states
  error: null,
  searchError: null
};

// Tourism slice
const tourismSlice = createSlice({
  name: 'tourism',
  initialState,
  reducers: {
    // Selection actions
    setSelectedProvince: (state, action) => {
      state.selectedProvince = action.payload;
      state.selectedDistrict = null;
      state.selectedPlace = null;
      state.districts = [];
      state.municipalities = [];
    },
    setSelectedDistrict: (state, action) => {
      state.selectedDistrict = action.payload;
      state.selectedPlace = null;
      state.municipalities = [];
    },
    setSelectedPlace: (state, action) => {
      state.selectedPlace = action.payload;
    },
    
    // Search actions
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.searchQuery = '';
      state.searchResults = [];
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchError = null;
    },
    
    // Clear errors
    clearError: (state) => {
      state.error = null;
    },
    clearSearchError: (state) => {
      state.searchError = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch provinces
    builder
      .addCase(fetchProvinces.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProvinces.fulfilled, (state, action) => {
        state.isLoading = false;
        state.provinces = action.payload.success ? action.payload.data : [];
      })
      .addCase(fetchProvinces.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch provinces';
      })
      
      // Fetch districts
      .addCase(fetchDistricts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDistricts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.districts = action.payload.success ? action.payload.data : [];
      })
      .addCase(fetchDistricts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch districts';
      })
      
      // Fetch municipalities
      .addCase(fetchMunicipalities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMunicipalities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.municipalities = action.payload.success ? action.payload.data : [];
      })
      .addCase(fetchMunicipalities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch municipalities';
      })
      
      // Fetch places
      .addCase(fetchPlaces.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlaces.fulfilled, (state, action) => {
        state.isLoading = false;
        state.places = action.payload.success ? action.payload.data : [];
      })
      .addCase(fetchPlaces.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch places';
      })
      
      // Search places
      .addCase(searchPlaces.pending, (state) => {
        state.isSearching = true;
        state.searchError = null;
      })
      .addCase(searchPlaces.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload.success ? action.payload.data : [];
      })
      .addCase(searchPlaces.rejected, (state, action) => {
        state.isSearching = false;
        state.searchError = action.payload?.message || 'Failed to search places';
      });
  }
});

export const {
  setSelectedProvince,
  setSelectedDistrict,
  setSelectedPlace,
  setSearchQuery,
  setFilters,
  clearFilters,
  clearSearchResults,
  clearError,
  clearSearchError
} = tourismSlice.actions;

export default tourismSlice.reducer;