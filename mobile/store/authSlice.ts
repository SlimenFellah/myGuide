import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authService } from '@/services/authService'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface User {
    id: number
    email: string
    full_name: string
}

interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
}

export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }: any, { rejectWithValue }) => {
        try {
            const response = await authService.login(email, password)
            if (response.success) {
                // authService already stores tokens
                return response.data // { access, refresh, user }
            }
            return rejectWithValue(response.error)
        } catch (error: any) {
            return rejectWithValue(error.message || 'Login failed')
        }
    }
)

export const register = createAsyncThunk(
    'auth/register',
    async (userData: any, { rejectWithValue }) => {
        try {
            const response = await authService.register(userData)
            if (response.success) {
                return response.data
            }
            return rejectWithValue(response.error)
        } catch (error: any) {
            return rejectWithValue(error.message || 'Registration failed')
        }
    }
)

export const logout = createAsyncThunk('auth/logout', async () => {
    await authService.logout()
})

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
    try {
        const token = await AsyncStorage.getItem('access_token')
        if (!token) return rejectWithValue('No token')
        const user = await authService.getUser()
        return { user, token }
    } catch (error) {
        return rejectWithValue('Failed to fetch user')
    }
})

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false
                state.isAuthenticated = true
                state.user = action.payload.user
                state.token = action.payload.access
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
            .addCase(register.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false
                state.isAuthenticated = true
                state.user = action.payload.user
                state.token = action.payload.access
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null
                state.token = null
                state.isAuthenticated = false
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.isAuthenticated = true
                state.user = action.payload.user
                state.token = action.payload.token
            })
            .addCase(checkAuth.rejected, (state) => {
                state.isAuthenticated = false
                state.user = null
                state.token = null
            })
    },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
