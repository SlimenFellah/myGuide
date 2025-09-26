#!/usr/bin/env python
"""
Script to test database integrity and verify all data is correctly populated.
This script will check all models and relationships to ensure data consistency.
"""

import os
import sys
import django
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from tourism.models import Province, District, Municipality, Place, PlaceCategory, PlaceImage
from django.contrib.auth.models import User

def test_database_integrity():
    """Test database integrity and verify all data is correctly populated."""
    
    print("🔍 Starting database integrity test...")
    print("=" * 60)
    
    # Test 1: Check provinces
    print("\n1️⃣ Testing Provinces:")
    provinces = Province.objects.all()
    print(f"   Total provinces: {provinces.count()}")
    
    expected_provinces = ['Alger', 'Oran']
    for province_name in expected_provinces:
        try:
            province = Province.objects.get(name=province_name)
            print(f"   ✅ {province_name}: Found (ID: {province.id})")
        except Province.DoesNotExist:
            print(f"   ❌ {province_name}: Not found")
    
    # Test 2: Check districts
    print("\n2️⃣ Testing Districts:")
    districts = District.objects.all()
    print(f"   Total districts: {districts.count()}")
    
    for province in provinces:
        district_count = District.objects.filter(province=province).count()
        print(f"   📍 {province.name}: {district_count} districts")
        
        for district in District.objects.filter(province=province):
            print(f"      - {district.name}")
    
    # Test 3: Check municipalities
    print("\n3️⃣ Testing Municipalities:")
    municipalities = Municipality.objects.all()
    print(f"   Total municipalities: {municipalities.count()}")
    
    for province in provinces:
        municipality_count = Municipality.objects.filter(district__province=province).count()
        print(f"   🏘️ {province.name}: {municipality_count} municipalities")
    
    # Test 4: Check place categories
    print("\n4️⃣ Testing Place Categories:")
    categories = PlaceCategory.objects.all()
    print(f"   Total categories: {categories.count()}")
    
    for category in categories:
        place_count = Place.objects.filter(category=category).count()
        print(f"   🏷️ {category.name}: {place_count} places")
    
    # Test 5: Check places
    print("\n5️⃣ Testing Places:")
    places = Place.objects.all()
    print(f"   Total places: {places.count()}")
    
    for province in provinces:
        place_count = Place.objects.filter(municipality__district__province=province).count()
        print(f"   🏛️ {province.name}: {place_count} places")
        
        for place in Place.objects.filter(municipality__district__province=province):
            print(f"      - {place.name} ({place.municipality.name})")
    
    # Test 6: Check place images
    print("\n6️⃣ Testing Place Images:")
    place_images = PlaceImage.objects.all()
    print(f"   Total place images: {place_images.count()}")
    
    places_with_images = Place.objects.filter(images__isnull=False).distinct().count()
    places_without_images = places.count() - places_with_images
    
    print(f"   📸 Places with images: {places_with_images}")
    print(f"   📷 Places without images: {places_without_images}")
    
    # Test 7: Check data relationships
    print("\n7️⃣ Testing Data Relationships:")
    
    # Check if all places have valid municipalities
    orphaned_places = Place.objects.filter(municipality__isnull=True).count()
    print(f"   🔗 Places without municipality: {orphaned_places}")
    
    # Check if all municipalities have valid districts
    orphaned_municipalities = Municipality.objects.filter(district__isnull=True).count()
    print(f"   🔗 Municipalities without district: {orphaned_municipalities}")
    
    # Check if all districts have valid provinces
    orphaned_districts = District.objects.filter(province__isnull=True).count()
    print(f"   🔗 Districts without province: {orphaned_districts}")
    
    # Test 8: Check coordinate validity
    print("\n8️⃣ Testing Coordinate Validity:")
    
    invalid_coordinates = 0
    for place in places:
        if not (-90 <= float(place.latitude) <= 90) or not (-180 <= float(place.longitude) <= 180):
            print(f"   ❌ Invalid coordinates for {place.name}: ({place.latitude}, {place.longitude})")
            invalid_coordinates += 1
    
    if invalid_coordinates == 0:
        print(f"   ✅ All {places.count()} places have valid coordinates")
    else:
        print(f"   ❌ {invalid_coordinates} places have invalid coordinates")
    
    # Test 9: Check required fields
    print("\n9️⃣ Testing Required Fields:")
    
    places_without_description = Place.objects.filter(description__isnull=True).count()
    places_without_description += Place.objects.filter(description__exact='').count()
    print(f"   📝 Places without description: {places_without_description}")
    
    places_without_category = Place.objects.filter(category__isnull=True).count()
    print(f"   🏷️ Places without category: {places_without_category}")
    
    # Test 10: Summary
    print("\n🎯 INTEGRITY TEST SUMMARY:")
    print("=" * 60)
    
    total_issues = 0
    
    if provinces.count() != 2:
        print(f"   ❌ Expected 2 provinces, found {provinces.count()}")
        total_issues += 1
    else:
        print(f"   ✅ Provinces: {provinces.count()}/2")
    
    if districts.count() < 8:
        print(f"   ⚠️ Expected at least 8 districts, found {districts.count()}")
        total_issues += 1
    else:
        print(f"   ✅ Districts: {districts.count()}")
    
    if municipalities.count() < 28:
        print(f"   ⚠️ Expected at least 28 municipalities, found {municipalities.count()}")
        total_issues += 1
    else:
        print(f"   ✅ Municipalities: {municipalities.count()}")
    
    if places.count() != 17:
        print(f"   ❌ Expected 17 places, found {places.count()}")
        total_issues += 1
    else:
        print(f"   ✅ Places: {places.count()}/17")
    
    if places_with_images != places.count():
        print(f"   ❌ Not all places have images: {places_with_images}/{places.count()}")
        total_issues += 1
    else:
        print(f"   ✅ Place Images: All places have images")
    
    if orphaned_places > 0 or orphaned_municipalities > 0 or orphaned_districts > 0:
        print(f"   ❌ Orphaned records found")
        total_issues += 1
    else:
        print(f"   ✅ Data Relationships: All valid")
    
    if invalid_coordinates > 0:
        print(f"   ❌ Invalid coordinates found: {invalid_coordinates}")
        total_issues += 1
    else:
        print(f"   ✅ Coordinates: All valid")
    
    print("\n" + "=" * 60)
    
    if total_issues == 0:
        print("🎉 DATABASE INTEGRITY TEST PASSED!")
        print("   All data is correctly populated and consistent.")
        return True
    else:
        print(f"❌ DATABASE INTEGRITY TEST FAILED!")
        print(f"   Found {total_issues} issues that need attention.")
        return False

if __name__ == "__main__":
    success = test_database_integrity()
    sys.exit(0 if success else 1)