#!/usr/bin/env python
import os
import sys
import django
import json
from datetime import date

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.test import RequestFactory
from trip_planner.views import generate_trip_plan
from trip_planner.serializers import TripGenerationRequestSerializer

User = get_user_model()

# Get or create a test user
user, created = User.objects.get_or_create(
    username='testuser',
    defaults={'email': 'test@example.com', 'first_name': 'Test', 'last_name': 'User'}
)

print(f"Using user: {user.username}")

# Test data that matches what frontend sends (with group_size 5000 to reproduce the error)
test_data = {
    'destination': 'Algiers',
    'trip_type': 'cultural',
    'start_date': '2025-09-18',
    'end_date': '2025-09-19',
    'budget': 5000,
    'budget_currency': 'USD',
    'group_size': 5000,  # This should cause validation error
    'interests': ['restaurants'],
    'accommodation_preference': 'mid-range',
    'activity_level': 'moderate',
    'special_requirements': 'nothing. nothing'
}

print("\n=== Testing Serializer Validation ===")
print(f"Test data: {json.dumps(test_data, indent=2)}")

# Test serializer validation
serializer = TripGenerationRequestSerializer(data=test_data)
if serializer.is_valid():
    print("✅ Serializer validation passed")
    print(json.dumps(dict(serializer.validated_data), indent=2, default=str))
else:
    print("❌ Serializer validation failed:")
    print(json.dumps(serializer.errors, indent=2))

# Test the full view
print("\n=== Testing Full View ===")
factory = RequestFactory()
request = factory.post('/api/trip-planner/generate-trip-plan/', 
                      data=json.dumps(test_data), 
                      content_type='application/json')
request.user = user

try:
    response = generate_trip_plan(request)
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 400:
        print("❌ Validation failed as expected")
        response_data = json.loads(response.content)
        print(f"Response errors: {json.dumps(response_data, indent=2)}")
    elif response.status_code == 201:
        print("✅ Trip plan created successfully!")
        response_data = json.loads(response.content)
        print(f"Trip title: {response_data.get('title', 'No title')}")
    else:
        print(f"❌ Unexpected status code: {response.status_code}")
        print(f"Response content: {response.content.decode()}")
        
except Exception as e:
    import traceback
    print(f"❌ View execution failed: {str(e)}")
    print("Full traceback:")
    traceback.print_exc()