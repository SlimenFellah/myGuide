from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class SubscriptionPlan(models.Model):
    """Model for subscription plans"""
    PLAN_TYPES = [
        ('free', 'Free'),
        ('monthly', 'Monthly Premium'),
        ('annual', 'Annual Premium'),
    ]
    
    name = models.CharField(max_length=50, choices=PLAN_TYPES, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_days = models.IntegerField()  # 0 for free, 30 for monthly, 365 for annual
    stripe_price_id = models.CharField(max_length=100, blank=True, null=True)
    features = models.JSONField(default=dict)  # Store plan features as JSON
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.get_name_display()} - ${self.price}"
    
    class Meta:
        ordering = ['price']


class UserSubscription(models.Model):
    """Model for user subscriptions"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
        ('pending', 'Pending'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    stripe_subscription_id = models.CharField(max_length=100, blank=True, null=True)
    stripe_customer_id = models.CharField(max_length=100, blank=True, null=True)
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(null=True, blank=True)  # Null for free plans (no expiration)
    auto_renew = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.end_date:
            if self.plan.duration_days == 0:  # Free plan - no expiration
                self.end_date = None
            else:
                self.end_date = self.start_date + timedelta(days=self.plan.duration_days)
        super().save(*args, **kwargs)
    
    @property
    def is_active(self):
        if self.status != 'active':
            return False
        # Free plans never expire (end_date is None)
        if self.end_date is None:
            return True
        # Premium plans expire based on end_date
        return self.end_date > timezone.now()
    
    @property
    def is_premium(self):
        return self.is_active and self.plan.name in ['monthly', 'annual']
    
    @property
    def days_remaining(self):
        # Free plans don't expire
        if self.end_date is None:
            return None
        if self.end_date > timezone.now():
            return (self.end_date - timezone.now()).days
        return 0
    
    def __str__(self):
        return f"{self.user.username} - {self.plan.name} ({self.status})"
    
    class Meta:
        ordering = ['-created_at']


class PaymentHistory(models.Model):
    """Model for payment history"""
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_METHODS = [
        ('stripe', 'Stripe'),
        ('paypal', 'PayPal'),
        ('bank_transfer', 'Bank Transfer'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    subscription = models.ForeignKey(UserSubscription, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='stripe')
    stripe_payment_intent_id = models.CharField(max_length=100, blank=True, null=True)
    stripe_invoice_id = models.CharField(max_length=100, blank=True, null=True)
    transaction_id = models.CharField(max_length=100, unique=True)
    payment_date = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict)  # Store additional payment data
    
    def __str__(self):
        return f"{self.user.username} - ${self.amount} ({self.status})"
    
    class Meta:
        ordering = ['-payment_date']


class SubscriptionUsage(models.Model):
    """Model to track subscription usage and limits"""
    subscription = models.OneToOneField(UserSubscription, on_delete=models.CASCADE, related_name='usage')
    trips_created = models.IntegerField(default=0)
    chatbot_messages = models.IntegerField(default=0)
    api_calls_today = models.IntegerField(default=0)
    last_reset_date = models.DateField(auto_now_add=True)
    
    def reset_daily_limits(self):
        """Reset daily usage limits"""
        today = timezone.now().date()
        if self.last_reset_date < today:
            self.api_calls_today = 0
            self.last_reset_date = today
            self.save()
    
    def reset_usage(self):
        """Reset all usage counters (used when changing plans)"""
        self.trips_created = 0
        self.chatbot_messages = 0
        self.api_calls_today = 0
        self.last_reset_date = timezone.now().date()
        self.save()
    
    def can_create_trip(self):
        """Check if user can create more trips based on their plan"""
        if self.subscription.is_premium:
            return True  # Premium users have unlimited trips
        return self.trips_created < 3  # Free users limited to 3 trips
    
    def can_use_chatbot(self):
        """Check if user can use chatbot based on their plan"""
        if self.subscription.is_premium:
            return True  # Premium users have unlimited chatbot access
        return self.chatbot_messages < 10  # Free users limited to 10 messages per day
    
    def __str__(self):
        return f"{self.subscription.user.username} - Usage"
    
    class Meta:
        verbose_name = "Subscription Usage"
        verbose_name_plural = "Subscription Usages"