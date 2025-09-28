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

User = get_user_model()

def fix_free_users():
    """Fix existing free users to have no end_date"""
    print("Fixing Existing Free Users")
    print("=" * 50)
    
    try:
        # Get all free plan subscriptions
        free_plan = SubscriptionPlan.objects.get(name='free')
        free_subscriptions = UserSubscription.objects.filter(plan=free_plan)
        
        print(f"Found {free_subscriptions.count()} free subscriptions")
        
        for subscription in free_subscriptions:
            print(f"\nFixing user: {subscription.user.email}")
            print(f"  Current end_date: {subscription.end_date}")
            print(f"  Current days_remaining: {subscription.days_remaining}")
            
            # Set end_date to None for free plans
            subscription.end_date = None
            subscription.save()
            
            print(f"  Updated end_date: {subscription.end_date}")
            print(f"  Updated days_remaining: {subscription.days_remaining}")
            print("  ✅ Fixed!")
        
        print("\n" + "=" * 50)
        print("All free users have been fixed!")
        
    except Exception as e:
        print(f"Error during fix: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    fix_free_users()