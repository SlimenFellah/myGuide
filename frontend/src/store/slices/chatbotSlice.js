import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chatbotService from '../../services/chatbotService';

// Async thunks
export const sendChatMessage = createAsyncThunk(
  'chatbot/sendMessage',
  async ({ message, sessionId = null }, { rejectWithValue }) => {
    try {
      const response = await chatbotService.sendMessage(message, sessionId);
      return response;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.error || error.message || 'Failed to send message'
      });
    }
  }
);

export const createSession = createAsyncThunk(
  'chatbot/createSession',
  async (title = 'New Chat', { rejectWithValue }) => {
    try {
      const response = await chatbotService.createSession(title);
      return response;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.error || error.message || 'Failed to create session'
      });
    }
  }
);

export const fetchSessions = createAsyncThunk(
  'chatbot/fetchSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatbotService.getSessions();
      return response;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.error || error.message || 'Failed to fetch sessions'
      });
    }
  }
);

export const fetchSessionMessages = createAsyncThunk(
  'chatbot/fetchSessionMessages',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await chatbotService.getSessionMessages(sessionId);
      return { sessionId, messages: response };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.error || error.message || 'Failed to fetch session messages'
      });
    }
  }
);

export const getOrCreateActiveSession = createAsyncThunk(
  'chatbot/getOrCreateActiveSession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatbotService.getOrCreateActiveSession();
      return response;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.error || error.message || 'Failed to get active session'
      });
    }
  }
);

export const deleteSession = createAsyncThunk(
  'chatbot/deleteSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      await chatbotService.deleteSession(sessionId);
      return sessionId;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.error || error.message || 'Failed to delete session'
      });
    }
  }
);

// Initial state
const initialState = {
  sessions: [],
  activeSession: null,
  messages: {}, // Messages organized by session ID
  isLoading: false,
  isSending: false,
  error: null,
  sendError: null
};

// Chatbot slice
const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    setActiveSession: (state, action) => {
      state.activeSession = action.payload;
    },
    clearActiveSession: (state) => {
      state.activeSession = null;
    },
    addMessage: (state, action) => {
      const { sessionId, message } = action.payload;
      if (!state.messages[sessionId]) {
        state.messages[sessionId] = [];
      }
      state.messages[sessionId].push(message);
    },
    addUserMessage: (state, action) => {
      const { sessionId, content } = action.payload;
      if (!state.messages[sessionId]) {
        state.messages[sessionId] = [];
      }
      state.messages[sessionId].push({
        id: Date.now() + Math.random(),
        content,
        message_type: 'user',
        created_at: new Date().toISOString()
      });
    },
    addBotMessage: (state, action) => {
      const { sessionId, content, messageId, confidence_score } = action.payload;
      if (!state.messages[sessionId]) {
        state.messages[sessionId] = [];
      }
      state.messages[sessionId].push({
        id: messageId || Date.now() + Math.random(),
        content,
        message_type: 'assistant',
        confidence_score: confidence_score || 0.8,
        created_at: new Date().toISOString()
      });
    },
    clearMessages: (state, action) => {
      const sessionId = action.payload;
      if (sessionId) {
        state.messages[sessionId] = [];
      } else {
        state.messages = {};
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSendError: (state) => {
      state.sendError = null;
    },
    updateSessionTitle: (state, action) => {
      const { sessionId, title } = action.payload;
      const session = state.sessions.find(s => s.id === sessionId);
      if (session) {
        session.title = title;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Send chat message
      .addCase(sendChatMessage.pending, (state, action) => {
        state.isSending = true;
        state.sendError = null;
        
        // Add user message immediately for better UX
        const { message, sessionId } = action.meta.arg;
        if (sessionId && message) {
          if (!state.messages[sessionId]) {
            state.messages[sessionId] = [];
          }
          state.messages[sessionId].push({
            id: Date.now() + Math.random(),
            content: message,
            message_type: 'user',
            created_at: new Date().toISOString()
          });
        }
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isSending = false;
        const response = action.payload;
        
        // Add bot response to messages
        if (response && response.session_id) {
          if (!state.messages[response.session_id]) {
            state.messages[response.session_id] = [];
          }
          state.messages[response.session_id].push({
            id: response.message_id || Date.now() + Math.random(),
            content: response.response,
            message_type: 'assistant',
            confidence_score: response.confidence_score || 0.8,
            created_at: new Date().toISOString()
          });
          
          // Update active session if this is the first message
          if (!state.activeSession) {
            state.activeSession = response.session_id;
          }
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isSending = false;
        state.sendError = action.payload?.message || 'Failed to send message';
      })
      
      // Create session
      .addCase(createSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.isLoading = false;
        const newSession = action.payload;
        state.sessions.unshift(newSession);
        state.activeSession = newSession.id;
        
        // Initialize messages for new session
        if (!state.messages[newSession.id]) {
          state.messages[newSession.id] = [];
        }
      })
      .addCase(createSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to create session';
      })
      
      // Fetch sessions
      .addCase(fetchSessions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessions = action.payload.results || action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch sessions';
      })
      
      // Fetch session messages
      .addCase(fetchSessionMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSessionMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        const { sessionId, messages } = action.payload;
        state.messages[sessionId] = messages.results || messages;
      })
      .addCase(fetchSessionMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch session messages';
      })
      
      // Get or create active session
      .addCase(getOrCreateActiveSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrCreateActiveSession.fulfilled, (state, action) => {
        state.isLoading = false;
        const session = action.payload;
        if (session && session.id) {
          // Add to sessions if not already there
          const existingSession = state.sessions.find(s => s.id === session.id);
          if (!existingSession) {
            state.sessions.unshift(session);
          }
          state.activeSession = session.id;
          
          // Initialize messages if not already there
          if (!state.messages[session.id]) {
            state.messages[session.id] = [];
          }
        }
      })
      .addCase(getOrCreateActiveSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to get active session';
      })
      
      // Delete session
      .addCase(deleteSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedSessionId = action.payload;
        
        // Remove session from list
        state.sessions = state.sessions.filter(s => s.id !== deletedSessionId);
        
        // Clear messages for deleted session
        delete state.messages[deletedSessionId];
        
        // Clear active session if it was deleted
        if (state.activeSession === deletedSessionId) {
          state.activeSession = state.sessions.length > 0 ? state.sessions[0].id : null;
        }
      })
      .addCase(deleteSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to delete session';
      });
  }
});

export const {
  setActiveSession,
  clearActiveSession,
  addMessage,
  addUserMessage,
  addBotMessage,
  clearMessages,
  clearError,
  clearSendError,
  updateSessionTitle
} = chatbotSlice.actions;

export default chatbotSlice.reducer;