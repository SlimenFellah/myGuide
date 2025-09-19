#!/usr/bin/env python3
"""
Test script to verify user registration functionality
"""

import requests
import json

def test_registration():
    url = "http://127.0.0.1:8000/api/auth/register/"
    
    # Test data matching what the user provided (with stronger password)
    data = {
        "name": "admin",
        "email": "admin@gmail.com", 
        "password": "AdminPassword123!",
        "password_confirm": "AdminPassword123!"
    }
    
    print("Testing user registration...")
    print(f"URL: {url}")
    print(f"Data: {json.dumps(data, indent=2)}")
    print("-" * 50)
    
    # Also test with the original weak password to show the difference
    print("\n=== Testing with original weak password ===\n")
    weak_data = data.copy()
    weak_data["password"] = "Admin123"
    weak_data["password_confirm"] = "Admin123"
    weak_data["email"] = "admin_weak@gmail.com"  # Different email to avoid conflicts
    
    try:
        weak_response = requests.post(url, json=weak_data)
        print(f"Weak password test - Status: {weak_response.status_code}")
        if weak_response.status_code != 201:
            print(f"Expected error: {weak_response.json()}")
    except Exception as e:
        print(f"Weak password test error: {e}")
    
    print("\n=== Testing with strong password ===\n")
    
    try:
        response = requests.post(url, json=data)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 201:
            print("\n✅ Registration successful!")
            return True
        else:
            print(f"\n❌ Registration failed with status {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error details: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Raw error response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the server. Make sure Django is running on http://127.0.0.1:8000/")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    test_registration()