#!/usr/bin/env python3
"""
Enhanced Places Seeding Script
This script seeds the database with comprehensive places data for Oran and Algiers provinces.
Run this after cleanup_database.py and after images are ready.
"""

import os
import sys
import django
from decimal import Decimal

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from tourism.models import Province, District, Municipality, Place, PlaceCategory, PlaceImage
from django.contrib.auth import get_user_model

User = get_user_model()

def create_place_categories():
    """Create all necessary place categories"""
    print("🏷️ Creating place categories...")
    
    categories = [
        {'name': 'landmark', 'name_ar': 'معلم', 'icon': 'landmark', 'color': '#8B5CF6'},
        {'name': 'museum', 'name_ar': 'متحف', 'icon': 'museum', 'color': '#06B6D4'},
        {'name': 'market', 'name_ar': 'سوق', 'icon': 'shopping-bag', 'color': '#F59E0B'},
        {'name': 'mosque', 'name_ar': 'مسجد', 'icon': 'mosque', 'color': '#10B981'},
        {'name': 'park', 'name_ar': 'حديقة', 'icon': 'tree', 'color': '#22C55E'},
        {'name': 'monument', 'name_ar': 'نصب تذكاري', 'icon': 'monument', 'color': '#6B7280'},
        {'name': 'cultural_center', 'name_ar': 'مركز ثقافي', 'icon': 'building', 'color': '#EC4899'},
        {'name': 'airport', 'name_ar': 'مطار', 'icon': 'plane', 'color': '#3B82F6'},
        {'name': 'theater', 'name_ar': 'مسرح', 'icon': 'theater', 'color': '#DC2626'},
        {'name': 'square', 'name_ar': 'ساحة', 'icon': 'square', 'color': '#7C3AED'},
        {'name': 'fortress', 'name_ar': 'قلعة', 'icon': 'castle', 'color': '#92400E'},
        {'name': 'beach', 'name_ar': 'شاطئ', 'icon': 'waves', 'color': '#0EA5E9'},
        {'name': 'harbor', 'name_ar': 'ميناء', 'icon': 'anchor', 'color': '#1E40AF'},
        {'name': 'university', 'name_ar': 'جامعة', 'icon': 'graduation-cap', 'color': '#7C2D12'},
        {'name': 'mall', 'name_ar': 'مركز تجاري', 'icon': 'shopping-cart', 'color': '#BE185D'},
    ]
    
    for cat_data in categories:
        category, created = PlaceCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults={
                'name_ar': cat_data['name_ar'],
                'icon': cat_data['icon'],
                'color': cat_data['color']
            }
        )
        if created:
            print(f"   ✅ Created category: {cat_data['name']}")

def create_districts_and_municipalities():
    """Create districts and municipalities for Oran and Algiers"""
    print("🏛️ Creating districts and municipalities...")
    
    # Get provinces
    algiers = Province.objects.get(name='Algiers')
    oran = Province.objects.get(name='Oran')
    
    # Algiers districts and municipalities
    algiers_data = {
        'Algiers Center': [
            'Algiers Center', 'Casbah', 'Sidi M\'Hamed', 'El Madania',
            'Hamma El Annasser', 'Bab El Oued'
        ],
        'Bouzareah': ['Bouzareah', 'Beni Messous', 'Ouled Fayet'],
        'Bir Mourad Rais': ['Bir Mourad Rais', 'El Biar', 'Hydra'],
        'Hussein Dey': ['Hussein Dey', 'Kouba', 'Bourouba'],
        'Dar El Beida': ['Dar El Beida', 'Rouiba', 'Reghaia'],
    }
    
    # Oran districts and municipalities
    oran_data = {
        'Oran': ['Oran', 'Bir El Djir', 'Es Senia', 'Sidi Chami'],
        'Arzew': ['Arzew', 'Bethioua', 'Marsat El Hadjadj'],
        'Boutlelis': ['Boutlelis', 'Ain El Turk', 'El Ançor'],
    }
    
    # Create Algiers districts and municipalities
    for district_name, municipalities in algiers_data.items():
        district, created = District.objects.get_or_create(
            name=district_name,
            province=algiers,
            defaults={'description': f'District of {district_name} in Algiers'}
        )
        if created:
            print(f"   ✅ Created district: {district_name}")
        
        for muni_name in municipalities:
            municipality, created = Municipality.objects.get_or_create(
                name=muni_name,
                district=district,
                defaults={'description': f'Municipality of {muni_name}'}
            )
            if created:
                print(f"     ✅ Created municipality: {muni_name}")
    
    # Create Oran districts and municipalities
    for district_name, municipalities in oran_data.items():
        district, created = District.objects.get_or_create(
            name=district_name,
            province=oran,
            defaults={'description': f'District of {district_name} in Oran'}
        )
        if created:
            print(f"   ✅ Created district: {district_name}")
        
        for muni_name in municipalities:
            municipality, created = Municipality.objects.get_or_create(
                name=muni_name,
                district=district,
                defaults={'description': f'Municipality of {muni_name}'}
            )
            if created:
                print(f"     ✅ Created municipality: {muni_name}")

