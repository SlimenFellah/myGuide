#!/usr/bin/env python
import os
import django
from pathlib import Path

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from tourism.models import Place, PlaceImage
from django.core.files.base import ContentFile
import requests
from io import BytesIO
from PIL import Image

def create_sample_image(place_name, width=800, height=600):
    """Create a sample image for a place"""
    # Create a simple colored image
    img = Image.new('RGB', (width, height), color='lightblue')
    
    # Save to BytesIO
    img_io = BytesIO()
    img.save(img_io, format='JPEG', quality=85)
    img_io.seek(0)
    
    return ContentFile(img_io.getvalue(), name=f'{place_name.lower().replace(" ", "_")}.jpg')

def add_images_to_places():
    """Add sample images to places that don't have any"""
    
    # Places that need images
    places_needing_images = [
        {'id': 23, 'name': 'Hotel Sheraton Oran'},
        {'id': 19, 'name': 'Restaurant El Bahdja'},
        {'id': 17, 'name': 'Makam Echahid (Martyrs\' Memorial)'}
    ]
    
    for place_data in places_needing_images:
        try:
            place = Place.objects.get(id=place_data['id'])
            
            # Check if place already has images
            if place.images.count() > 0:
                print(f"Place {place.name} already has images, skipping...")
                continue
            
            # Create sample image
            sample_image = create_sample_image(place.name)
            
            # Create PlaceImage instance
            place_image = PlaceImage(
                place=place,
                is_primary=True,
                caption=f"Beautiful view of {place.name}"
            )
            
            # Save the image
            place_image.image.save(
                f'{place.name.lower().replace(" ", "_")}.jpg',
                sample_image,
                save=True
            )
            
            print(f"Added sample image to {place.name}")
            
        except Place.DoesNotExist:
            print(f"Place with ID {place_data['id']} not found")
        except Exception as e:
            print(f"Error adding image to {place_data['name']}: {str(e)}")

if __name__ == '__main__':
    print("Adding sample images to places without images...")
    add_images_to_places()
    print("Done!")