from django.shortcuts import render
from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Count
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import json
import time
import openai
from django.conf import settings

from .models import (
    KnowledgeBase, ChatSession, ChatMessage, ChatFeedback,
    FrequentlyAskedQuestion, ChatAnalytics
)
from .serializers import (
    KnowledgeBaseSerializer, KnowledgeBaseCreateSerializer,
    ChatSessionSerializer, ChatMessageSerializer, ChatMessageCreateSerializer,
    ChatMessageListSerializer, ChatFeedbackSerializer, ChatFeedbackCreateSerializer,
    FrequentlyAskedQuestionSerializer, ChatAnalyticsSerializer,
    ChatStatsSerializer, KnowledgeBaseStatsSerializer, ChatResponseSerializer,
    ChatSuggestionSerializer, KnowledgeSearchSerializer, ChatHistorySerializer,
    ChatSessionAdminSerializer, BulkKnowledgeBaseSerializer, ChatExportSerializer
)
from .services import RAGService, ChatbotService

User = get_user_model()

# Custom pagination
class ChatPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

# Knowledge Base Views
class KnowledgeBaseListCreateView(generics.ListCreateAPIView):
    """List all knowledge base entries or create a new one (admin only)"""
    queryset = KnowledgeBase.objects.all().order_by('-created_at')
    permission_classes = [IsAdminUser]
    pagination_class = ChatPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['source_type', 'is_active']
    search_fields = ['title', 'content', 'tags']
    ordering_fields = ['created_at', 'updated_at', 'title']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return KnowledgeBaseCreateSerializer
        return KnowledgeBaseSerializer

class KnowledgeBaseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a knowledge base entry (admin only)"""
    queryset = KnowledgeBase.objects.all()
    serializer_class = KnowledgeBaseSerializer
    permission_classes = [IsAdminUser]

# Chat Session Views
class ChatSessionListCreateView(generics.ListCreateAPIView):
    """List user's chat sessions or create a new one"""
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = ChatPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-updated_at']
    
    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ChatSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a chat session"""
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)

# Chat Message Views
class ChatMessageListView(generics.ListAPIView):
    """List messages for a chat session"""
    serializer_class = ChatMessageListSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = ChatPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at']
    ordering = ['created_at']
    
    def get_queryset(self):
        session_id = self.kwargs.get('session_id')
        return ChatMessage.objects.filter(
            session_id=session_id,
            session__user=self.request.user
        )

class ChatMessageCreateView(generics.CreateAPIView):
    """Send a new message to the chatbot"""
    serializer_class = ChatMessageCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create the user message
        message = serializer.save()
        
        # Generate AI response using RAG service
        try:
            start_time = time.time()
            rag_service = RAGService()
            chatbot_service = ChatbotService()
            
            # Get relevant context from knowledge base
            context = rag_service.search_knowledge_base(message.message)
            
            # Generate response using AI
            ai_response = chatbot_service.generate_response(
                message.message, 
                context, 
                message.session.get_conversation_history()
            )
            
            response_time = time.time() - start_time
            
            # Create AI response message
            ai_message = ChatMessage.objects.create(
                session=message.session,
                message=ai_response['response'],
                message_type='bot',
                response_time=response_time,
                confidence_score=ai_response.get('confidence', 0.8),
                sources_used=json.dumps(ai_response.get('sources', []))
            )
            
            # Update session
            message.session.updated_at = timezone.now()
            message.session.save()
            
            # Log analytics
            ChatAnalytics.objects.create(
                session=message.session,
                user_message=message.message,
                bot_response=ai_message.message,
                response_time=response_time,
                confidence_score=ai_response.get('confidence', 0.8),
                sources_count=len(ai_response.get('sources', []))
            )
            
            # Return response
            response_data = ChatResponseSerializer({
                'message_id': ai_message.id,
                'response': ai_message.message,
                'confidence_score': ai_message.confidence_score,
                'sources': ai_response.get('sources', []),
                'response_time': response_time,
                'suggestions': ai_response.get('suggestions', [])
            }).data
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Create error response
            error_message = ChatMessage.objects.create(
                session=message.session,
                message="I'm sorry, I'm having trouble processing your request right now. Please try again later.",
                message_type='bot',
                response_time=0,
                confidence_score=0
            )
            
            return Response({
                'message_id': error_message.id,
                'response': error_message.message,
                'confidence_score': 0,
                'sources': [],
                'response_time': 0,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Chat Feedback Views
class ChatFeedbackListCreateView(generics.ListCreateAPIView):
    """List or create chat feedback"""
    serializer_class = ChatFeedbackSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ChatFeedback.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ChatFeedbackCreateSerializer
        return ChatFeedbackSerializer

class ChatFeedbackDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete chat feedback"""
    serializer_class = ChatFeedbackSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ChatFeedback.objects.filter(user=self.request.user)

