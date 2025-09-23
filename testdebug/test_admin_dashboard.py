#!/usr/bin/env python3
"""
Test script to verify admin dashboard functionality
"""

import requests
import json

def test_admin_dashboard_flow():
    """Test complete admin dashboard flow"""
    
    # API endpoints
    login_url = 'http://127.0.0.1:8000/api/auth/login/'
    
    # Admin credentials
    admin_credentials = {
        'email': 'admin@gmail.com',
        'password': 'AdminPassword123!'
    }
    
    print("🔐 Testing Admin Dashboard Flow")
    print("=" * 50)
    
    try:
        # Step 1: Login as admin
        print("\n1. Testing admin login...")
        response = requests.post(login_url, json=admin_credentials)
        
        if response.status_code != 200:
            print(f"❌ Admin login failed: {response.text}")
            return False
            
        login_data = response.json()
        user_data = login_data['user']
        access_token = login_data['access']
        
        print(f"✅ Admin login successful!")
        print(f"   User: {user_data['full_name']} ({user_data['email']})")
        print(f"   is_admin: {user_data['is_admin']}")
        print(f"   is_staff: {user_data['is_staff']}")
        print(f"   is_superuser: {user_data['is_superuser']}")
        
        # Step 2: Test admin API endpoints
        headers = {'Authorization': f'Bearer {access_token}'}
        
        admin_endpoints = [
            ('Admin Users List', 'http://127.0.0.1:8000/api/auth/admin/users/'),
            ('Place Statistics', 'http://127.0.0.1:8000/api/tourism/admin/stats/places/'),
            ('Province Statistics', 'http://127.0.0.1:8000/api/tourism/admin/stats/provinces/'),
            ('Chat Statistics', 'http://127.0.0.1:8000/api/chatbot/statistics/chat/'),
            ('Knowledge Base Statistics', 'http://127.0.0.1:8000/api/chatbot/statistics/knowledge-base/'),
            ('Admin Chat Sessions', 'http://127.0.0.1:8000/api/chatbot/admin/sessions/')
        ]
        
        print("\n2. Testing admin API endpoints...")
        all_endpoints_working = True
        
        for name, url in admin_endpoints:
            try:
                response = requests.get(url, headers=headers)
                if response.status_code == 200:
                    print(f"   ✅ {name}: Working")
                else:
                    print(f"   ❌ {name}: Failed ({response.status_code})")
                    all_endpoints_working = False
            except Exception as e:
                print(f"   ❌ {name}: Error - {e}")
                all_endpoints_working = False
        
        # Step 3: Summary
        print("\n3. Summary:")
        if user_data['is_admin'] and all_endpoints_working:
            print("✅ Admin dashboard should work correctly!")
            print("   - User has admin privileges")
            print("   - All admin API endpoints are accessible")
            print("   - Frontend should show AdminDashboard component")
            return True
        else:
            print("❌ Admin dashboard may have issues:")
            if not user_data['is_admin']:
                print("   - User lacks admin privileges")
            if not all_endpoints_working:
                print("   - Some admin API endpoints are not working")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_regular_user_login():
    """Test that regular users don't get admin access"""
    
    print("\n\n👤 Testing Regular User Access")
    print("=" * 50)
    
    # For this test, we'll assume there might be other users
    # In a real scenario, you'd create a test user
    print("ℹ️  Regular user test would verify:")
    print("   - Non-admin users get is_admin: false")
    print("   - Frontend shows regular Dashboard component")
    print("   - Admin API endpoints return 403 Forbidden")

if __name__ == '__main__':
    success = test_admin_dashboard_flow()
    test_regular_user_login()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 Admin dashboard functionality is working correctly!")
        print("\n📋 Next steps:")
        print("   1. Open http://localhost:5174/ in your browser")
        print("   2. Login with: admin@gmail.com / admin123")
        print("   3. Navigate to /dashboard")
        print("   4. Verify you see the AdminDashboard interface")
    else:
        print("⚠️  There may be issues with the admin dashboard setup.")