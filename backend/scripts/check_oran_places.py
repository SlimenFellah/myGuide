#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from tourism.models import Place, PlaceCategory
from django.db.models import Q

print("=== Checking Oran Places ===")

# Check places in Oran
oran_places = Place.objects.filter(
    Q(municipality__district__province__name__icontains='oran') |
    Q(municipality__district__name__icontains='oran') |
    Q(municipality__name__icontains='oran'),
    is_active=True
)

print(f"Total places in Oran: {oran_places.count()}")

if oran_places.exists():
    print("\nOran places:")
    for i, place in enumerate(oran_places, 1):
        category_name = place.category.name if place.category else "No category"
        print(f"{i:2d}. {place.name} - {category_name}")

# Check categories
print(f"\n=== Available Categories ===")
categories = PlaceCategory.objects.all()
for cat in categories:
    count = Place.objects.filter(category=cat, is_active=True).count()
    print(f"{cat.name}: {count} places")

# Check total active places
total_active = Place.objects.filter(is_active=True).count()
print(f"\nTotal active places in database: {total_active}")