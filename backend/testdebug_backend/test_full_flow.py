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
from django.contrib.auth.models import AnonymousUser
from rest_framework.test import force_authenticate
from trip_planner.views import generate_trip_plan
from trip_planner.serializers import TripGenerationRequestSerializer

User = get_user_model()

# Get or create a test user
user, created = User.objects.get_or_create(
    username='testuser',
    defaults={'email': 'test@example.com', 'first_name': 'Test', 'last_name': 'User'}
)

print(f"Using user: {user.username}")

# Test data exactly as frontend sends it
test_data = {
    'destination': 'Oran',
    'trip_type': 'cultural',
    'start_date': '2025-09-17',
    'end_date': '2025-09-21',
    'budget': 5000.00,
    'budget_currency': 'USD',
    'group_size': 1,
    'interests': ['restaurants'],
    'accommodation_preference': 'mid-range',
    'activity_level': 'moderate',
    'special_requirements': 'nothing. nothing'
}

print("Test data (as frontend sends):")
print(json.dumps(test_data, indent=2))

# Test serializer validation
print("\n=== Testing Serializer ===")
serializer = TripGenerationRequestSerializer(data=test_data)
if serializer.is_valid():
    print("✅ Serializer validation passed")
    print("Validated data:")
    print(json.dumps(dict(serializer.validated_data), indent=2, default=str))
else:
    print("❌ Serializer validation failed:")
    print(serializer.errors)
    sys.exit(1)

# Test the full view
print("\n=== Testing Full View ===")
factory = RequestFactory()
request = factory.post('/api/trip-planner/generate-trip-plan/', 
                      data=json.dumps(test_data), 
                      content_type='application/json')
request.user = user

try:
    response = generate_trip_plan(request)
    print(f"✅ View executed successfully")
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 201:
        print("✅ Trip plan created successfully!")
        response_data = json.loads(response.content)
        print(f"Trip title: {response_data.get('title', 'No title')}")
        print(f"Trip description: {response_data.get('description', 'No description')[:100]}...")
    else:
        print(f"❌ Unexpected status code: {response.status_code}")
        print(f"Response content: {response.content.decode()}")
        
except Exception as e:
    import traceback
    print(f"❌ View execution failed: {str(e)}")
    print("Full traceback:")
    traceback.print_exc()