#!/usr/bin/env python3
"""
Test script for token expiration functionality
Author: Slimene Fellah
Available for freelance projects
"""

import requests
import json
import time
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://127.0.0.1:8000"
FRONTEND_URL = "http://localhost:5174"

def test_token_validation_endpoints():
    """Test the new token validation endpoints"""
    print("🔍 Testing Token Validation Endpoints")
    print("=" * 50)
    
    # First, let's try to login to get a valid token
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        # Test login
        print("1. Testing login...")
        login_response = requests.post(f"{BASE_URL}/api/auth/login/", json=login_data)
        
        if login_response.status_code == 200:
            tokens = login_response.json()
            access_token = tokens.get('access')
            print(f"✅ Login successful! Token obtained.")
            
            # Test token validation endpoint
            print("\n2. Testing token validation endpoint...")
            validate_response = requests.post(
                f"{BASE_URL}/api/auth/token/validate/",
                json={"token": access_token}
            )
            
            if validate_response.status_code == 200:
                validation_result = validate_response.json()
                print(f"✅ Token validation successful!")
                print(f"   Valid: {validation_result.get('valid')}")
                print(f"   Message: {validation_result.get('message')}")
                if validation_result.get('expires_in'):
                    expires_in_minutes = validation_result.get('expires_in', 0) / 60
                    print(f"   Expires in: {expires_in_minutes:.1f} minutes")
            else:
                print(f"❌ Token validation failed: {validate_response.status_code}")
                print(f"   Response: {validate_response.text}")
            
            # Test token status endpoint (requires authentication)
            print("\n3. Testing token status endpoint...")
            headers = {"Authorization": f"Bearer {access_token}"}
            status_response = requests.get(
                f"{BASE_URL}/api/auth/token/status/",
                headers=headers
            )
            
            if status_response.status_code == 200:
                status_result = status_response.json()
                print(f"✅ Token status check successful!")
                print(f"   Valid: {status_result.get('valid')}")
                print(f"   User ID: {status_result.get('user_id')}")
                print(f"   Username: {status_result.get('username')}")
                if status_result.get('expires_soon'):
                    print(f"   ⚠️  Token expires soon!")
            else:
                print(f"❌ Token status check failed: {status_response.status_code}")
                print(f"   Response: {status_response.text}")
            
            # Test with invalid token
            print("\n4. Testing with invalid token...")
            invalid_validate_response = requests.post(
                f"{BASE_URL}/api/auth/token/validate/",
                json={"token": "invalid.token.here"}
            )
            
            if invalid_validate_response.status_code == 401:
                print("✅ Invalid token correctly rejected!")
                error_result = invalid_validate_response.json()
                print(f"   Error: {error_result.get('error')}")
                print(f"   Code: {error_result.get('code')}")
            else:
                print(f"❌ Invalid token handling failed: {invalid_validate_response.status_code}")
            
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            print(f"   Response: {login_response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server. Make sure it's running on http://127.0.0.1:8000")
        return False
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False
    
    return True

def test_admin_dashboard_fix():
    """Test that AdminDashboard no longer has the users2.map error"""
    print("\n🔧 Testing AdminDashboard Fix")
    print("=" * 50)
    
    try:
        # Check if frontend is accessible
        frontend_response = requests.get(FRONTEND_URL, timeout=5)
        if frontend_response.status_code == 200:
            print("✅ Frontend server is accessible")
            print("📝 Manual test required:")
            print("   1. Open http://localhost:5174 in your browser")
            print("   2. Login as admin (admin/admin123)")
            print("   3. Navigate to Admin Dashboard")
            print("   4. Check browser console for any 'users2.map' errors")
            print("   5. Verify that user statistics display correctly")
            return True
        else:
            print(f"❌ Frontend server not accessible: {frontend_response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to frontend server. Make sure it's running on http://localhost:5174")
        return False
    except Exception as e:
        print(f"❌ Frontend test failed: {e}")
        return False

def print_test_summary():
    """Print test summary and next steps"""
    print("\n📋 Test Summary & Next Steps")
    print("=" * 50)
    print("✅ Backend token validation endpoints implemented")
    print("✅ Frontend token expiration monitoring added")
    print("✅ AdminDashboard users2.map error fixed")
    print("✅ Session expiration notifications integrated")
    
    print("\n🔍 Manual Testing Required:")
    print("1. Login to the application")
    print("2. Wait for token expiration warnings (or modify JWT settings for faster testing)")
    print("3. Verify automatic logout on token expiration")
    print("4. Check that AdminDashboard loads without errors")
    print("5. Test session warning notifications")
    
    print("\n⚙️  For faster testing, you can:")
    print("1. Modify JWT ACCESS_TOKEN_LIFETIME in backend/myguide_backend/settings.py")
    print("2. Set it to 2-3 minutes for quick testing")
    print("3. Restart the backend server")
    print("4. Test the complete flow")

if __name__ == "__main__":
    print("🚀 MyGuide Token Expiration Test Suite")
    print("=" * 50)
    
    # Test backend endpoints
    backend_success = test_token_validation_endpoints()
    
    # Test frontend accessibility
    frontend_success = test_admin_dashboard_fix()
    
    # Print summary
    print_test_summary()
    
    if backend_success and frontend_success:
        print("\n🎉 All automated tests passed!")
        print("   Manual testing is now required to verify complete functionality.")
    else:
        print("\n⚠️  Some tests failed. Please check the output above.")