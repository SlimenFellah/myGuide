from django.shortcuts import render
from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Count, Sum, F
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta, datetime
import json
import random
import traceback

from .models import (
    TripPlan, DailyPlan, PlannedActivity, TripPlanTemplate,
    TripPlanRating, SavedTripPlan
)
from .serializers import (
    TripPlanSerializer, TripPlanCreateSerializer, TripPlanListSerializer,
    DailyPlanSerializer, DailyPlanCreateSerializer,
    PlannedActivitySerializer, PlannedActivityCreateSerializer,
    TripPlanTemplateSerializer, TripPlanRatingSerializer,
    SavedTripPlanSerializer, TripGenerationRequestSerializer,
    TripRecommendationSerializer, TripPlanStatsSerializer,
    UserTripStatsSerializer, TripPlanSearchSerializer,
    BulkTripPlanSerializer, TripPlanExportSerializer
)
from .services import TripPlannerAIService, TripRecommendationService
from tourism.models import Place, Province, District

User = get_user_model()

# Custom pagination
class TripPlanPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 50

# Trip Plan Views
class TripPlanListCreateView(generics.ListCreateAPIView):
    """List user's trip plans or create a new one"""
    permission_classes = [IsAuthenticated]
    pagination_class = TripPlanPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['trip_type', 'status', 'is_public']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'start_date', 'budget', 'average_rating']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return TripPlan.objects.filter(user=self.request.user).annotate(
            average_rating=Avg('ratings__rating'),
            rating_count=Count('ratings')
        ).prefetch_related(
            'daily_plans__activities__place',
            'daily_plans__activities'
        )
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TripPlanCreateSerializer
        return TripPlanSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TripPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a trip plan"""
    serializer_class = TripPlanSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return TripPlan.objects.filter(user=self.request.user).annotate(
            average_rating=Avg('ratings__rating'),
            rating_count=Count('ratings')
        ).prefetch_related('daily_plans__activities__place')

class PublicTripPlanListView(generics.ListAPIView):
    """List public trip plans"""
    serializer_class = TripPlanListSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = TripPlanPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['trip_type']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'start_date', 'budget', 'average_rating']
    ordering = ['-average_rating', '-created_at']
    
    def get_queryset(self):
        return TripPlan.objects.filter(
            is_public=True,
            status='active'
        ).annotate(
            average_rating=Avg('ratings__rating'),
            rating_count=Count('ratings')
        ).exclude(user=self.request.user)

class PublicTripPlanDetailView(generics.RetrieveAPIView):
    """Retrieve a public trip plan"""
    serializer_class = TripPlanSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return TripPlan.objects.filter(
            is_public=True,
            status='active'
        ).annotate(
            average_rating=Avg('ratings__rating'),
            rating_count=Count('ratings')
        ).prefetch_related('daily_plans__activities__place')

# Daily Plan Views
class DailyPlanListCreateView(generics.ListCreateAPIView):
    """List or create daily plans for a trip"""
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['date']
    ordering = ['date']
    
    def get_queryset(self):
        trip_plan_id = self.kwargs.get('trip_plan_id')
        return DailyPlan.objects.filter(
            trip_plan_id=trip_plan_id,
            trip_plan__user=self.request.user
        ).annotate(
            total_estimated_cost=Sum('activities__estimated_cost'),
            activity_count=Count('activities')
        ).prefetch_related('activities__place')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DailyPlanCreateSerializer
        return DailyPlanSerializer
    
    def perform_create(self, serializer):
        trip_plan_id = self.kwargs.get('trip_plan_id')
        trip_plan = TripPlan.objects.get(
            id=trip_plan_id,
            user=self.request.user
        )
        serializer.save(trip_plan=trip_plan)

class DailyPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a daily plan"""
    serializer_class = DailyPlanSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return DailyPlan.objects.filter(
            trip_plan__user=self.request.user
        ).annotate(
            total_estimated_cost=Sum('activities__estimated_cost'),
            activity_count=Count('activities')
        ).prefetch_related('activities__place')

