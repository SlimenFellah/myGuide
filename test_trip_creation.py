#!/usr/bin/env python
import os
import sys
import django
import json
from pathlib import Path
from datetime import datetime, date

# Add the backend directory to Python path
backend_path = Path(__file__).parent / 'backend'
sys.path.insert(0, str(backend_path))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from trip_planner.models import TripPlan, DailyPlan, PlannedActivity
from trip_planner.services import TripPlannerAIService
from tourism.models import Province

User = get_user_model()

def test_trip_creation():
    print("Testing Trip Creation Process...")
    print("=" * 50)
    
    # Get an existing user or create a new one
    user = User.objects.first()
    if not user:
        # Create a user with unique email
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        user = User.objects.create_user(
            username=f'test_user_{unique_id}',
            email=f'test_{unique_id}@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        print(f"Created test user: {user.username}")
    else:
        print(f"Using existing user: {user.username} ({user.email})")
    
    # Test trip generation parameters
    trip_params = {
        'start_date': date(2025, 10, 1),
        'end_date': date(2025, 10, 5),
        'budget': 500,
        'budget_currency': 'USD',
        'group_size': 2,
        'trip_type': 'cultural',
        'interests': ['historical', 'cultural', 'sightseeing'],
        'destination_preference': 'Algiers',
        'accommodation_preference': 'hotel',
        'activity_level': 'moderate',
        'special_requirements': 'Test trip creation'
    }
    
    print(f"\nGenerating trip with parameters:")
    for key, value in trip_params.items():
        print(f"  {key}: {value}")
    
    try:
        # Generate trip using AI service
        ai_service = TripPlannerAIService()
        trip_data = ai_service.generate_trip_plan(user=user, **trip_params)
        
        print(f"\nGenerated trip data:")
        print(f"  Title: {trip_data['title']}")
        print(f"  Daily Plans: {len(trip_data['daily_plans'])}")
        print(f"  Confidence Score: {trip_data.get('confidence_score', 'N/A')}")
        print(f"  Estimated Cost: ${trip_data.get('estimated_total_cost', 0)}")
        
        # Get province for saving
        province = Province.objects.filter(name__icontains='Algiers').first()
        if not province:
            province = Province.objects.first()
        
        # Calculate duration
        duration = (trip_params['end_date'] - trip_params['start_date']).days + 1
        
        # Map budget to budget_range
        budget = float(trip_params['budget'])
        if budget < 50:
            budget_range = 'low'
        elif budget <= 150:
            budget_range = 'medium'
        else:
            budget_range = 'high'
        
        # Create the trip plan (simulating the API endpoint logic)
        trip_plan = TripPlan.objects.create(
            user=user,
            title=trip_data['title'],
            province=province,
            trip_type=trip_params['trip_type'],
            budget_range=budget_range,
            start_date=trip_params['start_date'],
            end_date=trip_params['end_date'],
            duration_days=duration,
            group_size=trip_params['group_size'],
            preferences={
                'interests': trip_params.get('interests', []),
                'accommodation_preference': trip_params.get('accommodation_preference'),
                'activity_level': trip_params.get('activity_level'),
                'budget': float(trip_params['budget']),
                'budget_currency': trip_params['budget_currency']
            },
            special_requirements=trip_params.get('special_requirements'),
            ai_description=trip_data['description'],
            ai_recommendations={
                'confidence_score': trip_data.get('confidence_score', 0.8),
                'recommended_destinations': trip_data.get('recommended_destinations', []),
                'estimated_total_cost': trip_data.get('estimated_total_cost', 0)
            },
            estimated_cost=trip_data.get('estimated_total_cost', 0),
            status='generated'
        )
        
        print(f"\nCreated TripPlan: {trip_plan.title} (ID: {trip_plan.id})")
        
        # Create daily plans and activities
        total_activities = 0
        for day_index, day_data in enumerate(trip_data['daily_plans'], 1):
            daily_plan = DailyPlan.objects.create(
                trip_plan=trip_plan,
                day_number=day_index,
                date=day_data['date'],
                title=day_data['title'],
                description=day_data['description']
            )
            
            print(f"  Day {day_index}: {daily_plan.title} ({daily_plan.date})")
            
            day_activities = 0
            for activity_data in day_data['activities']:
                # Convert duration from hours to minutes if provided
                duration_minutes = None
                if activity_data.get('duration_hours'):
                    duration_minutes = int(float(activity_data['duration_hours']) * 60)
                
                activity = PlannedActivity.objects.create(
                    daily_plan=daily_plan,
                    place_id=activity_data.get('place_id'),
                    activity_type=activity_data.get('activity_type', 'visit'),
                    title=activity_data.get('title', activity_data.get('name', 'Activity')),
                    description=activity_data.get('description', ''),
                    start_time=activity_data.get('start_time'),
                    end_time=activity_data.get('end_time'),
                    duration_minutes=duration_minutes,
                    estimated_cost=activity_data.get('estimated_cost', 0),
                    notes=activity_data.get('notes', ''),
                    order=activity_data.get('order', 0)
                )
                
                place_name = activity.place.name if activity.place else 'Unknown Place'
                print(f"    Activity: {activity.title} at {place_name}")
                print(f"      Time: {activity.start_time} - {activity.end_time}")
                print(f"      Cost: ${activity.estimated_cost}")
                
                day_activities += 1
                total_activities += 1
            
            print(f"    Total activities for day: {day_activities}")
        
        print(f"\nTrip creation completed successfully!")
        print(f"  Trip ID: {trip_plan.id}")
        print(f"  Total Daily Plans: {trip_plan.daily_plans.count()}")
        print(f"  Total Activities: {total_activities}")
        
        # Verify the data structure matches what frontend expects
        print(f"\nVerifying data structure for frontend...")
        
        # Test the queryset that frontend will receive
        trip_with_relations = TripPlan.objects.filter(
            id=trip_plan.id
        ).prefetch_related(
            'daily_plans__activities__place'
        ).first()
        
        print(f"  Trip has daily_plans: {hasattr(trip_with_relations, 'daily_plans')}")
        print(f"  Daily plans count: {trip_with_relations.daily_plans.count()}")
        
        for daily_plan in trip_with_relations.daily_plans.all():
            print(f"  Day {daily_plan.day_number}: {daily_plan.activities.count()} activities")
            for activity in daily_plan.activities.all():
                place_name = activity.place.name if activity.place else 'No place'
                print(f"    - {activity.title} at {place_name}")
        
        print(f"\n✅ Trip creation test completed successfully!")
        return trip_plan.id
        
    except Exception as e:
        print(f"\n❌ Error during trip creation: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == '__main__':
    trip_id = test_trip_creation()
    if trip_id:
        print(f"\nTest trip created with ID: {trip_id}")
        print(f"You can now test this trip in the frontend My Trips page.")
    else:
        print(f"\nTrip creation test failed.")