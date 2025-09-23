#!/usr/bin/env python
import os
import sys
import django
import requests

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from authentication.models import User
from rest_framework_simplejwt.tokens import RefreshToken

def test_feedback_api():
    try:
        # Get admin user and token
        admin_user = User.objects.get(username='admin')
        token = RefreshToken.for_user(admin_user).access_token
        
        print(f"Admin user found: {admin_user.username}")
        print(f"Token generated successfully")
        
        # Test the feedback API endpoint
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        response = requests.get('http://127.0.0.1:8000/api/tourism/feedbacks/', headers=headers)
        
        print(f"\nAPI Response Status: {response.status_code}")
        print(f"API Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\nResponse Data: {data}")
            if 'results' in data:
                print(f"Number of feedbacks: {len(data['results'])}")
                for i, feedback in enumerate(data['results'][:3]):  # Show first 3
                    print(f"Feedback {i+1}: {feedback}")
            else:
                print("No 'results' key in response")
        else:
            print(f"Error response: {response.text}")
            
    except User.DoesNotExist:
        print("Admin user not found")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_feedback_api()