# Planned Activity Views
class PlannedActivityListCreateView(generics.ListCreateAPIView):
    """List or create activities for a daily plan"""
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['start_time']
    ordering = ['start_time']
    
    def get_queryset(self):
        daily_plan_id = self.kwargs.get('daily_plan_id')
        return PlannedActivity.objects.filter(
            daily_plan_id=daily_plan_id,
            daily_plan__trip_plan__user=self.request.user
        ).select_related('place')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PlannedActivityCreateSerializer
        return PlannedActivitySerializer
    
    def perform_create(self, serializer):
        daily_plan_id = self.kwargs.get('daily_plan_id')
        daily_plan = DailyPlan.objects.get(
            id=daily_plan_id,
            trip_plan__user=self.request.user
        )
        serializer.save(daily_plan=daily_plan)

class PlannedActivityDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a planned activity"""
    serializer_class = PlannedActivitySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PlannedActivity.objects.filter(
            daily_plan__trip_plan__user=self.request.user
        ).select_related('place')

# Trip Plan Template Views
class TripPlanTemplateListView(generics.ListAPIView):
    """List available trip plan templates"""
    queryset = TripPlanTemplate.objects.filter(is_active=True).order_by('-popularity_score', 'name')
    serializer_class = TripPlanTemplateSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = TripPlanPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['trip_type', 'is_active']
    search_fields = ['name', 'description', 'tags']
    ordering_fields = ['created_at', 'usage_count', 'duration_days']
    ordering = ['-popularity_score', '-created_at']

class TripPlanTemplateDetailView(generics.RetrieveAPIView):
    """Retrieve a trip plan template"""
    queryset = TripPlanTemplate.objects.filter(is_active=True)
    serializer_class = TripPlanTemplateSerializer
    permission_classes = [IsAuthenticated]

# Rating Views
class TripPlanRatingListCreateView(generics.ListCreateAPIView):
    """List or create ratings for a trip plan"""
    serializer_class = TripPlanRatingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        trip_plan_id = self.kwargs.get('trip_plan_id')
        return TripPlanRating.objects.filter(
            trip_plan_id=trip_plan_id
        ).select_related('user', 'trip_plan').order_by('-created_at')
    
    def perform_create(self, serializer):
        trip_plan_id = self.kwargs.get('trip_plan_id')
        trip_plan = TripPlan.objects.get(id=trip_plan_id)
        serializer.save(user=self.request.user, trip_plan=trip_plan)

class TripPlanRatingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a trip plan rating"""
    serializer_class = TripPlanRatingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return TripPlanRating.objects.filter(user=self.request.user)

# Saved Trip Plan Views
class SavedTripPlanListView(generics.ListAPIView):
    """List user's saved trip plans"""
    serializer_class = SavedTripPlanSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = TripPlanPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return SavedTripPlan.objects.filter(
            user=self.request.user
        ).select_related('trip_plan__user')

