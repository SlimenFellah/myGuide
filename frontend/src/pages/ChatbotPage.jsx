/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useConversations, useActiveConversation, useChatLoading } from '../store/hooks';
import ChatDebugger from '../components/ChatDebugger';
import { createConversation, sendChatMessage, addMessage, setActiveConversation, clearMessages, clearSendError } from '../store/slices/chatbotSlice';
import { addNotification } from '../store/slices/appSlice';
import { useAuth } from '../store/hooks';
import { apiService } from '../services';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Avatar,
  Chip,
  IconButton,
  TextField,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Send,
  SmartToy as Bot,
  Person as User,
  Refresh as RefreshCw,
  Chat as MessageCircle,
  AutoAwesome as Sparkles,
  LocationOn as MapPin,
  AccessTime as Clock,
  Star,
  AttachMoney as DollarSign,
  ContentCopy as Copy,
  ThumbUp,
  ThumbDown
} from '@mui/icons-material';

const ChatbotPage = () => {
  const auth = useAuth();
  const user = auth.user;
  const dispatch = useAppDispatch();
  const conversations = useConversations();
  const activeConversation = useActiveConversation();
  const chatLoading = useChatLoading();
  
  const [inputMessage, setInputMessage] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState(null);
  
  // Get messages and loading/error states from Redux
  const allMessages = useAppSelector((state) => state.chatbot.messages);
  const isSending = useAppSelector((state) => state.chatbot.isSending);
  const sendError = useAppSelector((state) => state.chatbot.sendError);
  const isLoading = useAppSelector((state) => state.chatbot.isLoading);
  const messages = currentConversationId ? (allMessages[currentConversationId] || []) : [];
  const isTyping = chatLoading || isSending;
  
  // Initialize conversation
  useEffect(() => {
    const initializeChat = async () => {
      console.log('🔄 Initializing chat, current user:', user);
      console.log('🔄 Current conversation ID:', currentConversationId);
      if (!currentConversationId && user) {
        console.log('🆕 Creating new conversation for user:', user.firstName);
        try {
          const result = await dispatch(createConversation()).unwrap();
          console.log('📋 Create conversation result:', result);
          const conversationId = result.data?.id || result.id;
          console.log('🆔 Setting conversation ID:', conversationId);
          setCurrentConversationId(conversationId);
          // Set as active conversation
          dispatch(setActiveConversation({ id: conversationId, messages: [] }));
          // Send welcome message
          const welcomeMessage = {
            id: Date.now(),
            type: 'assistant',
            content: `Hello ${user?.firstName || 'there'}! 👋 I'm your AI travel guide for Algeria. I can help you with:\n\n• Information about provinces, districts, and municipalities\n• Recommendations for places to visit\n• Local cuisine and restaurants\n• Cultural insights and travel tips\n• Planning your itinerary\n\nWhat would you like to know about Algeria?`,
            timestamp: new Date().toISOString(),
            suggestions: [
              'Tell me about Algiers',
              'Best restaurants in Oran',
              'Historic sites in Constantine',
              'Nature parks in Algeria'
            ]
          };
          dispatch(addMessage({ conversationId: conversationId, message: welcomeMessage }));
        } catch (error) {
          dispatch(addNotification({
            type: 'error',
            message: 'Failed to initialize chat'
          }));
        }
      }
    };
    
    initializeChat();
  }, [user, dispatch]); // Removed currentConversationId from dependencies
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clear send errors after 5 seconds
  useEffect(() => {
    if (sendError) {
      const timer = setTimeout(() => {
        dispatch(clearSendError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [sendError, dispatch]);

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim() || !currentConversationId) return;

    console.log('🚀 Starting handleSendMessage with:', message);

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    console.log('📝 Adding user message:', userMessage);
    // Add user message to state
    dispatch(addMessage({ conversationId: currentConversationId, message: userMessage }));
    console.log('✅ User message dispatched');
    setInputMessage('');
    
    // Send message to API
    try {
      // Ensure we have a conversation ID
      let conversationId = currentConversationId;
      console.log('💬 Current conversation ID:', conversationId);
      if (!conversationId && user) {
        console.log('🆕 Creating new conversation...');
        const result = await dispatch(createConversation()).unwrap();
        console.log('📋 Create conversation result:', result);
        conversationId = result.data?.id || result.id;
        console.log('🆔 New conversation ID:', conversationId);
        setCurrentConversationId(conversationId);
        dispatch(setActiveConversation({ id: conversationId, messages: [] }));
      }
      
      console.log('📤 Sending message to conversation:', conversationId);
      const response = await dispatch(sendChatMessage({
        conversationId: conversationId,
        message: message
      })).unwrap();
      console.log('📥 Received response:', response);
      
      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response.data?.content || response.data?.response || 'Sorry, I could not process your request.',
        timestamp: new Date().toISOString()
      };
      console.log('🤖 Adding bot message:', botMessage);
      dispatch(addMessage({ conversationId: conversationId, message: botMessage }));
      console.log('✅ Bot message dispatched');
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show error message as a chatbot message
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: '❌ **Error occurred**\n\nSorry, I encountered an error while processing your message. Please try again.\n\n*If the problem persists, please check your internet connection or try refreshing the page.*',
        timestamp: new Date().toISOString(),
        isError: true
      };
      dispatch(addMessage({ conversationId: conversationId, message: errorMessage }));
    }
  };

  const generateBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    let response = '';
    let suggestions = [];
    let places = [];

    // Simple keyword-based responses (in real app, this would be RAG-powered)
    if (lowerMessage.includes('algiers') || lowerMessage.includes('alger')) {
      response = `🏛️ **Algiers - The White City**\n\nAlgiers is Algeria's capital and largest city, known for its stunning Mediterranean coastline and rich history. Here are some highlights:\n\n**Must-Visit Places:**\n• **Casbah of Algiers** - UNESCO World Heritage site with Ottoman architecture\n• **Notre Dame d'Afrique** - Beautiful basilica overlooking the bay\n• **Jardin d'Essai du Hamma** - Botanical garden perfect for relaxation\n• **Martyrs' Memorial** - Iconic monument with panoramic city views\n\n**Best Districts:**\n• **Bab El Oued** - Traditional neighborhood with local markets\n• **El Hamma** - Modern district with parks and cultural sites\n• **Hydra** - Upscale area with restaurants and cafes\n\nWould you like specific recommendations for any of these areas?`;
      suggestions = ['Restaurants in Algiers', 'Hotels in Casbah', 'Algiers nightlife', 'Transportation in Algiers'];
      places = [
        { name: 'Casbah of Algiers', rating: 4.8, cost: 15, category: 'Historic Site' },
        { name: 'Jardin d\'Essai du Hamma', rating: 4.4, cost: 8, category: 'Nature' }
      ];
    } else if (lowerMessage.includes('oran')) {
      response = `🌊 **Oran - The Radiant City**\n\nOran is Algeria's second-largest city, famous for its vibrant culture and beautiful Mediterranean setting.\n\n**Top Attractions:**\n• **Santa Cruz Fort** - Historic fortress with stunning sea views\n• **Great Mosque of Oran** - Beautiful Islamic architecture\n• **Place du 1er Novembre** - Central square perfect for people-watching\n• **Oran Opera House** - Magnificent cultural venue\n\n**Cultural Highlights:**\n• Birthplace of Raï music\n• Rich Spanish and French colonial heritage\n• Vibrant arts and theater scene\n• Famous for its seafood cuisine\n\nWhat aspect of Oran interests you most?`;
      suggestions = ['Oran beaches', 'Raï music venues', 'Seafood restaurants', 'Day trips from Oran'];
      places = [
        { name: 'Santa Cruz Fort', rating: 4.6, cost: 10, category: 'Historic Site' },
        { name: 'Oran Opera House', rating: 4.5, cost: 30, category: 'Entertainment' }
      ];
    } else if (lowerMessage.includes('constantine')) {
      response = `🌉 **Constantine - City of Bridges**\n\nConstantine is known for its dramatic setting on a rocky plateau and its spectacular bridges spanning deep gorges.\n\n**Iconic Features:**\n• **Sidi M'Cid Bridge** - Suspension bridge with breathtaking views\n• **Palace of Ahmed Bey** - Ottoman palace showcasing Islamic art\n• **Great Mosque** - Historic mosque in the old city\n• **Rhumel Gorge** - Natural wonder with dramatic cliffs\n\n**Unique Experiences:**\n• Walking across the historic bridges\n• Exploring the old medina\n• Visiting traditional craft workshops\n• Enjoying panoramic viewpoints\n\nWould you like details about any specific attraction?`;
      suggestions = ['Constantine bridges', 'Hotels in Constantine', 'Traditional crafts', 'Constantine history'];
      places = [
        { name: 'Sidi M\'Cid Bridge', rating: 4.7, cost: 0, category: 'Landmark' },
        { name: 'Palace of Ahmed Bey', rating: 4.5, cost: 12, category: 'Historic Site' }
      ];
    } else if (lowerMessage.includes('restaurant') || lowerMessage.includes('food') || lowerMessage.includes('cuisine')) {
      response = `🍽️ **Algerian Cuisine Guide**\n\nAlgerian food is a delicious blend of Berber, Arab, Turkish, and French influences. Here are some must-try dishes and restaurants:\n\n**Traditional Dishes:**\n• **Couscous** - National dish, especially Friday couscous\n• **Tajine** - Slow-cooked stew with meat and vegetables\n• **Chorba** - Hearty soup, perfect for Ramadan\n• **Makroud** - Sweet semolina pastry with dates\n\n**Recommended Restaurants:**\n• **Restaurant El Bahdja** (Algiers) - Authentic traditional cuisine\n• **Le Tantra** (Oran) - Modern Algerian fusion\n• **Dar Diaf** (Constantine) - Family-style traditional meals\n\n**Food Tips:**\n• Mint tea is served everywhere\n• Bread is essential with every meal\n• Halal options are widely available\n\nWhich city's restaurants would you like to explore?`;
      suggestions = ['Vegetarian options', 'Street food guide', 'Fine dining', 'Local markets'];
    } else if (lowerMessage.includes('nature') || lowerMessage.includes('park') || lowerMessage.includes('hiking')) {
      response = `🌲 **Algeria's Natural Wonders**\n\nAlgeria offers incredible natural diversity, from Mediterranean coasts to Saharan landscapes:\n\n**National Parks:**\n• **Tassili n'Ajjer** - UNESCO site with ancient rock art and desert landscapes\n• **Ahaggar National Park** - Volcanic mountains and unique geology\n• **Chrea National Park** - Cedar forests and mountain hiking\n• **Gouraya National Park** - Coastal park near Béjaïa\n\n**Natural Attractions:**\n• **Sahara Desert** - World's largest hot desert\n• **Atlas Mountains** - Perfect for hiking and skiing\n• **Mediterranean Beaches** - Beautiful coastline\n• **Oases** - Palm groves and traditional settlements\n\n**Activities:**\n• Desert camping and camel trekking\n• Mountain hiking and rock climbing\n• Beach relaxation and water sports\n• Wildlife watching and photography\n\nWhat type of natural experience are you looking for?`;
      suggestions = ['Desert tours', 'Mountain hiking', 'Beach destinations', 'Wildlife parks'];
      places = [
        { name: 'Tassili n\'Ajjer National Park', rating: 4.9, cost: 80, category: 'Nature' },
        { name: 'Chrea National Park', rating: 4.3, cost: 15, category: 'Nature' }
      ];
    } else if (lowerMessage.includes('budget') || lowerMessage.includes('cost') || lowerMessage.includes('price')) {
      response = `💰 **Algeria Travel Budget Guide**\n\nAlgeria is generally affordable for travelers. Here's a breakdown of typical costs:\n\n**Daily Budget (USD):**\n• **Budget Travel:** $30-50/day\n• **Mid-range:** $50-100/day\n• **Luxury:** $100+/day\n\n**Typical Costs:**\n• **Meals:** $5-15 per person\n• **Accommodation:** $20-80 per night\n• **Transportation:** $1-10 per trip\n• **Attractions:** $5-20 entrance fees\n\n**Money-Saving Tips:**\n• Eat at local restaurants\n• Use public transportation\n• Stay in guesthouses or riads\n• Visit free attractions like beaches and parks\n\n**Currency:** Algerian Dinar (DZD)\n**Payment:** Cash is preferred, cards accepted in major hotels\n\nWould you like specific budget advice for any city?`;
      suggestions = ['Cheap eats', 'Budget hotels', 'Free activities', 'Transportation costs'];
    } else if (lowerMessage.includes('culture') || lowerMessage.includes('tradition') || lowerMessage.includes('history')) {
      response = `🏛️ **Algerian Culture & History**\n\nAlgeria has a rich cultural heritage spanning thousands of years:\n\n**Historical Periods:**\n• **Berber/Amazigh** - Indigenous North African culture\n• **Roman Era** - Ruins like Timgad and Djémila\n• **Islamic Conquest** - 7th century onwards\n• **Ottoman Rule** - 16th-19th centuries\n• **French Colonial** - 1830-1962\n• **Independence** - 1962 to present\n\n**Cultural Highlights:**\n• **Languages:** Arabic, Berber (Tamazight), French\n• **Music:** Raï, Chaabi, Andalusian\n• **Architecture:** Islamic, Ottoman, Colonial\n• **Crafts:** Carpets, pottery, jewelry, leather\n\n**Cultural Etiquette:**\n• Dress modestly, especially in religious sites\n• Remove shoes when entering homes\n• Use right hand for greetings and eating\n• Respect prayer times and Ramadan\n\nWhat aspect of Algerian culture interests you most?`;
      suggestions = ['Islamic architecture', 'Traditional music', 'Local festivals', 'Berber culture'];
    } else {
      response = `I'd be happy to help you learn more about Algeria! 🇩🇿\n\nI can provide information about:\n• **Cities & Regions** - Algiers, Oran, Constantine, and more\n• **Attractions** - Historic sites, natural wonders, cultural venues\n• **Food & Dining** - Traditional cuisine and restaurant recommendations\n• **Culture & History** - Rich heritage and local customs\n• **Travel Tips** - Budget advice, transportation, and practical info\n\nWhat would you like to explore? Feel free to ask me anything about Algeria!`;
      suggestions = ['Popular destinations', 'Travel itinerary help', 'Local customs', 'Best time to visit'];
    }

    return {
      id: Date.now(),
      type: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
      suggestions,
      places
    };
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    if (!currentConversationId) return;
    
    const welcomeMessage = {
      id: 1,
      type: 'assistant',
      content: `Hello ${user?.firstName || 'there'}! 👋 I'm your AI travel guide for Algeria. What would you like to know?`,
      timestamp: new Date(),
      suggestions: [
        'Tell me about Algiers',
        'Best restaurants in Oran',
        'Historic sites in Constantine',
        'Nature parks in Algeria'
      ]
    };
    // Clear current conversation and add welcome message
    dispatch(clearMessages(currentConversationId));
    dispatch(addMessage({ conversationId: currentConversationId, message: welcomeMessage }));
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  const formatMessageContent = (content) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <ChatDebugger currentConversationId={currentConversationId} />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center' }}>
                <MessageCircle sx={{ mr: 1, color: 'primary.main' }} />
                AI Travel Guide
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Ask me anything about Algeria - places, culture, food, and travel tips!
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                onClick={clearChat}
                variant="outlined"
                startIcon={<RefreshCw />}
                sx={{ textTransform: 'none' }}
              >
                Clear Chat
              </Button>
              <Button
                onClick={() => {
                  console.log('🧪 Test button clicked');
                  handleSendMessage('Test message from button');
                }}
                variant="contained"
                color="secondary"
                sx={{ textTransform: 'none' }}
              >
                Test Send
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Chat Container */}
        <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {/* Messages Area */}
          <Box sx={{ height: { xs: 400, md: 500 }, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {messages.map((message) => (
              <Box key={message.id} sx={{ display: 'flex', justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start' }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 1.5, 
                  maxWidth: '80%',
                  flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
                }}>
                  {/* Avatar */}
                  <Avatar sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: message.type === 'user' ? 'primary.main' : (message.isError ? 'error.main' : 'grey.300'),
                    color: message.type === 'user' ? 'white' : (message.isError ? 'white' : 'grey.700')
                  }}>
                    {message.type === 'user' ? <User sx={{ fontSize: 16 }} /> : <Bot sx={{ fontSize: 16 }} />}
                  </Avatar>
                
                  {/* Message Content */}
                  <Box sx={{ flex: 1, textAlign: message.type === 'user' ? 'right' : 'left' }}>
                    <Paper 
                      elevation={message.type === 'user' ? 3 : 1}
                      sx={{
                        display: 'inline-block',
                        p: 2,
                        borderRadius: 3,
                        bgcolor: message.type === 'user' ? 'primary.main' : (message.isError ? 'error.50' : 'background.paper'),
                        color: message.type === 'user' ? 'white' : (message.isError ? 'error.main' : 'text.primary'),
                        border: message.type === 'user' ? 'none' : '1px solid',
                        borderColor: message.isError ? 'error.main' : 'divider'
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        component="div"
                        dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                        sx={{ '& strong': { fontWeight: 'bold' }, '& em': { fontStyle: 'italic' } }}
                      />
                    </Paper>
                  
                    {/* Places Cards */}
                    {message.places && message.places.length > 0 && (
                      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {message.places.map((place, index) => (
                          <Paper key={index} elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{place.name}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Star sx={{ color: 'warning.main', fontSize: 14 }} />
                                    <Typography variant="caption" sx={{ ml: 0.5 }}>{place.rating}</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <DollarSign sx={{ fontSize: 14 }} />
                                    <Typography variant="caption">${place.cost}</Typography>
                                  </Box>
                                  <Chip 
                                    label={place.category} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                </Box>
                              </Box>
                              <IconButton color="primary" size="small">
                                <MapPin sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    )}
                    
                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {message.suggestions.map((suggestion, index) => (
                          <Chip
                            key={index}
                            label={suggestion}
                            onClick={() => handleSuggestionClick(suggestion)}
                            size="small"
                            variant="outlined"
                            color="primary"
                            clickable
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                      </Box>
                    )}
                  
                    {/* Message Actions */}
                    {message.type === 'bot' && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                        <IconButton
                          onClick={() => copyMessage(message.content)}
                          size="small"
                          title="Copy message"
                          sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
                        >
                          <Copy sx={{ fontSize: 14 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          title="Helpful"
                          sx={{ color: 'text.secondary', '&:hover': { color: 'success.main' } }}
                        >
                          <ThumbUp sx={{ fontSize: 14 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          title="Not helpful"
                          sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                        >
                          <ThumbDown sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    )}
                  
                    {/* Timestamp */}
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mt: 1,
                        justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <Clock sx={{ fontSize: 12, mr: 0.5 }} />
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          
            {/* Typing Indicator */}
            {isTyping && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, maxWidth: '80%' }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', color: 'white' }}>
                    <Bot sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Paper elevation={1} sx={{ bgcolor: 'primary.50', p: 2, borderRadius: 3, border: '1px solid', borderColor: 'primary.100' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} sx={{ color: 'primary.main' }} />
                      <Typography variant="body2" color="primary.main" sx={{ fontStyle: 'italic' }}>
                        Chatbot is thinking...
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Box>
            )}
          
            <Box ref={messagesEndRef} />
          </Box>
          
          <Divider />
          
          {/* Input Area */}
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5 }}>
              <TextField
                inputRef={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about places to visit, local cuisine, culture, or anything about Algeria..."
                multiline
                maxRows={4}
                fullWidth
                variant="outlined"
                size="small"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isTyping}
                variant="contained"
                sx={{ 
                  minWidth: 48, 
                  height: 48, 
                  borderRadius: 2,
                  p: 1.5
                }}
              >
                {isTyping ? <CircularProgress size={20} color="inherit" /> : <Send />}
              </Button>
            </Box>
          
            {/* Quick Actions */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {[
                '🏛️ Historic sites',
                '🍽️ Local cuisine',
                '🏞️ Nature parks',
                '🏖️ Beach destinations',
                '💰 Budget tips',
                '🎭 Cultural events'
              ].map((action, index) => (
                <Chip
                  key={index}
                  label={action}
                  onClick={() => handleSendMessage(action.split(' ').slice(1).join(' '))}
                  size="small"
                  variant="outlined"
                  clickable
                  sx={{ 
                    fontSize: '0.75rem',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        </Paper>
        
        {/* Disclaimer */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles sx={{ fontSize: 12, mr: 0.5 }} />
            AI responses are generated based on available data. Always verify important travel information.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ChatbotPage;