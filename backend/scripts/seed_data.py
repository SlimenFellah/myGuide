#!/usr/bin/env python

# Developed & maintained by Slimene Fellah — Available for freelance work at slimenefellah.dev

import sys
from pathlib import Path
import os

def setup_django():
    backend_path = Path(__file__).resolve().parent.parent  # This should point to the 'backend' directory
    sys.path.append(str(backend_path))
    os.environ['DJANGO_SETTINGS_MODULE'] = 'myguide_backend.settings'
    import django
    django.setup()

def seed_data():
    from tourism.models import Province, District, Municipality, Place

    data = [
        {
            'name': 'Alger',
            'description': 'The capital province of Algeria.',
            'districts': [
                {
                    'name': 'Alger-Centre',
                    'description': 'Central district of Algiers.',
                    'municipalities': [
                        {
                            'name': 'Sidi M\'Hamed',
                            'description': 'Municipality in central Algiers.',
                            'places': [
                                {'name': 'Casbah of Algiers', 'type': 'historical', 'lat': 36.7833, 'lon': 3.0603, 'description': 'UNESCO World Heritage site.'},
                                {'name': 'Makam Echahid', 'type': 'monument', 'lat': 36.7458, 'lon': 3.0697, 'description': 'Martyrs\' Memorial.'},
                            ]
                        },
                        {
                            'name': 'Alger-Centre',
                            'description': 'Central municipality.',
                            'places': [
                                {'name': 'Jardin d\'Essai du Hamma', 'type': 'park', 'lat': 36.7486, 'lon': 3.0764, 'description': 'Botanical garden.'},
                            ]
                        },
                    ]
                },
                {
                    'name': 'Bouzaréah',
                    'description': 'District in Algiers.',
                    'municipalities': [
                        {
                            'name': 'Bouzaréah',
                            'description': 'Municipality in Bouzaréah.',
                            'places': [
                                {'name': 'Notre-Dame d\'Afrique', 'type': 'religious', 'lat': 36.8008, 'lon': 3.0428, 'description': 'Basilica overlooking the sea.'},
                            ]
                        },
                    ]
                },
            ]
        },
        {
            'name': 'Oran',
            'description': 'Coastal province in western Algeria.',
            'districts': [
                {
                    'name': 'Oran',
                    'description': 'Main district of Oran.',
                    'municipalities': [
                        {
                            'name': 'Oran',
                            'description': 'Capital municipality of Oran.',
                            'places': [
                                {'name': 'Santa Cruz Fort', 'type': 'historical', 'lat': 35.7094, 'lon': -0.6647, 'description': 'Historic fort.'},
                                {'name': 'Great Mosque of Oran', 'type': 'religious', 'lat': 35.7022, 'lon': -0.6489, 'description': 'Important mosque.'},
                                {'name': 'Cathédrale du Sacré-Cœur d\'Oran', 'type': 'religious', 'lat': 35.7000, 'lon': -0.6500, 'description': 'Catholic cathedral.'},
                            ]
                        },
                    ]
                },
            ]
        },
        {
            'name': 'Constantine',
            'description': 'Province known for its bridges.',
            'districts': [
                {
                    'name': 'Constantine',
                    'description': 'Main district.',
                    'municipalities': [
                        {
                            'name': 'Constantine',
                            'description': 'Capital municipality.',
                            'places': [
                                {'name': 'Emir Abdelkader Mosque', 'type': 'religious', 'lat': 36.2833, 'lon': 6.6167, 'description': 'Large mosque.'},
                                {'name': 'Mellah Slimane Bridge', 'type': 'bridge', 'lat': 36.3667, 'lon': 6.6167, 'description': 'Famous suspension bridge.'},
                            ]
                        },
                    ]
                },
            ]
        },
        {
            'name': 'Annaba',
            'description': 'Eastern coastal province.',
            'districts': [
                {
                    'name': 'Annaba',
                    'description': 'Main district.',
                    'municipalities': [
                        {
                            'name': 'Annaba',
                            'description': 'Capital municipality.',
                            'places': [
                                {'name': 'Basilica of St Augustine', 'type': 'religious', 'lat': 36.9167, 'lon': 7.7500, 'description': 'Historic basilica.'},
                                {'name': 'Hippo Regius', 'type': 'historical', 'lat': 36.8833, 'lon': 7.7500, 'description': 'Ancient ruins.'},
                            ]
                        },
                    ]
                },
            ]
        },
        {
            'name': 'Tlemcen',
            'description': 'Province with rich Islamic heritage.',
            'districts': [
                {
                    'name': 'Tlemcen',
                    'description': 'Main district.',
                    'municipalities': [
                        {
                            'name': 'Tlemcen',
                            'description': 'Capital municipality.',
                            'places': [
                                {'name': 'Great Mosque of Tlemcen', 'type': 'religious', 'lat': 34.8833, 'lon': -1.3167, 'description': 'Almohad mosque.'},
                                {'name': 'Mansourah Castle', 'type': 'historical', 'lat': 34.8833, 'lon': -1.3167, 'description': 'Ruins of a castle.'},
                            ]
                        },
                    ]
                },
            ]
        },
        {
            'name': 'Béjaïa',
            'description': 'Province with beautiful coastline.',
            'districts': [
                {
                    'name': 'Béjaïa',
                    'description': 'Main district.',
                    'municipalities': [
                        {
                            'name': 'Béjaïa',
                            'description': 'Capital municipality.',
                            'places': [
                                {'name': 'Cap Carbon', 'type': 'natural', 'lat': 36.7667, 'lon': 5.1000, 'description': 'Scenic cape.'},
                                {'name': 'Yemma Gouraya', 'type': 'mountain', 'lat': 36.7500, 'lon': 5.0833, 'description': 'Mountain peak.'},
                            ]
                        },
                    ]
                },
            ]
        },
    ]

    for prov_data in data:
        province, _ = Province.objects.get_or_create(
            name=prov_data['name'],
            defaults={'description': prov_data['description']}
        )
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
                    Place.objects.get_or_create(
                        name=place_data['name'],
                        municipality=municipality,
                        defaults={
                            'place_type': place_data['type'],
                            'description': place_data['description'],
                            'latitude': place_data['lat'],
                            'longitude': place_data['lon'],
                        }
                    )
    print("Data seeding completed successfully.")

if __name__ == '__main__':
    setup_django()
    seed_data()