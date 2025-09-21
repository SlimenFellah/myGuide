#!/usr/bin/env python

import sys
from pathlib import Path
import os

def setup_django():
    backend_path = Path(__file__).resolve().parent
    sys.path.append(str(backend_path))
    os.environ['DJANGO_SETTINGS_MODULE'] = 'myguide_backend.settings'
    import django
    django.setup()

def check_data():
    from tourism.models import Place, PlaceCategory
    
    print(f"Total places: {Place.objects.count()}")
    print(f"Total categories: {PlaceCategory.objects.count()}")
    
    places = Place.objects.all()[:3]
    for place in places:
        print(f"\nPlace: {place.name}")
        print(f"  Address: {place.address}")
        print(f"  Phone: {getattr(place, 'phone', 'N/A')}")
        print(f"  Email: {getattr(place, 'email', 'N/A')}")
        print(f"  Website: {getattr(place, 'website', 'N/A')}")
        print(f"  Opening hours: {place.opening_hours}")
        print(f"  Entry fee: {getattr(place, 'entry_fee', 'N/A')}")
        print(f"  Place type: {place.place_type}")
        print(f"  Category: {place.category}")

if __name__ == '__main__':
    setup_django()
    check_data()