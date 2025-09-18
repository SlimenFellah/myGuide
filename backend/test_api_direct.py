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

# Test data
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

print("\nSending POST request to trip generation endpoint...")

# Make the request
headers = {
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json'
}

try:
    response = requests.post(
        'http://127.0.0.1:8000/api/trip-planner/generate-trip-plan/',
        headers=headers,
        json=test_data,
        timeout=30
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Content: {response.text}")
    
    if response.status_code == 201:
        print("✅ Trip generation successful!")
        data = response.json()
        print(f"Trip Title: {data.get('title', 'No title')}")
    else:
        print(f"❌ Trip generation failed with status {response.status_code}")
        
except requests.exceptions.RequestException as e:
    print(f"❌ Request failed: {str(e)}")
except Exception as e:
    print(f"❌ Unexpected error: {str(e)}")