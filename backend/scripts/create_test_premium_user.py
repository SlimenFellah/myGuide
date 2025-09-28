#!/usr/bin/env python
"""
Script to create a test premium user with an activated subscription.
Run this script from the backend directory: python create_test_premium_user.py
"""

import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from authentication.models import User
from subscriptions.models import SubscriptionPlan, UserSubscription

def create_test_premium_user():
    """Create a test premium user with activated subscription"""
    
    # Test user credentials
    username = "premium_test_user"
    email = "premium@test.com"
    password = "TestPremium123!"
    first_name = "Premium"
    last_name = "User"
    
    print("Creating test premium user...")
    
    # Delete existing user if exists
    if User.objects.filter(username=username).exists():
        User.objects.filter(username=username).delete()
        print(f"Deleted existing user: {username}")
    
    # Create the user
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name
    )
    print(f"Created user: {username}")
    
    # Get or create monthly premium plan
    monthly_plan, created = SubscriptionPlan.objects.get_or_create(
        name='monthly',
        defaults={
            'price': 9.99,
            'duration_days': 30,
            'features': {
                'trip_plans_per_month': 'unlimited',
                'chatbot_messages_per_day': 'unlimited',
                'api_calls_per_day': 'unlimited',
                'export_trips': True,
                'priority_support': True,
                'advanced_ai_features': True
            },
            'is_active': True
        }
    )
    
    if created:
        print("Created monthly premium plan")
    else:
        print("Using existing monthly premium plan")
    
    # Delete existing subscription if exists
    if UserSubscription.objects.filter(user=user).exists():
        UserSubscription.objects.filter(user=user).delete()
        print("Deleted existing subscription")
    
    # Create active premium subscription
    start_date = timezone.now()
    end_date = start_date + timedelta(days=30)  # 30 days from now
    
    subscription = UserSubscription.objects.create(
        user=user,
        plan=monthly_plan,
        status='active',
        start_date=start_date,
        end_date=end_date,
        auto_renew=True
    )
    
    print(f"Created active premium subscription for {username}")
    print(f"Plan: {monthly_plan.name}")
    print(f"Start Date: {start_date.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"End Date: {end_date.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Status: {subscription.status}")
    print(f"Is Premium: {subscription.is_premium}")
    print(f"Days Remaining: {subscription.days_remaining}")
    
    print("\n" + "="*50)
    print("TEST PREMIUM USER CREDENTIALS:")
    print("="*50)
    print(f"Username: {username}")
    print(f"Email: {email}")
    print(f"Password: {password}")
    print(f"Plan: {monthly_plan.name} (${monthly_plan.price}/month)")
    print(f"Status: Active Premium")
    print("="*50)
    
    return user, subscription

if __name__ == "__main__":
    try:
        user, subscription = create_test_premium_user()
        print("\n✅ Test premium user created successfully!")
        print("You can now log in with the credentials above to test premium features.")
    except Exception as e:
        print(f"\n❌ Error creating test premium user: {e}")
        sys.exit(1)