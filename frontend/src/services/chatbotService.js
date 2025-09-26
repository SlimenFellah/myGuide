import { api } from './authService';

const chatbotService = {
  // Send a message to the chatbot
  sendMessage: async (message, sessionId = null) => {
    try {
      const response = await api.post('/chatbot/messages/', {
        content: message,
        message_type: 'user',
        session: sessionId
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get all chat sessions for the user
  getSessions: async () => {
    try {
      const response = await api.get('/chatbot/sessions/');
      return response.data;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  },

  // Get a specific session
  getSession: async (sessionId) => {
    try {
      const response = await api.get(`/chatbot/sessions/${sessionId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching session:', error);
      throw error;
    }
  },

  // Create a new chat session
  createSession: async (title = 'New Chat') => {
    try {
      const response = await api.post('/chatbot/sessions/', {
        title: title
      });
      return response.data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  // Delete a chat session
  deleteSession: async (sessionId) => {
    try {
      const response = await api.delete(`/chatbot/sessions/${sessionId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  },

  // Update session title
  updateSession: async (sessionId, title) => {
    try {
      const response = await api.patch(`/chatbot/sessions/${sessionId}/`, {
        title: title
      });
      return response.data;
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  },

  // Get messages for a specific session
  getSessionMessages: async (sessionId) => {
    try {
      const response = await api.get(`/chatbot/sessions/${sessionId}/messages/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching session messages:', error);
      throw error;
    }
  },

  // Get or create an active session
  getOrCreateActiveSession: async () => {
    try {
      const response = await api.get('/chatbot/sessions/active/');
      if (response.data.session) {
        return response.data.session;
      } else {
        // Create a new session if none exists
        const createResponse = await api.post('/chatbot/sessions/active/', {
          title: 'New Chat'
        });
        return createResponse.data;
      }
    } catch (error) {
      console.error('Error getting or creating active session:', error);
      throw error;
    }
  },

  // Quick chat without session (legacy support)
  quickChat: async (message) => {
    try {
      const response = await api.post('/chatbot/chat/quick/', {
        message: message
      });
      return response.data;
    } catch (error) {
      console.error('Error in quick chat:', error);
      throw error;
    }
  },

  // Get chat suggestions
  getChatSuggestions: async () => {
    try {
      const response = await api.get('/chatbot/chat/suggestions/');
      return response.data;
    } catch (error) {
      console.error('Error fetching chat suggestions:', error);
      throw error;
    }
  }
};

export { chatbotService };
export default chatbotService;