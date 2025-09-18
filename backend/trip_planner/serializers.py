from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    TripPlan, DailyPlan, PlannedActivity, TripPlanTemplate,
    TripPlanRating, SavedTripPlan
)
from tourism.models import Place
from tourism.serializers import PlaceListSerializer, PlaceDetailSerializer

User = get_user_model()

class PlannedActivitySerializer(serializers.ModelSerializer):
    """Serializer for planned activities"""
    place = PlaceListSerializer(read_only=True)
    place_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = PlannedActivity
        fields = [
            'id', 'place', 'place_id', 'activity_type', 'start_time', 'end_time',
            'duration_minutes', 'estimated_cost', 'notes', 'is_completed',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate(self, data):
        """Validate activity timing"""
        if data.get('start_time') and data.get('end_time'):
            if data['start_time'] >= data['end_time']:
                raise serializers.ValidationError("Start time must be before end time")
        return data

class PlannedActivityCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating planned activities"""
    
    class Meta:
        model = PlannedActivity
        fields = [
            'place_id', 'activity_type', 'start_time', 'end_time',
            'duration_minutes', 'estimated_cost', 'notes'
        ]
    
    def validate_place_id(self, value):
        """Validate place exists"""
        if not Place.objects.filter(id=value).exists():
            raise serializers.ValidationError("Place does not exist")
        return value

class DailyPlanSerializer(serializers.ModelSerializer):
    """Serializer for daily plans"""
    activities = PlannedActivitySerializer(many=True, read_only=True)
    total_estimated_cost = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    activity_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = DailyPlan
        fields = [
            'id', 'date', 'title', 'description', 'activities',
            'total_estimated_cost', 'activity_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'total_estimated_cost', 'activity_count']

class DailyPlanCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating daily plans"""
    
    class Meta:
        model = DailyPlan
        fields = ['date', 'title', 'description']
    
    def validate_date(self, value):
        """Validate date is not in the past"""
        from django.utils import timezone
        if value < timezone.now().date():
            raise serializers.ValidationError("Date cannot be in the past")
        return value

class TripPlanSerializer(serializers.ModelSerializer):
    """Serializer for trip plans"""
    user = serializers.StringRelatedField(read_only=True)
    daily_plans = DailyPlanSerializer(many=True, read_only=True)
    total_estimated_cost = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    duration_days = serializers.IntegerField(read_only=True)
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=2, read_only=True)
    rating_count = serializers.IntegerField(read_only=True)
    is_saved = serializers.SerializerMethodField()
    
    class Meta:
        model = TripPlan
        fields = [
            'id', 'user', 'title', 'ai_description', 'start_date', 'end_date',
            'budget_range', 'estimated_cost', 'group_size', 'trip_type',
            'preferences', 'daily_plans', 'total_estimated_cost',
            'duration_days', 'status', 'is_public', 'average_rating',
            'rating_count', 'is_saved', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'total_estimated_cost', 'duration_days',
            'average_rating', 'rating_count', 'is_saved', 'created_at', 'updated_at'
        ]
    
    def get_is_saved(self, obj):
        """Check if trip is saved by current user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedTripPlan.objects.filter(
                user=request.user, trip_plan=obj
            ).exists()
        return False
    
    def validate(self, data):
        """Validate trip plan data"""
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] >= data['end_date']:
                raise serializers.ValidationError("Start date must be before end date")
        
        if data.get('budget') and data['budget'] < 0:
            raise serializers.ValidationError("Budget must be positive")
        
        if data.get('group_size') and data['group_size'] < 1:
            raise serializers.ValidationError("Group size must be at least 1")
        
        return data

class TripPlanCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating trip plans"""
    
    class Meta:
        model = TripPlan
        fields = [
            'title', 'ai_description', 'start_date', 'end_date', 'budget_range',
            'estimated_cost', 'group_size', 'trip_type', 'preferences', 'is_public', 'duration_days', 'province'
        ]
    
    def validate(self, data):
        """Validate trip plan creation data"""
        from django.utils import timezone
        
        if data.get('start_date') and data['start_date'] < timezone.now().date():
            raise serializers.ValidationError("Start date cannot be in the past")
        
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] >= data['end_date']:
                raise serializers.ValidationError("Start date must be before end date")
        
        return data

class TripPlanListSerializer(serializers.ModelSerializer):
    """Simplified serializer for trip plan lists"""
    user = serializers.StringRelatedField(read_only=True)
    duration_days = serializers.IntegerField(read_only=True)
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=2, read_only=True)
    rating_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = TripPlan
        fields = [
            'id', 'user', 'title', 'ai_description', 'start_date', 'end_date',
            'budget_range', 'estimated_cost', 'group_size', 'trip_type',
            'duration_days', 'status', 'is_public',
            'average_rating', 'rating_count', 'created_at', 'updated_at'
        ]

