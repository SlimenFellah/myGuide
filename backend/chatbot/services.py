import json
import re
from typing import List, Dict, Any, Optional
from django.db.models import Q
from django.conf import settings
from .models import KnowledgeBase, ChatMessage
import openai
import ollama
from decouple import config
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class RAGService:
    """Retrieval-Augmented Generation service for knowledge base search"""
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        self._knowledge_vectors = None
        self._knowledge_documents = None
        self._last_update = None
    
    def _update_knowledge_vectors(self):
        """Update the vectorized knowledge base"""
        documents = KnowledgeBase.objects.filter(is_active=True).values(
            'id', 'title', 'content', 'content_type', 'source_type'
        )
        
        if not documents:
            self._knowledge_vectors = None
            self._knowledge_documents = []
            return
        
        # Combine title and content for better search
        texts = []
        doc_list = list(documents)
        
        for doc in doc_list:
            combined_text = f"{doc['title']} {doc['content']}"
            texts.append(combined_text)
        
        # Vectorize the documents
        if texts:
            self._knowledge_vectors = self.vectorizer.fit_transform(texts)
            self._knowledge_documents = doc_list
        else:
            self._knowledge_vectors = None
            self._knowledge_documents = []
    
    def search_knowledge_base(
        self, 
        query: str, 
        content_type: Optional[str] = None,
        source_type: Optional[str] = None,
        limit: int = 5,
        min_similarity: float = 0.1
    ) -> List[Dict[str, Any]]:
        """Search the knowledge base using TF-IDF similarity"""
        
        # Update vectors if needed
        if self._knowledge_vectors is None or not self._knowledge_documents:
            self._update_knowledge_vectors()
        
        if not self._knowledge_documents:
            return []
        
        # Filter documents by content_type and source_type if specified
        filtered_docs = self._knowledge_documents.copy()
        if content_type:
            filtered_docs = [doc for doc in filtered_docs if doc['content_type'] == content_type]
        if source_type:
            filtered_docs = [doc for doc in filtered_docs if doc['source_type'] == source_type]
        
        if not filtered_docs:
            return []
        
        # Get indices of filtered documents
        filtered_indices = [i for i, doc in enumerate(self._knowledge_documents) if doc in filtered_docs]
        
        # Vectorize the query
        query_vector = self.vectorizer.transform([query])
        
        # Calculate similarities
        similarities = cosine_similarity(query_vector, self._knowledge_vectors[filtered_indices]).flatten()
        
        # Get top results
        top_indices = similarities.argsort()[-limit:][::-1]
        
        results = []
        for idx in top_indices:
            similarity = similarities[idx]
            if similarity >= min_similarity:
                doc_idx = filtered_indices[idx]
                doc = self._knowledge_documents[doc_idx]
                results.append({
                    'id': doc['id'],
                    'title': doc['title'],
                    'content': doc['content'][:500] + '...' if len(doc['content']) > 500 else doc['content'],
                    'content_type': doc['content_type'],
                    'source_type': doc['source_type'],
                    'similarity_score': float(similarity),
                    'tags': doc['tags']
                })
        
        return results
    
    def get_relevant_context(self, query: str, max_context_length: int = 2000) -> str:
        """Get relevant context for the query"""
        results = self.search_knowledge_base(query, limit=3)
        
        context_parts = []
        current_length = 0
        
        for result in results:
            content = f"Title: {result['title']}\nContent: {result['content']}\n\n"
            if current_length + len(content) <= max_context_length:
                context_parts.append(content)
                current_length += len(content)
            else:
                # Add partial content if it fits
                remaining_space = max_context_length - current_length
                if remaining_space > 100:  # Only add if there's meaningful space
                    partial_content = content[:remaining_space-3] + "..."
                    context_parts.append(partial_content)
                break
        
        return "\n".join(context_parts)

