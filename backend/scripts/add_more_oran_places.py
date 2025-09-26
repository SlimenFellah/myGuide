#!/usr/bin/env python
import os
import sys
import django
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from tourism.models import Place, PlaceCategory, Municipality

def add_oran_places():
    print("=== Adding More Places to Oran ===")
    
    # Get Oran municipality
    try:
        oran_municipality = Municipality.objects.get(name='Oran')
        print(f"Found municipality: {oran_municipality.name}")
    except Municipality.DoesNotExist:
        print("Oran municipality not found!")
        return
    
    # Get categories
    categories = {cat.name: cat for cat in PlaceCategory.objects.all()}
    
    # Additional places for Oran
    new_places = [
        {
            'name': 'Corniche Oranaise',
            'name_ar': 'كورنيش وهران',
            'category': 'landmark',
            'place_type': 'cultural',
            'description': 'Beautiful waterfront promenade with stunning Mediterranean views.',
            'description_ar': 'كورنيش جميل على الواجهة البحرية مع إطلالات خلابة على البحر الأبيض المتوسط.',
            'address': 'Front de Mer, Oran',
            'latitude': Decimal('35.7200'),
            'longitude': Decimal('-0.6500'),
            'opening_hours': '24/7',
            'entry_fee': Decimal('0.00'),
            'tags': ['waterfront', 'scenic', 'walking', 'mediterranean'],
            'facilities': ['benches', 'restaurants', 'parking', 'viewpoints']
        },
        {
            'name': 'Marché Medina Jedida',
            'name_ar': 'سوق المدينة الجديدة',
            'category': 'market',
            'place_type': 'cultural',
            'description': 'Traditional market offering local crafts, spices, and authentic Algerian products.',
            'description_ar': 'سوق تقليدي يقدم الحرف المحلية والتوابل والمنتجات الجزائرية الأصيلة.',
            'address': 'Medina Jedida, Oran',
            'latitude': Decimal('35.6900'),
            'longitude': Decimal('-0.6300'),
            'opening_hours': 'Daily: 8:00-18:00',
            'entry_fee': Decimal('0.00'),
            'tags': ['market', 'traditional', 'crafts', 'local'],
            'facilities': ['shops', 'cafes', 'parking']
        },
        {
            'name': 'Parc Usto',
            'name_ar': 'حديقة أوستو',
            'category': 'landmark',
            'place_type': 'recreational',
            'description': 'Large urban park perfect for relaxation and outdoor activities.',
            'description_ar': 'حديقة حضرية كبيرة مثالية للاسترخاء والأنشطة الخارجية.',
            'address': 'USTO Campus, Oran',
            'latitude': Decimal('35.6400'),
            'longitude': Decimal('-0.5900'),
            'opening_hours': 'Daily: 6:00-20:00',
            'entry_fee': Decimal('0.00'),
            'tags': ['park', 'recreation', 'nature', 'family'],
            'facilities': ['walking_paths', 'benches', 'playground', 'parking']
        },
        {
            'name': 'Cathédrale du Sacré-Cœur',
            'name_ar': 'كاتدرائية القلب المقدس',
            'category': 'monument',
            'place_type': 'historical',
            'description': 'Historic cathedral showcasing beautiful colonial architecture.',
            'description_ar': 'كاتدرائية تاريخية تعرض العمارة الاستعمارية الجميلة.',
            'address': 'Boulevard de la Révolution, Oran',
            'latitude': Decimal('35.6950'),
            'longitude': Decimal('-0.6320'),
            'opening_hours': 'Daily: 9:00-17:00',
            'entry_fee': Decimal('50.00'),
            'tags': ['cathedral', 'architecture', 'colonial', 'historical'],
            'facilities': ['guided_tours', 'parking']
        },
        {
            'name': 'Plage des Andalouses',
            'name_ar': 'شاطئ الأندلس',
            'category': 'beach',
            'place_type': 'recreational',
            'description': 'Beautiful beach with crystal clear waters and golden sand.',
            'description_ar': 'شاطئ جميل بمياه صافية ورمال ذهبية.',
            'address': 'Les Andalouses, Oran',
            'latitude': Decimal('35.7600'),
            'longitude': Decimal('-0.7800'),
            'opening_hours': 'Daily: 6:00-20:00',
            'entry_fee': Decimal('0.00'),
            'tags': ['beach', 'swimming', 'relaxation', 'family'],
            'facilities': ['restaurants', 'parking', 'showers', 'umbrellas']
        },
        {
            'name': 'Centre Culturel Ahmed Bey',
            'name_ar': 'المركز الثقافي أحمد باي',
            'category': 'cultural_center',
            'place_type': 'cultural',
            'description': 'Modern cultural center hosting exhibitions, concerts, and cultural events.',
            'description_ar': 'مركز ثقافي حديث يستضيف المعارض والحفلات الموسيقية والفعاليات الثقافية.',
            'address': 'Hai Es-Sabah, Oran',
            'latitude': Decimal('35.6800'),
            'longitude': Decimal('-0.6100'),
            'opening_hours': 'Tue-Sun: 10:00-18:00',
            'entry_fee': Decimal('100.00'),
            'tags': ['culture', 'exhibitions', 'concerts', 'modern'],
            'facilities': ['auditorium', 'galleries', 'cafe', 'parking']
        },
        {
            'name': 'Port d\'Oran',
            'name_ar': 'ميناء وهران',
            'category': 'harbor',
            'place_type': 'cultural',
            'description': 'Historic harbor with fishing boats and maritime activities.',
            'description_ar': 'ميناء تاريخي مع قوارب الصيد والأنشطة البحرية.',
            'address': 'Boulevard du Front de Mer, Oran',
            'latitude': Decimal('35.7150'),
            'longitude': Decimal('-0.6550'),
            'opening_hours': 'Daily: 6:00-22:00',
            'entry_fee': Decimal('0.00'),
            'tags': ['harbor', 'fishing', 'maritime', 'scenic'],
            'facilities': ['restaurants', 'parking', 'boat_tours']
        },
        {
            'name': 'Stade Ahmed Zabana',
            'name_ar': 'ملعب أحمد زبانة',
            'category': 'landmark',
            'place_type': 'recreational',
            'description': 'Historic football stadium and sports complex.',
            'description_ar': 'ملعب كرة قدم تاريخي ومجمع رياضي.',
            'address': 'Boulevard Millenium, Oran',
            'latitude': Decimal('35.7000'),
            'longitude': Decimal('-0.6200'),
            'opening_hours': 'Match days and tours: varies',
            'entry_fee': Decimal('200.00'),
            'tags': ['stadium', 'sports', 'football', 'historic'],
            'facilities': ['stadium', 'parking', 'cafeteria']
        }
    ]
    
    created_count = 0
    for place_data in new_places:
        try:
            category = categories.get(place_data['category'])
            if not category:
                print(f"Category '{place_data['category']}' not found, skipping {place_data['name']}")
                continue
                
            place, created = Place.objects.get_or_create(
                name=place_data['name'],
                municipality=oran_municipality,
                defaults={
                    'name_ar': place_data.get('name_ar', ''),
                    'category': category,
                    'place_type': place_data['place_type'],
                    'description': place_data['description'],
                    'description_ar': place_data.get('description_ar', ''),
                    'address': place_data['address'],
                    'latitude': place_data['latitude'],
                    'longitude': place_data['longitude'],
                    'opening_hours': place_data.get('opening_hours', ''),
                    'entry_fee': place_data.get('entry_fee', Decimal('0.00')),
                    'is_active': True,
                    'is_featured': False,
                    'average_rating': Decimal('4.0')
                }
            )
            
            if created:
                created_count += 1
                print(f"✓ Created: {place.name}")
            else:
                print(f"- Already exists: {place.name}")
                
        except Exception as e:
            print(f"✗ Error creating {place_data['name']}: {e}")
    
    print(f"\n=== Summary ===")
    print(f"Created {created_count} new places")
    
    # Check final count
    total_oran_places = Place.objects.filter(
        municipality=oran_municipality,
        is_active=True
    ).count()
    print(f"Total active places in Oran: {total_oran_places}")

if __name__ == '__main__':
    add_oran_places()