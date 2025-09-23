import requests
import json

# Test the API endpoint
url = 'http://localhost:8000/api/trip-planner/trip-plans/'
headers = {
    'Content-Type': 'application/json',
}

try:
    response = requests.get(url, headers=headers)
    print(f'Status Code: {response.status_code}')
    print(f'Response Headers: {dict(response.headers)}')
    
    if response.status_code == 200:
        data = response.json()
        print(f'Number of trips: {len(data.get("results", []))}')
        if data.get('results'):
            first_trip = data['results'][0]
            print(f'First trip title: {first_trip.get("title")}')
            print(f'Daily plans count: {len(first_trip.get("daily_plans", []))}')
            if first_trip.get('daily_plans'):
                first_day = first_trip['daily_plans'][0]
                print(f'First day: {first_day.get("title")} with {len(first_day.get("activities", []))} activities')
    else:
        print(f'Error: {response.text}')
        
except Exception as e:
    print(f'Exception: {e}')