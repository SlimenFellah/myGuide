from django.shortcuts import render
from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Count
from django.contrib.auth import get_user_model

from .models import (
    Province, District, Municipality, PlaceCategory, Place, 
    PlaceImage, Feedback, FeedbackHelpful
)
from .serializers import (
    ProvinceSerializer, DistrictSerializer, MunicipalitySerializer,
    PlaceCategorySerializer, PlaceListSerializer, PlaceDetailSerializer,
    PlaceCreateUpdateSerializer, PlaceImageSerializer, FeedbackSerializer,
    FeedbackCreateSerializer, FeedbackHelpfulSerializer, PlaceStatsSerializer,
    ProvinceStatsSerializer, PlaceSearchSerializer
)
from .permissions import IsOwnerOrReadOnly, IsAdminOrReadOnly

User = get_user_model()

# Custom pagination
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

# Province Views
class ProvinceListCreateView(generics.ListCreateAPIView):
    """List all provinces or create a new province"""
    queryset = Province.objects.all().order_by('name')
    serializer_class = ProvinceSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

class ProvinceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a province"""
    queryset = Province.objects.all()
    serializer_class = ProvinceSerializer
    permission_classes = [IsAdminOrReadOnly]

# District Views
class DistrictListCreateView(generics.ListCreateAPIView):
    """List all districts or create a new district"""
    queryset = District.objects.select_related('province').all().order_by('name')
    serializer_class = DistrictSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['province']
    search_fields = ['name', 'description', 'province__name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

class DistrictDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a district"""
    queryset = District.objects.select_related('province').all()
    serializer_class = DistrictSerializer
    permission_classes = [IsAdminOrReadOnly]

# Municipality Views
class MunicipalityListCreateView(generics.ListCreateAPIView):
    """List all municipalities or create a new municipality"""
    queryset = Municipality.objects.select_related('district__province').all().order_by('name')
    serializer_class = MunicipalitySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['district', 'district__province']
    search_fields = ['name', 'description', 'district__name', 'district__province__name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

class MunicipalityDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a municipality"""
    queryset = Municipality.objects.select_related('district__province').all()
    serializer_class = MunicipalitySerializer
    permission_classes = [IsAdminOrReadOnly]

# Place Category Views
class PlaceCategoryListCreateView(generics.ListCreateAPIView):
    """List all place categories or create a new category"""
    queryset = PlaceCategory.objects.all().order_by('name')
    serializer_class = PlaceCategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

class PlaceCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a place category"""
    queryset = PlaceCategory.objects.all()
    serializer_class = PlaceCategorySerializer
    permission_classes = [IsAdminOrReadOnly]

# Place Views
class PlaceListView(generics.ListAPIView):
    """List all active places with search and filtering"""
    serializer_class = PlaceListSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['province', 'district', 'municipality', 'category', 'is_featured']
    search_fields = ['name', 'description', 'address']
    ordering_fields = ['name', 'created_at', 'average_rating']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Place.objects.filter(is_active=True).select_related(
            'province', 'district', 'municipality', 'category'
        ).prefetch_related('images', 'feedbacks')
        
        # Custom filtering
        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            queryset = queryset.filter(average_rating__gte=float(min_rating))
        
        return queryset

class PlaceCreateView(generics.CreateAPIView):
    """Create a new place (admin only)"""
    queryset = Place.objects.all()
    serializer_class = PlaceCreateUpdateSerializer
    permission_classes = [IsAdminUser]

class PlaceDetailView(generics.RetrieveAPIView):
    """Retrieve a place with full details"""
    queryset = Place.objects.filter(is_active=True).select_related(
        'province', 'district', 'municipality', 'category'
    ).prefetch_related('images', 'feedbacks__user')
    serializer_class = PlaceDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class PlaceUpdateView(generics.UpdateAPIView):
    """Update a place (admin only)"""
    queryset = Place.objects.all()
    serializer_class = PlaceCreateUpdateSerializer
    permission_classes = [IsAdminUser]

class PlaceDeleteView(generics.DestroyAPIView):
    """Delete a place (admin only)"""
    queryset = Place.objects.all()
    permission_classes = [IsAdminUser]

# Featured Places
class FeaturedPlacesView(generics.ListAPIView):
    """List featured places"""
    queryset = Place.objects.filter(is_active=True, is_featured=True).select_related(
        'province', 'district', 'municipality', 'category'
    ).prefetch_related('images')[:10]
    serializer_class = PlaceListSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

# Place Images Views
class PlaceImageListCreateView(generics.ListCreateAPIView):
    """List or create place images"""
    serializer_class = PlaceImageSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        place_id = self.kwargs.get('place_id')
        return PlaceImage.objects.filter(place_id=place_id)
    
    def perform_create(self, serializer):
        place_id = self.kwargs.get('place_id')
        serializer.save(place_id=place_id)

class PlaceImageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a place image"""
    queryset = PlaceImage.objects.all()
    serializer_class = PlaceImageSerializer
    permission_classes = [IsAdminUser]

# Feedback Views
class FeedbackListView(generics.ListAPIView):
    """List feedbacks for a place"""
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']
    
    def get_queryset(self):
        place_id = self.kwargs.get('place_id')
        return Feedback.objects.filter(
            place_id=place_id, 
            is_approved=True
        ).select_related('user').prefetch_related('helpful_votes')

class FeedbackCreateView(generics.CreateAPIView):
    """Create a new feedback"""
    serializer_class = FeedbackCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class FeedbackDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a feedback"""
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [IsOwnerOrReadOnly]

# Feedback Helpful Views
class FeedbackHelpfulToggleView(generics.CreateAPIView):
    """Toggle helpful vote for a feedback"""
    serializer_class = FeedbackHelpfulSerializer
    permission_classes = [IsAuthenticated]
    
    def post(self, request, feedback_id):
        try:
            feedback = Feedback.objects.get(id=feedback_id)
            helpful_vote, created = FeedbackHelpful.objects.get_or_create(
                user=request.user,
                feedback=feedback
            )
            
            if not created:
                helpful_vote.delete()
                return Response({'message': 'Helpful vote removed'}, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'Helpful vote added'}, status=status.HTTP_201_CREATED)
        except Feedback.DoesNotExist:
            return Response({'error': 'Feedback not found'}, status=status.HTTP_404_NOT_FOUND)

