/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Loader, 
  RefreshCw, 
  MessageCircle,
  Sparkles,
  MapPin,
  Clock,
  Star,
  DollarSign,
  Copy,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ChatbotPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: `Hello ${user?.firstName || 'there'}! 👋 I'm your AI travel guide for Algeria. I can help you with:\n\n• Information about provinces, districts, and municipalities\n• Recommendations for places to visit\n• Local cuisine and restaurants\n• Cultural insights and travel tips\n• Planning your itinerary\n\nWhat would you like to know about Algeria?`,
      timestamp: new Date(),
      suggestions: [
        'Tell me about Algiers',
        'Best restaurants in Oran',
        'Historic sites in Constantine',
        'Nature parks in Algeria'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateBotResponse(message);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
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
      type: 'bot',
      content: response,
      timestamp: new Date(),
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
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: `Hello ${user?.firstName || 'there'}! 👋 I'm your AI travel guide for Algeria. What would you like to know?`,
        timestamp: new Date(),
        suggestions: [
          'Tell me about Algiers',
          'Best restaurants in Oran',
          'Historic sites in Constantine',
          'Nature parks in Algeria'
        ]
      }
    ]);
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
    <div className="container py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <MessageCircle className="mr-2 text-primary-600" />
              AI Travel Guide
            </h1>
            <p className="text-gray-600">
              Ask me anything about Algeria - places, culture, food, and travel tips!
            </p>
          </div>
          <button
            onClick={clearChat}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Messages Area */}
        <div className="h-96 md:h-[500px] overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-3 max-w-4xl ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {message.type === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                
                {/* Message Content */}
                <div className={`flex-1 ${
                  message.type === 'user' ? 'text-right' : 'text-left'
                }`}>
                  <div className={`inline-block p-4 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-50 text-gray-900'
                  }`}>
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                    />
                  </div>
                  
                  {/* Places Cards */}
                  {message.places && message.places.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.places.map((place, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">{place.name}</h4>
                              <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                                <div className="flex items-center">
                                  <Star className="text-yellow-400 fill-current" size={12} />
                                  <span className="ml-1">{place.rating}</span>
                                </div>
                                <div className="flex items-center">
                                  <DollarSign size={12} />
                                  <span>${place.cost}</span>
                                </div>
                                <span className="bg-gray-100 px-2 py-1 rounded-full">
                                  {place.category}
                                </span>
                              </div>
                            </div>
                            <button className="text-primary-600 hover:text-primary-700">
                              <MapPin size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs bg-primary-50 text-primary-700 hover:bg-primary-100 px-3 py-1 rounded-full transition-colors duration-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Message Actions */}
                  {message.type === 'bot' && (
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => copyMessage(message.content)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Copy message"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        className="text-gray-400 hover:text-green-600 p-1"
                        title="Helpful"
                      >
                        <ThumbsUp size={14} />
                      </button>
                      <button
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Not helpful"
                      >
                        <ThumbsDown size={14} />
                      </button>
                    </div>
                  )}
                  
                  {/* Timestamp */}
                  <div className={`text-xs text-gray-400 mt-2 ${
                    message.type === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    <Clock size={12} className="inline mr-1" />
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-4xl">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="bg-gray-50 text-gray-900 p-4 rounded-2xl">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about places to visit, local cuisine, culture, or anything about Algeria..."
                className="w-full resize-none border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping}
              className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTyping ? <Loader className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              '🏛️ Historic sites',
              '🍽️ Local cuisine',
              '🏞️ Nature parks',
              '🏖️ Beach destinations',
              '💰 Budget tips',
              '🎭 Cultural events'
            ].map((action, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(action.split(' ').slice(1).join(' '))}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors duration-200"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          <Sparkles className="inline mr-1" size={12} />
          AI responses are generated based on available data. Always verify important travel information.
        </p>
      </div>
    </div>
  );
};

export default ChatbotPage;