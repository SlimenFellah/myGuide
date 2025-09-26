#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from places.models import Place
from django.db.models import Q

def debug_oran_places():
    print("=== DEBUGGING ORAN PLACES ===")
    
    # Check places in Oran
    oran_places = Place.objects.filter(
        Q(municipality__district__province__name__icontains='oran') |
        Q(municipality__district__name__icontains='oran') |
        Q(municipality__name__icontains='oran'),
        is_active=True
    )
    
    print(f'Total places in Oran: {oran_places.count()}')
    print("\nFirst 10 places:")
    for place in oran_places[:10]:
        print(f'ID: {place.id}, Name: {place.name}, Category: {place.category}')
    
    # Check if there are any active places at all
    all_active_places = Place.objects.filter(is_active=True)
    print(f'\nTotal active places in database: {all_active_places.count()}')
    
    # Check places by province
    provinces = Place.objects.filter(is_active=True).values_list(
        'municipality__district__province__name', flat=True
    ).distinct()
    print(f'\nAvailable provinces: {list(provinces)}')

if __name__ == '__main__':
    debug_oran_places()