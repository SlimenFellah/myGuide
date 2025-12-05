import axios, { AxiosInstance } from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { Platform } from 'react-native'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:8000/api' : 'http://127.0.0.1:8000/api')

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false
let pendingRequests: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = []

const processPending = (error: any, token: string | null) => {
  pendingRequests.forEach(p => {
    if (error) p.reject(error)
    else if (token) p.resolve(token)
  })
  pendingRequests = []
}

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('access_token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject })
        }).then(async token => {
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refresh = await AsyncStorage.getItem('refresh_token')
        if (!refresh) throw new Error('No refresh token')

        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh })
        const { access } = refreshResponse.data
        await AsyncStorage.setItem('access_token', access)

        processPending(null, access)
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${access}`
        return api(originalRequest)
      } catch (refreshErr) {
        processPending(refreshErr, null)
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user'])
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api
export { API_BASE_URL }
