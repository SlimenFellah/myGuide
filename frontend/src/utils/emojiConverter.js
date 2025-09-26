// Emoji converter utility to replace text descriptions with actual emojis
// Developed & maintained by Slimene Fellah — Available for freelance work at slimenefellah.dev

const emojiMap = {
  // Smiling and happy emojis
  'smiling': '😊',
  'smile': '😊',
  'happy': '😊',
  'grinning': '😀',
  'laughing': '😂',
  'joy': '😂',
  'winking': '😉',
  'wink': '😉',
  'blush': '😊',
  'blushing': '😊',
  
  // Other common emotions
  'sad': '😢',
  'crying': '😢',
  'angry': '😠',
  'surprised': '😲',
  'shocked': '😲',
  'confused': '😕',
  'thinking': '🤔',
  'worried': '😟',
  'excited': '🤩',
  'love': '❤️',
  'heart': '❤️',
  
  // Gestures and actions
  'thumbs up': '👍',
  'thumbs_up': '👍',
  'thumbsup': '👍',
  'clapping': '👏',
  'clap': '👏',
  'wave': '👋',
  'waving': '👋',
  'pointing': '👉',
  'ok': '👌',
  'peace': '✌️',
  
  // Objects and symbols
  'star': '⭐',
  'fire': '🔥',
  'sun': '☀️',
  'moon': '🌙',
  'rainbow': '🌈',
  'flower': '🌸',
  'tree': '🌳',
  'mountain': '🏔️',
  'beach': '🏖️',
  'camera': '📷',
  'plane': '✈️',
  'car': '🚗',
  'train': '🚂',
  'bus': '🚌',
  
  // Food and drinks
  'coffee': '☕',
  'tea': '🍵',
  'food': '🍽️',
  'pizza': '🍕',
  'burger': '🍔',
  'cake': '🎂',
  'apple': '🍎',
  'banana': '🍌',
  
  // Travel and tourism related
  'map': '🗺️',
  'compass': '🧭',
  'luggage': '🧳',
  'hotel': '🏨',
  'tent': '⛺',
  'ticket': '🎫',
  'passport': '📘',
  'flag': '🏳️',
  'mosque': '🕌',
  'castle': '🏰',
  'museum': '🏛️',
  'monument': '🗿',
  
  // Weather
  'sunny': '☀️',
  'cloudy': '☁️',
  'rainy': '🌧️',
  'snowy': '❄️',
  'windy': '💨',
  
  // Time
  'morning': '🌅',
  'evening': '🌆',
  'night': '🌃',
  'midnight': '🌙',
  
  // Celebration
  'party': '🎉',
  'celebration': '🎉',
  'birthday': '🎂',
  'gift': '🎁',
  'balloon': '🎈',
  'fireworks': '🎆',
  
  // Nature and animals
  'cat': '🐱',
  'dog': '🐶',
  'bird': '🐦',
  'fish': '🐟',
  'butterfly': '🦋',
  'bee': '🐝',
  'camel': '🐪',
  'desert': '🏜️',
  'oasis': '🏝️',
};

/**
 * Converts text descriptions to emojis in a given text
 * @param {string} text - The text containing emoji descriptions
 * @returns {string} - Text with emoji descriptions replaced by actual emojis
 */
export const convertTextToEmojis = (text) => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let convertedText = text;

  // Sort keys by length (longest first) to avoid partial matches
  const sortedKeys = Object.keys(emojiMap).sort((a, b) => b.length - a.length);

  sortedKeys.forEach(key => {
    // Create regex patterns for different formats
    const patterns = [
      // Standalone word (case insensitive)
      new RegExp(`\\b${key}\\b`, 'gi'),
      // Word with colon format (:word:)
      new RegExp(`:${key}:`, 'gi'),
      // Word in parentheses (word)
      new RegExp(`\\(${key}\\)`, 'gi'),
      // Word in brackets [word]
      new RegExp(`\\[${key}\\]`, 'gi'),
    ];

    patterns.forEach(pattern => {
      convertedText = convertedText.replace(pattern, emojiMap[key]);
    });
  });

  return convertedText;
};

/**
 * Adds emoji support to a text by converting common text patterns
 * @param {string} text - The input text
 * @returns {string} - Text with emojis
 */
export const enhanceTextWithEmojis = (text) => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // First convert explicit emoji descriptions
  let enhancedText = convertTextToEmojis(text);

  // Add contextual emojis for common phrases
  const contextualReplacements = [
    { pattern: /welcome to algeria/gi, replacement: 'Welcome to Algeria 🇩🇿' },
    { pattern: /beautiful country/gi, replacement: 'beautiful country 🌟' },
    { pattern: /thank you/gi, replacement: 'thank you 🙏' },
    { pattern: /good luck/gi, replacement: 'good luck 🍀' },
    { pattern: /have a great/gi, replacement: 'have a great ✨' },
    { pattern: /enjoy your/gi, replacement: 'enjoy your 😊' },
    { pattern: /safe travels/gi, replacement: 'safe travels 🛡️' },
    { pattern: /bon voyage/gi, replacement: 'bon voyage ✈️' },
  ];

  contextualReplacements.forEach(({ pattern, replacement }) => {
    enhancedText = enhancedText.replace(pattern, replacement);
  });

  return enhancedText;
};

export default { convertTextToEmojis, enhanceTextWithEmojis };