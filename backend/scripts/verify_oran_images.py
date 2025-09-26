#!/usr/bin/env python
"""
Script to verify that all new Oran places have images assigned.
"""

import os
import sys
import django
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.append(str(project_root))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from tourism.models import Place, PlaceImage

def verify_oran_images():
    """Verify that all new Oran places have images assigned."""
    
    print("🔍 Verifying new Oran place images...")
    
    # List of new Oran places
    new_oran_places = [
        'Corniche Oranaise',
        'Marché Medina Jedida', 
        'Parc Usto',
        'Cathédrale du Sacré-Cœur',
        'Plage des Andalouses',
        'Centre Culturel Ahmed Bey',
        'Port d\'Oran',
        'Stade Ahmed Zabana'
    ]
    
    total_places = len(new_oran_places)
    places_with_images = 0
    
    for place_name in new_oran_places:
        try:
            place = Place.objects.get(name=place_name)
            has_image = PlaceImage.objects.filter(place=place).exists()
            
            if has_image:
                image = PlaceImage.objects.get(place=place)
                print(f"   ✅ {place_name}: {image.image}")
                places_with_images += 1
            else:
                print(f"   ❌ {place_name}: No image assigned")
                
        except Place.DoesNotExist:
            print(f"   ❌ {place_name}: Place not found in database")
    
    print(f"\n📊 Summary: {places_with_images}/{total_places} places have images assigned")
    
    if places_with_images == total_places:
        print("🎉 All new Oran places have images assigned successfully!")
    else:
        print("⚠️ Some places are missing images.")

if __name__ == "__main__":
    verify_oran_images()