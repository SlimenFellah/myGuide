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

def test_admin_stats():
    from tourism.views import place_statistics
    from django.test import RequestFactory
    from django.contrib.auth import get_user_model
    from rest_framework.test import force_authenticate
    
    User = get_user_model()
    
    # Create a mock request
    factory = RequestFactory()
    request = factory.get('/api/tourism/admin/stats/places/')
    
    # Create or get an admin user
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={'is_staff': True, 'is_superuser': True}
    )
    
    # Force authenticate the request
    force_authenticate(request, user=admin_user)
    
    try:
        # Test the view function directly
        response = place_statistics(request)
        print(f"Status Code: {response.status_code}")
        print(f"Response Data: {response.data}")
        return True
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    setup_django()
    test_admin_stats()