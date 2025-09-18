#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

# Get or create a test user
user, created = User.objects.get_or_create(
    username='testuser',
    defaults={'email': 'test@example.com', 'first_name': 'Test', 'last_name': 'User'}
)

# Generate JWT token
refresh = RefreshToken.for_user(user)
access_token = str(refresh.access_token)

print(f"Using user: {user.username}")
print(f"Access Token: {access_token[:50]}...")

# Test data - EXACT format from frontend
test_data = {
    'destination': 'Algiers',
    'trip_type': 'cultural',
    'start_date': '2025-09-18',
    'end_date': '2025-09-20',
    'budget': 500,
    'budget_currency': 'USD',
    'group_size': 1,
    'interests': ['shopping'],
    'accommodation_preference': 'mid-range',
    'activity_level': 'moderate',
    'special_requirements': 'nothing. nothing'
}

print("\nSending POST request with FRONTEND data format...")
print(f"Data: {json.dumps(test_data, indent=2)}")

# Make the request
headers = {
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json'
}

response = requests.post(
    'http://127.0.0.1:8000/api/trip-planner/generate-trip-plan/',
    json=test_data,
    headers=headers
)

print(f"\nResponse Status: {response.status_code}")
print(f"Response Headers: {dict(response.headers)}")

if response.status_code == 200 or response.status_code == 201:
    print("✅ Trip generation successful!")
    result = response.json()
    print(f"Trip Title: {result.get('title', 'N/A')}")
else:
    print("❌ Trip generation failed!")
    try:
        error_data = response.json()
        print(f"Error Response: {json.dumps(error_data, indent=2)}")
    except:
        print(f"Raw Response: {response.text}")