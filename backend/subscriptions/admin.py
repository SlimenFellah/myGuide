from django.contrib import admin
from .models import SubscriptionPlan, UserSubscription, PaymentHistory, SubscriptionUsage


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'duration_days', 'is_active', 'created_at']
    list_filter = ['name', 'is_active']
    search_fields = ['name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'status', 'start_date', 'end_date', 'is_active', 'auto_renew']
    list_filter = ['plan', 'status', 'auto_renew']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at', 'is_active', 'is_premium', 'days_remaining']
    date_hierarchy = 'start_date'


@admin.register(PaymentHistory)
class PaymentHistoryAdmin(admin.ModelAdmin):
    list_display = ['user', 'amount', 'currency', 'status', 'payment_method', 'payment_date']
    list_filter = ['status', 'payment_method', 'currency']
    search_fields = ['user__username', 'user__email', 'transaction_id']
    readonly_fields = ['payment_date']
    date_hierarchy = 'payment_date'


@admin.register(SubscriptionUsage)
class SubscriptionUsageAdmin(admin.ModelAdmin):
    list_display = ['subscription', 'trips_created', 'chatbot_messages', 'api_calls_today', 'last_reset_date']
    list_filter = ['last_reset_date']
    search_fields = ['subscription__user__username']
    readonly_fields = ['last_reset_date']