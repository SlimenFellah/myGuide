#!/usr/bin/env python
"""
Script to check if feedbacks were added to the database
"""

import requests

# Configuration
API_BASE_URL = 'http://127.0.0.1:8000/api'
ADMIN_EMAIL = 'admin@gmail.com'
ADMIN_PASSWORD = 'AdminPassword123!'

def get_auth_token():
    """Get authentication token"""
    login_url = f'{API_BASE_URL}/auth/login/'
    login_data = {
        'email': ADMIN_EMAIL,
        'password': ADMIN_PASSWORD
    }
    
    try:
        response = requests.post(login_url, json=login_data)
        if response.status_code == 200:
            return response.json()['access']
        else:
            print(f"Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def check_feedbacks(token):
    """Check feedbacks for places"""
    # Get places first
    places_url = f'{API_BASE_URL}/tourism/places/'
    headers = {'Authorization': f'Bearer {token}'}
    
    try:
        response = requests.get(places_url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            places = data.get('results', data) if isinstance(data, dict) else data
            
            print(f"Checking feedbacks for {len(places)} places...")
            print("=" * 50)
            
            total_feedbacks = 0
            
            for place in places[:5]:  # Check first 5 places
                place_id = place.get('id')
                place_name = place.get('name', 'Unknown')
                
                # Get feedbacks for this place
                feedbacks_url = f'{API_BASE_URL}/tourism/places/{place_id}/feedbacks/'
                feedback_response = requests.get(feedbacks_url, headers=headers)
                
                if feedback_response.status_code == 200:
                    feedbacks_data = feedback_response.json()
                    feedbacks = feedbacks_data.get('results', feedbacks_data) if isinstance(feedbacks_data, dict) else feedbacks_data
                    feedback_count = len(feedbacks) if isinstance(feedbacks, list) else 0
                    total_feedbacks += feedback_count
                    
                    print(f"{place_name} (ID: {place_id}): {feedback_count} feedbacks")
                    
                    if feedback_count > 0 and isinstance(feedbacks, list):
                        for feedback in feedbacks[:2]:  # Show first 2 feedbacks
                            rating = feedback.get('rating', 'N/A')
                            comment = feedback.get('comment', 'No comment')[:50] + '...'
                            print(f"  - Rating: {rating}/5 - {comment}")
                else:
                    print(f"{place_name} (ID: {place_id}): Error getting feedbacks")
            
            print("=" * 50)
            print(f"Total feedbacks found: {total_feedbacks}")
            
        else:
            print(f"Failed to get places: {response.text}")
    except Exception as e:
        print(f"Error checking feedbacks: {e}")

def main():
    print("Checking feedback data in database...")
    
    token = get_auth_token()
    if not token:
        print("Cannot proceed without authentication")
        return
    
    check_feedbacks(token)

if __name__ == '__main__':
    main()