# FAQ Views
class FAQListView(generics.ListAPIView):
    """List frequently asked questions"""
    queryset = FrequentlyAskedQuestion.objects.filter(is_active=True).order_by('-view_count')
    serializer_class = FrequentlyAskedQuestionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['question', 'answer', 'category']

class FAQDetailView(generics.RetrieveAPIView):
    """Retrieve FAQ and increment view count"""
    queryset = FrequentlyAskedQuestion.objects.filter(is_active=True)
    serializer_class = FrequentlyAskedQuestionSerializer
    permission_classes = [IsAuthenticated]
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

# API Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def quick_chat(request):
    """Quick chat without session (for simple queries)"""
    message = request.data.get('message', '').strip()
    if not message:
        return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        start_time = time.time()
        rag_service = RAGService()
        chatbot_service = ChatbotService()
        
        # Get relevant context
        context = rag_service.search_knowledge_base(message)
        
        # Generate response
        ai_response = chatbot_service.generate_response(message, context)
        
        response_time = time.time() - start_time
        
        return Response({
            'response': ai_response['response'],
            'confidence_score': ai_response.get('confidence', 0.8),
            'sources': ai_response.get('sources', []),
            'response_time': response_time,
            'suggestions': ai_response.get('suggestions', [])
        })
        
    except Exception as e:
        return Response({
            'error': 'Failed to generate response',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_suggestions(request):
    """Get chat suggestions based on popular queries"""
    # Get popular questions from analytics
    popular_queries = ChatAnalytics.objects.values('user_message').annotate(
        count=Count('user_message')
    ).order_by('-count')[:10]
    
    suggestions = [query['user_message'] for query in popular_queries]
    
    # Add some default suggestions if not enough data
    default_suggestions = [
        "What are the best places to visit in Rwanda?",
        "How can I plan a trip to Volcanoes National Park?",
        "What is the best time to visit Rwanda?",
        "Tell me about Rwandan culture and traditions",
        "What are the visa requirements for Rwanda?"
    ]
    
    # Combine and limit to 10
    all_suggestions = suggestions + [s for s in default_suggestions if s not in suggestions]
    
    return Response(ChatSuggestionSerializer({
        'suggestions': all_suggestions[:10]
    }).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def search_knowledge_base(request):
    """Search the knowledge base"""
    serializer = KnowledgeSearchSerializer(data=request.data)
    if serializer.is_valid():
        try:
            rag_service = RAGService()
            results = rag_service.search_knowledge_base(
                query=serializer.validated_data['query'],
                category=serializer.validated_data.get('category'),
                source_type=serializer.validated_data.get('source_type'),
                limit=serializer.validated_data.get('limit', 10)
            )
            
            return Response({
                'results': results,
                'total': len(results)
            })
            
        except Exception as e:
            return Response({
                'error': 'Search failed',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_history(request):
    """Get user's chat history"""
    serializer = ChatHistorySerializer(data=request.query_params)
    if serializer.is_valid():
        data = serializer.validated_data
        
        queryset = ChatMessage.objects.filter(
            session__user=request.user
        ).order_by('-created_at')
        
        if data.get('session_id'):
            queryset = queryset.filter(session_id=data['session_id'])
        
        # Apply pagination
        offset = data.get('offset', 0)
        limit = data.get('limit', 50)
        
        messages = queryset[offset:offset + limit]
        total = queryset.count()
        
        serializer = ChatMessageListSerializer(messages, many=True)
        
        return Response({
            'messages': serializer.data,
            'total': total,
            'offset': offset,
            'limit': limit
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Statistics Views (Admin only)
@api_view(['GET'])
@permission_classes([IsAdminUser])
def chat_statistics(request):
    """Get chat statistics for admin dashboard"""
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    
    stats = {
        'total_sessions': ChatSession.objects.count(),
        'total_messages': ChatMessage.objects.count(),
        'active_sessions_today': ChatSession.objects.filter(
            updated_at__date=today
        ).count(),
        'average_session_length': ChatMessage.objects.values('session').annotate(
            message_count=Count('id')
        ).aggregate(avg_length=Avg('message_count'))['avg_length'] or 0,
        'average_response_time': ChatMessage.objects.filter(
            response_time__isnull=False
        ).aggregate(avg_time=Avg('response_time'))['avg_time'] or 0,
        'user_satisfaction': ChatFeedback.objects.aggregate(
            avg_rating=Avg('rating')
        )['avg_rating'] or 0,
        'popular_topics': dict(
            ChatAnalytics.objects.filter(
                created_at__date__gte=week_ago
            ).values('user_message').annotate(
                count=Count('user_message')
            ).order_by('-count')[:10].values_list('user_message', 'count')
        ),
        'daily_message_count': dict(
            ChatMessage.objects.filter(
                created_at__date__gte=week_ago
            ).extra(
                select={'day': 'date(created_at)'}
            ).values('day').annotate(
                count=Count('id')
            ).values_list('day', 'count')
        )
    }
    
    serializer = ChatStatsSerializer(stats)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def knowledge_base_statistics(request):
    """Get knowledge base statistics for admin dashboard"""
    week_ago = timezone.now() - timedelta(days=7)
    
    stats = {
        'total_documents': KnowledgeBase.objects.count(),
        'active_documents': KnowledgeBase.objects.filter(is_active=True).count(),
        'documents_by_category': dict(
            KnowledgeBase.objects.values('category').annotate(
                count=Count('id')
            ).values_list('category', 'count')
        ),
        'documents_by_source': dict(
            KnowledgeBase.objects.values('source_type').annotate(
                count=Count('id')
            ).values_list('source_type', 'count')
        ),
        'recent_additions': KnowledgeBase.objects.filter(
            created_at__gte=week_ago
        ).count()
    }
    
    serializer = KnowledgeBaseStatsSerializer(stats)
    return Response(serializer.data)

# Admin Views
class AdminChatSessionListView(generics.ListAPIView):
    """Admin view for all chat sessions"""
    queryset = ChatSession.objects.all().select_related('user').order_by('-updated_at')
    serializer_class = ChatSessionAdminSerializer
    permission_classes = [IsAdminUser]
    pagination_class = ChatPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['user', 'created_at']
    search_fields = ['title', 'user__email', 'user__first_name', 'user__last_name']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-updated_at']

@api_view(['POST'])
@permission_classes([IsAdminUser])
def bulk_knowledge_base_operations(request):
    """Bulk operations on knowledge base entries"""
    serializer = BulkKnowledgeBaseSerializer(data=request.data)
    if serializer.is_valid():
        data = serializer.validated_data
        document_ids = data['document_ids']
        action = data['action']
        
        queryset = KnowledgeBase.objects.filter(id__in=document_ids)
        
        if action == 'activate':
            updated_count = queryset.update(is_active=True)
            message = f'{updated_count} documents activated'
        elif action == 'deactivate':
            updated_count = queryset.update(is_active=False)
            message = f'{updated_count} documents deactivated'
        elif action == 'delete':
            updated_count = queryset.count()
            queryset.delete()
            message = f'{updated_count} documents deleted'
        
        return Response({'message': message}, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def export_chat_data(request):
    """Export chat data for analysis"""
    serializer = ChatExportSerializer(data=request.data)
    if serializer.is_valid():
        # Implementation for data export would go here
        # This is a placeholder for the actual export functionality
        return Response({
            'message': 'Export functionality not yet implemented',
            'requested_format': serializer.validated_data.get('format', 'json')
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
