#!/usr/bin/env python
"""
Test script for Algiers trip generation with improved place distribution
"""

import os
import sys
import django
from datetime import datetime
from collections import Counter

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from trip_planner.services import TripPlannerAIService
from authentication.models import User

def test_algiers_trip_generation():
    print("=== TESTING ALGIERS TRIP GENERATION ===")
    
    # Test parameters
    test_params = {
        "destination_preference": "Algiers",
        "start_date": "2025-10-26",
        "end_date": "2025-10-29",
        "budget": 250.0,
        "group_size": 2,
        "trip_type": "family",
        "travel_style": "cultural heritage",
        "interests": ["photography", "historical sites"],
        "activity_level": "moderate",
        "special_requirements": "quiet places, local restaurants",
        "dietary_restrictions": "halal",
        "preferences": "prefer authentic local experiences"
    }
    
    print(f"Test parameters: {test_params}")
    print()
    
    try:
        # Get the first user
        user = User.objects.first()
        if not user:
            print("❌ ERROR: No users found in database")
            return
        
        # Initialize service
        service = TripPlannerAIService()
        
        # Generate trip plan
        result = service.generate_trip_plan(
            user=user,
            destination_preference=test_params["destination_preference"],
            start_date=datetime.strptime(test_params["start_date"], "%Y-%m-%d"),
            end_date=datetime.strptime(test_params["end_date"], "%Y-%m-%d"),
            budget=test_params["budget"],
            group_size=test_params["group_size"],
            trip_type=test_params["trip_type"],
            travel_style=test_params["travel_style"],
            interests=test_params["interests"],
            activity_level=test_params["activity_level"],
            special_requirements=test_params["special_requirements"],
            dietary_restrictions=test_params["dietary_restrictions"],
            preferences=test_params["preferences"]
        )
        
        print("=== TRIP GENERATION SUCCESSFUL ===")
        print(f"Title: {result['title']}")
        
        # Calculate total cost from daily activities
        total_cost = 0
        for day in result['daily_plans']:
            for activity in day['activities']:
                # Activity cost is per person, multiply by group size for total cost
                total_cost += activity['estimated_cost'] * test_params['group_size']
        
        print(f"Total Cost: ${total_cost:.2f}")
        print(f"Confidence Score: {result['confidence_score']}")
        print()
        
        # Analyze place usage
        all_place_ids = []
        
        for day_idx, day in enumerate(result['daily_plans'], 1):
            day_places = []
            day_cost = sum(activity['estimated_cost'] * test_params['group_size'] for activity in day['activities'])
            
            for activity in day['activities']:
                place_id = activity['place_id']
                all_place_ids.append(place_id)
                day_places.append(place_id)
            
            print(f"Day {day_idx}: {day['title']}")
            print(f"  - Places used: {day_places}")
            print(f"  - Day cost: ${day_cost:.2f}")
            print()
        
        # Analysis
        print("=== ANALYSIS ===")
        place_counts = Counter(all_place_ids)
        unique_places = len(place_counts)
        total_activities = len(all_place_ids)
        duplicates = total_activities - unique_places
        total_budget = test_params["budget"] * test_params["group_size"]
        budget_adherence = (total_cost / total_budget) * 100
        
        print(f"Total activities: {total_activities}")
        print(f"Total places used: {len(all_place_ids)}")
        print(f"Unique places: {unique_places}")
        print(f"Duplicate occurrences: {duplicates}")
        print(f"Total budget ({test_params['group_size']} people): ${total_budget}")
        print(f"Generated cost: ${total_cost:.2f}")
        print(f"Budget adherence: {budget_adherence:.1f}%")
        
        # Success criteria
        if duplicates <= 3:  # With 9 places and 12 activities, 3 duplicates is acceptable
            print("✅ SUCCESS: Place duplication is within acceptable range")
        else:
            print(f"❌ ISSUE: Found {duplicates} duplicate place occurrences")
        
        if 80 <= budget_adherence <= 120:
            print("✅ SUCCESS: Budget is within acceptable range (80-120%)")
        else:
            print(f"❌ ISSUE: Budget adherence {budget_adherence:.1f}% is outside acceptable range")
        
        print(f"\nPlace usage details: {dict(place_counts)}")
        
    except Exception as e:
        print(f"❌ ERROR: Trip generation failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_algiers_trip_generation()