# Search Views
@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def search_places(request):
    """Advanced search for places"""
    serializer = PlaceSearchSerializer(data=request.query_params)
    if serializer.is_valid():
        data = serializer.validated_data
        queryset = Place.objects.filter(is_active=True)
        
        # Apply filters
        if data.get('query'):
            queryset = queryset.filter(
                Q(name__icontains=data['query']) |
                Q(description__icontains=data['query']) |
                Q(address__icontains=data['query'])
            )
        
        if data.get('province'):
            queryset = queryset.filter(province_id=data['province'])
        
        if data.get('district'):
            queryset = queryset.filter(district_id=data['district'])
        
        if data.get('municipality'):
            queryset = queryset.filter(municipality_id=data['municipality'])
        
        if data.get('category'):
            queryset = queryset.filter(category_id=data['category'])
        
        if data.get('min_rating'):
            queryset = queryset.filter(average_rating__gte=data['min_rating'])
        
        if data.get('is_featured') is not None:
            queryset = queryset.filter(is_featured=data['is_featured'])
        
        # Apply ordering
        ordering = data.get('ordering', '-created_at')
        queryset = queryset.order_by(ordering)
        
        # Paginate results
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        
        if page is not None:
            serializer = PlaceListSerializer(page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)
        
        serializer = PlaceListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Statistics Views
@api_view(['GET'])
@permission_classes([IsAdminUser])
def place_statistics(request):
    """Get place statistics for admin dashboard"""
    stats = {
        'total_places': Place.objects.filter(is_active=True).count(),
        'featured_places': Place.objects.filter(is_active=True, is_featured=True).count(),
        'places_by_category': dict(
            PlaceCategory.objects.annotate(
                count=Count('places', filter=Q(places__is_active=True))
            ).values_list('name', 'count')
        ),
        'places_by_province': dict(
            Province.objects.annotate(
                count=Count('places', filter=Q(places__is_active=True))
            ).values_list('name', 'count')
        ),
        'average_rating': Place.objects.filter(is_active=True).aggregate(
            avg_rating=Avg('average_rating')
        )['avg_rating'] or 0,
        'total_feedbacks': Feedback.objects.filter(is_approved=True).count()
    }
    
    serializer = PlaceStatsSerializer(stats)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def province_statistics(request):
    """Get province statistics for admin dashboard"""
    stats = {
        'total_provinces': Province.objects.count(),
        'total_districts': District.objects.count(),
        'total_municipalities': Municipality.objects.count(),
        'places_distribution': dict(
            Province.objects.annotate(
                places_count=Count('places', filter=Q(places__is_active=True)),
                districts_count=Count('districts'),
                municipalities_count=Count('districts__municipalities')
            ).values_list('name', 'places_count')
        )
    }
    
    serializer = ProvinceStatsSerializer(stats)
    return Response(serializer.data)

# Admin bulk operations
@api_view(['POST'])
@permission_classes([IsAdminUser])
def bulk_approve_feedbacks(request):
    """Bulk approve feedbacks"""
    feedback_ids = request.data.get('feedback_ids', [])
    if not feedback_ids:
        return Response({'error': 'No feedback IDs provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    updated_count = Feedback.objects.filter(id__in=feedback_ids).update(is_approved=True)
    return Response({
        'message': f'{updated_count} feedbacks approved successfully'
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def bulk_feature_places(request):
    """Bulk feature/unfeature places"""
    place_ids = request.data.get('place_ids', [])
    is_featured = request.data.get('is_featured', True)
    
    if not place_ids:
        return Response({'error': 'No place IDs provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    updated_count = Place.objects.filter(id__in=place_ids).update(is_featured=is_featured)
    action = 'featured' if is_featured else 'unfeatured'
    return Response({
        'message': f'{updated_count} places {action} successfully'
    }, status=status.HTTP_200_OK)
