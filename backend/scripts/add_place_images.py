import os
import sys
import django
import requests
from urllib.parse import urlparse
from pathlib import Path

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from tourism.models import Place, PlaceImage

# Placeholder images from Picsum (Lorem Picsum) - free to use
PLACE_IMAGES = {
    'Casbah of Algiers': [
        'https://picsum.photos/800/600?random=1'
    ],
    'Makam Echahid': [
        'https://picsum.photos/800/600?random=2'
    ],
    'Jardin d\'Essai du Hamma': [
        'https://picsum.photos/800/600?random=3'
    ],
    'Notre-Dame d\'Afrique': [
        'https://picsum.photos/800/600?random=4'
    ],
    'Santa Cruz Fort': [
        'https://picsum.photos/800/600?random=5'
    ],
    'Great Mosque of Oran': [
        'https://picsum.photos/800/600?random=6'
    ],
    'Cathédrale du Sacré-Cœur d\'Oran': [
        'https://picsum.photos/800/600?random=15'
    ],
    'Emir Abdelkader Mosque': [
        'https://picsum.photos/800/600?random=7'
    ],
    'Mellah Slimane Bridge': [
        'https://picsum.photos/800/600?random=8'
    ],
    'Basilica of St Augustine': [
        'https://picsum.photos/800/600?random=9'
    ],
    'Great Mosque of Tlemcen': [
        'https://picsum.photos/800/600?random=10'
    ],
    'Cap Carbon': [
        'https://picsum.photos/800/600?random=11'
    ],
    'Yemma Gouraya': [
        'https://picsum.photos/800/600?random=12'
    ],
    'Hippo Regius': [
        'https://picsum.photos/800/600?random=13'
    ],
    'Mansourah Castle': [
        'https://picsum.photos/800/600?random=14'
    ]
}

def download_image(url, filename):
    """Download an image from URL and save it locally"""
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        # Create media/places directory if it doesn't exist
        media_dir = Path('media/places')
        media_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = media_dir / filename
        
        with open(file_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"Downloaded: {filename}")
        return f"places/{filename}"
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return None

def add_images_to_places():
    """Add images to places in the database"""
    for place_name, image_urls in PLACE_IMAGES.items():
        try:
            place = Place.objects.get(name=place_name)
            print(f"\nProcessing place: {place_name}")
            
            # Clear existing images
            PlaceImage.objects.filter(place=place).delete()
            
            for i, url in enumerate(image_urls):
                # Extract filename from URL
                parsed_url = urlparse(url)
                clean_name = place_name.lower().replace(' ', '_').replace("'", "")
                filename = f"{clean_name}_{i+1}.jpg"
                
                # Download image
                image_path = download_image(url, filename)
                
                if image_path:
                    # Create PlaceImage object
                    place_image = PlaceImage.objects.create(
                        place=place,
                        image=image_path,
                        caption=f"{place_name} - Image {i+1}",
                        is_primary=(i == 0)  # First image is primary
                    )
                    print(f"Added image to database: {image_path}")
                    
        except Place.DoesNotExist:
            print(f"Place not found: {place_name}")
        except Exception as e:
            print(f"Error processing {place_name}: {e}")

if __name__ == '__main__':
    print("Starting to add images to places...")
    add_images_to_places()
    print("\nFinished adding images to places!")