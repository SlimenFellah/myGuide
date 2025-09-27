from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import SubscriptionPlan, UserSubscription, PaymentHistory, SubscriptionUsage

User = get_user_model()


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    """Serializer for subscription plans"""
    
    class Meta:
        model = SubscriptionPlan
        fields = [
            'id', 'name', 'price', 'duration_days', 'stripe_price_id',
            'features', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserSubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for user subscriptions"""
    plan = SubscriptionPlanSerializer(read_only=True)
    plan_id = serializers.IntegerField(write_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    is_premium = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = UserSubscription
        fields = [
            'id', 'user', 'user_email', 'user_username', 'plan', 'plan_id',
            'status', 'stripe_subscription_id', 'stripe_customer_id',
            'start_date', 'end_date', 'auto_renew', 'is_active', 'is_premium',
            'days_remaining', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'user_email', 'user_username', 'plan',
            'is_active', 'is_premium', 'days_remaining', 'created_at', 'updated_at'
        ]


class PaymentHistorySerializer(serializers.ModelSerializer):
    """Serializer for payment history"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    subscription_plan = serializers.CharField(source='subscription.plan.name', read_only=True)
    
    class Meta:
        model = PaymentHistory
        fields = [
            'id', 'user', 'user_email', 'user_username', 'subscription',
            'subscription_plan', 'amount', 'currency', 'status', 'payment_method',
            'stripe_payment_intent_id', 'stripe_invoice_id', 'transaction_id',
            'payment_date', 'metadata'
        ]
        read_only_fields = [
            'id', 'user', 'user_email', 'user_username', 'subscription_plan',
            'payment_date'
        ]


class SubscriptionUsageSerializer(serializers.ModelSerializer):
    """Serializer for subscription usage"""
    user_email = serializers.CharField(source='subscription.user.email', read_only=True)
    plan_name = serializers.CharField(source='subscription.plan.name', read_only=True)
    can_create_trip = serializers.BooleanField(read_only=True)
    can_use_chatbot = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = SubscriptionUsage
        fields = [
            'id', 'subscription', 'user_email', 'plan_name',
            'trips_created', 'chatbot_messages', 'api_calls_today',
            'last_reset_date', 'can_create_trip', 'can_use_chatbot'
        ]
        read_only_fields = [
            'id', 'user_email', 'plan_name', 'last_reset_date',
            'can_create_trip', 'can_use_chatbot'
        ]


class CreatePaymentIntentSerializer(serializers.Serializer):
    """Serializer for creating payment intent"""
    plan_id = serializers.IntegerField()
    payment_method_id = serializers.CharField(required=False)
    
    def validate_plan_id(self, value):
        try:
            plan = SubscriptionPlan.objects.get(id=value, is_active=True)
            if plan.name == 'free':
                raise serializers.ValidationError("Cannot create payment for free plan")
        except SubscriptionPlan.DoesNotExist:
            raise serializers.ValidationError("Invalid plan ID")
        return value


class SubscriptionStatusSerializer(serializers.Serializer):
    """Serializer for subscription status response"""
    is_premium = serializers.BooleanField()
    plan_name = serializers.CharField()
    status = serializers.CharField()
    days_remaining = serializers.IntegerField()
    end_date = serializers.DateTimeField()
    can_create_trip = serializers.BooleanField()
    can_use_chatbot = serializers.BooleanField()
    trips_created = serializers.IntegerField()
    chatbot_messages = serializers.IntegerField()


class UpgradeSubscriptionSerializer(serializers.Serializer):
    """Serializer for upgrading subscription"""
    plan_id = serializers.IntegerField()
    
    def validate_plan_id(self, value):
        try:
            plan = SubscriptionPlan.objects.get(id=value, is_active=True)
            if plan.name == 'free':
                raise serializers.ValidationError("Cannot upgrade to free plan")
        except SubscriptionPlan.DoesNotExist:
            raise serializers.ValidationError("Invalid plan ID")
        return value