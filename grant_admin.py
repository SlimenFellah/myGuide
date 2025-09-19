#!/usr/bin/env python3
"""
Script to grant admin privileges to a user in the database
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

def grant_admin_privileges(user_id):
    """
    Grant admin privileges to a user
    """
    try:
        user = User.objects.get(id=user_id)
        print(f"Found user: {user.username} ({user.email})")
        print(f"Current status - is_staff: {user.is_staff}, is_superuser: {user.is_superuser}, is_admin: {user.is_admin}")
        
        # Grant admin privileges
        user.is_staff = True
        user.is_superuser = True
        user.is_admin = True
        user.save()
        
        print(f"\n✅ Admin privileges granted successfully!")
        print(f"Updated status - is_staff: {user.is_staff}, is_superuser: {user.is_superuser}, is_admin: {user.is_admin}")
        
        return True
        
    except User.DoesNotExist:
        print(f"❌ User with ID {user_id} not found")
        return False
    except Exception as e:
        print(f"❌ Error granting admin privileges: {e}")
        return False

if __name__ == "__main__":
    # Grant admin privileges to user ID 5
    user_id = 5
    print(f"Granting admin privileges to user ID {user_id}...")
    print("-" * 50)
    
    success = grant_admin_privileges(user_id)
    
    if success:
        print("\n🎉 User is now an admin and can access the admin dashboard!")
    else:
        print("\n💥 Failed to grant admin privileges")