def create_places():
    """Create all the places with their data"""
    print("📍 Creating places...")
    
    # Get categories
    categories = {cat.name: cat for cat in PlaceCategory.objects.all()}
    
    # Get municipalities
    municipalities = {muni.name: muni for muni in Municipality.objects.all()}
    
    # Get admin user (or create one)
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@myguide.com',
            'is_staff': True,
            'is_superuser': True
        }
    )
    
    # Algiers places data
    algiers_places = [
        {
            'name': 'Grande Poste d\'Alger',
            'name_ar': 'البريد المركزي بالجزائر',
            'municipality': 'Algiers Center',
            'category': 'landmark',
            'place_type': 'historical',
            'description': 'Historic central post office building, an architectural landmark of Algiers.',
            'description_ar': 'مبنى البريد المركزي التاريخي، معلم معماري في الجزائر.',
            'address': '1 Grande Poste, Algiers Center',
            'latitude': Decimal('36.7753'),
            'longitude': Decimal('3.0581'),
            'opening_hours': 'Mon-Fri: 8:00-17:00, Sat: 8:00-12:00',
            'entry_fee': Decimal('0.00'),
            'website': 'https://www.poste.dz',
            'phone': '+213 21 73 71 23',
            'tags': ['architecture', 'historical', 'postal', 'landmark'],
            'facilities': ['parking', 'accessibility', 'restrooms']
        },
        {
            'name': 'Palais des Raïs',
            'name_ar': 'قصر الرياس',
            'municipality': 'Casbah',
            'category': 'museum',
            'place_type': 'cultural',
            'description': 'Historic palace complex showcasing Ottoman architecture and Algerian heritage.',
            'description_ar': 'مجمع قصور تاريخي يعرض العمارة العثمانية والتراث الجزائري.',
            'address': 'Bastion 23, Casbah, Algiers',
            'latitude': Decimal('36.7847'),
            'longitude': Decimal('3.0597'),
            'opening_hours': 'Tue-Sun: 9:00-17:00',
            'entry_fee': Decimal('200.00'),
            'phone': '+213 21 73 56 78',
            'tags': ['ottoman', 'architecture', 'museum', 'heritage'],
            'facilities': ['guided_tours', 'gift_shop', 'cafe']
        },
        {
            'name': 'Place des Martyrs',
            'name_ar': 'ساحة الشهداء',
            'municipality': 'Algiers Center',
            'category': 'square',
            'place_type': 'cultural',
            'description': 'Central square commemorating Algerian independence martyrs.',
            'description_ar': 'الساحة المركزية التي تخلد ذكرى شهداء الاستقلال الجزائري.',
            'address': 'Place des Martyrs, Algiers Center',
            'latitude': Decimal('36.7755'),
            'longitude': Decimal('3.0597'),
            'opening_hours': '24/7',
            'entry_fee': Decimal('0.00'),
            'tags': ['memorial', 'independence', 'public_space', 'historical'],
            'facilities': ['benches', 'lighting', 'monuments']
        },
        {
            'name': 'Marché de Bab El Oued',
            'name_ar': 'سوق باب الواد',
            'municipality': 'Bab El Oued',
            'category': 'market',
            'place_type': 'cultural',
            'description': 'Traditional market offering local products, crafts, and authentic Algerian goods.',
            'description_ar': 'سوق تقليدي يقدم المنتجات المحلية والحرف اليدوية والسلع الجزائرية الأصيلة.',
            'address': 'Rue Larbi Ben M\'hidi, Bab El Oued',
            'latitude': Decimal('36.7889'),
            'longitude': Decimal('3.0456'),
            'opening_hours': 'Daily: 6:00-19:00',
            'entry_fee': Decimal('0.00'),
            'tags': ['traditional', 'shopping', 'local_products', 'authentic'],
            'facilities': ['parking', 'food_stalls', 'restrooms']
        },
        {
            'name': 'Mosquée Ketchaoua',
            'name_ar': 'جامع كتشاوة',
            'municipality': 'Casbah',
            'category': 'mosque',
            'place_type': 'religious',
            'description': 'Historic mosque in the Casbah, important religious and architectural site.',
            'description_ar': 'مسجد تاريخي في القصبة، موقع ديني ومعماري مهم.',
            'address': 'Place du Gouvernement, Casbah, Algiers',
            'latitude': Decimal('36.7831'),
            'longitude': Decimal('3.0603'),
            'opening_hours': 'Daily: 5:00-22:00 (Prayer times)',
            'entry_fee': Decimal('0.00'),
            'tags': ['religious', 'ottoman', 'architecture', 'historical'],
            'facilities': ['prayer_hall', 'ablution', 'library']
        },
        {
            'name': 'Musée National des Beaux-Arts',
            'name_ar': 'المتحف الوطني للفنون الجميلة',
            'municipality': 'El Madania',
            'category': 'museum',
            'place_type': 'cultural',
            'description': 'National fine arts museum with extensive collection of Algerian and international art.',
            'description_ar': 'المتحف الوطني للفنون الجميلة مع مجموعة واسعة من الفن الجزائري والعالمي.',
            'address': 'Rue Larbi Ben M\'hidi, El Madania',
            'latitude': Decimal('36.7642'),
            'longitude': Decimal('3.0567'),
            'opening_hours': 'Tue-Sun: 10:00-17:00',
            'entry_fee': Decimal('100.00'),
            'website': 'http://www.mnba.dz',
            'phone': '+213 21 74 95 24',
            'tags': ['art', 'culture', 'paintings', 'exhibitions'],
            'facilities': ['gift_shop', 'cafe', 'library', 'parking']
        },
        {
            'name': 'Parc de la Liberté',
            'name_ar': 'حديقة الحرية',
            'municipality': 'El Madania',
            'category': 'park',
            'place_type': 'natural',
            'description': 'Large urban park perfect for recreation and family activities.',
            'description_ar': 'حديقة حضرية كبيرة مثالية للترفيه والأنشطة العائلية.',
            'address': 'Avenue Franklin Roosevelt, El Madania',
            'latitude': Decimal('36.7598'),
            'longitude': Decimal('3.0456'),
            'opening_hours': 'Daily: 6:00-20:00',
            'entry_fee': Decimal('0.00'),
            'tags': ['recreation', 'family', 'nature', 'walking'],
            'facilities': ['playground', 'benches', 'walking_paths', 'restrooms']
        },
        {
            'name': 'Sanctuaire du Martyr',
            'name_ar': 'مقام الشهيد',
            'municipality': 'El Madania',
            'category': 'monument',
            'place_type': 'cultural',
            'description': 'National monument commemorating the martyrs of the Algerian War of Independence.',
            'description_ar': 'نصب تذكاري وطني يخلد ذكرى شهداء حرب التحرير الجزائرية.',
            'address': 'Plateau des Glières, El Madania',
            'latitude': Decimal('36.7519'),
            'longitude': Decimal('3.0389'),
            'opening_hours': 'Daily: 9:00-17:00',
            'entry_fee': Decimal('50.00'),
            'tags': ['memorial', 'independence', 'monument', 'national'],
            'facilities': ['museum', 'parking', 'viewpoint', 'gift_shop']
        },
        {
            'name': 'Palais de la Culture',
            'name_ar': 'قصر الثقافة',
            'municipality': 'Kouba',
            'category': 'cultural_center',
            'place_type': 'cultural',
            'description': 'Major cultural center hosting exhibitions, concerts, and cultural events.',
            'description_ar': 'مركز ثقافي رئيسي يستضيف المعارض والحفلات الموسيقية والفعاليات الثقافية.',
            'address': 'Plateau des Annassers, Kouba',
            'latitude': Decimal('36.7289'),
            'longitude': Decimal('3.0678'),
            'opening_hours': 'Tue-Sun: 10:00-18:00',
            'entry_fee': Decimal('0.00'),
            'website': 'http://www.palaisdelaculture.dz',
            'phone': '+213 21 77 12 34',
            'tags': ['culture', 'events', 'exhibitions', 'concerts'],
            'facilities': ['theater', 'exhibition_halls', 'cafe', 'parking']
        },
        {
            'name': 'Aéroport Houari Boumediene',
            'name_ar': 'مطار هواري بومدين',
            'municipality': 'Dar El Beida',
            'category': 'airport',
            'place_type': 'transportation',
            'description': 'Main international airport serving Algiers and Algeria.',
            'description_ar': 'المطار الدولي الرئيسي الذي يخدم الجزائر العاصمة والجزائر.',
            'address': 'Route de l\'Aéroport, Dar El Beida',
            'latitude': Decimal('36.6910'),
            'longitude': Decimal('3.2154'),
            'opening_hours': '24/7',
            'entry_fee': Decimal('0.00'),
            'website': 'http://www.aeroport-alger.dz',
            'phone': '+213 21 50 91 91',
            'tags': ['airport', 'international', 'transportation', 'travel'],
            'facilities': ['restaurants', 'shops', 'parking', 'wifi', 'car_rental']
        }
    ]
    
    # Oran places data
    oran_places = [
        {
            'name': 'Théâtre Régional d\'Oran',
            'name_ar': 'المسرح الجهوي بوهران',
            'municipality': 'Oran',
            'category': 'theater',
            'place_type': 'cultural',
            'description': 'Historic theater hosting various cultural performances and events.',
            'description_ar': 'مسرح تاريخي يستضيف العروض والفعاليات الثقافية المختلفة.',
            'address': 'Boulevard Emir Abdelkader, Oran',
            'latitude': Decimal('35.6969'),
            'longitude': Decimal('-0.6331'),
            'opening_hours': 'Tue-Sun: 14:00-22:00',
            'entry_fee': Decimal('500.00'),
            'phone': '+213 41 33 75 92',
            'tags': ['theater', 'culture', 'performances', 'arts'],
            'facilities': ['auditorium', 'cafe', 'parking', 'box_office']
        },
        {
            'name': 'Musée Ahmed Zabana',
            'name_ar': 'متحف أحمد زبانة',
            'municipality': 'Oran',
            'category': 'museum',
            'place_type': 'cultural',
            'description': 'Regional museum showcasing the history and culture of western Algeria.',
            'description_ar': 'متحف إقليمي يعرض تاريخ وثقافة غرب الجزائر.',
            'address': 'Boulevard Zabana, Oran',
            'latitude': Decimal('35.7045'),
            'longitude': Decimal('-0.6405'),
            'opening_hours': 'Tue-Sun: 9:00-17:00',
            'entry_fee': Decimal('100.00'),
            'phone': '+213 41 39 29 63',
            'tags': ['history', 'culture', 'artifacts', 'regional'],
            'facilities': ['exhibitions', 'library', 'gift_shop', 'parking']
        },
        {
            'name': 'Place du 1er Novembre',
            'name_ar': 'ساحة أول نوفمبر',
            'municipality': 'Oran',
            'category': 'square',
            'place_type': 'cultural',
            'description': 'Central square commemorating the start of the Algerian revolution.',
            'description_ar': 'الساحة المركزية التي تخلد ذكرى بداية الثورة الجزائرية.',
            'address': 'Place du 1er Novembre, Oran',
            'latitude': Decimal('35.6978'),
            'longitude': Decimal('-0.6336'),
            'opening_hours': '24/7',
            'entry_fee': Decimal('0.00'),
            'tags': ['memorial', 'revolution', 'public_space', 'historical'],
            'facilities': ['benches', 'lighting', 'monuments', 'fountains']
        },
        {
            'name': 'Château Neuf',
            'name_ar': 'القلعة الجديدة',
            'municipality': 'Oran',
            'category': 'fortress',
            'place_type': 'historical',
            'description': 'Historic fortress overlooking the city and Mediterranean Sea.',
            'description_ar': 'قلعة تاريخية تطل على المدينة والبحر الأبيض المتوسط.',
            'address': 'Plateau de Santa Cruz, Oran',
            'latitude': Decimal('35.7123'),
            'longitude': Decimal('-0.6289'),
            'opening_hours': 'Daily: 9:00-17:00',
            'entry_fee': Decimal('150.00'),
            'tags': ['fortress', 'historical', 'viewpoint', 'architecture'],
            'facilities': ['viewpoint', 'parking', 'guided_tours']
        },
        {
            'name': 'Mosquée Hassan Pacha',
            'name_ar': 'جامع حسن باشا',
            'municipality': 'Oran',
            'category': 'mosque',
            'place_type': 'religious',
            'description': 'Beautiful Ottoman-era mosque with distinctive architecture.',
            'description_ar': 'مسجد جميل من العهد العثماني بعمارة مميزة.',
            'address': 'Rue Larbi Ben M\'hidi, Oran',
            'latitude': Decimal('35.6956'),
            'longitude': Decimal('-0.6378'),
            'opening_hours': 'Daily: 5:00-22:00 (Prayer times)',
            'entry_fee': Decimal('0.00'),
            'tags': ['religious', 'ottoman', 'architecture', 'historical'],
            'facilities': ['prayer_hall', 'ablution', 'courtyard']
        },
        {
            'name': 'Université d\'Oran Es-Senia',
            'name_ar': 'جامعة وهران السانيا',
            'municipality': 'Es Senia',
            'category': 'university',
            'place_type': 'educational',
            'description': 'Major university campus with modern facilities and botanical gardens.',
            'description_ar': 'حرم جامعي رئيسي بمرافق حديثة وحدائق نباتية.',
            'address': 'BP 1524, Es Senia, Oran',
            'latitude': Decimal('35.6445'),
            'longitude': Decimal('-0.5978'),
            'opening_hours': 'Mon-Fri: 8:00-18:00',
            'entry_fee': Decimal('0.00'),
            'website': 'http://www.univ-oran.dz',
            'phone': '+213 41 51 92 67',
            'tags': ['education', 'university', 'research', 'campus'],
            'facilities': ['library', 'laboratories', 'cafeteria', 'parking']
        },
        {
            'name': 'Centre Commercial Ardis',
            'name_ar': 'المركز التجاري أرديس',
            'municipality': 'Bir El Djir',
            'category': 'mall',
            'place_type': 'commercial',
            'description': 'Modern shopping center with international brands and entertainment.',
            'description_ar': 'مركز تسوق حديث بعلامات تجارية عالمية وترفيه.',
            'address': 'Route Nationale 2, Bir El Djir, Oran',
            'latitude': Decimal('35.7234'),
            'longitude': Decimal('-0.5567'),
            'opening_hours': 'Daily: 10:00-22:00',
            'entry_fee': Decimal('0.00'),
            'website': 'http://www.ardis-mall.com',
            'phone': '+213 41 58 76 43',
            'tags': ['shopping', 'entertainment', 'modern', 'brands'],
            'facilities': ['restaurants', 'cinema', 'parking', 'wifi', 'kids_area']
        }
    ]
    
    # Create all places
    all_places = algiers_places + oran_places
    
    for place_data in all_places:
        try:
            municipality = municipalities[place_data['municipality']]
            category = categories[place_data['category']]
            
            place, created = Place.objects.get_or_create(
                name=place_data['name'],
                municipality=municipality,
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
                    'website': place_data.get('website', ''),
                    'phone': place_data.get('phone', ''),
                    'email': place_data.get('email', ''),
                    'average_rating': Decimal('4.0'),
                    'popularity_score': 50,
                    'is_active': True,
                    'tags': place_data.get('tags', []),
                    'amenities': place_data.get('facilities', []),
                    'created_by': admin_user
                }
            )
            
            if created:
                print(f"   ✅ Created place: {place_data['name']}")
            else:
                print(f"   ℹ️ Place already exists: {place_data['name']}")
                
        except Exception as e:
            print(f"   ❌ Error creating place {place_data['name']}: {str(e)}")

def seed_database():
    """Main function to seed the database"""
    print("🌱 Starting database seeding...")
    
    create_place_categories()
    create_districts_and_municipalities()
    create_places()
    
    print("\n🎉 Database seeding completed successfully!")
    print(f"📊 Final state:")
    print(f"   - Provinces: {Province.objects.count()}")
    print(f"   - Districts: {District.objects.count()}")
    print(f"   - Municipalities: {Municipality.objects.count()}")
    print(f"   - Places: {Place.objects.count()}")
    print(f"   - Place Categories: {PlaceCategory.objects.count()}")

if __name__ == '__main__':
    try:
        seed_database()
    except Exception as e:
        print(f"❌ Error during seeding: {str(e)}")
        sys.exit(1)