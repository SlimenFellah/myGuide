#!/usr/bin/env python
import os
import django
import json
from datetime import date, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from trip_planner.services import TripPlannerAIService
from django.contrib.auth import get_user_model

def test_improved_trip_generation():
    """Test the improved trip generation functionality"""
    User = get_user_model()
    
    # Create or get a test user
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={'email': 'test@example.com'}
    )
    
    # Test trip generation with improved logic
    ai_service = TripPlannerAIService()
    
    test_params = {
        'destination_preference': 'Oran',
        'start_date': date.today() + timedelta(days=30),
        'end_date': date.today() + timedelta(days=33),  # 4 days
        'budget': 250.0,  # $250 per person
        'group_size': 2,
        'trip_type': 'family',
        'travel_style': 'cultural heritage',
        'interests': ['photography', 'historical sites'],
        'activity_level': 'moderate',
        'special_requirements': 'quiet places, local restaurants',
        'dietary_restrictions': 'halal',
        'preferences': 'prefer authentic local experiences'
    }
    
    print('=== TESTING IMPROVED TRIP GENERATION ===')
    print(f'Test parameters: {json.dumps(test_params, indent=2, default=str)}')
    print()
    
    try:
        result = ai_service.generate_trip_plan(user, **test_params)
        
        print('=== TRIP GENERATION SUCCESSFUL ===')
        print(f'Title: {result["title"]}')
        print(f'Total Cost: ${result["estimated_total_cost"]}')
        print(f'Confidence Score: {result["confidence_score"]}')
        print()
        
        # Check for duplicate places
        all_places = []
        total_activities = 0
        
        for i, day in enumerate(result['daily_plans'], 1):
            print(f'Day {i}: {day["title"]}')
            day_places = []
            day_cost = 0
            
            for activity in day['activities']:
                place_id = activity.get('place_id')
                cost = activity.get('estimated_cost', 0)
                # Activity cost is per person, multiply by group size for total cost
                day_cost += cost * test_params['group_size']
                total_activities += 1
                
                if place_id:
                    all_places.append(place_id)
                    day_places.append(place_id)
                    
            print(f'  - Places used: {day_places}')
            print(f'  - Day cost: ${day_cost:.2f}')
            print()
        
        # Check for duplicates
        unique_places = set(all_places)
        duplicate_count = len(all_places) - len(unique_places)
        
        print('=== ANALYSIS ===')
        print(f'Total activities: {total_activities}')
        print(f'Total places used: {len(all_places)}')
        print(f'Unique places: {len(unique_places)}')
        print(f'Duplicate occurrences: {duplicate_count}')
        print(f'Budget per person: ${test_params["budget"]}')
        print(f'Total budget (2 people): ${test_params["budget"] * test_params["group_size"]}')
        print(f'Generated cost: ${result["estimated_total_cost"]}')
        print(f'Budget adherence: {(result["estimated_total_cost"] / (test_params["budget"] * test_params["group_size"]) * 100):.1f}%')
        
        if duplicate_count == 0:
            print('✅ SUCCESS: No duplicate places found!')
        else:
            print(f'❌ ISSUE: Found {duplicate_count} duplicate place occurrences')
            
        budget_ratio = result['estimated_total_cost'] / (test_params['budget'] * test_params['group_size'])
        if 0.8 <= budget_ratio <= 1.2:
            print('✅ SUCCESS: Budget is within acceptable range (80-120%)')
        else:
            print(f'❌ ISSUE: Budget ratio is {budget_ratio:.2f} (should be 0.8-1.2)')
            
        return True
        
    except Exception as e:
        print(f'❌ ERROR: {str(e)}')
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    test_improved_trip_generation()