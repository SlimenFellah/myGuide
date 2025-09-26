#!/usr/bin/env python
"""
Simple script to test trip generation functionality with enhanced places data.
This script manually creates trip plans to test the basic functionality.
"""

import os
import sys
import django
from pathlib import Path
from datetime import datetime, timedelta

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from tourism.models import Province, Place, PlaceCategory
from trip_planner.models import TripPlan, DailyPlan, PlannedActivity
from authentication.models import User

def test_simple_trip_generation():
    """Test simple trip generation functionality with enhanced places data."""
    
    print("🗺️ Starting simple trip generation test...")
    print("=" * 60)
    
    # Get or create a test user
    try:
        test_user = User.objects.get(username='test_simple_trip_user')
        print("✅ Using existing test user")
    except User.DoesNotExist:
        test_user = User.objects.create_user(
            username='test_simple_trip_user',
            email='test_simple_trip@example.com',
            first_name='Test',
            last_name='User',
            password='testpass123'
        )
        print("✅ Created test user")
    
    # Test results
    test_results = {
        'passed': 0,
        'failed': 0,
        'errors': []
    }
    
    def test_manual_trip_creation(name, province_name, duration):
        """Test creating a trip manually for a specific province."""
        print(f"\n🔍 Testing {name}:")
        
        try:
            # Get province
            province = Province.objects.get(name=province_name)
            print(f"   📍 Province: {province.name}")
            
            # Get available places in the province
            places = Place.objects.filter(municipality__district__province=province)[:5]  # Limit to 5 places
            print(f"   🏛️ Available places: {places.count()}")
            
            if places.count() == 0:
                print(f"   ❌ No places found in {province_name}")
                test_results['failed'] += 1
                test_results['errors'].append(f"{name}: No places in {province_name}")
                return False
            
            # Create trip plan manually
            start_date = datetime.strptime('2024-01-15', '%Y-%m-%d').date()
            end_date = start_date + timedelta(days=duration-1)
            
            trip = TripPlan.objects.create(
                user=test_user,
                title=f"Test Trip to {province_name}",
                province=province,
                trip_type='cultural',
                budget_range='medium',
                start_date=start_date,
                end_date=end_date,
                duration_days=duration,
                group_size=1,
                ai_description=f"A {duration}-day cultural trip to explore the beautiful {province_name} province.",
                estimated_cost=500.00,
                status='generated'
            )
            
            print(f"   ✅ Trip created: {trip.title}")
            print(f"   📅 Duration: {trip.duration_days} days")
            
            # Create daily plans
            places_list = list(places)
            total_activities = 0
            
            for day in range(1, duration + 1):
                daily_plan = DailyPlan.objects.create(
                    trip_plan=trip,
                    day_number=day,
                    date=start_date + timedelta(days=day-1),
                    title=f"Day {day} - Exploring {province_name}",
                    description=f"Visit amazing places in {province_name}",
                    estimated_budget=100.00
                )
                
                # Add 2-3 activities per day
                activities_per_day = min(3, len(places_list))
                for i in range(activities_per_day):
                    if places_list:
                        place = places_list.pop(0)  # Take first place and remove from list
                        activity = PlannedActivity.objects.create(
                            daily_plan=daily_plan,
                            place=place,
                            activity_type='visit',
                            title=f"Visit {place.name}",
                            description=f"Explore the beautiful {place.name}",
                            estimated_cost=50.00,
                            order=i + 1
                        )
                        total_activities += 1
                
                print(f"   📅 Day {day}: {activities_per_day} activities planned")
            
            print(f"   🗺️ Total activities: {total_activities}")
            
            if total_activities > 0:
                print("   📋 Sample activities:")
                activities = PlannedActivity.objects.filter(daily_plan__trip_plan=trip)[:3]
                for i, activity in enumerate(activities, 1):
                    place_name = activity.place.name if activity.place else "Unknown"
                    print(f"      {i}. {activity.title} at {place_name} (Day {activity.daily_plan.day_number})")
                
                test_results['passed'] += 1
                return True
            else:
                print(f"   ❌ Trip created but no activities added")
                test_results['failed'] += 1
                test_results['errors'].append(f"{name}: No activities in generated trip")
                return False
                
        except Province.DoesNotExist:
            print(f"   ❌ Province {province_name} not found")
            test_results['failed'] += 1
            test_results['errors'].append(f"{name}: Province {province_name} not found")
            return False
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            test_results['failed'] += 1
            test_results['errors'].append(f"{name}: {str(e)}")
            return False
    
    # Test 1: Generate trip for Algiers
    test_manual_trip_creation("Algiers 2-day Trip", "Algiers", 2)
    
    # Test 2: Generate trip for Oran
    test_manual_trip_creation("Oran 3-day Trip", "Oran", 3)
    
    # Test 3: Generate longer trip for Algiers
    test_manual_trip_creation("Algiers Extended Trip", "Algiers", 4)
    
    # Test 4: Check available provinces
    print(f"\n📊 Available Data:")
    provinces = Province.objects.all()
    print(f"   🌍 Provinces: {provinces.count()}")
    for province in provinces:
        places_count = Place.objects.filter(municipality__district__province=province).count()
        print(f"      - {province.name}: {places_count} places")
    
    # Test 5: Check trip statistics
    print(f"\n📊 Trip Statistics:")
    total_trips = TripPlan.objects.filter(user=test_user).count()
    total_activities = PlannedActivity.objects.filter(daily_plan__trip_plan__user=test_user).count()
    total_daily_plans = DailyPlan.objects.filter(trip_plan__user=test_user).count()
    
    print(f"   🗂️ Total trips created: {total_trips}")
    print(f"   📅 Total daily plans: {total_daily_plans}")
    print(f"   📍 Total activities: {total_activities}")
    
    if total_trips > 0:
        avg_activities_per_trip = total_activities / total_trips
        avg_days_per_trip = total_daily_plans / total_trips
        print(f"   📈 Average activities per trip: {avg_activities_per_trip:.1f}")
        print(f"   📈 Average days per trip: {avg_days_per_trip:.1f}")
    
    # Test 6: Verify trip data integrity
    print(f"\n🔍 Trip Data Integrity:")
    
    trips_without_daily_plans = TripPlan.objects.filter(user=test_user, daily_plans__isnull=True).count()
    print(f"   🚫 Trips without daily plans: {trips_without_daily_plans}")
    
    daily_plans_without_activities = DailyPlan.objects.filter(
        trip_plan__user=test_user, 
        activities__isnull=True
    ).count()
    print(f"   🚫 Daily plans without activities: {daily_plans_without_activities}")
    
    invalid_activities = PlannedActivity.objects.filter(
        daily_plan__trip_plan__user=test_user,
        order__lt=1
    ).count()
    print(f"   ❌ Invalid activities (order < 1): {invalid_activities}")
    
    # Test 7: Check place categories usage
    print(f"\n🏷️ Place Categories in Trips:")
    categories_used = set()
    for activity in PlannedActivity.objects.filter(daily_plan__trip_plan__user=test_user, place__isnull=False):
        if activity.place and activity.place.category:
            categories_used.add(activity.place.category.name)
    
    print(f"   📊 Categories used in trips: {len(categories_used)}")
    for category in sorted(categories_used):
        print(f"      - {category}")
    
    # Summary
    print("\n" + "=" * 60)
    print("🎯 SIMPLE TRIP GENERATION TEST SUMMARY:")
    print("=" * 60)
    
    total_tests = test_results['passed'] + test_results['failed']
    success_rate = (test_results['passed'] / total_tests * 100) if total_tests > 0 else 0
    
    print(f"   📊 Total tests: {total_tests}")
    print(f"   ✅ Passed: {test_results['passed']}")
    print(f"   ❌ Failed: {test_results['failed']}")
    print(f"   📈 Success rate: {success_rate:.1f}%")
    
    print(f"\n📋 Generated Data:")
    print(f"   🗂️ Total trips: {total_trips}")
    print(f"   📅 Total daily plans: {total_daily_plans}")
    print(f"   📍 Total activities: {total_activities}")
    
    if test_results['errors']:
        print(f"\n❌ ERRORS FOUND:")
        for error in test_results['errors']:
            print(f"   - {error}")
    
    print("\n" + "=" * 60)
    
    if test_results['failed'] == 0 and total_trips > 0:
        print("🎉 SIMPLE TRIP GENERATION TEST PASSED!")
        print("   Trip generation models are working correctly with the new places data.")
        print("   The database structure supports trip planning functionality.")
        return True
    else:
        print(f"⚠️ SIMPLE TRIP GENERATION TEST COMPLETED WITH ISSUES!")
        if test_results['failed'] > 0:
            print(f"   {test_results['failed']} tests failed.")
        if total_trips == 0:
            print("   No trips were successfully generated.")
        return False

if __name__ == "__main__":
    success = test_simple_trip_generation()
    sys.exit(0 if success else 1)