#!/usr/bin/env python

import os
import sys
from pathlib import Path

def setup_django():
    backend_path = Path(__file__).resolve().parent
    sys.path.append(str(backend_path))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
    import django
    django.setup()

def test_place_detail():
    from tourism.models import Place
    from tourism.serializers import PlaceDetailSerializer
    from django.test import RequestFactory
    
    # Get a place to test
    place = Place.objects.first()
    if not place:
        print("No places found in database")
        return
    
    print(f"Testing place: {place.name}")
    print(f"Place ID: {place.id}")
    print(f"Category: {place.category}")
    
    # Create a mock request
    factory = RequestFactory()
    request = factory.get('/')
    
    try:
        # Test serialization
        serializer = PlaceDetailSerializer(place, context={'request': request})
        data = serializer.data
        print("\nSerialization successful!")
        print(f"Category data: {data.get('category', 'No category')}")
        print(f"Province data: {data.get('province', 'No province')}")
        print(f"District data: {data.get('district', 'No district')}")
        print(f"Municipality data: {data.get('municipality', 'No municipality')}")
        return True
    except Exception as e:
        print(f"\nSerialization failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    setup_django()
    test_place_detail()