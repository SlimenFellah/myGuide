import api, { API_BASE_URL } from './api'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const authService = {
  async login(email: string, password: string) {
    try {
      const res = await api.post('/auth/login/', { email, password })
      const { access, refresh, user } = res.data
      await AsyncStorage.setItem('access_token', access)
      await AsyncStorage.setItem('refresh_token', refresh)
      await AsyncStorage.setItem('user', JSON.stringify(user))
      return { success: true, data: res.data }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || err.message || 'Login failed' }
    }
  },

  async register(userData: Record<string, any>) {
    try {
      const res = await api.post('/auth/register/', userData)
      return { success: true, data: res.data }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || 'Registration failed' }
    }
  },

  async getCurrentUser() {
    try {
      const res = await api.get('/auth/profile/')
      return { success: true, data: res.data }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || 'Failed to get user' }
    }
  },

  async updateProfile(userData: Record<string, any>) {
    try {
      const res = await api.put('/auth/profile/', userData)
      await AsyncStorage.setItem('user', JSON.stringify(res.data))
      return { success: true, data: res.data }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || 'Profile update failed' }
    }
  },

  async changePassword(old_password: string, new_password: string) {
    try {
      const res = await api.post('/auth/password/change/', { old_password, new_password, new_password_confirm: new_password })
      return { success: true, data: res.data }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || err.response?.data?.message || 'Password change failed' }
    }
  },

  async logout() {
    try {
      const refresh_token = await AsyncStorage.getItem('refresh_token')
      if (refresh_token) {
        await api.post('/auth/logout/', { refresh_token })
      }
    } catch {}
    finally {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user'])
    }
  },

  async isAuthenticated() {
    const token = await AsyncStorage.getItem('access_token')
    return !!token
  },

  async getUser() {
    const userStr = await AsyncStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  async refreshTokenDirect() {
    const refresh = await AsyncStorage.getItem('refresh_token')
    if (!refresh) return null
    const res = await api.post('/auth/token/refresh/', { refresh })
    const { access } = res.data
    await AsyncStorage.setItem('access_token', access)
    return access
  },
}

export default authService
