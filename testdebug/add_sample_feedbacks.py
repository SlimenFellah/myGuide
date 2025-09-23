#!/usr/bin/env python
"""
Script to add sample feedback data to the database
Author: Slimene Fellah
"""

import requests
import json
import random
from datetime import datetime, timedelta

# Configuration
API_BASE_URL = 'http://127.0.0.1:8000/api'
ADMIN_EMAIL = 'admin@gmail.com'
ADMIN_PASSWORD = 'AdminPassword123!'

# Sample feedback data
SAMPLE_FEEDBACKS = [
    {
        'rating': 5,
        'comment': 'Amazing place! The historical significance and beautiful architecture make it a must-visit destination. Highly recommended for anyone interested in Algerian culture and history.'
    },
    {
        'rating': 4,
        'comment': 'Great experience overall. The location is stunning and well-maintained. Could use better signage and information boards for tourists.'
    },
    {
        'rating': 5,
        'comment': 'Absolutely breathtaking! The views are incredible and the staff is very helpful. Perfect for photography and learning about local traditions.'
    },
    {
        'rating': 3,
        'comment': 'Nice place to visit but can get quite crowded during peak hours. The facilities are decent but could be improved. Still worth a visit.'
    },
    {
        'rating': 4,
        'comment': 'Beautiful location with rich history. The guided tour was informative and engaging. Would definitely come back with family and friends.'
    },
    {
        'rating': 5,
        'comment': 'Outstanding experience! The natural beauty combined with cultural heritage creates an unforgettable visit. Excellent for both locals and tourists.'
    },
    {
        'rating': 2,
        'comment': 'The place has potential but needs better maintenance. Some areas were not accessible and the information provided was limited. Hope to see improvements.'
    },
    {
        'rating': 4,
        'comment': 'Wonderful destination for a day trip. The scenery is beautiful and there are plenty of photo opportunities. Good facilities and friendly locals.'
    },
    {
        'rating': 5,
        'comment': 'Exceptional place that showcases the beauty of Algeria. The combination of nature and culture is perfect. Highly recommend for all age groups.'
    },
    {
        'rating': 3,
        'comment': 'Decent place to visit. The location is interesting but could benefit from better organization and clearer directions. Still enjoyable overall.'
    }
]

def get_auth_token():
    """Get authentication token for API requests"""
    login_url = f'{API_BASE_URL}/auth/login/'
    login_data = {
        'email': ADMIN_EMAIL,
        'password': ADMIN_PASSWORD
    }
    
    try:
        response = requests.post(login_url, json=login_data)
        response.raise_for_status()
        return response.json()['access']
    except requests.exceptions.RequestException as e:
        print(f"Error getting auth token: {e}")
        return None

def get_places(token):
    """Get list of places from the API"""
    places_url = f'{API_BASE_URL}/tourism/places/'
    headers = {'Authorization': f'Bearer {token}'}
    
    try:
        response = requests.get(places_url, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data.get('results', data) if isinstance(data, dict) else data
    except requests.exceptions.RequestException as e:
        print(f"Error getting places: {e}")
        return []

def create_feedback(token, place_id, feedback_data):
    """Create feedback for a specific place"""
    feedback_url = f'{API_BASE_URL}/tourism/feedbacks/create/'
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # Add place ID to feedback data
    feedback_data['place'] = place_id
    
    try:
        response = requests.post(feedback_url, json=feedback_data, headers=headers)
        if response.status_code == 201:
            return True, response.json()
        else:
            return False, response.text
    except requests.exceptions.RequestException as e:
        return False, str(e)

def main():
    print("Starting to add sample feedback data...")
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("Failed to get authentication token. Please check your credentials.")
        return
    
    print("Authentication successful!")
    
    # Get places
    places = get_places(token)
    if not places:
        print("No places found or error fetching places.")
        return
    
    print(f"Found {len(places)} places. Adding sample feedbacks...")
    
    success_count = 0
    error_count = 0
    
    # Add feedbacks to random places
    for i, place in enumerate(places[:10]):  # Limit to first 10 places
        place_id = place.get('id')
        place_name = place.get('name', 'Unknown')
        
        # Select random feedback
        feedback = random.choice(SAMPLE_FEEDBACKS)
        
        print(f"Adding feedback to place: {place_name} (ID: {place_id})")
        
        success, result = create_feedback(token, place_id, feedback)
        
        if success:
            print(f"  [SUCCESS] Feedback added successfully")
            success_count += 1
        else:
            print(f"  [ERROR] Failed to add feedback: {result}")
            error_count += 1
    
    print(f"\nCompleted! Successfully added {success_count} feedbacks with {error_count} errors.")
    
    if error_count > 0:
        print("\nNote: Some errors might be due to duplicate feedbacks (one feedback per user per place).")
        print("This is normal if you've run this script before.")

if __name__ == '__main__':
    main()