#!/usr/bin/env python3
"""
Database Cleanup Script
This script cleans the existing database and keeps only Oran and Algiers provinces
with their associated data.
"""

import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from tourism.models import Province, District, Municipality, Place, PlaceCategory, PlaceImage
from chatbot.models import KnowledgeBase
from trip_planner.models import TripPlan
from django.contrib.auth import get_user_model

User = get_user_model()

def cleanup_database():
    """Clean up the database and keep only Oran and Algiers data"""
    
    print("🧹 Starting database cleanup...")
    
    # Step 1: Delete all trip plans (they reference places)
    print("📋 Deleting all trip plans...")
    trip_count = TripPlan.objects.count()
    TripPlan.objects.all().delete()
    print(f"   ✅ Deleted {trip_count} trip plans")
    
    # Step 2: Delete all knowledge base entries (they reference places)
    print("🧠 Deleting all knowledge base entries...")
    kb_count = KnowledgeBase.objects.count()
    KnowledgeBase.objects.all().delete()
    print(f"   ✅ Deleted {kb_count} knowledge base entries")
    
    # Step 3: Delete all place images
    print("🖼️ Deleting all place images...")
    image_count = PlaceImage.objects.count()
    PlaceImage.objects.all().delete()
    print(f"   ✅ Deleted {image_count} place images")
    
    # Step 4: Delete all places
    print("📍 Deleting all places...")
    place_count = Place.objects.count()
    Place.objects.all().delete()
    print(f"   ✅ Deleted {place_count} places")
    
    # Step 5: Delete all municipalities
    print("🏘️ Deleting all municipalities...")
    municipality_count = Municipality.objects.count()
    Municipality.objects.all().delete()
    print(f"   ✅ Deleted {municipality_count} municipalities")
    
    # Step 6: Delete all districts
    print("🏛️ Deleting all districts...")
    district_count = District.objects.count()
    District.objects.all().delete()
    print(f"   ✅ Deleted {district_count} districts")
    
    # Step 7: Delete all provinces except Oran and Algiers
    print("🌍 Cleaning up provinces...")
    provinces_to_keep = ['Algiers', 'Oran']
    provinces_to_delete = Province.objects.exclude(name__in=provinces_to_keep)
    deleted_provinces_count = provinces_to_delete.count()
    provinces_to_delete.delete()
    print(f"   ✅ Deleted {deleted_provinces_count} provinces")
    
    # Step 8: Clean up place categories (keep only the ones we'll use)
    print("🏷️ Cleaning up place categories...")
    categories_to_keep = [
        'landmark', 'museum', 'market', 'mosque', 'park', 'monument',
        'cultural_center', 'airport', 'theater', 'square', 'fortress',
        'beach', 'harbor', 'university', 'mall', 'historical', 'natural',
        'cultural', 'religious'
    ]
    categories_to_delete = PlaceCategory.objects.exclude(name__in=categories_to_keep)
    deleted_categories_count = categories_to_delete.count()
    categories_to_delete.delete()
    print(f"   ✅ Deleted {deleted_categories_count} unused place categories")
    
    # Step 9: Ensure Oran and Algiers provinces exist
    print("🏛️ Ensuring required provinces exist...")
    
    algiers, created = Province.objects.get_or_create(
        name='Algiers',
        defaults={
            'name_ar': 'الجزائر',
            'description': 'Capital province of Algeria, home to the largest city and main port.',
            'description_ar': 'عاصمة الجزائر، موطن أكبر مدينة والميناء الرئيسي.',
            'latitude': 36.7538,
            'longitude': 3.0588,
            'area_km2': 1190.0,
            'population': 2988145
        }
    )
    if created:
        print("   ✅ Created Algiers province")
    else:
        print("   ℹ️ Algiers province already exists")
    
    oran, created = Province.objects.get_or_create(
        name='Oran',
        defaults={
            'name_ar': 'وهران',
            'description': 'Second largest city of Algeria, important port and cultural center.',
            'description_ar': 'ثاني أكبر مدينة في الجزائر، ميناء مهم ومركز ثقافي.',
            'latitude': 35.6969,
            'longitude': -0.6331,
            'area_km2': 2114.0,
            'population': 1584607
        }
    )
    if created:
        print("   ✅ Created Oran province")
    else:
        print("   ℹ️ Oran province already exists")
    
    print("\n🎉 Database cleanup completed successfully!")
    print(f"📊 Current state:")
    print(f"   - Provinces: {Province.objects.count()}")
    print(f"   - Districts: {District.objects.count()}")
    print(f"   - Municipalities: {Municipality.objects.count()}")
    print(f"   - Places: {Place.objects.count()}")
    print(f"   - Place Categories: {PlaceCategory.objects.count()}")
    print(f"   - Place Images: {PlaceImage.objects.count()}")
    print(f"   - Knowledge Base: {KnowledgeBase.objects.count()}")
    print(f"   - Trip Plans: {TripPlan.objects.count()}")

if __name__ == '__main__':
    try:
        cleanup_database()
    except Exception as e:
        print(f"❌ Error during cleanup: {str(e)}")
        sys.exit(1)