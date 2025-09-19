#!/usr/bin/env python3
"""
Test script to demonstrate the password validation issue with the user's original password
"""

import requests
import json

def test_with_original_password():
    url = "http://127.0.0.1:8000/api/auth/register/"
    
    # Exact data the user was trying to use
    data = {
        "name": "admin",
        "email": "admin_test@gmail.com",  # Different email to avoid conflicts
        "password": "Admin123",
        "password_confirm": "Admin123"
    }
    
    print("Testing with user's original password: 'Admin123'")
    print(f"URL: {url}")
    print(f"Data: {json.dumps(data, indent=2)}")
    print("-" * 50)
    
    try:
        response = requests.post(url, json=data)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 400:
            print("\n❌ Registration failed as expected due to weak password")
            try:
                error_data = response.json()
                print(f"Error details: {json.dumps(error_data, indent=2)}")
                print("\n💡 Solution: Use a stronger password like 'AdminPassword123!' or 'MySecurePass2024!'")
            except:
                print(f"Raw error response: {response.text}")
        elif response.status_code == 201:
            print("\n✅ Registration successful!")
        else:
            print(f"\n❓ Unexpected status code: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the server. Make sure Django is running on http://127.0.0.1:8000/")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_with_original_password()