import api from './api'

export const chatbotService = {
  async sendMessage(content: string, sessionId?: number | null) {
    try {
      const res = await api.post('/chatbot/messages/', { content, message_type: 'user', session: sessionId })
      return { success: true, data: res.data }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || 'Failed to send message' }
    }
  },

  async getOrCreateActiveSession() {
    try {
      const res = await api.get('/chatbot/sessions/active/')
      if (res.data.session) return { success: true, data: res.data.session }
      const createRes = await api.post('/chatbot/sessions/active/', { title: 'New Chat' })
      return { success: true, data: createRes.data }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || 'Failed to get session' }
    }
  },

  async getSessionMessages(sessionId: number) {
    try {
      const res = await api.get(`/chatbot/sessions/${sessionId}/messages/`)
      return { success: true, data: res.data }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || 'Failed to get messages' }
    }
  },
}

export default chatbotService