class TripPlanTemplateSerializer(serializers.ModelSerializer):
    """Serializer for trip plan templates"""
    created_by = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = TripPlanTemplate
        fields = [
            'id', 'name', 'description', 'province', 'trip_type', 'duration_days',
            'template_data', 'estimated_budget_min', 'estimated_budget_max',
            'is_active', 'popularity_score', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

class TripPlanRatingSerializer(serializers.ModelSerializer):
    """Serializer for trip plan ratings"""
    user = serializers.StringRelatedField(read_only=True)
    trip_plan_title = serializers.CharField(source='trip_plan.title', read_only=True)
    
    class Meta:
        model = TripPlanRating
        fields = [
            'id', 'user', 'trip_plan', 'trip_plan_title', 'rating',
            'comment', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def validate_rating(self, value):
        """Validate rating is between 1 and 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value
    
    def validate(self, data):
        """Validate user hasn't already rated this trip plan"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            trip_plan = data.get('trip_plan')
            if trip_plan and TripPlanRating.objects.filter(
                user=request.user, trip_plan=trip_plan
            ).exists():
                raise serializers.ValidationError(
                    "You have already rated this trip plan"
                )
        return data

class SavedTripPlanSerializer(serializers.ModelSerializer):
    """Serializer for saved trip plans"""
    user = serializers.StringRelatedField(read_only=True)
    trip_plan = TripPlanListSerializer(read_only=True)
    
    class Meta:
        model = SavedTripPlan
        fields = ['id', 'user', 'trip_plan', 'notes', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

# AI Trip Generation Serializers
class TripGenerationRequestSerializer(serializers.Serializer):
    """Serializer for AI trip generation requests"""
    destination = serializers.CharField(max_length=200, required=False)
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    budget = serializers.DecimalField(max_digits=10, decimal_places=2)
    budget_currency = serializers.CharField(max_length=3, default='USD')
    group_size = serializers.IntegerField(min_value=1, max_value=20)
    trip_type = serializers.ChoiceField(choices=TripPlan.TRIP_TYPES)
    interests = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        allow_empty=True
    )
    accommodation_preference = serializers.ChoiceField(
        choices=[('budget', 'Budget'), ('mid-range', 'Mid-range'), ('luxury', 'Luxury')],
        required=False
    )
    activity_level = serializers.ChoiceField(
        choices=[('low', 'Low'), ('moderate', 'Moderate'), ('high', 'High')],
        required=False
    )
    special_requirements = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    def validate(self, data):
        """Validate trip generation request"""
        from django.utils import timezone
        
        if data['start_date'] < timezone.now().date():
            raise serializers.ValidationError("Start date cannot be in the past")
        
        if data['start_date'] >= data['end_date']:
            raise serializers.ValidationError("Start date must be before end date")
        
        # Validate trip duration (max 30 days)
        duration = (data['end_date'] - data['start_date']).days
        if duration > 30:
            raise serializers.ValidationError("Trip duration cannot exceed 30 days")
        
        return data

class TripRecommendationSerializer(serializers.Serializer):
    """Serializer for trip recommendations"""
    trip_plan_id = serializers.IntegerField()
    title = serializers.CharField()
    description = serializers.CharField()
    confidence_score = serializers.FloatField()
    estimated_cost = serializers.DecimalField(max_digits=10, decimal_places=2)
    highlights = serializers.ListField(child=serializers.CharField())
    daily_summary = serializers.ListField(child=serializers.DictField())

# Statistics Serializers
class TripPlanStatsSerializer(serializers.Serializer):
    """Serializer for trip plan statistics"""
    total_plans = serializers.IntegerField()
    public_plans = serializers.IntegerField()
    ai_generated_plans = serializers.IntegerField()
    average_duration = serializers.FloatField()
    average_budget = serializers.DecimalField(max_digits=10, decimal_places=2)
    popular_trip_types = serializers.DictField()
    monthly_creation_stats = serializers.DictField()
    top_destinations = serializers.ListField(child=serializers.DictField())

class UserTripStatsSerializer(serializers.Serializer):
    """Serializer for user trip statistics"""
    total_plans = serializers.IntegerField()
    completed_plans = serializers.IntegerField()
    saved_plans = serializers.IntegerField()
    average_rating_given = serializers.FloatField()
    favorite_trip_type = serializers.CharField()
    total_budget_planned = serializers.DecimalField(max_digits=10, decimal_places=2)

# Search and Filter Serializers
class TripPlanSearchSerializer(serializers.Serializer):
    """Serializer for trip plan search"""
    query = serializers.CharField(max_length=200, required=False)
    trip_type = serializers.ChoiceField(choices=TripPlan.TRIP_TYPES, required=False)
    min_budget = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    max_budget = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    min_duration = serializers.IntegerField(required=False)
    max_duration = serializers.IntegerField(required=False)
    group_size = serializers.IntegerField(required=False)
    is_public = serializers.BooleanField(required=False)
    ai_generated = serializers.BooleanField(required=False)
    ordering = serializers.ChoiceField(
        choices=[
            ('created_at', 'Newest'),
            ('-created_at', 'Oldest'),
            ('average_rating', 'Lowest Rated'),
            ('-average_rating', 'Highest Rated'),
            ('budget', 'Lowest Budget'),
            ('-budget', 'Highest Budget')
        ],
        required=False
    )

# Bulk Operations Serializers
class BulkTripPlanSerializer(serializers.Serializer):
    """Serializer for bulk trip plan operations"""
    trip_plan_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1,
        max_length=50
    )
    action = serializers.ChoiceField(
        choices=[('delete', 'Delete'), ('make_public', 'Make Public'), ('make_private', 'Make Private')]
    )

class TripPlanExportSerializer(serializers.Serializer):
    """Serializer for trip plan export"""
    trip_plan_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )
    format = serializers.ChoiceField(
        choices=[('json', 'JSON'), ('csv', 'CSV'), ('pdf', 'PDF')],
        default='json'
    )
    include_activities = serializers.BooleanField(default=True)
    include_ratings = serializers.BooleanField(default=False)