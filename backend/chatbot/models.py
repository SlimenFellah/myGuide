from django.db import models
from django.contrib.auth import get_user_model
from tourism.models import Place, Province

User = get_user_model()

class KnowledgeBase(models.Model):
    """Knowledge base entries for RAG system"""
    CONTENT_TYPES = [
        ('place_info', 'Place Information'),
        ('cultural_info', 'Cultural Information'),
        ('historical_info', 'Historical Information'),
        ('travel_tips', 'Travel Tips'),
        ('local_customs', 'Local Customs'),
        ('transportation', 'Transportation Info'),
        ('accommodation', 'Accommodation Info'),
        ('food_culture', 'Food & Culture'),
        ('events', 'Events & Festivals'),
        ('general', 'General Information'),
    ]
    
    title = models.CharField(max_length=300)
    content = models.TextField()
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES)
    
    # Relationships
    related_place = models.ForeignKey(Place, on_delete=models.CASCADE, blank=True, null=True, related_name='knowledge_entries')
    related_province = models.ForeignKey(Province, on_delete=models.CASCADE, blank=True, null=True, related_name='knowledge_entries')
    
    # Vector embeddings for RAG
    embedding_vector = models.JSONField(blank=True, null=True)  # Store embeddings as JSON
    
    # Metadata
    source_url = models.URLField(blank=True, null=True)
    source_type = models.CharField(max_length=100, blank=True, null=True)
    language = models.CharField(max_length=10, default='en')
    
    # Status
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['content_type']),
            models.Index(fields=['is_active']),
            models.Index(fields=['related_place']),
            models.Index(fields=['related_province']),
        ]
    
    def __str__(self):
        return self.title

class ChatSession(models.Model):
    """Chat sessions for users"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions', blank=True, null=True)
    session_id = models.CharField(max_length=100, unique=True)  # For anonymous users
    title = models.CharField(max_length=200, blank=True, null=True)
    
    # Session metadata
    user_agent = models.TextField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        if self.user:
            return f"Chat with {self.user.full_name} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
        return f"Anonymous Chat {self.session_id} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    @property
    def message_count(self):
        return self.messages.count()

class ChatMessage(models.Model):
    """Individual chat messages"""
    MESSAGE_TYPES = [
        ('user', 'User Message'),
        ('assistant', 'Assistant Response'),
        ('system', 'System Message'),
    ]
    
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES)
    content = models.TextField()
    
    # RAG context
    retrieved_context = models.JSONField(blank=True, null=True)  # Retrieved knowledge base entries
    confidence_score = models.FloatField(blank=True, null=True)  # AI confidence in response
    
    # Related entities
    mentioned_places = models.ManyToManyField(Place, blank=True, related_name='chat_mentions')
    mentioned_provinces = models.ManyToManyField(Province, blank=True, related_name='chat_mentions')
    
    # Metadata
    processing_time_ms = models.IntegerField(blank=True, null=True)
    model_used = models.CharField(max_length=100, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        content_preview = self.content[:50] + "..." if len(self.content) > 50 else self.content
        return f"{self.get_message_type_display()}: {content_preview}"

class ChatFeedback(models.Model):
    """User feedback on chat responses"""
    FEEDBACK_TYPES = [
        ('helpful', 'Helpful'),
        ('not_helpful', 'Not Helpful'),
        ('incorrect', 'Incorrect Information'),
        ('incomplete', 'Incomplete Answer'),
        ('excellent', 'Excellent Response'),
    ]
    
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='feedback')
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)
    feedback_type = models.CharField(max_length=15, choices=FEEDBACK_TYPES)
    comment = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['message', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_feedback_type_display()} - {self.message.session}"

class FrequentlyAskedQuestion(models.Model):
    """FAQ entries for common questions"""
    question = models.CharField(max_length=500)
    answer = models.TextField()
    category = models.CharField(max_length=100, blank=True, null=True)
    
    # Relationships
    related_places = models.ManyToManyField(Place, blank=True, related_name='faqs')
    related_provinces = models.ManyToManyField(Province, blank=True, related_name='faqs')
    
    # Metadata
    view_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-view_count', 'question']
    
    def __str__(self):
        return self.question

class ChatAnalytics(models.Model):
    """Analytics for chat system performance"""
    date = models.DateField()
    
    # Usage metrics
    total_sessions = models.IntegerField(default=0)
    total_messages = models.IntegerField(default=0)
    unique_users = models.IntegerField(default=0)
    anonymous_sessions = models.IntegerField(default=0)
    
    # Performance metrics
    avg_response_time_ms = models.FloatField(blank=True, null=True)
    avg_confidence_score = models.FloatField(blank=True, null=True)
    
    # Feedback metrics
    helpful_responses = models.IntegerField(default=0)
    not_helpful_responses = models.IntegerField(default=0)
    
    # Popular topics
    top_provinces_mentioned = models.JSONField(default=dict, blank=True)
    top_places_mentioned = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['date']
        ordering = ['-date']
    
    def __str__(self):
        return f"Chat Analytics - {self.date}"