# API Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_trip_plan(request):
    """Generate an AI-powered trip plan"""
    print(f"\n=== TRIP GENERATION REQUEST ===")
    print(f"Request data: {request.data}")
    
    serializer = TripGenerationRequestSerializer(data=request.data)
    if serializer.is_valid():
        try:
            ai_service = TripPlannerAIService()
            # Map destination to destination_preference for the AI service
            ai_params = serializer.validated_data.copy()
            if 'destination' in ai_params:
                ai_params['destination_preference'] = ai_params.pop('destination')
            
            trip_data = ai_service.generate_trip_plan(
                user=request.user,
                **ai_params
            )
            
            # Get the province for the destination
            from tourism.models import Province
            try:
                province = Province.objects.filter(
                    name__icontains=serializer.validated_data['destination']
                ).first()
                if not province:
                    # Default to first province if not found
                    province = Province.objects.first()
            except Exception:
                province = Province.objects.first()
            
            # Calculate duration
            duration = (serializer.validated_data['end_date'] - serializer.validated_data['start_date']).days + 1
            
            # Map budget to budget_range
            budget = float(serializer.validated_data['budget'])
            if budget < 50:
                budget_range = 'low'
            elif budget <= 150:
                budget_range = 'medium'
            else:
                budget_range = 'high'
            
            # Create the trip plan
            trip_plan = TripPlan.objects.create(
                user=request.user,
                title=trip_data['title'],
                province=province,
                trip_type=serializer.validated_data['trip_type'],
                budget_range=budget_range,
                start_date=serializer.validated_data['start_date'],
                end_date=serializer.validated_data['end_date'],
                duration_days=duration,
                group_size=serializer.validated_data['group_size'],
                preferences={
                    'interests': serializer.validated_data.get('interests', []),
                    'accommodation_preference': serializer.validated_data.get('accommodation_preference'),
                    'activity_level': serializer.validated_data.get('activity_level'),
                    'budget': float(serializer.validated_data['budget']),
                    'budget_currency': serializer.validated_data['budget_currency']
                },
                special_requirements=serializer.validated_data.get('special_requirements'),
                ai_description=trip_data['description'],
                ai_recommendations={
                    'confidence_score': trip_data.get('confidence_score', 0.8),
                    'recommended_destinations': trip_data.get('recommended_destinations', []),
                    'estimated_total_cost': trip_data.get('estimated_total_cost', 0)
                },
                estimated_cost=trip_data.get('estimated_total_cost', 0),
                status='generated'
            )
            
            # Create daily plans and activities
            for day_index, day_data in enumerate(trip_data['daily_plans'], 1):
                daily_plan = DailyPlan.objects.create(
                    trip_plan=trip_plan,
                    day_number=day_index,
                    date=day_data['date'],
                    title=day_data['title'],
                    description=day_data['description']
                )
                
                for activity_data in day_data['activities']:
                    # Convert duration from hours to minutes if provided
                    duration_minutes = None
                    if activity_data.get('duration_hours'):
                        duration_minutes = int(float(activity_data['duration_hours']) * 60)
                    
                    PlannedActivity.objects.create(
                        daily_plan=daily_plan,
                        place_id=activity_data.get('place_id'),
                        activity_type=activity_data.get('activity_type', 'visit'),
                        title=activity_data.get('title', activity_data.get('name', 'Activity')),
                        description=activity_data.get('description', ''),
                        start_time=activity_data.get('start_time'),
                        end_time=activity_data.get('end_time'),
                        duration_minutes=duration_minutes,
                        estimated_cost=activity_data.get('estimated_cost', 0),
                        notes=activity_data.get('notes', ''),
                        order=activity_data.get('order', 0)
                    )
            
            # Return the created trip plan
            trip_serializer = TripPlanSerializer(trip_plan, context={'request': request})
            return Response(trip_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"\n=== TRIP GENERATION ERROR ===")
            print(f"Error: {str(e)}")
            print(f"Error type: {type(e).__name__}")
            print(f"Traceback:")
            traceback.print_exc()
            print(f"Request data: {request.data}")
            print(f"=== END ERROR ===")
            return Response({
                'error': 'Failed to generate trip plan',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    print(f"\n=== VALIDATION ERRORS ===")
    print(f"Serializer errors: {serializer.errors}")
    print(f"=== END VALIDATION ERRORS ===")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trip_recommendations(request):
    """Get personalized trip recommendations"""
    try:
        recommendation_service = TripRecommendationService()
        recommendations = recommendation_service.get_recommendations(
            user=request.user,
            limit=int(request.query_params.get('limit', 5))
        )
        
        serializer = TripRecommendationSerializer(recommendations, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({
            'error': 'Failed to get recommendations',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_trip_plan(request, trip_plan_id):
    """Save a public trip plan"""
    try:
        trip_plan = TripPlan.objects.get(
            id=trip_plan_id,
            is_public=True,
            status='active'
        )
        
        # Check if already saved
        saved_plan, created = SavedTripPlan.objects.get_or_create(
            user=request.user,
            trip_plan=trip_plan,
            defaults={'notes': request.data.get('notes', '')}
        )
        
        if created:
            serializer = SavedTripPlanSerializer(saved_plan)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(
                {'message': 'Trip plan already saved'},
                status=status.HTTP_200_OK
            )
            
    except TripPlan.DoesNotExist:
        return Response(
            {'error': 'Trip plan not found or not public'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unsave_trip_plan(request, trip_plan_id):
    """Remove a trip plan from saved list"""
    try:
        saved_plan = SavedTripPlan.objects.get(
            user=request.user,
            trip_plan_id=trip_plan_id
        )
        saved_plan.delete()
        return Response(
            {'message': 'Trip plan removed from saved list'},
            status=status.HTTP_200_OK
        )
        
    except SavedTripPlan.DoesNotExist:
        return Response(
            {'error': 'Saved trip plan not found'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def duplicate_trip_plan(request, trip_plan_id):
    """Duplicate a trip plan (public or own)"""
    try:
        # Get the original trip plan
        if request.user.trip_plans.filter(id=trip_plan_id).exists():
            # User's own trip plan
            original_plan = TripPlan.objects.get(id=trip_plan_id)
        else:
            # Public trip plan
            original_plan = TripPlan.objects.get(
                id=trip_plan_id,
                is_public=True,
                status='active'
            )
        
        # Create duplicate
        duplicate_plan = TripPlan.objects.create(
            user=request.user,
            title=f"Copy of {original_plan.title}",
            description=original_plan.description,
            start_date=original_plan.start_date,
            end_date=original_plan.end_date,
            budget=original_plan.budget,
            budget_currency=original_plan.budget_currency,
            group_size=original_plan.group_size,
            trip_type=original_plan.trip_type,
            preferences=original_plan.preferences,
            is_public=False,
            ai_generated=original_plan.ai_generated,
            ai_confidence_score=original_plan.ai_confidence_score
        )
        
        # Duplicate daily plans and activities
        for daily_plan in original_plan.daily_plans.all():
            new_daily_plan = DailyPlan.objects.create(
                trip_plan=duplicate_plan,
                date=daily_plan.date,
                title=daily_plan.title,
                description=daily_plan.description,
                notes=daily_plan.notes
            )
            
            for activity in daily_plan.activities.all():
                PlannedActivity.objects.create(
                    daily_plan=new_daily_plan,
                    place=activity.place,
                    activity_type=activity.activity_type,
                    start_time=activity.start_time,
                    end_time=activity.end_time,
                    duration_hours=activity.duration_hours,
                    estimated_cost=activity.estimated_cost,
                    notes=activity.notes
                )
        
        serializer = TripPlanSerializer(duplicate_plan, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except TripPlan.DoesNotExist:
        return Response(
            {'error': 'Trip plan not found or not accessible'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def search_trip_plans(request):
    """Advanced search for trip plans"""
    serializer = TripPlanSearchSerializer(data=request.data)
    if serializer.is_valid():
        data = serializer.validated_data
        
        # Base queryset
        queryset = TripPlan.objects.filter(
            is_public=True,
            status='active'
        ).annotate(
            average_rating=Avg('ratings__rating'),
            rating_count=Count('ratings')
        )
        
        # Apply filters
        if data.get('query'):
            queryset = queryset.filter(
                Q(title__icontains=data['query']) |
                Q(description__icontains=data['query'])
            )
        
        if data.get('trip_type'):
            queryset = queryset.filter(trip_type=data['trip_type'])
        
        if data.get('min_budget'):
            queryset = queryset.filter(budget__gte=data['min_budget'])
        
        if data.get('max_budget'):
            queryset = queryset.filter(budget__lte=data['max_budget'])
        
        if data.get('min_duration'):
            queryset = queryset.filter(duration_days__gte=data['min_duration'])
        
        if data.get('max_duration'):
            queryset = queryset.filter(duration_days__lte=data['max_duration'])
        
        if data.get('group_size'):
            queryset = queryset.filter(group_size=data['group_size'])
        
        if data.get('ai_generated') is not None:
            queryset = queryset.filter(ai_generated=data['ai_generated'])
        
        # Apply ordering
        ordering = data.get('ordering', '-created_at')
        queryset = queryset.order_by(ordering)
        
        # Paginate results
        paginator = TripPlanPagination()
        page = paginator.paginate_queryset(queryset, request)
        
        if page is not None:
            serializer = TripPlanListSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        serializer = TripPlanListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Statistics Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_trip_statistics(request):
    """Get user's trip planning statistics"""
    user = request.user
    
    # Calculate statistics
    total_plans = user.trip_plans.count()
    completed_plans = user.trip_plans.filter(status='completed').count()
    saved_plans = user.saved_trip_plans.count()
    
    avg_rating = user.trip_plan_ratings.aggregate(
        avg=Avg('rating')
    )['avg'] or 0
    
    # Most common trip type
    trip_type_counts = user.trip_plans.values('trip_type').annotate(
        count=Count('trip_type')
    ).order_by('-count').first()
    
    favorite_trip_type = trip_type_counts['trip_type'] if trip_type_counts else 'adventure'
    
    total_budget = user.trip_plans.aggregate(
        total=Sum('budget')
    )['total'] or 0
    
    stats = {
        'total_plans': total_plans,
        'completed_plans': completed_plans,
        'saved_plans': saved_plans,
        'average_rating_given': float(avg_rating),
        'favorite_trip_type': favorite_trip_type,
        'total_budget_planned': total_budget
    }
    
    serializer = UserTripStatsSerializer(stats)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def trip_plan_statistics(request):
    """Get overall trip plan statistics (admin only)"""
    today = timezone.now().date()
    
    # Basic stats
    total_plans = TripPlan.objects.count()
    public_plans = TripPlan.objects.filter(is_public=True).count()
    ai_generated_plans = TripPlan.objects.filter(ai_generated=True).count()
    
    # Average duration and budget
    avg_duration = TripPlan.objects.annotate(
        duration=F('end_date') - F('start_date')
    ).aggregate(avg=Avg('duration'))['avg']
    
    avg_budget = TripPlan.objects.aggregate(avg=Avg('budget'))['avg'] or 0
    
    # Popular trip types
    popular_types = dict(
        TripPlan.objects.values('trip_type').annotate(
            count=Count('trip_type')
        ).values_list('trip_type', 'count')
    )
    
    # Monthly creation stats (last 12 months)
    monthly_stats = {}
    for i in range(12):
        month_start = today.replace(day=1) - timedelta(days=30*i)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        count = TripPlan.objects.filter(
            created_at__date__gte=month_start,
            created_at__date__lte=month_end
        ).count()
        
        monthly_stats[month_start.strftime('%Y-%m')] = count
    
    stats = {
        'total_plans': total_plans,
        'public_plans': public_plans,
        'ai_generated_plans': ai_generated_plans,
        'average_duration': float(avg_duration.days) if avg_duration else 0,
        'average_budget': float(avg_budget),
        'popular_trip_types': popular_types,
        'monthly_creation_stats': monthly_stats,
        'top_destinations': []  # Would need to implement based on places in activities
    }
    
    serializer = TripPlanStatsSerializer(stats)
    return Response(serializer.data)

# Admin Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_trip_plan_operations(request):
    """Bulk operations on user's trip plans"""
    serializer = BulkTripPlanSerializer(data=request.data)
    if serializer.is_valid():
        data = serializer.validated_data
        trip_plan_ids = data['trip_plan_ids']
        action = data['action']
        
        # Only allow operations on user's own trip plans
        queryset = TripPlan.objects.filter(
            id__in=trip_plan_ids,
            user=request.user
        )
        
        if action == 'delete':
            count = queryset.count()
            queryset.delete()
            message = f'{count} trip plans deleted'
        elif action == 'make_public':
            count = queryset.update(is_public=True)
            message = f'{count} trip plans made public'
        elif action == 'make_private':
            count = queryset.update(is_public=False)
            message = f'{count} trip plans made private'
        
        return Response({'message': message}, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_trip_plans(request):
    """Export trip plans"""
    serializer = TripPlanExportSerializer(data=request.data)
    if serializer.is_valid():
        # Implementation for data export would go here
        # This is a placeholder for the actual export functionality
        return Response({
            'message': 'Export functionality not yet implemented',
            'requested_format': serializer.validated_data.get('format', 'json')
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
