from trip_planner.models import TripPlan, DailyPlan, PlannedActivity

trip = TripPlan.objects.first()
if trip:
    print(f'Trip: {trip.title}')
    print(f'User: {trip.user.username}')
    print(f'Daily plans: {trip.daily_plans.count()}')
    
    for dp in trip.daily_plans.all():
        print(f'  Day {dp.day_number}: {dp.title} ({dp.activities.count()} activities)')
        for act in dp.activities.all():
            place_name = act.place.name if act.place else 'No place'
            print(f'    - {place_name}: {act.start_time}-{act.end_time} ({act.activity_type})')
else:
    print('No trips found')