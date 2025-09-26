import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  IconButton,
  CircularProgress,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  MessageCircle,
  Send,
  User,
  Bot,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Star,
  DollarSign,
  MapPin,
  Sparkles,
  Plus,
  MenuIcon,
  HistoryIcon,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { 
  sendChatMessage,
  fetchSessions,
  fetchSessionMessages,
  getOrCreateActiveSession,
  createSession,
  deleteSession,
  setActiveSession
} from '../store/slices/chatbotSlice';
import { addNotification } from '../store/slices/appSlice';
import ChatDebugger from '../components/ChatDebugger';
import { convertTextToEmojis } from '../utils/emojiConverter';

const ChatbotPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { 
    sessions, 
    activeSession, 
    messages, 
    isLoading, 
    isSending,
    error 
  } = useSelector((state) => state.chatbot);

  const [inputMessage, setInputMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionMenuAnchor, setSessionMenuAnchor] = useState(null);
  const [selectedSessionForMenu, setSelectedSessionForMenu] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get current session messages
  const currentMessages = activeSession ? messages[activeSession] || [] : [];

  useEffect(() => {
    if (user) {
      // Fetch existing sessions and get or create active session
      dispatch(fetchSessions());
      dispatch(getOrCreateActiveSession());
    }
  }, [dispatch, user]);

  useEffect(() => {
    // Fetch messages for active session
    if (activeSession) {
      dispatch(fetchSessionMessages(activeSession));
    }
  }, [dispatch, activeSession]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleSendMessage = async (messageText = null) => {
    const message = messageText || inputMessage.trim();
    if (!message) return;

    try {
      await dispatch(sendChatMessage({ 
        sessionId: activeSession, 
        message: message 
      })).unwrap();
      
      setInputMessage('');
      inputRef.current?.focus();
    } catch (error) {
      dispatch(addNotification({
        message: 'Failed to send message. Please try again.',
        severity: 'error'
      }));
    }
  };

  const handleCreateNewSession = async () => {
    try {
      const result = await dispatch(createSession('New Chat')).unwrap();
      setSidebarOpen(false);
      dispatch(addNotification({
        message: 'New chat session created!',
        severity: 'success'
      }));
    } catch (error) {
      dispatch(addNotification({
        message: 'Failed to create new session.',
        severity: 'error'
      }));
    }
  };

  const handleSelectSession = async (sessionId) => {
    if (sessionId !== activeSession) {
      await dispatch(fetchSessionMessages(sessionId));
      // Update the active session after fetching messages
      dispatch(setActiveSession(sessionId));
    }
    setSidebarOpen(false);
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await dispatch(deleteSession(sessionId)).unwrap();
      handleSessionMenuClose();
      dispatch(addNotification({
        message: 'Session deleted successfully!',
        severity: 'success'
      }));
    } catch (error) {
      dispatch(addNotification({
        message: 'Failed to delete session.',
        severity: 'error'
      }));
    }
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

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
    dispatch(showNotification({
      message: 'Message copied to clipboard!',
      severity: 'success'
    }));
  };

  const formatMessageContent = (content) => {
    // First convert text descriptions to emojis
    const contentWithEmojis = convertTextToEmojis(content);
    
    // Then apply markdown formatting
    return contentWithEmojis
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  const handleSessionMenuOpen = (event, sessionId) => {
    setSessionMenuAnchor(event.currentTarget);
    setSelectedSessionForMenu(sessionId);
  };

  const handleSessionMenuClose = () => {
    setSessionMenuAnchor(null);
    setSelectedSessionForMenu(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', display: 'flex' }}>
      <ChatDebugger currentConversationId={activeSession} />
      
      {/* Session Sidebar */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 300,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <HistoryIcon sx={{ mr: 1 }} />
              Chat Sessions
            </Typography>
            <Tooltip title="New Chat">
              <IconButton onClick={handleCreateNewSession} color="primary">
                <Plus />
              </IconButton>
            </Tooltip>
          </Box>
          
          <List>
            {sessions.map((session) => (
              <ListItem key={session.id} disablePadding>
                <ListItemButton
                  selected={session.id === activeSession}
                  onClick={() => handleSelectSession(session.id)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.50',
                      '&:hover': {
                        backgroundColor: 'primary.100',
                      },
                    },
                  }}
                >
                  <ListItemIcon>
                    <MessageCircle sx={{ fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={session.title || `Chat ${session.id}`}
                    secondary={new Date(session.updated_at).toLocaleDateString()}
                    primaryTypographyProps={{
                      noWrap: true,
                      sx: { fontSize: '0.9rem' }
                    }}
                    secondaryTypographyProps={{
                      sx: { fontSize: '0.75rem' }
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSessionMenuOpen(e, session.id);
                    }}
                  >
                    <MoreVertical sx={{ fontSize: 16 }} />
                  </IconButton>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Session Menu */}
      <Menu
        anchorEl={sessionMenuAnchor}
        open={Boolean(sessionMenuAnchor)}
        onClose={handleSessionMenuClose}
      >
        <MenuItem
          onClick={() => {
            if (selectedSessionForMenu) {
              handleDeleteSession(selectedSessionForMenu);
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <Trash2 sx={{ mr: 1, fontSize: 16 }} />
          Delete Session
        </MenuItem>
      </Menu>

      {/* Main Chat Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  onClick={() => setSidebarOpen(true)}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                <Box>
                  <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center' }}>
                    <MessageCircle sx={{ mr: 1, color: 'primary.main' }} />
                    AI Travel Guide
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Ask me anything about Algeria - places, culture, food, and travel tips!
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="New Chat">
                  <Button
                    onClick={handleCreateNewSession}
                    variant="outlined"
                    startIcon={<Plus />}
                    sx={{ textTransform: 'none' }}
                  >
                    New Chat
                  </Button>
                </Tooltip>
              </Box>
            </Box>
          </Box>

          {/* Chat Container */}
          <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Messages Area */}
            <Box sx={{ height: { xs: 400, md: 500 }, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3, flexGrow: 1 }}>
              {currentMessages.map((message) => (
                <Box key={message.id} sx={{ display: 'flex', justifyContent: message.message_type === 'user' ? 'flex-end' : 'flex-start' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 1.5, 
                    maxWidth: '80%',
                    flexDirection: message.message_type === 'user' ? 'row-reverse' : 'row'
                  }}>
                    {/* Avatar */}
                    <Avatar sx={{ 
                      width: 32, 
                      height: 32,
                      bgcolor: message.message_type === 'user' ? 'primary.main' : 'grey.300',
                      color: message.message_type === 'user' ? 'white' : 'grey.700'
                    }}>
                      {message.message_type === 'user' ? <User sx={{ fontSize: 16 }} /> : <Bot sx={{ fontSize: 16 }} />}
                    </Avatar>
                  
                    {/* Message Content */}
                    <Box sx={{ flex: 1, textAlign: message.message_type === 'user' ? 'right' : 'left' }}>
                      <Paper 
                        elevation={message.message_type === 'user' ? 3 : 1}
                        sx={{
                          display: 'inline-block',
                          p: 2,
                          borderRadius: 3,
                          bgcolor: message.message_type === 'user' ? 'primary.main' : 'background.paper',
                          color: message.message_type === 'user' ? 'white' : 'text.primary',
                          border: message.message_type === 'user' ? 'none' : '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          component="div"
                          dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                          sx={{ '& strong': { fontWeight: 'bold' }, '& em': { fontStyle: 'italic' } }}
                        />
                      </Paper>
                    
                      {/* Message Actions */}
                      {message.message_type === 'assistant' && (
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
                            <ThumbsUp sx={{ fontSize: 14 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            title="Not helpful"
                            sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                          >
                            <ThumbsDown sx={{ fontSize: 14 }} />
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
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            
              {/* Typing Indicator */}
              {isSending && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, maxWidth: '80%' }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', color: 'white' }}>
                      <Bot sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Paper elevation={1} sx={{ bgcolor: 'primary.50', p: 2, borderRadius: 3, border: '1px solid', borderColor: 'primary.100' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} sx={{ color: 'primary.main' }} />
                        <Typography variant="body2" color="primary.main" sx={{ fontStyle: 'italic' }}>
                          AI is thinking...
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
                  disabled={!inputMessage.trim() || isLoading}
                  variant="contained"
                  sx={{ 
                    minWidth: 48, 
                    height: 48, 
                    borderRadius: 2,
                    p: 1.5
                  }}
                >
                  {isLoading ? <CircularProgress size={20} color="inherit" /> : <Send />}
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
    </Box>
  );
};

export default ChatbotPage;