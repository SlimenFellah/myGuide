#!/usr/bin/env python
import os
import sys
import django
from django.db.models import Q, Avg, Count

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from tourism.models import Place
from trip_planner.services import TripPlannerAIService

def debug_destination_selection():
    print("=== Debugging Destination Selection for Oran ===")
    
    # Test parameters from the test script
    trip_type = "family"
    interests = ["photography", "historical sites"]
    destination_preference = "Oran"
    budget = 250.0
    duration = 4
    travel_style = "cultural heritage"
    
    service = TripPlannerAIService()
    
    print(f"Parameters:")
    print(f"  Trip type: {trip_type}")
    print(f"  Interests: {interests}")
    print(f"  Destination: {destination_preference}")
    print(f"  Travel style: {travel_style}")
    
    # Get all Oran places first
    all_oran_places = Place.objects.filter(
        Q(municipality__district__province__name__icontains='Oran') |
        Q(municipality__district__name__icontains='Oran') |
        Q(municipality__name__icontains='Oran'),
        is_active=True
    )
    
    print(f"\nAll Oran places ({all_oran_places.count()}):")
    for place in all_oran_places:
        category_name = place.category.name if place.category else "No category"
        print(f"  - {place.name} ({category_name})")
    
    # Now get suitable destinations using the service method
    suitable_destinations = service._get_suitable_destinations(
        trip_type, interests, destination_preference, budget, duration, travel_style
    )
    
    print(f"\nSuitable destinations selected ({len(suitable_destinations)}):")
    for place in suitable_destinations:
        category_name = place.category.name if place.category else "No category"
        print(f"  - {place.name} ({category_name})")
    
    # Check what places were filtered out
    selected_ids = {place.id for place in suitable_destinations}
    filtered_out = [place for place in all_oran_places if place.id not in selected_ids]
    
    if filtered_out:
        print(f"\nPlaces filtered out ({len(filtered_out)}):")
        for place in filtered_out:
            category_name = place.category.name if place.category else "No category"
            print(f"  - {place.name} ({category_name})")

if __name__ == '__main__':
    debug_destination_selection()