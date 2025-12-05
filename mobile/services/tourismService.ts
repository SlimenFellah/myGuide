import api from './api'

export const tourismService = {
  async getProvinces() {
    try {
      const res = await api.get('/tourism/provinces/')
      return { success: true, data: res.data }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || 'Failed to fetch provinces' }
    }
  },

  async getDistricts(provinceId?: number) {
    try {
      const url = provinceId ? `/tourism/districts/?province=${provinceId}` : '/tourism/districts/'
      const res = await api.get(url)
      return { success: true, data: res.data }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || 'Failed to fetch districts' }
    }
  },

  async getPlaces(filters: Record<string, any> = {}) {
    try {
      const params = new URLSearchParams()
      Object.keys(filters).forEach(k => {
        const v = filters[k]
        if (v !== null && v !== undefined && v !== '') params.append(k, String(v))
      })
      const url = `/tourism/places/${params.toString() ? `?${params.toString()}` : ''}`
      const res = await api.get(url)
      return { success: true, data: res.data.results || res.data }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || 'Failed to fetch places' }
    }
  },

  async getPlace(id: number) {
    try {
      const res = await api.get(`/tourism/places/${id}/`)
      return { success: true, data: res.data }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || 'Failed to fetch place' }
    }
  },

  async getPopularPlaces() {
    try {
      const res = await api.get('/tourism/places/featured/')
      return { success: true, data: res.data }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || 'Failed to fetch popular places' }
    }
  },
}

export default tourismService
