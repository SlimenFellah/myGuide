#!/usr/bin/env python3

import os
import sys
import django

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from trip_planner.services import TripPlannerService
from datetime import datetime

def debug_algiers_budget():
    """Debug budget calculation for Algiers"""
    
    service = TripPlannerService()
    
    # Test parameters
    params = {
        'destination_preference': 'Algiers',
        'start_date': '2025-10-26',
        'end_date': '2025-10-29',
        'budget': 250.0,
        'group_size': 2,
        'trip_type': 'family',
        'travel_style': 'cultural heritage',
        'interests': ['photography', 'historical sites'],
        'activity_level': 'moderate',
        'special_requirements': 'quiet places, local restaurants',
        'dietary_restrictions': 'halal',
        'preferences': 'prefer authentic local experiences'
    }
    
    print("=== DEBUGGING ALGIERS BUDGET CALCULATION ===")
    print(f"Input budget per person: ${params['budget']}")
    print(f"Group size: {params['group_size']}")
    
    # Calculate budget breakdown
    total_budget = params['budget'] * params['group_size']
    activity_budget_percentage = 0.7
    activity_total_budget = total_budget * activity_budget_percentage
    
    duration = (datetime.strptime(params['end_date'], '%Y-%m-%d') - 
                datetime.strptime(params['start_date'], '%Y-%m-%d')).days
    
    per_person_activity_budget = activity_total_budget / params['group_size']
    daily_budget_per_person = per_person_activity_budget / duration
    
    print(f"Total budget: ${total_budget}")
    print(f"Activity budget (70%): ${activity_total_budget}")
    print(f"Per person activity budget: ${per_person_activity_budget}")
    print(f"Daily budget per person: ${daily_budget_per_person}")
    
    # Generate actual trip and analyze
    print("\n=== GENERATING ACTUAL TRIP ===")
    result = service.generate_trip_plan(**params)
    
    if result:
        print(f"Generated total cost: ${result['estimated_total_cost']}")
        print(f"Expected activity budget: ${activity_total_budget}")
        print(f"Budget utilization: {result['estimated_total_cost']/total_budget*100:.1f}%")
        
        # Analyze daily costs
        total_raw_cost = 0
        for i, day_plan in enumerate(result['daily_plans'], 1):
            day_cost = sum(activity.get('estimated_cost', 0) for activity in day_plan['activities']) * params['group_size']
            total_raw_cost += day_cost
            print(f"Day {i} raw cost: ${day_cost:.2f}")
        
        print(f"Total raw cost before scaling: ${total_raw_cost:.2f}")
        print(f"Scaling threshold (80% of budget): ${total_budget * 0.8:.2f}")
        print(f"Should scale up: {total_raw_cost < total_budget * 0.8}")

if __name__ == "__main__":
    debug_algiers_budget()