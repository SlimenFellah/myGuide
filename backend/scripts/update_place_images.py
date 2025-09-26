#!/usr/bin/env python
"""
Script to update place images in the database with downloaded images.
This script will copy images from place_images_to_download to the media directory
and update the database records accordingly.
"""

import os
import sys
import shutil
import django
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from tourism.models import Place, PlaceImage
from django.core.files import File
from django.conf import settings

def update_place_images():
    """Update place images in the database with downloaded images."""
    
    print("🖼️ Starting place images update...")
    
    # Define the source directory for images
    source_dir = Path(project_root.parent / "place_images_to_download")
    
    # Define the media directory
    media_dir = Path(settings.MEDIA_ROOT)
    places_media_dir = media_dir / "places"
    
    # Create places media directory if it doesn't exist
    places_media_dir.mkdir(parents=True, exist_ok=True)
    
    # Mapping of image filenames to place names (based on our seeded data)
    image_to_place_mapping = {
        'grande_poste_alger.jpg': 'Grande Poste d\'Alger',
        'palais_des_rais.jpg': 'Palais des Raïs',
        'place_des_martyrs.jpg': 'Place des Martyrs',
        'marche_bab_el_oued.jpg': 'Marché de Bab El Oued',
        'mosquee_ketchaoua.jpg': 'Mosquée Ketchaoua',
        'musee_beaux_arts.jpg': 'Musée National des Beaux-Arts',
        'parc_liberte.jpg': 'Parc de la Liberté',
        'sanctuaire_martyr.jpg': 'Sanctuaire du Martyr',
        'palais_culture.jpg': 'Palais de la Culture',
        'aeroport_houari_boumediene.jpg': 'Aéroport Houari Boumediene',
        'theatre_regional_oran.jpg': 'Théâtre Régional d\'Oran',
        'musee_ahmed_zabana.jpg': 'Musée Ahmed Zabana',
        'place_1er_novembre.jpg': 'Place du 1er Novembre',
        'chateau_neuf.jpg': 'Château Neuf',
        'mosquee_hassan_pacha.jpg': 'Mosquée Hassan Pacha',
        'universite_oran.jpeg': 'Université d\'Oran Es-Senia',
        'centre_commercial_ardis.jpg': 'Centre Commercial Ardis'
    }
    
    updated_count = 0
    
    for image_filename, place_name in image_to_place_mapping.items():
        source_image_path = source_dir / image_filename
        
        if not source_image_path.exists():
            print(f"   ⚠️ Image not found: {image_filename}")
            continue
            
        try:
            # Find the place in the database
            place = Place.objects.get(name=place_name)
            
            # Define destination path
            dest_filename = f"{place.id}_{image_filename}"
            dest_path = places_media_dir / dest_filename
            
            # Copy the image to media directory
            shutil.copy2(source_image_path, dest_path)
            
            # Create or update PlaceImage record
            place_image, created = PlaceImage.objects.get_or_create(
                place=place,
                defaults={
                    'image': f"places/{dest_filename}",
                    'is_primary': True,
                    'caption': f"Main image of {place_name}"
                }
            )
            
            if not created:
                # Update existing image
                place_image.image = f"places/{dest_filename}"
                place_image.is_primary = True
                place_image.caption = f"Main image of {place_name}"
                place_image.save()
            
            print(f"   ✅ Updated image for: {place_name}")
            updated_count += 1
            
        except Place.DoesNotExist:
            print(f"   ❌ Place not found in database: {place_name}")
        except Exception as e:
            print(f"   ❌ Error updating {place_name}: {str(e)}")
    
    print(f"\n🎉 Image update completed!")
    print(f"📊 Updated {updated_count} place images")
    
    # Verify the results
    total_places = Place.objects.count()
    places_with_images = Place.objects.filter(images__isnull=False).distinct().count()
    
    print(f"📈 Summary:")
    print(f"   - Total places: {total_places}")
    print(f"   - Places with images: {places_with_images}")
    print(f"   - Places without images: {total_places - places_with_images}")

if __name__ == "__main__":
    update_place_images()