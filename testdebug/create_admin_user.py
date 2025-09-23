#!/usr/bin/env python3
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from authentication.models import User

def create_or_update_admin():
    """Create or update admin user with correct credentials"""
    try:
        # Try to find existing admin user
        try:
            user = User.objects.get(email="admin@gmail.com")
            print(f"Found existing user: {user.email}")
        except User.DoesNotExist:
            # Create new admin user
            user = User.objects.create_user(
                email="admin@gmail.com",
                username="admin",
                full_name="Admin User",
                password="AdminPassword123!"
            )
            print("Created new admin user")
        
        # Set admin privileges
        user.is_staff = True
        user.is_superuser = True
        user.is_admin = True
        user.is_active = True
        user.set_password("AdminPassword123!")  # Ensure password is set correctly
        user.save()
        
        print(f"✅ Admin user ready:")
        print(f"   Email: {user.email}")
        print(f"   Username: {user.username}")
        print(f"   Password: AdminPassword123!")
        print(f"   Is Staff: {user.is_staff}")
        print(f"   Is Superuser: {user.is_superuser}")
        print(f"   Is Admin: {user.is_admin}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Creating/Updating Admin User")
    print("=" * 40)
    create_or_update_admin()