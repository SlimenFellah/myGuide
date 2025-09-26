#!/usr/bin/env python
"""
Test script to verify trip generation improvements across multiple destinations
"""

import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from trip_planner.services import TripPlannerAIService
from tourism.models import Place

def test_destination(destination_name, test_params):
    """Test trip generation for a specific destination"""
    print(f"\n=== TESTING {destination_name.upper()} ===")
    
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Create or get a test user
        user, created = User.objects.get_or_create(
            username='testuser',
            defaults={'email': 'test@example.com'}
        )
        
        service = TripPlannerAIService()
        result = service.generate_trip_plan(user, **test_params)
        
        print(f"✅ Trip generated successfully")
        print(f"   Title: {result['title']}")
        print(f"   Total Cost: ${result['estimated_total_cost']}")
        
        # Analyze place usage
        all_places = []
        for day in result['daily_plans']:
            for activity in day['activities']:
                place_id = activity.get('place_id')
                if place_id:
                    all_places.append(place_id)
        
        unique_places = len(set(all_places))
        total_places = len(all_places)
        duplicates = total_places - unique_places
        
        print(f"   Total activities: {total_places}")
        print(f"   Unique places: {unique_places}")
        print(f"   Duplicate occurrences: {duplicates}")
        
        # Budget analysis
        budget_adherence = (result['estimated_total_cost'] / (test_params['budget'] * test_params['group_size'])) * 100
        print(f"   Budget adherence: {budget_adherence:.1f}%")
        
        return {
            'success': True,
            'duplicates': duplicates,
            'budget_adherence': budget_adherence,
            'total_activities': total_places,
            'unique_places': unique_places
        }
            
    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        return {'success': False, 'error': str(e)}

def main():
    print("=== COMPREHENSIVE DESTINATION TESTING ===")
    
    # Base test parameters
    base_params = {
        'start_date': datetime(2025, 10, 26).date(),
        'end_date': datetime(2025, 10, 29).date(),
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
    
    # Test different destinations
    destinations = ['Oran', 'Algiers']
    results = {}
    
    for destination in destinations:
        test_params = base_params.copy()
        test_params['destination_preference'] = destination
        
        results[destination] = test_destination(destination, test_params)
    
    # Summary
    print("\n=== SUMMARY ===")
    for destination, result in results.items():
        if result['success']:
            status = "✅ PASS" if result['duplicates'] <= 3 else "⚠️ ACCEPTABLE"
            print(f"{destination}: {status} - {result['duplicates']} duplicates, {result['budget_adherence']:.1f}% budget")
        else:
            print(f"{destination}: ❌ FAILED - {result.get('error', 'Unknown error')}")
    
    # Overall assessment
    successful_tests = sum(1 for r in results.values() if r['success'])
    total_tests = len(results)
    
    print(f"\nOverall: {successful_tests}/{total_tests} destinations tested successfully")
    
    if successful_tests == total_tests:
        avg_duplicates = sum(r['duplicates'] for r in results.values() if r['success']) / successful_tests
        print(f"Average duplicates across all destinations: {avg_duplicates:.1f}")
        
        if avg_duplicates <= 2:
            print("🎉 EXCELLENT: Very low duplication achieved!")
        elif avg_duplicates <= 3:
            print("✅ GOOD: Acceptable duplication levels")
        else:
            print("⚠️ NEEDS IMPROVEMENT: Higher than desired duplication")

if __name__ == "__main__":
    main()