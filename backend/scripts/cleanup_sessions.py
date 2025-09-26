#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
django.setup()

from chatbot.models import ChatSession
from django.contrib.auth import get_user_model

User = get_user_model()

def cleanup_duplicate_sessions():
    """Clean up duplicate active sessions - keep only the most recent one for each user"""
    print("Starting session cleanup...")
    
    total_cleaned = 0
    for user in User.objects.all():
        active_sessions = ChatSession.objects.filter(user=user, is_active=True).order_by('-updated_at')
        if active_sessions.count() > 1:
            print(f'User {user.email} has {active_sessions.count()} active sessions')
            # Keep the most recent session, deactivate the rest
            sessions_to_deactivate = active_sessions[1:]
            for session in sessions_to_deactivate:
                session.is_active = False
                session.save()
                print(f'Deactivated session {session.session_id}')
                total_cleaned += 1
    
    print(f'Cleanup completed. Deactivated {total_cleaned} duplicate sessions.')
    
    # Show current state
    print("\nCurrent active sessions:")
    for user in User.objects.all():
        active_count = ChatSession.objects.filter(user=user, is_active=True).count()
        if active_count > 0:
            print(f'User {user.email}: {active_count} active session(s)')

if __name__ == '__main__':
    cleanup_duplicate_sessions()