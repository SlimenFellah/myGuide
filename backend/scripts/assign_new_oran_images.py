#!/usr/bin/env python
"""
Script to assign images to the new Oran places added via add_more_oran_places.py
This script will update the database records with the correct image paths.
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

def assign_new_oran_images():
    """Assign images to the new Oran places."""
    
    print("🖼️ Starting new Oran place images assignment...")
    
    # Mapping of image filenames to place names (based on the new places added)
    image_to_place_mapping = {
        'CornicheOranaise.jpg': 'Corniche Oranaise',
        'MarchéMedinaJedida.jpg': 'Marché Medina Jedida',
        'ParcUsto.jpg': 'Parc Usto',
        'CathédraleduSacréCœur.jpg': 'Cathédrale du Sacré-Cœur',
        'PlagedesAndalouses.jpg': 'Plage des Andalouses',
        'CentreCulturelAhmedBey.jpg': 'Centre Culturel Ahmed Bey',
        'PortdOran.jpg': 'Port d\'Oran',
        'StadeAhmedZabana.jpg': 'Stade Ahmed Zabana'
    }
    
    updated_count = 0
    
    for image_filename, place_name in image_to_place_mapping.items():
        try:
            # Find the place in the database
            place = Place.objects.get(name=place_name)
            
            # Create or update PlaceImage record
            place_image, created = PlaceImage.objects.get_or_create(
                place=place,
                defaults={
                    'image': f"places/{image_filename}",
                    'is_primary': True,
                    'caption': f"Main image of {place_name}"
                }
            )
            
            if not created:
                # Update existing image
                place_image.image = f"places/{image_filename}"
                place_image.is_primary = True
                place_image.caption = f"Main image of {place_name}"
                place_image.save()
                print(f"   ✅ Updated existing image for: {place_name}")
            else:
                print(f"   ✅ Created new image record for: {place_name}")
            
            updated_count += 1
            
        except Place.DoesNotExist:
            print(f"   ❌ Place not found: {place_name}")
        except Exception as e:
            print(f"   ❌ Error processing {place_name}: {str(e)}")
    
    print(f"\n🎉 Successfully assigned images to {updated_count} places!")

if __name__ == "__main__":
    assign_new_oran_images()