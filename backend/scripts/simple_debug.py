import os
import django
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from trip_planner.services import TripPlannerAIService
from authentication.models import User

# Get the first user
user = User.objects.first()
if not user:
    print("❌ ERROR: No users found in database")
    exit()

service = TripPlannerAIService()
params = {
    'destination_preference': 'Algiers',
    'start_date': datetime.strptime('2025-10-26', '%Y-%m-%d').date(),
    'end_date': datetime.strptime('2025-10-29', '%Y-%m-%d').date(),
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

print('=== DEBUGGING ALGIERS BUDGET ===')
total_budget = params['budget'] * params['group_size']
print(f'Total budget: ${total_budget}')
print(f'Scaling threshold (80%): ${total_budget * 0.8}')

result = service.generate_trip_plan(user, **params)
if result:
    print(f'Generated total cost: ${result["estimated_total_cost"]}')
    print(f'Budget utilization: {result["estimated_total_cost"]/total_budget*100:.1f}%')
    
    # Check raw costs before scaling
    total_raw_cost = 0
    for day_plan in result['daily_plans']:
        for activity in day_plan['activities']:
            activity_cost = activity.get('estimated_cost', 0) * params['group_size']
            total_raw_cost += activity_cost
    
    print(f'Total raw cost before scaling: ${total_raw_cost:.2f}')
    print(f'Should scale up: {total_raw_cost < total_budget * 0.8}')