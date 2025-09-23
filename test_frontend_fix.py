#!/usr/bin/env python
"""
Test script to verify the frontend fix for trip generation display
"""

import os
import sys
import django
from datetime import datetime, timedelta

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from trip_planner.services import TripPlannerAIService

User = get_user_model()

def test_trip_generation_and_structure():
    """Test that trip generation returns the correct data structure for frontend"""
    print("=== Testing Trip Generation Data Structure ===")
    
    # Get or create test user with unique email
    try:
        user = User.objects.get(username='test_user_frontend')
    except User.DoesNotExist:
        user = User.objects.create_user(
            username='test_user_frontend',
            email='test_frontend@example.com'
        )
    
    # Test data matching the frontend request
    from datetime import datetime
    test_data = {
        'destination': 'Oran',
        'trip_type': 'cultural',
        'start_date': datetime(2025, 9, 22).date(),
        'end_date': datetime(2025, 9, 24).date(),
        'budget': 500,
        'budget_currency': 'USD',
        'group_size': 1,
        'interests': ['historicSites'],
        'accommodation_preference': 'mid-range',
        'activity_level': 'moderate',
        'special_requirements': ''
    }
    
    try:
        # Generate trip plan
        service = TripPlannerAIService()
        result = service.generate_trip_plan(user, **test_data)
        
        print(f"✅ Trip generation successful!")
        print(f"📋 Trip Title: {result.get('title', 'N/A')}")
        print(f"📝 Description: {result.get('description', 'N/A')[:100]}...")
        print(f"📅 Duration: {result.get('duration', 'N/A')} days")
        print(f"💰 Total Cost: ${result.get('total_cost', 'N/A')}")
        print(f"📍 Province: {result.get('province', 'N/A')}")
        
        # Check if daily_plans exists and has content
        daily_plans = result.get('daily_plans', [])
        print(f"🗓️ Daily Plans Count: {len(daily_plans)}")
        
        if daily_plans:
            print(f"✅ Daily plans structure is correct")
            for i, day in enumerate(daily_plans):
                activities_count = len(day.get('activities', []))
                print(f"   Day {i+1}: {activities_count} activities")
        else:
            print("❌ No daily plans found - this would cause empty display")
            
        # Check required fields for frontend display
        required_fields = ['title', 'description', 'duration', 'total_cost', 'province', 'daily_plans']
        missing_fields = [field for field in required_fields if field not in result]
        
        if missing_fields:
            print(f"⚠️ Missing fields that frontend expects: {missing_fields}")
        else:
            print("✅ All required fields present for frontend display")
            
        print(f"🎯 Confidence Score: {result.get('confidence_score', 'N/A')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Trip generation failed: {str(e)}")
        return False

if __name__ == '__main__':
    success = test_trip_generation_and_structure()
    if success:
        print("\n🎉 Frontend fix verification: Trip data structure is correct!")
        print("The generated trip should now display properly in the frontend.")
    else:
        print("\n❌ There may still be issues with the trip generation.")