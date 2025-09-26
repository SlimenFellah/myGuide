#!/usr/bin/env python
"""
Script to test all tourism API endpoints to ensure they work with new data.
This script will make HTTP requests to all API endpoints and verify responses.
"""

import os
import sys
import django
import requests
import json
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from tourism.models import Province, Place, PlaceCategory
from django.contrib.auth.models import User

def test_api_endpoints():
    """Test all tourism API endpoints to ensure they work with new data."""
    
    print("🌐 Starting API endpoints test...")
    print("=" * 60)
    
    # Base URL for API
    base_url = "http://localhost:8000/api"
    
    # Test results
    test_results = {
        'passed': 0,
        'failed': 0,
        'errors': []
    }
    
    def make_request(endpoint, method='GET', data=None):
        """Make HTTP request and return response."""
        try:
            url = f"{base_url}{endpoint}"
            if method == 'GET':
                response = requests.get(url, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, timeout=10)
            
            return response
        except requests.exceptions.RequestException as e:
            return None
    
    def test_endpoint(name, endpoint, expected_status=200, method='GET', data=None):
        """Test a single endpoint."""
        print(f"\n🔍 Testing {name}:")
        print(f"   Endpoint: {method} {endpoint}")
        
        response = make_request(endpoint, method, data)
        
        if response is None:
            print(f"   ❌ Connection failed")
            test_results['failed'] += 1
            test_results['errors'].append(f"{name}: Connection failed")
            return False
        
        if response.status_code == expected_status:
            print(f"   ✅ Status: {response.status_code}")
            
            # Try to parse JSON response
            try:
                json_data = response.json()
                if isinstance(json_data, dict):
                    if 'results' in json_data:
                        print(f"   📊 Results count: {len(json_data['results'])}")
                    elif 'count' in json_data:
                        print(f"   📊 Total count: {json_data['count']}")
                elif isinstance(json_data, list):
                    print(f"   📊 Items count: {len(json_data)}")
                
                test_results['passed'] += 1
                return True
            except json.JSONDecodeError:
                print(f"   ⚠️ Non-JSON response")
                test_results['passed'] += 1
                return True
        else:
            print(f"   ❌ Status: {response.status_code} (expected {expected_status})")
            test_results['failed'] += 1
            test_results['errors'].append(f"{name}: Status {response.status_code}")
            return False
    
    # Test 1: Provinces endpoint
    test_endpoint("Provinces List", "/tourism/provinces/")
    
    # Test 2: Districts endpoint
    test_endpoint("Districts List", "/tourism/districts/")
    
    # Test 3: Municipalities endpoint
    test_endpoint("Municipalities List", "/tourism/municipalities/")
    
    # Test 4: Place Categories endpoint
    test_endpoint("Place Categories List", "/tourism/place-categories/")
    
    # Test 5: Places endpoint
    test_endpoint("Places List", "/tourism/places/")
    
    # Test 6: Places with filters
    test_endpoint("Places by Province (Algiers)", "/tourism/places/?province=1")
    test_endpoint("Places by Province (Oran)", "/tourism/places/?province=2")
    
    # Test 7: Individual place details
    places = Place.objects.all()[:3]  # Test first 3 places
    for place in places:
        test_endpoint(f"Place Detail ({place.name})", f"/tourism/places/{place.id}/")
    
    # Test 8: Place images endpoint
    if places:
        test_endpoint("Place Images", f"/tourism/places/{places[0].id}/images/")
    
    # Test 9: Search endpoint
    test_endpoint("Search Places", "/tourism/places/search/?q=alger")
    
    # Test 10: Trip generation endpoint (if exists)
    test_endpoint("Trip Generation", "/tourism/generate-trip/", method='POST', data={
        'province': 1,
        'duration': 2,
        'interests': ['cultural', 'historical']
    })
    
    # Test 11: Statistics endpoint (if exists)
    test_endpoint("Statistics", "/tourism/statistics/")
    
    print("\n" + "=" * 60)
    print("🎯 API ENDPOINTS TEST SUMMARY:")
    print("=" * 60)
    
    total_tests = test_results['passed'] + test_results['failed']
    success_rate = (test_results['passed'] / total_tests * 100) if total_tests > 0 else 0
    
    print(f"   📊 Total tests: {total_tests}")
    print(f"   ✅ Passed: {test_results['passed']}")
    print(f"   ❌ Failed: {test_results['failed']}")
    print(f"   📈 Success rate: {success_rate:.1f}%")
    
    if test_results['errors']:
        print(f"\n❌ ERRORS FOUND:")
        for error in test_results['errors']:
            print(f"   - {error}")
    
    print("\n" + "=" * 60)
    
    if test_results['failed'] == 0:
        print("🎉 ALL API ENDPOINTS TEST PASSED!")
        print("   All endpoints are working correctly with the new data.")
        return True
    else:
        print(f"⚠️ API ENDPOINTS TEST COMPLETED WITH ISSUES!")
        print(f"   {test_results['failed']} endpoints need attention.")
        return False

def start_server_if_needed():
    """Check if server is running, if not provide instructions."""
    try:
        response = requests.get("http://localhost:8000/api/tourism/provinces/", timeout=5)
        return True
    except requests.exceptions.RequestException:
        print("⚠️ Django development server is not running!")
        print("   Please start the server with: python manage.py runserver")
        print("   Then run this test again.")
        return False

if __name__ == "__main__":
    if start_server_if_needed():
        success = test_api_endpoints()
        sys.exit(0 if success else 1)
    else:
        sys.exit(1)