#!/usr/bin/env python
"""
Test feedback spam detection via API
Author: Slimene Fellah
"""

import requests
import json

def test_feedback_spam_detection():
    """Test spam detection through the feedback API"""
    
    base_url = "http://127.0.0.1:8000/api"
    
    # First, get an access token (you'll need to replace with actual credentials)
    print("🔐 Getting access token...")
    
    # Get places to test with
    print("📍 Getting places...")
    try:
        places_response = requests.get(f"{base_url}/tourism/places/")
        if places_response.status_code == 200:
            places = places_response.json()
            if places:
                test_place_id = places[0]['id']
                print(f"✅ Using place ID: {test_place_id}")
            else:
                print("❌ No places found")
                return
        else:
            print(f"❌ Failed to get places: {places_response.status_code}")
            return
    except Exception as e:
        print(f"❌ Error getting places: {e}")
        return
    
    # Test comments
    test_comments = [
        {
            "comment": "This place is amazing! Great food and beautiful views.",
            "rating": 5,
            "type": "review",
            "expected": "clean"
        },
        {
            "comment": "BUY NOW!!! CLICK HERE FOR AMAZING DEALS!!! FREE MONEY!!!",
            "rating": 1,
            "type": "review", 
            "expected": "spam"
        },
        {
            "comment": "Visit my website www.spam-deals.com for incredible offers!",
            "rating": 1,
            "type": "review",
            "expected": "spam"
        }
    ]
    
    print("\n🧪 Testing feedback submissions...")
    
    for i, test_data in enumerate(test_comments, 1):
        print(f"\nTest {i}: {test_data['expected'].upper()} - {test_data['comment'][:50]}...")
        
        feedback_data = {
            "place": test_place_id,
            "comment": test_data["comment"],
            "rating": test_data["rating"],
            "type": test_data["type"]
        }
        
        try:
            response = requests.post(
                f"{base_url}/tourism/places/{test_place_id}/feedbacks/",
                json=feedback_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 201:
                result = response.json()
                is_spam = result.get('is_spam', False)
                spam_confidence = result.get('spam_confidence', 0)
                status = result.get('status', 'unknown')
                
                spam_status = "🚨 SPAM" if is_spam else "✅ CLEAN"
                print(f"  Result: {spam_status} (confidence: {spam_confidence:.2f})")
                print(f"  Status: {status}")
                print(f"  Feedback ID: {result.get('id')}")
                
                # Check if detection matches expectation
                expected_spam = test_data['expected'] == 'spam'
                if is_spam == expected_spam:
                    print("  ✅ Detection matches expectation")
                else:
                    print("  ❌ Detection doesn't match expectation")
                    
            else:
                print(f"  ❌ Failed to create feedback: {response.status_code}")
                print(f"  Response: {response.text}")
                
        except Exception as e:
            print(f"  ❌ Error: {e}")
    
    print("\n✅ Spam detection test completed!")

if __name__ == '__main__':
    test_feedback_spam_detection()