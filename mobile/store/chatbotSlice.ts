import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import chatbotService from '@/services/chatbotService'

export interface ChatbotState {
    messages: any[]
    session: any | null
    isLoading: boolean
    error: string | null
}

const initialState: ChatbotState = {
    messages: [],
    session: null,
    isLoading: false,
    error: null,
}

export const getOrCreateSession = createAsyncThunk('chatbot/getSession', async (_, { rejectWithValue }) => {
    try {
        const response = await chatbotService.getOrCreateActiveSession()
        if (response.success) return response.data
        return rejectWithValue(response.error)
    } catch (error: any) {
        return rejectWithValue(error.message)
    }
})

export const getMessages = createAsyncThunk('chatbot/getMessages', async (sessionId: number, { rejectWithValue }) => {
    try {
        const response = await chatbotService.getSessionMessages(sessionId)
        if (response.success) return response.data
        return rejectWithValue(response.error)
    } catch (error: any) {
        return rejectWithValue(error.message)
    }
})

export const sendMessage = createAsyncThunk(
    'chatbot/sendMessage',
    async ({ text, sessionId }: { text: string; sessionId: number }, { dispatch, rejectWithValue }) => {
        try {
            const response = await chatbotService.sendMessage(text, sessionId)
            if (response.success) {
                dispatch(getMessages(sessionId))
                return response.data
            }
            return rejectWithValue(response.error)
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    }
)

const chatbotSlice = createSlice({
    name: 'chatbot',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getOrCreateSession.fulfilled, (state, action) => {
                state.session = action.payload
            })
            .addCase(getMessages.fulfilled, (state, action) => {
                state.messages = action.payload
            })
    },
})

export default chatbotSlice.reducer