class ChatbotService:
    """Service for generating AI responses using Ollama or fallback logic"""
    
    def __init__(self):
        # Initialize Ollama configuration
        self.ollama_base_url = config('OLLAMA_BASE_URL', default='http://localhost:11434')
        self.ollama_model = config('OLLAMA_MODEL', default='llama2:chat')
        self.use_ollama = True
        
        # Fallback to OpenAI if configured
        self.use_openai = config('OPENAI_API_KEY', default=None) is not None
        if self.use_openai:
            openai.api_key = config('OPENAI_API_KEY')
    
    def generate_response(
        self, 
        user_message: str, 
        context: str, 
        conversation_history: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """Generate a response using AI or fallback logic"""
        
        if self.use_ollama:
            return self._generate_ollama_response(user_message, context, conversation_history)
        elif self.use_openai:
            return self._generate_openai_response(user_message, context, conversation_history)
        else:
            return self._generate_fallback_response(user_message, context)
    
    def _generate_ollama_response(
        self, 
        user_message: str, 
        context: str, 
        conversation_history: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """Generate response using Ollama API"""
        try:
            # Build the prompt with context and conversation history
            context_text = context if context else "No specific context available."
            system_prompt = f"""You are a helpful tourism assistant for Algeria. Use the following context to answer questions about Algeria's tourism, culture, places to visit, and travel information.
            
Context:
{context_text}
            
Instructions:
- Provide accurate and helpful information about Algeria
- If the context doesn't contain relevant information, use your general knowledge about Algeria
- Be friendly and encouraging about visiting Algeria
- Suggest specific places, activities, or experiences when appropriate
- If asked about travel logistics, provide practical advice
- Keep responses concise but informative"""
            
            # Build conversation context
            conversation_context = ""
            if conversation_history:
                for msg in conversation_history[-4:]:  # Last 4 messages for context
                    role = "Human" if msg['role'] == 'user' else "Assistant"
                    conversation_context += f"{role}: {msg['content']}\n"
            
            # Create the full prompt
            full_prompt = f"{system_prompt}\n\n{conversation_context}Human: {user_message}\nAssistant:"
            
            # Generate response using Ollama
            response = ollama.generate(
                model=self.ollama_model,
                prompt=full_prompt,
                options={
                    'temperature': 0.7,
                    'top_p': 0.9,
                    'max_tokens': 500
                }
            )
            
            ai_response = response['response'].strip()
            
            # Generate suggestions based on the response
            suggestions = self._generate_suggestions(user_message, ai_response)
            
            return {
                'response': ai_response,
                'confidence': 0.85,
                'sources': self._extract_sources_from_context(context),
                'suggestions': suggestions
            }
            
        except Exception as e:
            print(f"Ollama API error: {e}")
            # Fallback to OpenAI if available, otherwise use fallback response
            if self.use_openai:
                return self._generate_openai_response(user_message, context, conversation_history)
            else:
                return self._generate_fallback_response(user_message, context)
    
    def _generate_openai_response(
        self, 
        user_message: str, 
        context: str, 
        conversation_history: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """Generate response using OpenAI API"""
        try:
            # Build conversation messages
            context_text = context if context else "No specific context available."
            messages = [
                {
                    "role": "system",
                    "content": f"""You are a helpful tourism assistant for Algeria. Use the following context to answer questions about Algeria's tourism, culture, places to visit, and travel information.
                    
Context:
{context_text}
                    
Instructions:
- Provide accurate and helpful information about Algeria
- If the context doesn't contain relevant information, use your general knowledge about Algeria
- Be friendly and encouraging about visiting Algeria
- Suggest specific places, activities, or experiences when appropriate
- If asked about travel logistics, provide practical advice
- Keep responses concise but informative"""
                }
            ]
            
            # Add conversation history if available
            if conversation_history:
                for msg in conversation_history[-6:]:  # Last 6 messages for context
                    messages.append({
                        "role": "user" if msg['message_type'] == 'user' else "assistant",
                        "content": msg['message']
                    })
            
            # Add current user message
            messages.append({
                "role": "user",
                "content": user_message
            })
            
            # Generate response
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=500,
                temperature=0.7,
                top_p=0.9
            )
            
            ai_response = response.choices[0].message.content.strip()
            
            # Generate suggestions based on the response
            suggestions = self._generate_suggestions(user_message, ai_response)
            
            return {
                'response': ai_response,
                'confidence': 0.9,
                'sources': self._extract_sources_from_context(context),
                'suggestions': suggestions
            }
            
        except Exception as e:
            print(f"OpenAI API error: {e}")
            return self._generate_fallback_response(user_message, context)
    
    def _generate_fallback_response(self, user_message: str, context: str) -> Dict[str, Any]:
        """Generate a fallback response using rule-based logic"""
        
        # Convert to lowercase for matching
        message_lower = user_message.lower()
        
        # Define response patterns
        patterns = {
            'greeting': {
                'keywords': ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
                'response': "Hello! I'm here to help you discover the beauty of Rwanda. What would you like to know about our amazing country?"
            },
            'places': {
                'keywords': ['places', 'visit', 'attractions', 'destinations', 'where to go'],
                'response': "Rwanda has many incredible places to visit! Some highlights include Volcanoes National Park for gorilla trekking, Lake Kivu for relaxation, Nyungwe Forest for canopy walks, and Kigali city for culture and history. What type of experience interests you most?"
            },
            'gorillas': {
                'keywords': ['gorilla', 'gorillas', 'mountain gorilla', 'trekking'],
                'response': "Gorilla trekking in Volcanoes National Park is Rwanda's most famous attraction! You can encounter mountain gorillas in their natural habitat. The experience requires permits and moderate fitness. Would you like to know more about booking or what to expect?"
            },
            'culture': {
                'keywords': ['culture', 'tradition', 'people', 'customs', 'history'],
                'response': "Rwandan culture is rich and welcoming! Known as the 'Land of a Thousand Hills,' Rwanda has a strong tradition of unity, beautiful traditional dances, and delicious cuisine. The people are incredibly friendly and proud of their heritage. What aspect of culture interests you?"
            },
            'weather': {
                'keywords': ['weather', 'climate', 'temperature', 'rain', 'season'],
                'response': "Rwanda has a pleasant tropical highland climate with two rainy seasons (March-May and October-December) and two dry seasons. Temperatures are generally mild year-round due to the altitude. The best time to visit depends on your activities - dry seasons are great for trekking!"
            },
            'visa': {
                'keywords': ['visa', 'entry', 'passport', 'requirements', 'border'],
                'response': "Most visitors can get a visa on arrival or apply online for an e-visa. Many nationalities can also get a 30-day visa-free entry. Make sure your passport is valid for at least 6 months. Check the latest requirements based on your nationality before traveling."
            }
        }
        
        # Find matching pattern
        best_match = None
        max_matches = 0
        
        for category, pattern in patterns.items():
            matches = sum(1 for keyword in pattern['keywords'] if keyword in message_lower)
            if matches > max_matches:
                max_matches = matches
                best_match = pattern
        
        # Use context if available and no pattern matched well
        if max_matches == 0 and context:
            # Extract first few sentences from context
            sentences = context.split('. ')[:3]
            response = '. '.join(sentences) + ". Would you like to know more about any specific aspect?"
        elif best_match:
            response = best_match['response']
        else:
            response = "I'd be happy to help you learn about Rwanda! You can ask me about places to visit, culture, gorilla trekking, weather, visa requirements, or any other travel-related questions."
        
        # Generate simple suggestions
        suggestions = [
            "What are the best places to visit in Rwanda?",
            "Tell me about gorilla trekking",
            "What's the weather like in Rwanda?",
            "What should I know about Rwandan culture?"
        ]
        
        return {
            'response': response,
            'confidence': 0.7 if max_matches > 0 else 0.5,
            'sources': self._extract_sources_from_context(context),
            'suggestions': suggestions[:3]
        }
    
    def _extract_sources_from_context(self, context: str) -> List[Dict[str, str]]:
        """Extract source information from context"""
        sources = []
        
        # Simple extraction based on "Title:" markers
        titles = re.findall(r'Title: ([^\n]+)', context)
        for i, title in enumerate(titles[:3]):  # Limit to 3 sources
            sources.append({
                'title': title,
                'type': 'knowledge_base',
                'relevance': 1.0 - (i * 0.1)  # Decreasing relevance
            })
        
        return sources
    
    def _generate_suggestions(self, user_message: str, ai_response: str) -> List[str]:
        """Generate follow-up suggestions based on the conversation"""
        
        message_lower = user_message.lower()
        
        # Context-aware suggestions
        if any(word in message_lower for word in ['gorilla', 'trekking']):
            return [
                "What should I bring for gorilla trekking?",
                "How much does a gorilla permit cost?",
                "What other activities are available in Volcanoes National Park?"
            ]
        elif any(word in message_lower for word in ['places', 'visit', 'attractions']):
            return [
                "Tell me about Nyungwe Forest National Park",
                "What can I do at Lake Kivu?",
                "How many days should I spend in Rwanda?"
            ]
        elif any(word in message_lower for word in ['culture', 'people', 'tradition']):
            return [
                "What is traditional Rwandan food like?",
                "Tell me about Rwandan music and dance",
                "What languages are spoken in Rwanda?"
            ]
        else:
            return [
                "What's the best time to visit Rwanda?",
                "How do I get around Rwanda?",
                "What are the must-see attractions?"
            ]
    
    def analyze_sentiment(self, message: str) -> Dict[str, float]:
        """Simple sentiment analysis"""
        positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'like', 'best', 'fantastic']
        negative_words = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'worst', 'horrible', 'disappointing']
        
        words = message.lower().split()
        
        positive_count = sum(1 for word in words if word in positive_words)
        negative_count = sum(1 for word in words if word in negative_words)
        
        total_words = len(words)
        if total_words == 0:
            return {'positive': 0.5, 'negative': 0.5, 'neutral': 0.0}
        
        positive_score = positive_count / total_words
        negative_score = negative_count / total_words
        neutral_score = 1 - positive_score - negative_score
        
        return {
            'positive': positive_score,
            'negative': negative_score,
            'neutral': neutral_score
        }