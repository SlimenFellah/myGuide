import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from tourism.models import Place, PlaceImage

# Check for places without images
places_without_images = Place.objects.filter(is_active=True, images__isnull=True).distinct()
print(f"Places without images ({places_without_images.count()}):")
for place in places_without_images:
    print(f"- {place.name} (ID: {place.id})")

# Check specifically for the mentioned places
mentioned_places = [
    "Hotel Sheraton Oran",
    "Restaurant El Bahdja", 
    "Makam Echahid (Martyrs' Memorial)"
]

print("\nChecking mentioned places:")
for place_name in mentioned_places:
    try:
        place = Place.objects.get(name__icontains=place_name.split()[0])
        images_count = place.images.count()
        print(f"- {place.name} (ID: {place.id}): {images_count} images")
        if images_count == 0:
            print(f"  -> No images found for {place.name}")
    except Place.DoesNotExist:
        print(f"- {place_name}: Not found in database")
    except Place.MultipleObjectsReturned:
        places = Place.objects.filter(name__icontains=place_name.split()[0])
        print(f"- Multiple places found for '{place_name.split()[0]}':")
        for p in places:
            images_count = p.images.count()
            print(f"  -> {p.name} (ID: {p.id}): {images_count} images")

# List all places and their image counts
print("\nAll places and their image counts:")
all_places = Place.objects.filter(is_active=True)
for place in all_places:
    images_count = place.images.count()
    print(f"- {place.name} (ID: {place.id}): {images_count} images")