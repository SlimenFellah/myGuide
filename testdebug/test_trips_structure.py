#!/usr/bin/env python
import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_path = Path(__file__).parent / 'backend'
sys.path.insert(0, str(backend_path))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from trip_planner.models import TripPlan
from trip_planner.serializers import TripPlanSerializer
from django.contrib.auth.models import User

def test_trip_structure():
    print("Testing Trip Data Structure...")
    print("=" * 50)
    
    # Get first trip plan
    trip = TripPlan.objects.prefetch_related(
        'daily_plans__activities__place'
    ).first()
    
    if not trip:
        print("No trips found in database")
        return
    
    print(f"Trip: {trip.title}")
    print(f"Daily Plans Count: {trip.daily_plans.count()}")
    
    # Test serializer output
    serializer = TripPlanSerializer(trip)
    data = serializer.data
    
    print("\nSerialized Data Structure:")
    print(f"- Title: {data.get('title')}")
    print(f"- Daily Plans: {len(data.get('daily_plans', []))}")
    
    for i, daily_plan in enumerate(data.get('daily_plans', [])):
        print(f"  Day {i+1}: {daily_plan.get('title', 'No title')}")
        print(f"    Date: {daily_plan.get('date')}")
        print(f"    Activities: {len(daily_plan.get('activities', []))}")
        
        for j, activity in enumerate(daily_plan.get('activities', [])):
            place_name = activity.get('place', {}).get('name', 'Unknown place')
            print(f"      Activity {j+1}: {place_name}")
            print(f"        Time: {activity.get('start_time')} - {activity.get('end_time')}")
            print(f"        Cost: ${activity.get('estimated_cost', 0)}")
    
    print("\nTest completed successfully!")

if __name__ == '__main__':
    test_trip_structure()