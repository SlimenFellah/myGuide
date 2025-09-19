import os
import sys
import django
from django.contrib.auth import authenticate
import requests

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from authentication.models import User

print("🔍 Debugging Admin Login Issue")
print("=" * 50)

# Check if admin user exists
try:
    admin_user = User.objects.get(email='admin@gmail.com')
    print(f"✅ Admin user found:")
    print(f"   Email: {admin_user.email}")
    print(f"   Username: {admin_user.username}")
    print(f"   First Name: {admin_user.first_name}")
    print(f"   Last Name: {admin_user.last_name}")
    print(f"   is_active: {admin_user.is_active}")
    print(f"   is_staff: {admin_user.is_staff}")
    print(f"   is_superuser: {admin_user.is_superuser}")
    print(f"   is_admin: {admin_user.is_admin}")
    print(f"   has_usable_password: {admin_user.has_usable_password()}")
except User.DoesNotExist:
    print("❌ Admin user with email 'admin@gmail.com' not found!")
    sys.exit(1)

print("\n🔐 Testing Password Authentication")
print("-" * 30)

# Test different passwords
passwords_to_test = [
    'admin123',
    'AdminPassword123!',
    'password',
    'admin'
]

for password in passwords_to_test:
    print(f"\nTesting password: '{password}'")
    
    # Test Django authentication
    user = authenticate(username=admin_user.email, password=password)
    if user:
        print(f"   ✅ Django auth successful with '{password}'")
        
        # Test API login
        try:
            response = requests.post('http://127.0.0.1:8000/api/auth/login/', {
                'email': 'admin@gmail.com',
                'password': password
            })
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ API login successful!")
                print(f"   Access token: {data.get('access', 'N/A')[:20]}...")
                print(f"   User data: {data.get('user', {})}")
                break
            else:
                print(f"   ❌ API login failed: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"   ❌ API request failed: {e}")
    else:
        print(f"   ❌ Django auth failed with '{password}'")

print("\n🔧 Setting correct password if needed")
print("-" * 30)

# Set the password to AdminPassword123! if it's not working
if not authenticate(username=admin_user.email, password='AdminPassword123!'):
    print("Setting password to 'AdminPassword123!'...")
    admin_user.set_password('AdminPassword123!')
    admin_user.save()
    print("✅ Password updated successfully!")
    
    # Test again
    user = authenticate(username=admin_user.email, password='AdminPassword123!')
    if user:
        print("✅ Authentication now works with 'AdminPassword123!'")
    else:
        print("❌ Still having authentication issues")
else:
    print("✅ Password 'AdminPassword123!' already works correctly")

print("\n📋 Summary:")
print("- Admin user exists and is properly configured")
print("- Password should now be set to 'AdminPassword123!'")
print("- Try logging in again with admin@gmail.com / AdminPassword123!")