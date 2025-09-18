from rest_framework import serializers
from .models import (
    KnowledgeBase, ChatSession, ChatMessage, ChatFeedback,
    FrequentlyAskedQuestion, ChatAnalytics
)
from django.contrib.auth import get_user_model

User = get_user_model()

class KnowledgeBaseSerializer(serializers.ModelSerializer):
    """Knowledge base serializer"""
    
    class Meta:
        model = KnowledgeBase
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'embedding')

class KnowledgeBaseCreateSerializer(serializers.ModelSerializer):
    """Knowledge base create serializer"""
    
    class Meta:
        model = KnowledgeBase
        fields = ['title', 'content', 'source_type', 'source_url', 'is_active']

class ChatSessionSerializer(serializers.ModelSerializer):
    """Chat session serializer"""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    messages_count = serializers.SerializerMethodField()
    last_message_at = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = '__all__'
        read_only_fields = ('user', 'session_id', 'created_at', 'updated_at')
    
    def get_messages_count(self, obj):
        return obj.messages.count()
    
    def get_last_message_at(self, obj):
        last_message = obj.messages.order_by('-created_at').first()
        return last_message.created_at if last_message else obj.created_at

class ChatMessageSerializer(serializers.ModelSerializer):
    """Chat message serializer"""
    user_name = serializers.CharField(source='session.user.full_name', read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = '__all__'
        read_only_fields = ('created_at', 'response_time', 'sources_used')

class ChatMessageCreateSerializer(serializers.ModelSerializer):
    """Chat message create serializer"""
    
    class Meta:
        model = ChatMessage
        fields = ['session', 'content', 'message_type']
    
    def validate_session(self, value):
        """Validate that the session belongs to the current user"""
        request = self.context.get('request')
        if request and request.user != value.user:
            raise serializers.ValidationError("You can only send messages to your own chat sessions.")
        return value

class ChatMessageListSerializer(serializers.ModelSerializer):
    """Chat message list serializer (for chat history)"""
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'content', 'message_type', 'created_at', 'confidence_score']
        read_only_fields = ['id', 'created_at']

class ChatFeedbackSerializer(serializers.ModelSerializer):
    """Chat feedback serializer"""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    message_content = serializers.CharField(source='message.content', read_only=True)
    
    class Meta:
        model = ChatFeedback
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

class ChatFeedbackCreateSerializer(serializers.ModelSerializer):
    """Chat feedback create serializer"""
    
    class Meta:
        model = ChatFeedback
        fields = ['message', 'feedback_type', 'comment']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class FrequentlyAskedQuestionSerializer(serializers.ModelSerializer):
    """FAQ serializer"""
    
    class Meta:
        model = FrequentlyAskedQuestion
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'view_count')

class ChatAnalyticsSerializer(serializers.ModelSerializer):
    """Chat analytics serializer"""
    
    class Meta:
        model = ChatAnalytics
        fields = '__all__'
        read_only_fields = ('created_at',)

# Statistics serializers
class ChatStatsSerializer(serializers.Serializer):
    """Chat statistics serializer"""
    total_sessions = serializers.IntegerField()
    total_messages = serializers.IntegerField()
    active_sessions_today = serializers.IntegerField()
    average_session_length = serializers.FloatField()
    average_response_time = serializers.FloatField()
    user_satisfaction = serializers.FloatField()
    popular_topics = serializers.DictField()
    daily_message_count = serializers.DictField()

class KnowledgeBaseStatsSerializer(serializers.Serializer):
    """Knowledge base statistics serializer"""
    total_documents = serializers.IntegerField()
    active_documents = serializers.IntegerField()
    documents_by_content_type = serializers.DictField()
    documents_by_source = serializers.DictField()
    recent_additions = serializers.IntegerField()

# Chat response serializers
class ChatResponseSerializer(serializers.Serializer):
    """Chat response serializer for API responses"""
    message_id = serializers.IntegerField()
    response = serializers.CharField()
    confidence_score = serializers.FloatField()
    sources = serializers.ListField(child=serializers.DictField())
    response_time = serializers.FloatField()
    suggestions = serializers.ListField(child=serializers.CharField(), required=False)

class ChatSuggestionSerializer(serializers.Serializer):
    """Chat suggestion serializer"""
    suggestions = serializers.ListField(child=serializers.CharField())

# Search serializers
class KnowledgeSearchSerializer(serializers.Serializer):
    """Knowledge base search serializer"""
    query = serializers.CharField(required=True, max_length=500)
    content_type = serializers.CharField(required=False, allow_blank=True)
    source_type = serializers.ChoiceField(
        choices=KnowledgeBase.CONTENT_TYPES,
        required=False,
        allow_blank=True
    )
    limit = serializers.IntegerField(default=10, min_value=1, max_value=50)

class ChatHistorySerializer(serializers.Serializer):
    """Chat history serializer"""
    session_id = serializers.IntegerField(required=False)
    limit = serializers.IntegerField(default=50, min_value=1, max_value=200)
    offset = serializers.IntegerField(default=0, min_value=0)

# Admin serializers
class ChatSessionAdminSerializer(serializers.ModelSerializer):
    """Chat session admin serializer with additional details"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    messages_count = serializers.SerializerMethodField()
    total_response_time = serializers.SerializerMethodField()
    average_confidence = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = '__all__'
    
    def get_messages_count(self, obj):
        return obj.messages.count()
    
    def get_total_response_time(self, obj):
        return sum(msg.response_time or 0 for msg in obj.messages.all())
    
    def get_average_confidence(self, obj):
        messages = obj.messages.filter(confidence_score__isnull=False)
        if messages.exists():
            return sum(msg.confidence_score for msg in messages) / messages.count()
        return 0

class BulkKnowledgeBaseSerializer(serializers.Serializer):
    """Bulk knowledge base operations serializer"""
    document_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1,
        max_length=100
    )
    action = serializers.ChoiceField(choices=['activate', 'deactivate', 'delete'])

class ChatExportSerializer(serializers.Serializer):
    """Chat export serializer"""
    session_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )
    start_date = serializers.DateTimeField(required=False)
    end_date = serializers.DateTimeField(required=False)
    format = serializers.ChoiceField(choices=['json', 'csv'], default='json')
    include_feedback = serializers.BooleanField(default=True)