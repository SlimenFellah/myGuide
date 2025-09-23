from django.core.management.base import BaseCommand
from tourism.models import Place, PlaceImage

class Command(BaseCommand):
    help = 'Check places and their images'

    def handle(self, *args, **options):
        # Check for places without images
        places_without_images = Place.objects.filter(is_active=True, images__isnull=True).distinct()
        self.stdout.write(f"Places without images ({places_without_images.count()}):")
        for place in places_without_images:
            self.stdout.write(f"- {place.name} (ID: {place.id})")

        # Check specifically for the mentioned places
        mentioned_places = [
            "Hotel Sheraton Oran",
            "Restaurant El Bahdja", 
            "Makam Echahid (Martyrs' Memorial)"
        ]

        self.stdout.write("\nChecking mentioned places:")
        for place_name in mentioned_places:
            try:
                place = Place.objects.get(name__icontains=place_name.split()[0])
                images_count = place.images.count()
                self.stdout.write(f"- {place.name} (ID: {place.id}): {images_count} images")
                if images_count == 0:
                    self.stdout.write(f"  -> No images found for {place.name}")
            except Place.DoesNotExist:
                self.stdout.write(f"- {place_name}: Not found in database")
            except Place.MultipleObjectsReturned:
                places = Place.objects.filter(name__icontains=place_name.split()[0])
                self.stdout.write(f"- Multiple places found for '{place_name.split()[0]}':")
                for p in places:
                    images_count = p.images.count()
                    self.stdout.write(f"  -> {p.name} (ID: {p.id}): {images_count} images")

        # List all places and their image counts
        self.stdout.write("\nAll places and their image counts:")
        all_places = Place.objects.filter(is_active=True)
        for place in all_places:
            images_count = place.images.count()
            self.stdout.write(f"- {place.name} (ID: {place.id}): {images_count} images")