#!/usr/bin/env python

# Developed & maintained by Slimene Fellah — Available for freelance work at slimenefellah.dev

import sys
from pathlib import Path
import os
from decimal import Decimal

def setup_django():
    backend_path = Path(__file__).resolve().parent.parent  # This should point to the 'backend' directory
    sys.path.append(str(backend_path))
    os.environ['DJANGO_SETTINGS_MODULE'] = 'myguide_backend.settings'
    import django
    django.setup()

def clear_existing_data():
    """Clear existing incomplete data"""
    from tourism.models import Place, PlaceCategory, PlaceImage, Feedback
    
    print("Clearing existing data...")
    Place.objects.all().delete()
    PlaceCategory.objects.all().delete()
    PlaceImage.objects.all().delete()
    Feedback.objects.all().delete()
    print("Existing data cleared.")

def create_categories():
    """Create place categories"""
    from tourism.models import PlaceCategory
    
    categories = [
        {'name': 'Historical Sites', 'icon': 'fas fa-monument', 'color': '#8B4513'},
        {'name': 'Natural Attractions', 'icon': 'fas fa-tree', 'color': '#228B22'},
        {'name': 'Religious Sites', 'icon': 'fas fa-mosque', 'color': '#4169E1'},
        {'name': 'Museums', 'icon': 'fas fa-university', 'color': '#800080'},
        {'name': 'Entertainment', 'icon': 'fas fa-theater-masks', 'color': '#FF6347'},
        {'name': 'Restaurants', 'icon': 'fas fa-utensils', 'color': '#FF8C00'},
        {'name': 'Hotels', 'icon': 'fas fa-bed', 'color': '#20B2AA'},
        {'name': 'Shopping', 'icon': 'fas fa-shopping-bag', 'color': '#DC143C'},
    ]
    
    created_categories = {}
    for cat_data in categories:
        category, created = PlaceCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults={
                'icon': cat_data['icon'],
                'color': cat_data['color']
            }
        )
        created_categories[cat_data['name']] = category
        if created:
            print(f"Created category: {category.name}")
    
    return created_categories

