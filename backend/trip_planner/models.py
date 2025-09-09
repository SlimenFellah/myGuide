from django.db import models
from django.contrib.auth import get_user_model
from tourism.models import Place, Province

User = get_user_model()

class TripPlan(models.Model):
    TRIP_TYPES = [
        ('cultural', 'Cultural Heritage'),
        ('adventure', 'Adventure & Nature'),
        ('relaxation', 'Relaxation & Wellness'),
        ('family', 'Family Fun'),
        ('historical', 'Historical Sites'),
        ('culinary', 'Culinary Experience'),
        ('photography', 'Photography Tour'),
        ('business', 'Business Travel'),
    ]
    
    BUDGET_RANGES = [
        ('low', 'Low Budget (< $50/day)'),
        ('medium', 'Medium Budget ($50-150/day)'),
        ('high', 'High Budget (> $150/day)'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('generated', 'Generated'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trip_plans')
    title = models.CharField(max_length=200)
    province = models.ForeignKey(Province, on_delete=models.CASCADE)
    trip_type = models.CharField(max_length=20, choices=TRIP_TYPES)
    budget_range = models.CharField(max_length=10, choices=BUDGET_RANGES)
    
    # Trip details
    start_date = models.DateField()
    end_date = models.DateField()
    duration_days = models.IntegerField()
    group_size = models.IntegerField(default=1)
    
    # Preferences
    preferences = models.JSONField(default=dict, blank=True)  # User preferences from form
    special_requirements = models.TextField(blank=True, null=True)
    
    # AI Generated content
    ai_description = models.TextField(blank=True, null=True)
    ai_recommendations = models.JSONField(default=dict, blank=True)  # AI suggestions
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    # Status and metadata
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='draft')
    is_public = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.full_name}"
    
    @property
    def total_places(self):
        return sum(day.places.count() for day in self.daily_plans.all())
    
    @property
    def is_current(self):
        from django.utils import timezone
        today = timezone.now().date()
        return self.start_date <= today <= self.end_date

class DailyPlan(models.Model):
    trip_plan = models.ForeignKey(TripPlan, on_delete=models.CASCADE, related_name='daily_plans')
    day_number = models.IntegerField()  # Day 1, 2, 3, etc.
    date = models.DateField()
    title = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    
    # AI generated suggestions
    ai_suggestions = models.JSONField(default=dict, blank=True)
    estimated_budget = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['day_number']
        unique_together = ['trip_plan', 'day_number']
    
    def __str__(self):
        return f"{self.trip_plan.title} - Day {self.day_number}"

class PlannedActivity(models.Model):
    ACTIVITY_TYPES = [
        ('visit', 'Visit Place'),
        ('meal', 'Meal'),
        ('transport', 'Transportation'),
        ('accommodation', 'Accommodation'),
        ('activity', 'Activity/Experience'),
        ('rest', 'Rest/Free Time'),
    ]
    
    daily_plan = models.ForeignKey(DailyPlan, on_delete=models.CASCADE, related_name='activities')
    place = models.ForeignKey(Place, on_delete=models.CASCADE, blank=True, null=True)
    activity_type = models.CharField(max_length=15, choices=ACTIVITY_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    
    # Timing
    start_time = models.TimeField(blank=True, null=True)
    end_time = models.TimeField(blank=True, null=True)
    duration_minutes = models.IntegerField(blank=True, null=True)
    
    # Cost and details
    estimated_cost = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    # Order in the day
    order = models.IntegerField(default=0)
    
    # Status
    is_completed = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'start_time']
    
    def __str__(self):
        return f"{self.daily_plan} - {self.title}"

class TripPlanTemplate(models.Model):
    """Pre-made trip plan templates for common itineraries"""
    name = models.CharField(max_length=200)
    description = models.TextField()
    province = models.ForeignKey(Province, on_delete=models.CASCADE)
    trip_type = models.CharField(max_length=20, choices=TripPlan.TRIP_TYPES)
    duration_days = models.IntegerField()
    
    # Template data
    template_data = models.JSONField(default=dict)  # Structured template information
    estimated_budget_min = models.DecimalField(max_digits=10, decimal_places=2)
    estimated_budget_max = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Metadata
    is_active = models.BooleanField(default=True)
    popularity_score = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-popularity_score', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.province.name} ({self.duration_days} days)"

class TripPlanRating(models.Model):
    """User ratings for trip plans"""
    RATING_CHOICES = [
        (1, '1 Star'),
        (2, '2 Stars'),
        (3, '3 Stars'),
        (4, '4 Stars'),
        (5, '5 Stars'),
    ]
    
    trip_plan = models.ForeignKey(TripPlan, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['trip_plan', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.full_name} - {self.trip_plan.title} ({self.rating}/5)"

class SavedTripPlan(models.Model):
    """Users can save trip plans for later reference"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_trips')
    trip_plan = models.ForeignKey(TripPlan, on_delete=models.CASCADE, related_name='saved_by')
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'trip_plan']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.full_name} saved {self.trip_plan.title}"
