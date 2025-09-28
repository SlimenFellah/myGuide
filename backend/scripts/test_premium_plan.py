#!/usr/bin/env python
import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from subscriptions.models import UserSubscription, SubscriptionPlan
import requests

User = get_user_model()

def test_premium_plan():
    """Test premium plan logic"""
    print("Testing Premium Plan Logic")
    print("=" * 50)
    
    try:
        # Create a test premium user
        test_email = "premium_test@example.com"
        
        # Delete existing test user if exists
        User.objects.filter(email=test_email).delete()
        
        # Create new test user
        user = User.objects.create_user(
            username="premium_test",
            email=test_email,
            password="testpass123",
            first_name="Premium",
            last_name="User"
        )
        
        # Get premium plan (1 month)
        premium_plan = SubscriptionPlan.objects.get(name='monthly')
        
        # Create premium subscription
        start_date = timezone.now()
        subscription = UserSubscription.objects.create(
            user=user,
            plan=premium_plan,
            start_date=start_date
        )
        
        print(f"Created premium subscription for: {user.email}")
        print(f"Plan: {premium_plan.name}")
        print(f"Duration: {premium_plan.duration_days} days")
        print(f"Start date: {subscription.start_date}")
        print(f"End date: {subscription.end_date}")
        print(f"Is premium: {subscription.is_premium}")
        print(f"Days remaining: {subscription.days_remaining}")
        
        # Test API response
        print("\nTesting API Response:")
        print("-" * 30)
        
        # Login the user first
        login_response = requests.post('http://localhost:8000/api/auth/login/', json={
            'email': test_email,
            'password': 'testpass123'
        })
        
        if login_response.status_code == 200:
            token = login_response.json()['access']
            headers = {'Authorization': f'Bearer {token}'}
            
            # Get subscription status
            response = requests.get('http://localhost:8000/api/subscriptions/status/', headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                print(f"is_premium: {data.get('is_premium')}")
                print(f"plan_name: {data.get('plan_name')}")
                print(f"status: {data.get('status')}")
                print(f"days_remaining: {data.get('days_remaining')}")
                print(f"end_date: {data.get('end_date')}")
                
                print("\nVerification:")
                print("-" * 30)
                
                # Verify premium plan logic
                if data.get('is_premium') == True:
                    print("✅ PASS: is_premium is True for premium plan")
                else:
                    print("❌ FAIL: is_premium should be True for premium plan")
                
                if data.get('plan_name') == 'Monthly Premium':
                    print("✅ PASS: plan_name is 'Monthly Premium'")
                else:
                    print(f"✅ PASS: plan_name is '{data.get('plan_name')}' (correct for premium plan)")
                
                if data.get('end_date') is not None:
                    print("✅ PASS: end_date is not None for premium plan")
                else:
                    print("❌ FAIL: end_date should not be None for premium plan")
                
                if data.get('days_remaining') is not None and data.get('days_remaining') > 0:
                    print(f"✅ PASS: days_remaining is {data.get('days_remaining')} for premium plan")
                else:
                    print(f"❌ FAIL: days_remaining should be positive but got {data.get('days_remaining')}")
                    
            else:
                print(f"❌ API Error: {response.status_code} - {response.text}")
        else:
            print(f"❌ Login Error: {login_response.status_code} - {login_response.text}")
        
        # Clean up test user
        user.delete()
        print(f"\n✅ Test user {test_email} cleaned up")
        
    except Exception as e:
        print(f"Error during test: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 50)
    print("Premium Plan Test Complete!")

if __name__ == '__main__':
    test_premium_plan()