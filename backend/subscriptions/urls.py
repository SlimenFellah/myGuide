from django.urls import path
from . import views

app_name = 'subscriptions'

urlpatterns = [
    # Subscription plans
    path('plans/', views.SubscriptionPlanListView.as_view(), name='subscription-plans'),
    
    # User subscription management
    path('status/', views.UserSubscriptionStatusView.as_view(), name='subscription-status'),
    path('payment-history/', views.PaymentHistoryView.as_view(), name='payment-history'),
    path('cancel/', views.CancelSubscriptionView.as_view(), name='cancel-subscription'),
    
    # Payment processing
    path('create-payment-intent/', views.CreatePaymentIntentView.as_view(), name='create-payment-intent'),
    path('confirm-payment/', views.ConfirmPaymentView.as_view(), name='confirm-payment'),
    
    # Stripe webhooks
    path('webhook/', views.stripe_webhook, name='stripe-webhook'),
]