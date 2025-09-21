from rest_framework import serializers
from .models import (
    Province, District, Municipality, PlaceCategory, Place, 
    PlaceImage, Feedback, FeedbackHelpful
)
from django.contrib.auth import get_user_model

User = get_user_model()

class ProvinceSerializer(serializers.ModelSerializer):
    """Province serializer"""
    places_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Province
        fields = '__all__'
    
    def get_places_count(self, obj):
        return obj.places_count

class DistrictSerializer(serializers.ModelSerializer):
    """District serializer"""
    province_name = serializers.CharField(source='province.name', read_only=True)
    places_count = serializers.SerializerMethodField()
    
    class Meta:
        model = District
        fields = '__all__'
    
    def get_places_count(self, obj):
        return obj.places_count

class MunicipalitySerializer(serializers.ModelSerializer):
    """Municipality serializer"""
    district_name = serializers.CharField(source='district.name', read_only=True)
    province_name = serializers.CharField(source='district.province.name', read_only=True)
    places_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Municipality
        fields = '__all__'
    
    def get_places_count(self, obj):
        return obj.places_count

class PlaceCategorySerializer(serializers.ModelSerializer):
    """Place category serializer"""
    places_count = serializers.SerializerMethodField()
    
    class Meta:
        model = PlaceCategory
        fields = '__all__'
    
    def get_places_count(self, obj):
        return obj.places.filter(is_active=True).count()

class PlaceImageSerializer(serializers.ModelSerializer):
    """Place image serializer"""
    
    class Meta:
        model = PlaceImage
        fields = '__all__'
        read_only_fields = ('uploaded_at',)

class PlaceListSerializer(serializers.ModelSerializer):
    """Place list serializer (for listing views)"""
    province_name = serializers.CharField(source='municipality.district.province.name', read_only=True)
    district_name = serializers.CharField(source='municipality.district.name', read_only=True)
    municipality_name = serializers.CharField(source='municipality.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    # Frontend compatibility fields
    province = serializers.CharField(source='municipality.district.province.name', read_only=True)
    district = serializers.CharField(source='municipality.district.name', read_only=True)
    municipality = serializers.CharField(source='municipality.name', read_only=True)
    category = serializers.CharField(source='category.name', read_only=True)
    
    main_image = serializers.SerializerMethodField()
    rating = serializers.DecimalField(source='average_rating', max_digits=3, decimal_places=2, read_only=True)
    reviews = serializers.IntegerField(source='total_ratings', read_only=True)
    averageCost = serializers.SerializerMethodField()
    costType = serializers.SerializerMethodField()
    
    class Meta:
        model = Place
        fields = [
            'id', 'name', 'description', 'province_name', 'district_name', 
            'municipality_name', 'category_name', 'province', 'district', 
            'municipality', 'category', 'main_image', 'average_rating', 
            'total_ratings', 'rating', 'reviews', 'averageCost', 'costType',
            'is_featured', 'created_at', 'place_type'
        ]
    
    def get_main_image(self, obj):
        main_image = obj.images.filter(is_primary=True).first()
        if main_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(main_image.image.url)
            return main_image.image.url
        return None
    
    def get_averageCost(self, obj):
        # Return entry fee if available, otherwise return 0
        return float(obj.entry_fee) if obj.entry_fee else 0
    
    def get_costType(self, obj):
        # Return cost type based on entry fee
        if obj.entry_fee and obj.entry_fee > 0:
            return "entry"
        return "free"

class PlaceDetailSerializer(serializers.ModelSerializer):
    """Place detail serializer (for detail views)"""
    province = ProvinceSerializer(source='municipality.district.province', read_only=True)
    district = DistrictSerializer(source='municipality.district', read_only=True)
    municipality = MunicipalitySerializer(read_only=True)
    category = PlaceCategorySerializer(read_only=True)
    images = PlaceImageSerializer(many=True, read_only=True)
    average_rating = serializers.ReadOnlyField()
    total_feedbacks = serializers.ReadOnlyField()
    recent_feedbacks = serializers.SerializerMethodField()
    
    class Meta:
        model = Place
        fields = '__all__'
    
    def get_recent_feedbacks(self, obj):
        recent_feedbacks = obj.feedbacks.filter(status='approved').order_by('-created_at')[:5]
        return FeedbackSerializer(recent_feedbacks, many=True, context=self.context).data

class PlaceCreateUpdateSerializer(serializers.ModelSerializer):
    """Place create/update serializer"""
    
    class Meta:
        model = Place
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class FeedbackSerializer(serializers.ModelSerializer):
    """Feedback serializer"""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_avatar = serializers.SerializerMethodField()
    helpful_count = serializers.SerializerMethodField()
    is_helpful_by_user = serializers.SerializerMethodField()
    place_name = serializers.CharField(source='place.name', read_only=True)
    
    class Meta:
        model = Feedback
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')
    
    def get_user_avatar(self, obj):
        if obj.user and obj.user.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user.profile_picture.url)
            return obj.user.profile_picture.url
        return None
    
    def get_helpful_count(self, obj):
        return obj.helpful_votes.count()
    
    def get_is_helpful_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.helpful_votes.filter(user=request.user).exists()
        return False

class FeedbackCreateSerializer(serializers.ModelSerializer):
    """Feedback create serializer"""
    
    class Meta:
        model = Feedback
        fields = ['place', 'rating', 'comment']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class FeedbackHelpfulSerializer(serializers.ModelSerializer):
    """Feedback helpful serializer"""
    
    class Meta:
        model = FeedbackHelpful
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

# Statistics serializers
class PlaceStatsSerializer(serializers.Serializer):
    """Place statistics serializer"""
    total_places = serializers.IntegerField()
    featured_places = serializers.IntegerField()
    places_by_category = serializers.DictField()
    places_by_province = serializers.DictField()
    average_rating = serializers.FloatField()
    total_feedbacks = serializers.IntegerField()

class ProvinceStatsSerializer(serializers.Serializer):
    """Province statistics serializer"""
    total_provinces = serializers.IntegerField()
    total_districts = serializers.IntegerField()
    total_municipalities = serializers.IntegerField()
    places_distribution = serializers.DictField()

# Search and filter serializers
class PlaceSearchSerializer(serializers.Serializer):
    """Place search serializer"""
    query = serializers.CharField(required=False, allow_blank=True)
    province = serializers.IntegerField(required=False)
    district = serializers.IntegerField(required=False)
    municipality = serializers.IntegerField(required=False)
    category = serializers.IntegerField(required=False)
    min_rating = serializers.FloatField(required=False, min_value=0, max_value=5)
    is_featured = serializers.BooleanField(required=False)
    ordering = serializers.ChoiceField(
        choices=['name', '-name', 'created_at', '-created_at', 'average_rating', '-average_rating'],
        required=False,
        default='-created_at'
    )