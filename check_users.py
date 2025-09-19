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

print("📋 Current Users in Database:")
print("=" * 50)

users = User.objects.all()
for user in users:
    print(f"ID: {user.id}")
    print(f"Username: {user.username}")
    print(f"Email: {user.email}")
    print(f"Full Name: {user.full_name}")
    print(f"Is Staff: {user.is_staff}")
    print(f"Is Superuser: {user.is_superuser}")
    print(f"Is Admin: {user.is_admin}")
    print(f"Is Active: {user.is_active}")
    print("-" * 30)

print(f"\nTotal users: {users.count()}")