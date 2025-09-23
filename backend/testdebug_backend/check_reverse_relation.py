#!/usr/bin/env python

import os
import sys
from pathlib import Path

def setup_django():
    backend_path = Path(__file__).resolve().parent
    sys.path.append(str(backend_path))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
    import django
    django.setup()

def check_reverse_relations():
    from tourism.models import PlaceCategory, Place
    
    print("PlaceCategory reverse relations:")
    for field in PlaceCategory._meta.get_fields():
        print(f"  {field.name}: {field}")
    
    print("\nTesting reverse lookup:")
    cat = PlaceCategory.objects.first()
    if cat:
        print(f"Category: {cat.name}")
        
        # Test different possible reverse relation names
        test_names = ['place_set', 'places', 'place']
        for name in test_names:
            try:
                result = getattr(cat, name)
                print(f"  {name}: SUCCESS - {result}")
                if hasattr(result, 'count'):
                    print(f"    Count: {result.count()}")
            except AttributeError as e:
                print(f"  {name}: FAILED - {e}")
    
    print("\nPlace model category field info:")
    category_field = Place._meta.get_field('category')
    print(f"  Field: {category_field}")
    print(f"  Related name: {getattr(category_field, 'related_name', 'Not set (uses default)')}")
    print(f"  Related query name: {category_field.related_query_name()}")

if __name__ == '__main__':
    setup_django()
    check_reverse_relations()