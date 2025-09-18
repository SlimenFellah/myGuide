#!/usr/bin/env python
import os
import sys
import django
from django.db.models import Q, Avg, Count

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from tourism.models import Place, Province, District, Municipality, PlaceCategory

print("=== Checking Places Database ===")

# Check total places
total_places = Place.objects.filter(is_active=True).count()
print(f"Total active places: {total_places}")

# Check places in Oran
oran_places = Place.objects.filter(
    is_active=True
).filter(
    Q(municipality__district__province__name__icontains='Oran') |
    Q(municipality__district__name__icontains='Oran') |
    Q(municipality__name__icontains='Oran')
)
print(f"Places in Oran: {oran_places.count()}")

if oran_places.exists():
    print("\nOran places:")
    for place in oran_places[:5]:
        print(f"  - {place.name} ({place.category.name if place.category else 'No category'})")
        print(f"    Location: {place.municipality.name}, {place.municipality.district.name}, {place.municipality.district.province.name}")

# Check available categories
print("\n=== Available Categories ===")
categories = PlaceCategory.objects.all()
print(f"Total categories: {categories.count()}")
for cat in categories:
    print(f"  - {cat.name}")

# Check places with restaurant category
restaurant_places = Place.objects.filter(
    is_active=True,
    category__name__icontains='restaurant'
)
print(f"\nPlaces with 'restaurant' category: {restaurant_places.count()}")

# Check if there are any places that match both Oran and restaurant
oran_restaurant_places = Place.objects.filter(
    is_active=True
).filter(
    Q(municipality__district__province__name__icontains='Oran') |
    Q(municipality__district__name__icontains='Oran') |
    Q(municipality__name__icontains='Oran')
).filter(
    category__name__in=['restaurant', 'cafe', 'local_cuisine']
)
print(f"\nOran places with restaurant categories: {oran_restaurant_places.count()}")

# Check provinces
print("\n=== Available Provinces ===")
provinces = Province.objects.all()
for province in provinces:
    print(f"  - {province.name}")