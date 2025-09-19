#!/usr/bin/env python3
import requests
import json

# Test place statistics endpoint directly
print("🔍 Testing Place Statistics Endpoint")
print("=" * 50)

# Login first
login_url = "http://127.0.0.1:8000/api/auth/login/"
login_data = {
    "email": "admin@gmail.com",
    "password": "AdminPassword123!"
}

try:
    login_response = requests.post(login_url, json=login_data)
    if login_response.status_code == 200:
        token = login_response.json().get('access')
        print("✅ Login successful")
        
        # Test place statistics
        headers = {'Authorization': f'Bearer {token}'}
        stats_url = "http://127.0.0.1:8000/api/tourism/admin/stats/places/"
        
        print(f"\n📊 Testing: {stats_url}")
        response = requests.get(stats_url, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Success!")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        else:
            print("❌ Failed")
            print(f"Response Text: {response.text[:500]}...")
            
    else:
        print(f"❌ Login failed: {login_response.status_code}")
        print(f"Response: {login_response.text}")
        
except Exception as e:
    print(f"❌ Error: {e}")