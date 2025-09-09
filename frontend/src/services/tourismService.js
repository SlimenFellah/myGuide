/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import api from './authService';

export const tourismService = {
  // Provinces
  async getProvinces() {
    try {
      const response = await api.get('/tourism/provinces/');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch provinces',
      };
    }
  },

  async getProvince(id) {
    try {
      const response = await api.get(`/tourism/provinces/${id}/`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch province',
      };
    }
  },

  // Districts
  async getDistricts(provinceId = null) {
    try {
      const url = provinceId 
        ? `/tourism/districts/?province=${provinceId}`
        : '/tourism/districts/';
      const response = await api.get(url);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch districts',
      };
    }
  },

  // Municipalities
  async getMunicipalities(districtId = null) {
    try {
      const url = districtId 
        ? `/tourism/municipalities/?district=${districtId}`
        : '/tourism/municipalities/';
      const response = await api.get(url);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch municipalities',
      };
    }
  },

  // Places
  async getPlaces(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      
      const url = `/tourism/places/${params.toString() ? '?' + params.toString() : ''}`;
      const response = await api.get(url);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch places',
      };
    }
  },

  async getPlace(id) {
    try {
      const response = await api.get(`/tourism/places/${id}/`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch place',
      };
    }
  },

  async searchPlaces(query, filters = {}) {
    try {
      const params = new URLSearchParams({
        search: query,
        ...filters
      });
      
      const response = await api.get(`/tourism/places/?${params.toString()}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to search places',
      };
    }
  },

  // Feedback
  async addFeedback(placeId, feedbackData) {
    try {
      const response = await api.post(`/tourism/places/${placeId}/feedback/`, feedbackData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to add feedback',
      };
    }
  },

  async getFeedback(placeId) {
    try {
      const response = await api.get(`/tourism/places/${placeId}/feedback/`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch feedback',
      };
    }
  },

  // Categories and Types
  async getPlaceCategories() {
    try {
      const response = await api.get('/tourism/categories/');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch categories',
      };
    }
  },

  // Popular places
  async getPopularPlaces(limit = 10) {
    try {
      const response = await api.get(`/tourism/places/popular/?limit=${limit}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch popular places',
      };
    }
  },

  // Nearby places
  async getNearbyPlaces(latitude, longitude, radius = 10) {
    try {
      const response = await api.get(
        `/tourism/places/nearby/?lat=${latitude}&lng=${longitude}&radius=${radius}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch nearby places',
      };
    }
  },
};

export default tourismService;