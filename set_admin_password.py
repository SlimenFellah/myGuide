#!/usr/bin/env python3
"""
Script to set admin user password
"""

import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from authentication.models import User

def set_admin_password():
    """
    Set password for admin user
    """
    try:
        # Find admin user by email
        user = User.objects.get(email='admin@gmail.com')
        print(f"Found admin user: {user.username} ({user.email})")
        print(f"Current admin status: is_admin={user.is_admin}, is_staff={user.is_staff}, is_superuser={user.is_superuser}")
        
        # Set password
        password = 'admin123'
        user.set_password(password)
        user.save()
        
        print(f"\n✅ Password set successfully for admin user!")
        print(f"Email: {user.email}")
        print(f"Password: {password}")
        
        return True
        
    except User.DoesNotExist:
        print(f"❌ Admin user with email 'admin@gmail.com' not found")
        return False
    except Exception as e:
        print(f"❌ Error setting password: {e}")
        return False

if __name__ == "__main__":
    print("Setting password for admin user...")
    print("-" * 50)
    set_admin_password()