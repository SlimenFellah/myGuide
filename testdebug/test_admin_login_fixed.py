import requests
import json

print("🔐 Testing Admin Login with Updated Credentials")
print("=" * 50)

# Test admin login with the correct password
login_data = {
    'email': 'admin@gmail.com',
    'password': 'AdminPassword123!'
}

try:
    print(f"Attempting login with:")
    print(f"  Email: {login_data['email']}")
    print(f"  Password: {login_data['password']}")
    print()
    
    response = requests.post('http://127.0.0.1:8000/api/auth/login/', login_data)
    
    print(f"Response Status: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print()
    
    if response.status_code == 200:
        data = response.json()
        print("✅ LOGIN SUCCESSFUL!")
        print(f"Access Token: {data.get('access', 'N/A')[:50]}...")
        print(f"Refresh Token: {data.get('refresh', 'N/A')[:50]}...")
        print()
        print("User Data:")
        user_data = data.get('user', {})
        for key, value in user_data.items():
            print(f"  {key}: {value}")
        print()
        print(f"✅ is_admin: {user_data.get('is_admin')}")
        print(f"✅ is_staff: {user_data.get('is_staff')}")
        print(f"✅ is_superuser: {user_data.get('is_superuser')}")
        
    else:
        print("❌ LOGIN FAILED!")
        print(f"Error: {response.text}")
        
        # Try to parse error response
        try:
            error_data = response.json()
            print(f"Error Details: {json.dumps(error_data, indent=2)}")
        except:
            print("Could not parse error response as JSON")
            
except requests.exceptions.ConnectionError:
    print("❌ CONNECTION ERROR!")
    print("Make sure the backend server is running at http://127.0.0.1:8000/")
except Exception as e:
    print(f"❌ UNEXPECTED ERROR: {e}")

print("\n📋 Next Steps:")
print("1. If login is successful, try logging in through the frontend")
print("2. Use credentials: admin@gmail.com / AdminPassword123!")
print("3. Check that you see the Admin Dashboard after login")
print("4. If still having issues, check browser console for errors")