def seed_comprehensive_data():
    from tourism.models import Province, District, Municipality, Place
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    
    # Get or create admin user
    admin_user, _ = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@myguide.com',
            'first_name': 'Admin',
            'last_name': 'User',
            'is_staff': True,
            'is_superuser': True
        }
    )
    
    # Create categories first
    categories = create_categories()
    
    comprehensive_data = [
        {
            'name': 'Alger',
            'description': 'The capital province of Algeria, rich in history and culture.',
            'districts': [
                {
                    'name': 'Alger-Centre',
                    'description': 'Central district of Algiers with major attractions.',
                    'municipalities': [
                        {
                            'name': 'Sidi M\'Hamed',
                            'description': 'Historic municipality in central Algiers.',
                            'places': [
                                {
                                    'name': 'Casbah of Algiers',
                                    'place_type': 'historical',
                                    'category': 'Historical Sites',
                                    'description': 'UNESCO World Heritage site featuring Ottoman-era architecture and narrow winding streets. The Casbah is a unique medina that preserves centuries of Algerian history.',
                                    'short_description': 'UNESCO World Heritage Ottoman medina',
                                    'address': 'Casbah, Algiers 16000, Algeria',
                                    'latitude': Decimal('36.7833'),
                                    'longitude': Decimal('3.0603'),
                                    'phone': '+213 21 73 56 78',
                                    'email': 'info@casbah-algiers.dz',
                                    'website': 'https://casbah-algiers.com',
                                    'entry_fee': Decimal('500.00'),
                                    'opening_hours': {
                                        'monday': '9:00 AM - 6:00 PM',
                                        'tuesday': '9:00 AM - 6:00 PM',
                                        'wednesday': '9:00 AM - 6:00 PM',
                                        'thursday': '9:00 AM - 6:00 PM',
                                        'friday': '2:00 PM - 6:00 PM',
                                        'saturday': '9:00 AM - 6:00 PM',
                                        'sunday': '9:00 AM - 6:00 PM'
                                    },
                                    'is_featured': True,
                                    'average_rating': Decimal('4.5')
                                },
                                {
                                    'name': 'Makam Echahid (Martyrs\' Memorial)',
                                    'place_type': 'historical',
                                    'category': 'Historical Sites',
                                    'description': 'Iconic monument commemorating Algerian martyrs of the independence war. Features a museum and panoramic views of Algiers.',
                                    'short_description': 'Memorial monument with museum and city views',
                                    'address': 'El Madania, Algiers 16075, Algeria',
                                    'latitude': Decimal('36.7458'),
                                    'longitude': Decimal('3.0697'),
                                    'phone': '+213 21 69 12 34',
                                    'email': 'contact@makam-echahid.dz',
                                    'website': 'https://makam-echahid.gov.dz',
                                    'entry_fee': Decimal('300.00'),
                                    'opening_hours': {
                                        'monday': '9:00 AM - 5:00 PM',
                                        'tuesday': '9:00 AM - 5:00 PM',
                                        'wednesday': '9:00 AM - 5:00 PM',
                                        'thursday': '9:00 AM - 5:00 PM',
                                        'friday': 'Closed',
                                        'saturday': '9:00 AM - 5:00 PM',
                                        'sunday': '9:00 AM - 5:00 PM'
                                    },
                                    'is_featured': True,
                                    'average_rating': Decimal('4.2')
                                }
                            ]
                        },
                        {
                            'name': 'Alger-Centre',
                            'description': 'Central municipality with gardens and cultural sites.',
                            'places': [
                                {
                                    'name': 'Jardin d\'Essai du Hamma',
                                    'place_type': 'park',
                                    'category': 'Natural Attractions',
                                    'description': 'Historic botanical garden established in 1832, featuring diverse plant species from around the world and beautiful landscaped areas.',
                                    'short_description': 'Historic botanical garden with diverse flora',
                                    'address': 'Rue Hassiba Ben Bouali, El Hamma, Algiers 16000',
                                    'latitude': Decimal('36.7486'),
                                    'longitude': Decimal('3.0764'),
                                    'phone': '+213 21 67 89 45',
                                    'email': 'jardin@hamma.dz',
                                    'website': 'https://jardin-hamma.com',
                                    'entry_fee': Decimal('200.00'),
                                    'opening_hours': {
                                        'monday': '8:00 AM - 6:00 PM',
                                        'tuesday': '8:00 AM - 6:00 PM',
                                        'wednesday': '8:00 AM - 6:00 PM',
                                        'thursday': '8:00 AM - 6:00 PM',
                                        'friday': '8:00 AM - 6:00 PM',
                                        'saturday': '8:00 AM - 6:00 PM',
                                        'sunday': '8:00 AM - 6:00 PM'
                                    },
                                    'is_featured': False,
                                    'average_rating': Decimal('4.0')
                                },
                                {
                                    'name': 'Restaurant El Bahdja',
                                    'place_type': 'restaurant',
                                    'category': 'Restaurants',
                                    'description': 'Traditional Algerian restaurant serving authentic local cuisine in the heart of Algiers. Famous for couscous and tagines.',
                                    'short_description': 'Authentic Algerian cuisine restaurant',
                                    'address': '15 Rue Didouche Mourad, Algiers 16000',
                                    'latitude': Decimal('36.7531'),
                                    'longitude': Decimal('3.0420'),
                                    'phone': '+213 21 63 45 67',
                                    'email': 'reservation@elbahdja.dz',
                                    'website': 'https://restaurant-elbahdja.com',
                                    'entry_fee': Decimal('0.00'),
                                    'opening_hours': {
                                        'monday': '12:00 PM - 11:00 PM',
                                        'tuesday': '12:00 PM - 11:00 PM',
                                        'wednesday': '12:00 PM - 11:00 PM',
                                        'thursday': '12:00 PM - 11:00 PM',
                                        'friday': '12:00 PM - 11:00 PM',
                                        'saturday': '12:00 PM - 11:00 PM',
                                        'sunday': '12:00 PM - 10:00 PM'
                                    },
                                    'is_featured': False,
                                    'average_rating': Decimal('4.3')
                                }
                            ]
                        }
                    ]
                },
                {
                    'name': 'Bouzaréah',
                    'description': 'Elevated district with religious and cultural sites.',
                    'municipalities': [
                        {
                            'name': 'Bouzaréah',
                            'description': 'Municipality with panoramic views of the Mediterranean.',
                            'places': [
                                {
                                    'name': 'Notre-Dame d\'Afrique',
                                    'place_type': 'religious',
                                    'category': 'Religious Sites',
                                    'description': 'Beautiful basilica overlooking the Mediterranean Sea, built in 1872. Known for its stunning architecture and peaceful atmosphere.',
                                    'short_description': 'Basilica with Mediterranean sea views',
                                    'address': 'Chemin de Notre-Dame d\'Afrique, Bouzaréah, Algiers',
                                    'latitude': Decimal('36.8008'),
                                    'longitude': Decimal('3.0428'),
                                    'phone': '+213 21 94 12 78',
                                    'email': 'contact@notredame-afrique.org',
                                    'website': 'https://notredame-afrique.org',
                                    'entry_fee': Decimal('0.00'),
                                    'opening_hours': {
                                        'monday': '8:00 AM - 6:00 PM',
                                        'tuesday': '8:00 AM - 6:00 PM',
                                        'wednesday': '8:00 AM - 6:00 PM',
                                        'thursday': '8:00 AM - 6:00 PM',
                                        'friday': '8:00 AM - 6:00 PM',
                                        'saturday': '8:00 AM - 6:00 PM',
                                        'sunday': '8:00 AM - 7:00 PM'
                                    },
                                    'is_featured': True,
                                    'average_rating': Decimal('4.4')
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            'name': 'Oran',
            'description': 'Coastal province in western Algeria, known for its vibrant culture.',
            'districts': [
                {
                    'name': 'Oran',
                    'description': 'Main district of Oran with historical and cultural attractions.',
                    'municipalities': [
                        {
                            'name': 'Oran',
                            'description': 'Capital municipality of Oran province.',
                            'places': [
                                {
                                    'name': 'Santa Cruz Fort',
                                    'place_type': 'historical',
                                    'category': 'Historical Sites',
                                    'description': 'Historic Spanish fort built in the 16th century, offering spectacular views of Oran and the Mediterranean coast.',
                                    'short_description': '16th-century Spanish fort with coastal views',
                                    'address': 'Santa Cruz, Oran 31000, Algeria',
                                    'latitude': Decimal('35.7094'),
                                    'longitude': Decimal('-0.6647'),
                                    'phone': '+213 41 33 45 67',
                                    'email': 'info@santacruz-fort.dz',
                                    'website': 'https://santacruz-oran.com',
                                    'entry_fee': Decimal('400.00'),
                                    'opening_hours': {
                                        'monday': '9:00 AM - 5:00 PM',
                                        'tuesday': '9:00 AM - 5:00 PM',
                                        'wednesday': '9:00 AM - 5:00 PM',
                                        'thursday': '9:00 AM - 5:00 PM',
                                        'friday': '2:00 PM - 5:00 PM',
                                        'saturday': '9:00 AM - 5:00 PM',
                                        'sunday': '9:00 AM - 5:00 PM'
                                    },
                                    'is_featured': True,
                                    'average_rating': Decimal('4.6')
                                },
                                {
                                    'name': 'Great Mosque of Oran',
                                    'place_type': 'religious',
                                    'category': 'Religious Sites',
                                    'description': 'Important mosque in the heart of Oran, showcasing beautiful Islamic architecture and serving as a center of worship.',
                                    'short_description': 'Central mosque with Islamic architecture',
                                    'address': 'Place du 1er Novembre, Oran 31000',
                                    'latitude': Decimal('35.7022'),
                                    'longitude': Decimal('-0.6489'),
                                    'phone': '+213 41 39 78 90',
                                    'email': 'mosque@oran-mosque.dz',
                                    'website': 'https://mosque-oran.org',
                                    'entry_fee': Decimal('0.00'),
                                    'opening_hours': {
                                        'monday': '5:00 AM - 10:00 PM',
                                        'tuesday': '5:00 AM - 10:00 PM',
                                        'wednesday': '5:00 AM - 10:00 PM',
                                        'thursday': '5:00 AM - 10:00 PM',
                                        'friday': '5:00 AM - 11:00 PM',
                                        'saturday': '5:00 AM - 10:00 PM',
                                        'sunday': '5:00 AM - 10:00 PM'
                                    },
                                    'is_featured': False,
                                    'average_rating': Decimal('4.1')
                                },
                                {
                                    'name': 'Hotel Sheraton Oran',
                                    'place_type': 'hotel',
                                    'category': 'Hotels',
                                    'description': 'Luxury hotel in downtown Oran offering modern amenities, conference facilities, and excellent service for business and leisure travelers.',
                                    'short_description': 'Luxury downtown hotel with modern amenities',
                                    'address': 'Avenue du Docteur Benzerdjeb, Oran 31000',
                                    'latitude': Decimal('35.6980'),
                                    'longitude': Decimal('-0.6364'),
                                    'phone': '+213 41 59 90 00',
                                    'email': 'reservations@sheraton-oran.com',
                                    'website': 'https://sheraton-oran.com',
                                    'entry_fee': Decimal('0.00'),
                                    'opening_hours': {
                                        'monday': '24 hours',
                                        'tuesday': '24 hours',
                                        'wednesday': '24 hours',
                                        'thursday': '24 hours',
                                        'friday': '24 hours',
                                        'saturday': '24 hours',
                                        'sunday': '24 hours'
                                    },
                                    'is_featured': True,
                                    'average_rating': Decimal('4.5')
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            'name': 'Constantine',
            'description': 'Province known for its dramatic bridges and rich history.',
            'districts': [
                {
                    'name': 'Constantine',
                    'description': 'Main district with architectural marvels.',
                    'municipalities': [
                        {
                            'name': 'Constantine',
                            'description': 'Capital municipality famous for its bridges.',
                            'places': [
                                {
                                    'name': 'Emir Abdelkader Mosque',
                                    'place_type': 'religious',
                                    'category': 'Religious Sites',
                                    'description': 'One of the largest mosques in Algeria, featuring impressive modern Islamic architecture and serving thousands of worshippers.',
                                    'short_description': 'Large modern mosque with impressive architecture',
                                    'address': 'Ali Mendjeli, Constantine 25000',
                                    'latitude': Decimal('36.2833'),
                                    'longitude': Decimal('6.6167'),
                                    'phone': '+213 31 92 34 56',
                                    'email': 'info@emir-mosque.dz',
                                    'website': 'https://emir-abdelkader-mosque.org',
                                    'entry_fee': Decimal('0.00'),
                                    'opening_hours': {
                                        'monday': '5:00 AM - 10:00 PM',
                                        'tuesday': '5:00 AM - 10:00 PM',
                                        'wednesday': '5:00 AM - 10:00 PM',
                                        'thursday': '5:00 AM - 10:00 PM',
                                        'friday': '5:00 AM - 11:00 PM',
                                        'saturday': '5:00 AM - 10:00 PM',
                                        'sunday': '5:00 AM - 10:00 PM'
                                    },
                                    'is_featured': True,
                                    'average_rating': Decimal('4.7')
                                },
                                {
                                    'name': 'Mellah Slimane Bridge',
                                    'place_type': 'historical',
                                    'category': 'Historical Sites',
                                    'description': 'Famous suspension bridge connecting different parts of Constantine, offering breathtaking views of the Rhumel Gorge.',
                                    'short_description': 'Suspension bridge with gorge views',
                                    'address': 'Constantine 25000, Algeria',
                                    'latitude': Decimal('36.3667'),
                                    'longitude': Decimal('6.6167'),
                                    'phone': '+213 31 94 78 12',
                                    'email': 'info@constantine-bridges.dz',
                                    'website': 'https://constantine-tourism.com',
                                    'entry_fee': Decimal('0.00'),
                                    'opening_hours': {
                                        'monday': '24 hours',
                                        'tuesday': '24 hours',
                                        'wednesday': '24 hours',
                                        'thursday': '24 hours',
                                        'friday': '24 hours',
                                        'saturday': '24 hours',
                                        'sunday': '24 hours'
                                    },
                                    'is_featured': True,
                                    'average_rating': Decimal('4.8')
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]

    for prov_data in comprehensive_data:
        province, _ = Province.objects.get_or_create(
            name=prov_data['name'],
            defaults={'description': prov_data['description']}
        )
        print(f"Processing province: {province.name}")
        
        for dist_data in prov_data['districts']:
            district, _ = District.objects.get_or_create(
                name=dist_data['name'],
                province=province,
                defaults={'description': dist_data['description']}
            )
            
            for mun_data in dist_data['municipalities']:
                municipality, _ = Municipality.objects.get_or_create(
                    name=mun_data['name'],
                    district=district,
                    defaults={'description': mun_data['description']}
                )
                
                for place_data in mun_data['places']:
                    category = categories.get(place_data['category'])
                    
                    place, created = Place.objects.get_or_create(
                        name=place_data['name'],
                        municipality=municipality,
                        defaults={
                            'place_type': place_data['place_type'],
                            'category': category,
                            'description': place_data['description'],
                            'short_description': place_data.get('short_description', ''),
                            'address': place_data.get('address', ''),
                            'latitude': place_data['latitude'],
                            'longitude': place_data['longitude'],
                            'phone': place_data.get('phone', ''),
                            'email': place_data.get('email', ''),
                            'website': place_data.get('website', ''),
                            'entry_fee': place_data.get('entry_fee', Decimal('0.00')),
                            'opening_hours': place_data.get('opening_hours', {}),
                            'is_featured': place_data.get('is_featured', False),
                            'is_active': True,
                            'average_rating': place_data.get('average_rating', Decimal('0.0')),
                            'created_by': admin_user
                        }
                    )
                    
                    if created:
                        print(f"  Created place: {place.name}")

    from tourism.models import PlaceCategory
    print("\nComprehensive data seeding completed successfully!")
    print(f"Total places created: {Place.objects.count()}")
    print(f"Total categories created: {PlaceCategory.objects.count()}")

if __name__ == '__main__':
    setup_django()
    clear_existing_data()
    seed_comprehensive_data()