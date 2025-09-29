#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from subscriptions.models import UserSubscription, PaymentHistory
from django.contrib.auth import get_user_model

User = get_user_model()

def check_user_subscription(user_id):
    try:
        user = User.objects.get(id=user_id)
        print(f"User: {user.email}")
        
        try:
            sub = UserSubscription.objects.get(user=user)
            print(f"Plan: {sub.plan.name}")
            print(f"Status: {sub.status}")
            print(f"Start date: {sub.start_date}")
            print(f"End date: {sub.end_date}")
            print(f"Stripe subscription ID: {sub.stripe_subscription_id}")
            print(f"Is premium: {sub.is_premium}")
        except UserSubscription.DoesNotExist:
            print("No subscription found for user")
        
        payments = PaymentHistory.objects.filter(user=user)
        print(f"Payment history count: {payments.count()}")
        for p in payments:
            print(f"  - Transaction: {p.transaction_id}, Status: {p.status}, Amount: {p.amount}")
            
    except User.DoesNotExist:
        print(f"User with ID {user_id} not found")

if __name__ == "__main__":
    user_id = sys.argv[1] if len(sys.argv) > 1 else 3
    check_user_subscription(user_id)