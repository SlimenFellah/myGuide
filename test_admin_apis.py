#!/usr/bin/env python3
"""
Test script to verify admin API endpoints are working
"""

import requests
import json

def get_admin_token():
    """Login as admin and get JWT token"""
    login_url = "http://127.0.0.1:8000/api/auth/login/"
    login_data = {
        "email": "admin@gmail.com",
        "password": "AdminPassword123!"
    }
    
    try:
        response = requests.post(login_url, json=login_data)
        if response.status_code == 200:
            data = response.json()
            return data.get('access')
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def test_admin_endpoints(token):
    """Test various admin endpoints"""
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    endpoints = [
        # Authentication admin endpoints
        {
            'name': 'Admin Users List',
            'url': 'http://127.0.0.1:8000/api/auth/admin/users/',
            'method': 'GET'
        },
        # Tourism admin endpoints
        {
            'name': 'Place Statistics',
            'url': 'http://127.0.0.1:8000/api/tourism/admin/stats/places/',
            'method': 'GET'
        },
        {
            'name': 'Province Statistics',
            'url': 'http://127.0.0.1:8000/api/tourism/admin/stats/provinces/',
            'method': 'GET'
        },
        # Chatbot admin endpoints
        {
            'name': 'Chat Statistics',
            'url': 'http://127.0.0.1:8000/api/chatbot/statistics/chat/',
            'method': 'GET'
        },
        {
            'name': 'Knowledge Base Statistics',
            'url': 'http://127.0.0.1:8000/api/chatbot/statistics/knowledge-base/',
            'method': 'GET'
        },
        {
            'name': 'Admin Chat Sessions',
            'url': 'http://127.0.0.1:8000/api/chatbot/admin/sessions/',
            'method': 'GET'
        }
    ]
    
    results = []
    
    for endpoint in endpoints:
        try:
            if endpoint['method'] == 'GET':
                response = requests.get(endpoint['url'], headers=headers)
            elif endpoint['method'] == 'POST':
                response = requests.post(endpoint['url'], headers=headers, json={})
            
            status = "✅ Working" if response.status_code in [200, 201] else f"❌ Failed ({response.status_code})"
            
            result = {
                'name': endpoint['name'],
                'url': endpoint['url'],
                'status_code': response.status_code,
                'status': status,
                'response_preview': response.text[:200] + '...' if len(response.text) > 200 else response.text
            }
            
            results.append(result)
            print(f"{status} - {endpoint['name']}")
            
            if response.status_code not in [200, 201]:
                print(f"   Error: {response.text[:100]}...")
                
        except Exception as e:
            result = {
                'name': endpoint['name'],
                'url': endpoint['url'],
                'status_code': 'ERROR',
                'status': f"❌ Exception: {str(e)}",
                'response_preview': str(e)
            }
            results.append(result)
            print(f"❌ Exception - {endpoint['name']}: {e}")
    
    return results

def main():
    print("🔐 Testing Admin API Endpoints")
    print("=" * 50)
    
    # Step 1: Login as admin
    print("\n1. Logging in as admin...")
    token = get_admin_token()
    
    if not token:
        print("❌ Cannot proceed without admin token")
        return
    
    print("✅ Admin login successful")
    
    # Step 2: Test admin endpoints
    print("\n2. Testing admin endpoints...")
    results = test_admin_endpoints(token)
    
    # Step 3: Summary
    print("\n" + "=" * 50)
    print("📊 SUMMARY")
    print("=" * 50)
    
    working_count = sum(1 for r in results if r['status_code'] in [200, 201])
    total_count = len(results)
    
    print(f"Working endpoints: {working_count}/{total_count}")
    
    if working_count == total_count:
        print("🎉 All admin endpoints are working correctly!")
    else:
        print("⚠️  Some admin endpoints need attention:")
        for result in results:
            if result['status_code'] not in [200, 201]:
                print(f"   - {result['name']}: {result['status']}")

if __name__ == "__main__":
    main()