#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from tourism.models import Place

# Check all places and their coordinates
places = Place.objects.filter(is_active=True)
print(f'Total active places: {places.count()}')
print('\nPlace coordinates:')
print('-' * 50)

for place in places:
    print(f'{place.name}:')
    print(f'  Latitude: {place.latitude}')
    print(f'  Longitude: {place.longitude}')
    print(f'  Province: {place.province}')
    print(f'  Active: {place.is_active}')
    print()

# Check if any places have missing coordinates
missing_coords = places.filter(latitude__isnull=True) | places.filter(longitude__isnull=True)
print(f'Places with missing coordinates: {missing_coords.count()}')

if missing_coords.exists():
    print('\nPlaces missing coordinates:')
    for place in missing_coords:
        print(f'- {place.name}: lat={place.latitude}, lng={place.longitude}')