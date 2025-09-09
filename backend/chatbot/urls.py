from django.urls import path
from . import views

app_name = 'chatbot'

urlpatterns = [
    # Knowledge Base URLs
    path('knowledge-base/', views.KnowledgeBaseListCreateView.as_view(), name='knowledge-base-list-create'),
    path('knowledge-base/<int:pk>/', views.KnowledgeBaseDetailView.as_view(), name='knowledge-base-detail'),
    path('knowledge-base/search/', views.search_knowledge_base, name='knowledge-base-search'),
    path('knowledge-base/statistics/', views.knowledge_base_statistics, name='knowledge-base-statistics'),
    path('knowledge-base/bulk-operations/', views.bulk_knowledge_base_operations, name='knowledge-base-bulk-operations'),
    
    # Chat Session URLs
    path('sessions/', views.ChatSessionListCreateView.as_view(), name='chat-session-list-create'),
    path('sessions/<int:pk>/', views.ChatSessionDetailView.as_view(), name='chat-session-detail'),
    path('sessions/<int:session_id>/messages/', views.ChatMessageListView.as_view(), name='chat-message-list'),
    
    # Chat Message URLs
    path('messages/', views.ChatMessageCreateView.as_view(), name='chat-message-create'),
    path('chat/quick/', views.quick_chat, name='quick-chat'),
    path('chat/suggestions/', views.chat_suggestions, name='chat-suggestions'),
    path('chat/history/', views.chat_history, name='chat-history'),
    
    # Chat Feedback URLs
    path('feedback/', views.ChatFeedbackListCreateView.as_view(), name='chat-feedback-list-create'),
    path('feedback/<int:pk>/', views.ChatFeedbackDetailView.as_view(), name='chat-feedback-detail'),
    
    # FAQ URLs
    path('faq/', views.FAQListView.as_view(), name='faq-list'),
    path('faq/<int:pk>/', views.FAQDetailView.as_view(), name='faq-detail'),
    
    # Statistics URLs (Admin only)
    path('statistics/chat/', views.chat_statistics, name='chat-statistics'),
    path('statistics/knowledge-base/', views.knowledge_base_statistics, name='knowledge-base-statistics'),
    
    # Admin URLs
    path('admin/sessions/', views.AdminChatSessionListView.as_view(), name='admin-chat-sessions'),
    path('admin/export/', views.export_chat_data, name='export-chat-data'),
]