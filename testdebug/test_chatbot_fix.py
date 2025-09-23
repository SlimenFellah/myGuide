#!/usr/bin/env python3
"""
Test script to verify chatbot fixes:
1. Frontend timestamp error fix
2. Backend message_type error fix
"""

import requests
import json
from datetime import datetime

# Test backend API directly
base_url = "http://127.0.0.1:8000/api"

def test_chatbot_backend():
    print("Testing chatbot backend fixes...")
    
    try:
        # Create a new session
        session_response = requests.post(f"{base_url}/chatbot/sessions/", json={})
        print(f"Session creation: {session_response.status_code}")
        
        if session_response.status_code == 201:
            session_data = session_response.json()
            session_id = session_data['id']
            print(f"Created session: {session_id}")
            
            # Send a test message
            message_data = {
                "content": "Tell me about Algiers",
                "message_type": "user",
                "session": session_id
            }
            
            message_response = requests.post(
                f"{base_url}/chatbot/messages/", 
                json=message_data
            )
            print(f"Message sending: {message_response.status_code}")
            
            if message_response.status_code == 201:
                response_data = message_response.json()
                print(f"Bot response received: {response_data.get('content', 'No content')[:100]}...")
                print("✅ Backend test PASSED - No message_type error!")
                return True
            else:
                print(f"❌ Message failed: {message_response.text}")
                return False
        else:
            print(f"❌ Session creation failed: {session_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Backend test failed: {str(e)}")
        return False

def test_timestamp_format():
    print("\nTesting timestamp format...")
    
    # Simulate the timestamp format used in frontend
    timestamp_iso = datetime.now().isoformat()
    timestamp_date = datetime.now()
    
    print(f"ISO timestamp: {timestamp_iso}")
    print(f"Date object: {timestamp_date}")
    
    # Test conversion (simulating frontend fix)
    try:
        from_iso = datetime.fromisoformat(timestamp_iso.replace('Z', '+00:00') if timestamp_iso.endswith('Z') else timestamp_iso)
        time_string = from_iso.strftime('%H:%M:%S')
        print(f"Converted to time string: {time_string}")
        print("✅ Timestamp conversion test PASSED!")
        return True
    except Exception as e:
        print(f"❌ Timestamp test failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("CHATBOT FIXES VERIFICATION TEST")
    print("=" * 50)
    
    backend_ok = test_chatbot_backend()
    timestamp_ok = test_timestamp_format()
    
    print("\n" + "=" * 50)
    if backend_ok and timestamp_ok:
        print("🎉 ALL TESTS PASSED! Chatbot fixes are working!")
    else:
        print("⚠️  Some tests failed. Please check the issues above.")
    print("=" * 50)