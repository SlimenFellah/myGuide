import React, { useEffect } from 'react';
import { useAppSelector } from '../store/hooks';

const ChatDebugger = ({ currentConversationId }) => {
  const allMessages = useAppSelector((state) => state.chatbot.messages);
  const activeConversation = useAppSelector((state) => state.chatbot.activeConversation);
  const chatbotState = useAppSelector((state) => state.chatbot);
  
  useEffect(() => {
    console.log('🐛 ChatDebugger - Current Conversation ID:', currentConversationId);
    console.log('🐛 ChatDebugger - All Messages:', allMessages);
    console.log('🐛 ChatDebugger - Active Conversation:', activeConversation);
    console.log('🐛 ChatDebugger - Full Chatbot State:', chatbotState);
    
    if (currentConversationId) {
      const conversationMessages = allMessages[currentConversationId];
      console.log(`🐛 ChatDebugger - Messages for conversation ${currentConversationId}:`, conversationMessages);
    }
  }, [currentConversationId, allMessages, activeConversation, chatbotState]);
  
  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div><strong>Debug Info:</strong></div>
      <div>Conversation ID: {currentConversationId || 'None'}</div>
      <div>Messages Count: {currentConversationId ? (allMessages[currentConversationId]?.length || 0) : 0}</div>
      <div>Active Conv: {activeConversation?.id || 'None'}</div>
      <div>Loading: {chatbotState.isLoading ? 'Yes' : 'No'}</div>
      <div>Sending: {chatbotState.isSending ? 'Yes' : 'No'}</div>
    </div>
  );
};

export default ChatDebugger;