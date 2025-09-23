#!/usr/bin/env python
"""
Test script for spam detection functionality
Author: Slimene Fellah
"""

import os
import sys
import django
from django.conf import settings

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myGuide.settings')
django.setup()

from tourism.models import Place, Feedback, User
from tourism.spam_detection import SpamDetectionService
from django.contrib.auth import get_user_model

def test_spam_detection():
    """Test the spam detection service"""
    print("🔍 Testing Spam Detection Service...")
    
    # Initialize spam detection service
    spam_service = SpamDetectionService()
    
    # Test cases
    test_comments = [
        "This place is amazing! Great food and service.",  # Normal comment
        "BUY NOW!!! CLICK HERE FOR AMAZING DEALS!!!",     # Spam comment
        "Visit my website www.spam-site.com for deals",    # Spam with URL
        "Beautiful location, highly recommend visiting",    # Normal comment
        "FREE MONEY!!! CALL NOW 123-456-7890",           # Spam with phone
        "The view was breathtaking and staff was friendly", # Normal comment
    ]
    
    print("\n📝 Testing individual comments:")
    for i, comment in enumerate(test_comments, 1):
        is_spam, confidence, reasons = spam_service.detect_spam(comment)
        status = "🚨 SPAM" if is_spam else "✅ CLEAN"
        print(f"{i}. {status} ({confidence:.2f}) - {comment[:50]}...")
        if reasons:
            print(f"   Reasons: {', '.join(reasons)}")
        print()
    
    print("\n🎯 Testing with actual feedback creation...")
    
    # Get or create a test user
    User = get_user_model()
    test_user, created = User.objects.get_or_create(
        username='test_spam_user',
        defaults={
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User'
        }
    )
    
    # Get a test place (assuming at least one exists)
    test_place = Place.objects.first()
    if not test_place:
        print("❌ No places found in database. Please add a place first.")
        return
    
    # Create test feedbacks
    test_feedbacks = [
        {
            'comment': 'This place is wonderful! Great experience.',
            'rating': 5,
            'type': 'review'
        },
        {
            'comment': 'BUY NOW!!! AMAZING DEALS!!! CLICK HERE!!!',
            'rating': 1,
            'type': 'review'
        }
    ]
    
    for feedback_data in test_feedbacks:
        feedback = Feedback.objects.create(
            place=test_place,
            user=test_user,
            comment=feedback_data['comment'],
            rating=feedback_data['rating'],
            type=feedback_data['type']
        )
        
        status = "🚨 SPAM" if feedback.is_spam else "✅ CLEAN"
        print(f"Created feedback #{feedback.id}: {status}")
        print(f"  Comment: {feedback.comment[:50]}...")
        print(f"  Spam confidence: {feedback.spam_confidence:.2f}")
        print(f"  Status: {feedback.status}")
        if feedback.spam_detected_at:
            print(f"  Detected at: {feedback.spam_detected_at}")
        print()
    
    print("✅ Spam detection test completed!")

if __name__ == '__main__':
    test_spam_detection()