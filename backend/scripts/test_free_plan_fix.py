#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from subscriptions.models import UserSubscription, SubscriptionPlan
from subscriptions.serializers import SubscriptionStatusSerializer
from subscriptions.views import UserSubscriptionStatusView
from django.test import RequestFactory
from django.contrib.auth.models import AnonymousUser
import json

User = get_user_model()

def test_free_plan_logic():
    """Test that free plans show no expiration date"""
    print("Testing Free Plan Logic Fix")
    print("=" * 50)
    
    try:
        # Get the admin user
        user = User.objects.get(email='admin@gmail.com')
        print(f"Testing with user: {user.email}")
        
        # Get their subscription
        subscription = UserSubscription.objects.get(user=user)
        print(f"User's plan: {subscription.plan.name}")
        print(f"Plan duration: {subscription.plan.duration_days} days")
        print(f"End date: {subscription.end_date}")
        print(f"Is premium: {subscription.is_premium}")
        print(f"Days remaining: {subscription.days_remaining}")
        
        # Test the API response
        factory = RequestFactory()
        request = factory.get('/api/subscriptions/status/')
        request.user = user
        
        view = UserSubscriptionStatusView()
        response = view.get(request)
        
        print("\nAPI Response:")
        print("-" * 30)
        response_data = response.data
        for key, value in response_data.items():
            print(f"{key}: {value}")
        
        # Verify the fix
        print("\nVerification:")
        print("-" * 30)
        if response_data.get('end_date') is None:
            print("✅ PASS: end_date is None for free plan")
        else:
            print(f"❌ FAIL: end_date should be None but got {response_data.get('end_date')}")
            
        if response_data.get('days_remaining') is None:
            print("✅ PASS: days_remaining is None for free plan")
        else:
            print(f"❌ FAIL: days_remaining should be None but got {response_data.get('days_remaining')}")
            
        if response_data.get('is_premium') is False:
            print("✅ PASS: is_premium is False for free plan")
        else:
            print(f"❌ FAIL: is_premium should be False but got {response_data.get('is_premium')}")
            
        if response_data.get('plan_name') == 'Free':
            print("✅ PASS: plan_name is 'Free'")
        else:
            print(f"❌ FAIL: plan_name should be 'Free' but got {response_data.get('plan_name')}")
        
        print("\n" + "=" * 50)
        print("Free Plan Fix Test Complete!")
        
    except Exception as e:
        print(f"Error during test: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_free_plan_logic()