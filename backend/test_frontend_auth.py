#!/usr/bin/env python
import requests
import json

# Test authentication and feedback API
BASE_URL = 'http://127.0.0.1:8000'

def get_admin_token():
    """Get admin authentication token"""
    login_data = {
        "email": "admin@gmail.com",
        "password": "AdminPassword123!"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login/", json=login_data)
        if response.status_code == 200:
            tokens = response.json()
            return tokens.get('access')
        else:
            print(f"Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def test_feedback_api_with_token(token):
    """Test feedback API with valid token"""
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get(f"{BASE_URL}/api/tourism/feedbacks/", headers=headers)
        print(f"Feedback API Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Feedbacks found: {len(data.get('results', []))}")
            print(f"Total count: {data.get('count', 0)}")
            return True
        else:
            print(f"API Error: {response.text}")
            return False
    except Exception as e:
        print(f"API request error: {e}")
        return False

if __name__ == "__main__":
    print("🔐 Testing Frontend Authentication")
    print("=" * 40)
    
    # Get admin token
    token = get_admin_token()
    if token:
        print(f"✅ Token obtained: {token[:50]}...")
        
        # Test feedback API
        print("\n📊 Testing Feedback API")
        success = test_feedback_api_with_token(token)
        
        if success:
            print("\n🎉 Authentication and API working correctly!")
            print(f"\n📋 For frontend debugging, use this token:")
            print(f"localStorage.setItem('access_token', '{token}');")
        else:
            print("\n❌ API test failed")
    else:
        print("❌ Failed to get authentication token")