# Developed & maintained by Slimene Fellah — Available for freelance work at slimenefellah.dev

from django.db import models
from django.contrib.auth import get_user_model
from PIL import Image
import os

User = get_user_model()

class Province(models.Model):
    name = models.CharField(max_length=100, unique=True)
    name_ar = models.CharField(max_length=100, blank=True, null=True)  # Arabic name
    description = models.TextField()
    description_ar = models.TextField(blank=True, null=True)  # Arabic description
    image = models.ImageField(upload_to='provinces/', blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    area_km2 = models.FloatField(blank=True, null=True)
    population = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    @property
    def districts_count(self):
        return self.districts.count()
    
    @property
    def places_count(self):
        return sum(district.places_count for district in self.districts.all())

class District(models.Model):
    name = models.CharField(max_length=100)
    name_ar = models.CharField(max_length=100, blank=True, null=True)
    province = models.ForeignKey(Province, on_delete=models.CASCADE, related_name='districts')
    description = models.TextField(blank=True, null=True)
    description_ar = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='districts/', blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        unique_together = ['name', 'province']
    
    def __str__(self):
        return f"{self.name}, {self.province.name}"
    
    @property
    def municipalities_count(self):
        return self.municipalities.count()
    
    @property
    def places_count(self):
        return sum(municipality.places_count for municipality in self.municipalities.all())

class Municipality(models.Model):
    name = models.CharField(max_length=100)
    name_ar = models.CharField(max_length=100, blank=True, null=True)
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='municipalities')
    description = models.TextField(blank=True, null=True)
    description_ar = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='municipalities/', blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    population = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        unique_together = ['name', 'district']
        verbose_name_plural = 'Municipalities'
    
    def __str__(self):
        return f"{self.name}, {self.district.name}"
    
    @property
    def places_count(self):
        return self.places.count()
    
    @property
    def province(self):
        return self.district.province

class PlaceCategory(models.Model):
    name = models.CharField(max_length=50, unique=True)
    name_ar = models.CharField(max_length=50, blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True)  # Icon class name
    color = models.CharField(max_length=7, default='#3B82F6')  # Hex color
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Place Categories'
    
    def __str__(self):
        return self.name

class Place(models.Model):
    PLACE_TYPES = [
        ('historical', 'Historical Site'),
        ('natural', 'Natural Attraction'),
        ('cultural', 'Cultural Site'),
        ('religious', 'Religious Site'),
        ('museum', 'Museum'),
        ('park', 'Park/Garden'),
        ('beach', 'Beach'),
        ('mountain', 'Mountain'),
        ('restaurant', 'Restaurant'),
        ('hotel', 'Hotel'),
        ('shopping', 'Shopping'),
        ('entertainment', 'Entertainment'),
    ]
    
    name = models.CharField(max_length=200)
    name_ar = models.CharField(max_length=200, blank=True, null=True)
    municipality = models.ForeignKey(Municipality, on_delete=models.CASCADE, related_name='places')
    category = models.ForeignKey(PlaceCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='places')
    place_type = models.CharField(max_length=20, choices=PLACE_TYPES)
    description = models.TextField()
    description_ar = models.TextField(blank=True, null=True)
    short_description = models.CharField(max_length=300, blank=True, null=True)
    address = models.CharField(max_length=300, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    
    # Additional details
    opening_hours = models.JSONField(default=dict, blank=True)  # {"monday": "9:00-17:00", ...}
    entry_fee = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    
    # Ratings and popularity
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_ratings = models.IntegerField(default=0)
    popularity_score = models.IntegerField(default=0)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    
    # Metadata
    tags = models.JSONField(default=list, blank=True)  # ["family-friendly", "accessible", ...]
    amenities = models.JSONField(default=list, blank=True)  # ["parking", "wifi", "restaurant", ...]
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-popularity_score', '-average_rating', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.municipality.name}"
    
    @property
    def district(self):
        return self.municipality.district
    
    @property
    def province(self):
        return self.municipality.district.province
    
    def update_rating(self):
        """Update average rating based on feedbacks"""
        feedbacks = self.feedbacks.filter(rating__isnull=False)
        if feedbacks.exists():
            self.average_rating = feedbacks.aggregate(avg_rating=models.Avg('rating'))['avg_rating']
            self.total_ratings = feedbacks.count()
        else:
            self.average_rating = 0.00
            self.total_ratings = 0
        self.save(update_fields=['average_rating', 'total_ratings'])

class PlaceImage(models.Model):
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='places/')
    caption = models.CharField(max_length=200, blank=True, null=True)
    caption_ar = models.CharField(max_length=200, blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-is_primary', '-uploaded_at']
    
    def __str__(self):
        return f"{self.place.name} - Image {self.id}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        
        # Resize image
        if self.image:
            img = Image.open(self.image.path)
            if img.height > 800 or img.width > 800:
                output_size = (800, 800)
                img.thumbnail(output_size)
                img.save(self.image.path)

class Feedback(models.Model):
    RATING_CHOICES = [
        (1, '1 Star'),
        (2, '2 Stars'),
        (3, '3 Stars'),
        (4, '4 Stars'),
        (5, '5 Stars'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='feedbacks')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feedbacks')
    rating = models.IntegerField(choices=RATING_CHOICES, blank=True, null=True)
    comment = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    
    # Helpful votes
    helpful_count = models.IntegerField(default=0)
    
    # Spam detection fields
    is_spam = models.BooleanField(default=False)
    spam_confidence = models.FloatField(default=0.0, help_text="AI confidence score for spam detection (0.0-1.0)")
    spam_detected_at = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_feedbacks')
    reviewed_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['place', 'user']  # One feedback per user per place
    
    def __str__(self):
        return f"{self.user.full_name} - {self.place.name} ({self.rating}/5)"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update place rating when feedback is saved
        if self.status == 'approved':
            self.place.update_rating()

class FeedbackHelpful(models.Model):
    feedback = models.ForeignKey(Feedback, on_delete=models.CASCADE, related_name='helpful_votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    is_helpful = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['feedback', 'user']
    
    def __str__(self):
        return f"{self.user.full_name} - {self.feedback.id} ({'Helpful' if self.is_helpful else 'Not Helpful'})"
