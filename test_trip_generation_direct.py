#!/usr/bin/env python
"""
Direct test of trip generation API
"""
import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
sys.path.append('backend')
django.setup()

from trip_planner.services import TripPlannerAIService
from django.contrib.auth import get_user_model

User = get_user_model()

def test_trip_generation():
    print("Testing trip generation...")
    
    # Create or get a test user
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={'email': 'test@example.com'}
    )
    
    # Test data
    trip_data = {
        'destination': 'Oran',
        'trip_type': 'cultural',
        'start_date': datetime.now().date(),
        'end_date': (datetime.now() + timedelta(days=2)).date(),
        'budget': 500,
        'budget_currency': 'USD',
        'group_size': 1,
        'accommodation_preference': 'mid-range',
        'activity_level': 'moderate',
        'interests': ['restaurants'],
        'special_requirements': ''
    }
    
    try:
        # Initialize the service
        service = TripPlannerAIService()
        
        # Generate trip plan
        result = service.generate_trip_plan(user, **trip_data)
        
        print("SUCCESS: Trip generation completed")
        print(f"Title: {result.get('title', 'N/A')}")
        print(f"Description: {result.get('description', 'N/A')[:100]}...")
        print(f"Daily plans count: {len(result.get('daily_plans', []))}")
        print(f"Confidence score: {result.get('confidence_score', 'N/A')}")
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_trip_generation()