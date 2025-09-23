#!/usr/bin/env python3

import requests
import json

def test_admin_login():
    """Test admin user login and check user data structure"""
    
    # API endpoint
    login_url = 'http://127.0.0.1:8000/api/auth/login/'
    
    # Admin credentials
    admin_credentials = {
        'email': 'admin@gmail.com',
        'password': 'admin123'
    }
    
    try:
        print("Testing admin login...")
        response = requests.post(login_url, json=admin_credentials)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\nLogin successful!")
            print("\nUser data structure:")
            print(json.dumps(data['user'], indent=2))
            
            # Check if is_admin field is present and true
            user_data = data['user']
            if 'is_admin' in user_data:
                print(f"\nis_admin field: {user_data['is_admin']}")
                if user_data['is_admin']:
                    print("✅ Admin user detected correctly!")
                else:
                    print("❌ is_admin is False - user is not admin")
            else:
                print("❌ is_admin field is missing from user data")
                
        else:
            print(f"❌ Login failed: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    test_admin_login()