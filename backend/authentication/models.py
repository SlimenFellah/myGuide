# Developed & maintained by Slimene Fellah — Available for freelance work at slimenefellah.dev

from django.contrib.auth.models import AbstractUser
from django.db import models
from PIL import Image

class User(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    phone = models.CharField(max_length=15, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    is_admin = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        
        # Resize profile picture if it exists
        if self.profile_picture:
            img = Image.open(self.profile_picture.path)
            if img.height > 300 or img.width > 300:
                output_size = (300, 300)
                img.thumbnail(output_size)
                img.save(self.profile_picture.path)
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

class UserPreferences(models.Model):
    BUDGET_CHOICES = [
        ('low', 'Low Budget (< $50/day)'),
        ('medium', 'Medium Budget ($50-150/day)'),
        ('high', 'High Budget (> $150/day)'),
    ]
    
    TRAVEL_STYLE_CHOICES = [
        ('adventure', 'Adventure'),
        ('cultural', 'Cultural'),
        ('relaxation', 'Relaxation'),
        ('family', 'Family-friendly'),
        ('luxury', 'Luxury'),
        ('budget', 'Budget Travel'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    preferred_budget = models.CharField(max_length=10, choices=BUDGET_CHOICES, default='medium')
    travel_style = models.CharField(max_length=15, choices=TRAVEL_STYLE_CHOICES, default='cultural')
    preferred_activities = models.JSONField(default=list, blank=True)
    dietary_restrictions = models.TextField(blank=True, null=True)
    accessibility_needs = models.TextField(blank=True, null=True)
    language_preference = models.CharField(max_length=10, default='en')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.full_name}'s Preferences"

class UserActivity(models.Model):
    ACTIVITY_TYPES = [
        ('login', 'Login'),
        ('search', 'Search'),
        ('view_place', 'View Place'),
        ('create_trip', 'Create Trip'),
        ('chat', 'Chat with AI'),
        ('feedback', 'Leave Feedback'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    description = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = 'User Activities'
    
    def __str__(self):
        return f"{self.user.full_name} - {self.activity_type} at {self.timestamp}"
