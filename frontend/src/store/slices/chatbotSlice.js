import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatbotService } from '../../services';

// Async thunks for chatbot functionality
export const sendChatMessage = createAsyncThunk(
  'chatbot/sendMessage',
  async ({ conversationId, message }, { rejectWithValue }) => {
    try {
      const response = await chatbotService.sendMessage(message, conversationId);
      if (!response.success) {
        return rejectWithValue({ message: response.error });
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to send message' });
    }
  }
);

export const createConversation = createAsyncThunk(
  'chatbot/createConversation',
  async (initialMessage, { rejectWithValue }) => {
    try {
      const response = await chatbotService.createConversation(initialMessage);
      if (!response.success) {
        return rejectWithValue({ message: response.error });
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create conversation' });
    }
  }
);

export const fetchConversations = createAsyncThunk(
  'chatbot/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatbotService.getConversations();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch conversations' });
    }
  }
);

export const fetchConversationHistory = createAsyncThunk(
  'chatbot/fetchConversationHistory',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await chatbotService.getConversationHistory(conversationId);
      return { conversationId, messages: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch conversation history' });
    }
  }
);

// Initial state
const initialState = {
  // Conversations
  conversations: [],
  activeConversation: null,
  
  // Messages
  messages: {},
  
  // UI state
  isLoading: false,
  isSending: false,
  
  // Errors
  error: null,
  sendError: null
};

// Chatbot slice
const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    // Conversation management
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    clearActiveConversation: (state) => {
      state.activeConversation = null;
    },
    
    // Message management
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push({
        ...message,
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString()
      });
    },
    
    addUserMessage: (state, action) => {
      const { conversationId, content } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push({
        id: Date.now() + Math.random(),
        content,
        sender: 'user',
        timestamp: new Date().toISOString()
      });
    },
    
    addBotMessage: (state, action) => {
      const { conversationId, content } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push({
        id: Date.now() + Math.random(),
        content,
        sender: 'bot',
        timestamp: new Date().toISOString()
      });
    },
    
    clearMessages: (state, action) => {
      const conversationId = action.payload;
      if (conversationId) {
        delete state.messages[conversationId];
      } else {
        state.messages = {};
      }
    },
    
    // Error management
    clearError: (state) => {
      state.error = null;
    },
    clearSendError: (state) => {
      state.sendError = null;
    }
  },
  extraReducers: (builder) => {
    // Send message
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.isSending = true;
        state.sendError = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isSending = false;
        const { conversationId, botResponse } = action.payload;
        
        // Add bot response to messages
        if (botResponse && conversationId) {
          if (!state.messages[conversationId]) {
            state.messages[conversationId] = [];
          }
          state.messages[conversationId].push({
            id: Date.now() + Math.random(),
            content: botResponse,
            sender: 'bot',
            timestamp: new Date().toISOString()
          });
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isSending = false;
        state.sendError = action.payload?.message || 'Failed to send message';
      })
      
      // Create conversation
      .addCase(createConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        const newConversation = action.payload;
        state.conversations.unshift(newConversation);
        state.activeConversation = newConversation.id;
        
        // Initialize messages for new conversation
        if (!state.messages[newConversation.id]) {
          state.messages[newConversation.id] = [];
        }
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to create conversation';
      })
      
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch conversations';
      })
      
      // Fetch conversation history
      .addCase(fetchConversationHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversationHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        const { conversationId, messages } = action.payload;
        state.messages[conversationId] = messages;
      })
      .addCase(fetchConversationHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch conversation history';
      });
  }
});

export const {
  setActiveConversation,
  clearActiveConversation,
  addMessage,
  addUserMessage,
  addBotMessage,
  clearMessages,
  clearError,
  clearSendError
} = chatbotSlice.actions;

export default chatbotSlice.reducer;