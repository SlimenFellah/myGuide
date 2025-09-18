#!/usr/bin/env python
import os
import sys
import django
from datetime import date

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from trip_planner.services import TripPlannerAIService

User = get_user_model()

# Get or create a test user
user, created = User.objects.get_or_create(
    username='testuser',
    defaults={'email': 'test@example.com', 'first_name': 'Test', 'last_name': 'User'}
)

print(f"Using user: {user.username}")

# Test data similar to what frontend sends
test_data = {
    'start_date': date(2025, 9, 17),
    'end_date': date(2025, 9, 21),
    'budget': 5000,
    'budget_currency': 'USD',
    'group_size': 1,
    'trip_type': 'cultural',
    'interests': ['restaurants'],
    'destination_preference': 'Oran',
    'accommodation_preference': 'mid-range',
    'activity_level': 'moderate',
    'special_requirements': 'nothing. nothing'
}

print("Test data:", test_data)

try:
    ai_service = TripPlannerAIService()
    result = ai_service.generate_trip_plan(user=user, **test_data)
    print("Success! Trip generated:", result.get('title', 'No title'))
except Exception as e:
    import traceback
    print("Error occurred:")
    print(f"Error type: {type(e).__name__}")
    print(f"Error message: {str(e)}")
    print("\nFull traceback:")
    traceback.print_exc()