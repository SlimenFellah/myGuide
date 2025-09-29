from django.urls import path
from . import views

app_name = 'subscriptions'

urlpatterns = [
    # Subscription plans
    path('plans/', views.SubscriptionPlanListView.as_view(), name='subscription-plans'),
    
    # User subscription management
    path('status/', views.UserSubscriptionStatusView.as_view(), name='subscription-status'),
    path('payment-history/', views.PaymentHistoryView.as_view(), name='payment-history'),
    path('upgrade/', views.UpgradeSubscriptionView.as_view(), name='upgrade_subscription'),
    path('preview-change/', views.PreviewSubscriptionChangeView.as_view(), name='preview_subscription_change'),
    path('cancel/', views.CancelSubscriptionView.as_view(), name='cancel_subscription'),
    
    # Payment endpoints
    path('create-payment-intent/', views.CreatePaymentIntentView.as_view(), name='create-payment-intent'),
    path('create-checkout-session/', views.CreateCheckoutSessionView.as_view(), name='create-checkout-session'),
    path('verify-checkout-session/', views.verify_checkout_session, name='verify-checkout-session'),
    path('confirm-payment/', views.ConfirmPaymentView.as_view(), name='confirm-payment'),
    
    # Stripe webhooks
    path('webhook/', views.stripe_webhook, name='stripe-webhook'),
]