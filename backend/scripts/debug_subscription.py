#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from authentication.models import User
from subscriptions.models import UserSubscription, SubscriptionPlan

def debug_subscription():
    try:
        # Get the admin user
        user = User.objects.get(email='admin@gmail.com')
        print(f"User: {user.email}")
        print(f"User ID: {user.id}")
        
        # Check subscriptions
        subs = UserSubscription.objects.filter(user=user)
        print(f"Subscriptions count: {subs.count()}")
        
        for sub in subs:
            print(f"Subscription ID: {sub.id}")
            print(f"Plan: {sub.plan.name}")
            print(f"Status: {sub.status}")
            print(f"Start: {sub.start_date}")
            print(f"End: {sub.end_date}")
            print(f"Is Premium: {sub.is_premium}")
            print("---")
        
        # Check all plans
        plans = SubscriptionPlan.objects.all()
        print("All plans:")
        for plan in plans:
            print(f"Plan: {plan.name}, Price: {plan.price}")
            
        # Check if user has any active subscription
        active_subs = UserSubscription.objects.filter(user=user, status='active')
        print(f"Active subscriptions: {active_subs.count()}")
        
    except User.DoesNotExist:
        print("User admin@gmail.com not found")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_subscription()