/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import api from './authService';

export const chatbotService = {
  // Send message to chatbot
  async sendMessage(message, conversationId = null) {
    try {
      const payload = {
        message,
        ...(conversationId && { conversation_id: conversationId })
      };
      
      const response = await api.post('/chatbot/chat/', payload);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to send message',
      };
    }
  },

  // Get user conversations
  async getConversations() {
    try {
      const response = await api.get('/chatbot/conversations/');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch conversations',
      };
    }
  },

  // Get conversation history
  async getConversation(conversationId) {
    try {
      const response = await api.get(`/chatbot/conversations/${conversationId}/`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch conversation',
      };
    }
  },

  // Create new conversation
  async createConversation(title = 'New Conversation') {
    try {
      const response = await api.post('/chatbot/conversations/', { title });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to create conversation',
      };
    }
  },

  // Delete conversation
  async deleteConversation(conversationId) {
    try {
      await api.delete(`/chatbot/conversations/${conversationId}/`);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to delete conversation',
      };
    }
  },

  // Update conversation title
  async updateConversation(conversationId, title) {
    try {
      const response = await api.patch(`/chatbot/conversations/${conversationId}/`, { title });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to update conversation',
      };
    }
  },

  // Get suggested questions
  async getSuggestedQuestions() {
    try {
      const response = await api.get('/chatbot/suggestions/');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch suggestions',
      };
    }
  },

  // Rate chatbot response
  async rateResponse(messageId, rating, feedback = null) {
    try {
      const payload = {
        rating,
        ...(feedback && { feedback })
      };
      
      const response = await api.post(`/chatbot/messages/${messageId}/rate/`, payload);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to rate response',
      };
    }
  },

  // Search in knowledge base
  async searchKnowledge(query) {
    try {
      const response = await api.get(`/chatbot/knowledge/search/?q=${encodeURIComponent(query)}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to search knowledge base',
      };
    }
  },

  // Get chat statistics
  async getChatStats() {
    try {
      const response = await api.get('/chatbot/stats/');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch chat statistics',
      };
    }
  },
};

export default chatbotService;