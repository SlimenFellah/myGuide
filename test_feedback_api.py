#!/usr/bin/env python
"""
Simple test script to verify feedback API
"""

import requests
import json

# Configuration
API_BASE_URL = 'http://127.0.0.1:8000/api'
ADMIN_EMAIL = 'admin@gmail.com'
ADMIN_PASSWORD = 'AdminPassword123!'

def test_login():
    """Test login functionality"""
    print("Testing login...")
    login_url = f'{API_BASE_URL}/auth/login/'
    login_data = {
        'email': ADMIN_EMAIL,
        'password': ADMIN_PASSWORD
    }
    
    try:
        response = requests.post(login_url, json=login_data)
        print(f"Login response status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Login successful!")
            return data['access']
        else:
            print(f"Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def test_places_api(token):
    """Test places API"""
    print("\nTesting places API...")
    places_url = f'{API_BASE_URL}/tourism/places/'
    headers = {'Authorization': f'Bearer {token}'}
    
    try:
        response = requests.get(places_url, headers=headers)
        print(f"Places API response status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            places = data.get('results', data) if isinstance(data, dict) else data
            print(f"Found {len(places)} places")
            if places:
                print(f"First place: {places[0].get('name', 'Unknown')} (ID: {places[0].get('id')})")
            return places
        else:
            print(f"Places API failed: {response.text}")
            return []
    except Exception as e:
        print(f"Places API error: {e}")
        return []

def test_feedback_api(token, place_id):
    """Test feedback API"""
    print(f"\nTesting feedback API for place {place_id}...")
    feedback_url = f'{API_BASE_URL}/tourism/feedbacks/create/'
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    feedback_data = {
        'place': place_id,
        'rating': 5,
        'comment': 'Test feedback from API script - Amazing place!'
    }
    
    try:
        response = requests.post(feedback_url, json=feedback_data, headers=headers)
        print(f"Feedback API response status: {response.status_code}")
        if response.status_code == 201:
            print("Feedback created successfully!")
            return True
        else:
            print(f"Feedback API failed: {response.text}")
            return False
    except Exception as e:
        print(f"Feedback API error: {e}")
        return False

def main():
    print("=== Testing Feedback API ===")
    
    # Test login
    token = test_login()
    if not token:
        print("Cannot proceed without authentication")
        return
    
    # Test places API
    places = test_places_api(token)
    if not places:
        print("Cannot proceed without places data")
        return
    
    # Test feedback API with first place
    place_id = places[0].get('id')
    if place_id:
        success = test_feedback_api(token, place_id)
        if success:
            print("\n✅ All tests passed! Feedback API is working.")
        else:
            print("\n❌ Feedback API test failed.")
    else:
        print("\n❌ No valid place ID found.")

if __name__ == '__main__':
    main()