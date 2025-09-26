#!/usr/bin/env python
"""
Debug script to analyze budget calculation in trip generation
"""

import os
import sys
import django
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from trip_planner.services import TripPlannerAIService
from authentication.models import User

def debug_budget_calculation():
    print("=== DEBUGGING BUDGET CALCULATION ===")
    
    # Test parameters
    budget = 250.0
    group_size = 2
    duration = 4
    
    # Calculate budget distribution
    total_budget = budget * group_size
    activity_budget_percentage = 0.7
    total_activity_budget = total_budget * activity_budget_percentage
    per_person_activity_budget = total_activity_budget / group_size
    daily_budget = per_person_activity_budget / duration
    
    print(f"Budget per person: ${budget}")
    print(f"Total budget: ${total_budget}")
    print(f"Total activity budget (70%): ${total_activity_budget}")
    print(f"Per person activity budget: ${per_person_activity_budget}")
    print(f"Daily budget per person: ${daily_budget}")
    print(f"Expected daily cost for group: ${daily_budget * group_size}")
    print(f"Expected total cost for trip: ${daily_budget * group_size * duration}")
    print()
    
    # Test activity cost estimation
    service = TripPlannerAIService()
    
    # Get Algiers places
    destinations = service._get_suitable_destinations(
        'family', ['photography', 'historical sites'], 'Algiers', budget, duration, 'cultural heritage'
    )
    
    print(f"Found {len(destinations)} destinations for Algiers")
    
    if destinations:
        place = destinations[0]
        print(f"Testing cost estimation for: {place.name}")
        
        # Test different activity types
        activity_types = ['sightseeing', 'cultural', 'historical', 'photography']
        
        for activity_type in activity_types:
            cost = service._estimate_activity_cost_improved(
                activity_type, daily_budget, place, 'quiet places, local restaurants', 'halal'
            )
            print(f"  {activity_type}: ${cost}")
        
        print()
        
        # Test with different budget values
        print("Testing cost scaling with different budgets:")
        test_budgets = [10, 20, 30, 40, 50, 60, 70]
        
        for test_budget in test_budgets:
            cost = service._estimate_activity_cost_improved(
                'cultural', test_budget, place, 'quiet places, local restaurants', 'halal'
            )
            print(f"  Budget ${test_budget} -> Cost ${cost} (utilization: {(cost/test_budget)*100:.1f}%)")

if __name__ == "__main__":
    debug_budget_calculation()