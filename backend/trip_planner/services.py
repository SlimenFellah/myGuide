import json
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from django.db.models import Q, Avg, Count
from django.contrib.auth import get_user_model
from django.utils import timezone

from tourism.models import Place, Province, District, Municipality, PlaceCategory
from .models import TripPlan, TripPlanTemplate

User = get_user_model()

class TripPlannerAIService:
    """AI service for generating personalized trip plans"""
    
    def __init__(self):
        self.activity_types = [
            'sightseeing', 'adventure', 'cultural', 'relaxation',
            'food_and_drink', 'shopping', 'nature', 'historical',
            'religious', 'entertainment', 'sports', 'photography'
        ]
        
        self.trip_type_preferences = {
            'adventure': ['adventure', 'nature', 'sports', 'sightseeing'],
            'cultural': ['cultural', 'historical', 'religious', 'sightseeing'],
            'relaxation': ['relaxation', 'nature', 'food_and_drink', 'sightseeing'],
            'family': ['sightseeing', 'entertainment', 'cultural', 'nature'],
            'business': ['sightseeing', 'food_and_drink', 'cultural', 'shopping'],
            'romantic': ['sightseeing', 'relaxation', 'food_and_drink', 'cultural'],
            'solo': ['sightseeing', 'cultural', 'adventure', 'photography'],
            'group': ['sightseeing', 'entertainment', 'adventure', 'food_and_drink']
        }
    
    def generate_trip_plan(self, user, **kwargs) -> Dict[str, Any]:
        """Generate a complete AI trip plan"""
        # Extract parameters
        start_date = kwargs.get('start_date')
        end_date = kwargs.get('end_date')
        budget = kwargs.get('budget', 1000)
        budget_currency = kwargs.get('budget_currency', 'USD')
        group_size = kwargs.get('group_size', 1)
        trip_type = kwargs.get('trip_type', 'adventure')
        interests = kwargs.get('interests', [])
        destination_preference = kwargs.get('destination_preference')
        accommodation_preference = kwargs.get('accommodation_preference', 'hotel')
        activity_level = kwargs.get('activity_level', 'moderate')
        special_requirements = kwargs.get('special_requirements', '')
        
        # Calculate trip duration
        duration = (end_date - start_date).days + 1
        
        # Get suitable destinations
        destinations = self._get_suitable_destinations(
            trip_type, interests, destination_preference, budget, duration
        )
        
        if not destinations:
            raise ValueError("No suitable destinations found for the given criteria")
        
        # Select primary destination
        primary_destination = destinations[0]
        
        # Generate trip title and description
        title = self._generate_trip_title(trip_type, primary_destination, duration)
        description = self._generate_trip_description(
            trip_type, primary_destination, duration, group_size, interests
        )
        
        # Generate daily plans
        daily_plans = self._generate_daily_plans(
            start_date, end_date, destinations, trip_type, interests,
            budget, group_size, activity_level
        )
        
        # Calculate confidence score
        confidence_score = self._calculate_confidence_score(
            destinations, trip_type, interests, budget, duration
        )
        
        return {
            'title': title,
            'description': description,
            'daily_plans': daily_plans,
            'confidence_score': confidence_score,
            'estimated_total_cost': sum(
                sum(activity.get('estimated_cost', 0) for activity in day['activities'])
                for day in daily_plans
            ),
            'recommended_destinations': [dest.name for dest in destinations[:3]]
        }
    
    def _get_suitable_destinations(self, trip_type: str, interests: List[str], 
                                 destination_preference: Optional[str], 
                                 budget: float, duration: int) -> List[Place]:
        """Find suitable destinations based on criteria"""
        queryset = Place.objects.filter(is_active=True)
        
        # Filter by destination preference (province/district)
        if destination_preference:
            queryset = queryset.filter(
                Q(province__name__icontains=destination_preference) |
                Q(district__name__icontains=destination_preference) |
                Q(municipality__name__icontains=destination_preference)
            )
        
        # Filter by categories that match trip type and interests
        preferred_activities = self.trip_type_preferences.get(trip_type, [])
        if interests:
            preferred_activities.extend(interests)
        
        if preferred_activities:
            # Map interests to place categories
            category_mapping = {
                'adventure': ['adventure', 'nature', 'sports'],
                'cultural': ['cultural', 'historical', 'museum'],
                'nature': ['nature', 'park', 'mountain'],
                'historical': ['historical', 'heritage', 'monument'],
                'religious': ['religious', 'temple', 'monastery'],
                'food_and_drink': ['restaurant', 'cafe', 'local_cuisine'],
                'shopping': ['shopping', 'market', 'bazaar'],
                'relaxation': ['spa', 'resort', 'beach'],
                'entertainment': ['entertainment', 'nightlife', 'festival']
            }
            
            category_names = []
            for interest in preferred_activities:
                category_names.extend(category_mapping.get(interest, [interest]))
            
            if category_names:
                queryset = queryset.filter(
                    category__name__in=category_names
                ).distinct()
        
        # Order by rating and popularity
        queryset = queryset.annotate(
            avg_rating=Avg('feedbacks__rating'),
            feedback_count=Count('feedbacks')
        ).order_by('-avg_rating', '-feedback_count')
        
        return list(queryset[:20])  # Limit to top 20 destinations
    
    def _generate_trip_title(self, trip_type: str, destination: Place, duration: int) -> str:
        """Generate an attractive trip title"""
        trip_type_titles = {
            'adventure': f"{duration}-Day Adventure in {destination.district.name}",
            'cultural': f"Cultural Discovery: {duration} Days in {destination.district.name}",
            'relaxation': f"Relaxing {duration}-Day Getaway to {destination.district.name}",
            'family': f"Family Fun: {duration} Days in {destination.district.name}",
            'business': f"Business & Leisure: {duration} Days in {destination.district.name}",
            'romantic': f"Romantic {duration}-Day Escape to {destination.district.name}",
            'solo': f"Solo Journey: {duration} Days Exploring {destination.district.name}",
            'group': f"Group Adventure: {duration} Days in {destination.district.name}"
        }
        
        return trip_type_titles.get(trip_type, f"{duration}-Day Trip to {destination.district.name}")
    
    def _generate_trip_description(self, trip_type: str, destination: Place, 
                                 duration: int, group_size: int, interests: List[str]) -> str:
        """Generate trip description"""
        base_description = f"Discover the beauty of {destination.district.name} in this carefully planned {duration}-day itinerary."
        
        if trip_type == 'adventure':
            base_description += " Experience thrilling adventures and explore stunning natural landscapes."
        elif trip_type == 'cultural':
            base_description += " Immerse yourself in rich cultural heritage and local traditions."
        elif trip_type == 'relaxation':
            base_description += " Unwind and rejuvenate in peaceful, scenic locations."
        elif trip_type == 'family':
            base_description += " Enjoy family-friendly activities and create lasting memories together."
        
        if interests:
            base_description += f" This trip focuses on {', '.join(interests[:3])} experiences."
        
        if group_size > 1:
            base_description += f" Perfect for groups of {group_size} people."
        
        return base_description
    
    def _generate_daily_plans(self, start_date, end_date, destinations: List[Place],
                            trip_type: str, interests: List[str], budget: float,
                            group_size: int, activity_level: str) -> List[Dict[str, Any]]:
        """Generate daily plans for the trip"""
        daily_plans = []
        current_date = start_date
        duration = (end_date - start_date).days + 1
        daily_budget = budget / duration if duration > 0 else budget
        
        # Determine activities per day based on activity level
        activities_per_day = {
            'low': 2,
            'moderate': 3,
            'high': 4
        }.get(activity_level, 3)
        
        day_number = 1
        while current_date <= end_date:
            # Select destinations for this day
            day_destinations = self._select_day_destinations(
                destinations, day_number, duration
            )
            
            # Generate activities for the day
            activities = self._generate_day_activities(
                day_destinations, trip_type, interests, daily_budget,
                activities_per_day, day_number
            )
            
            daily_plan = {
                'date': current_date,
                'title': f"Day {day_number}: {self._get_day_theme(day_number, trip_type)}",
                'description': self._generate_day_description(day_number, activities, trip_type),
                'activities': activities
            }
            
            daily_plans.append(daily_plan)
            current_date += timedelta(days=1)
            day_number += 1
        
        return daily_plans
    
    def _select_day_destinations(self, destinations: List[Place], 
                               day_number: int, total_days: int) -> List[Place]:
        """Select destinations for a specific day"""
        if not destinations:
            return []
        
        # For shorter trips, focus on fewer destinations
        if total_days <= 3:
            return destinations[:2]
        elif total_days <= 7:
            # Rotate through destinations
            start_idx = (day_number - 1) % len(destinations)
            return destinations[start_idx:start_idx + 2] or destinations[:2]
        else:
            # For longer trips, allow more variety
            start_idx = (day_number - 1) % len(destinations)
            return destinations[start_idx:start_idx + 3] or destinations[:3]
    
    def _generate_day_activities(self, destinations: List[Place], trip_type: str,
                               interests: List[str], daily_budget: float,
                               activities_count: int, day_number: int) -> List[Dict[str, Any]]:
        """Generate activities for a single day"""
        activities = []
        activity_budget = daily_budget / activities_count if activities_count > 0 else daily_budget
        
        # Get preferred activity types
        preferred_types = self.trip_type_preferences.get(trip_type, self.activity_types[:4])
        if interests:
            preferred_types = list(set(preferred_types + interests))
        
        # Generate time slots for activities
        time_slots = self._generate_time_slots(activities_count)
        
        for i in range(activities_count):
            if i < len(destinations):
                place = destinations[i]
            else:
                place = random.choice(destinations) if destinations else None
            
            if not place:
                continue
            
            activity_type = preferred_types[i % len(preferred_types)]
            start_time, end_time = time_slots[i] if i < len(time_slots) else (None, None)
            
            activity = {
                'place_id': place.id,
                'activity_type': activity_type,
                'start_time': start_time,
                'end_time': end_time,
                'duration_hours': 2.0 + random.uniform(-0.5, 1.0),  # 1.5 to 3 hours
                'estimated_cost': self._estimate_activity_cost(
                    activity_type, activity_budget, day_number
                ),
                'notes': self._generate_activity_notes(place, activity_type)
            }
            
            activities.append(activity)
        
        return activities
    
    def _generate_time_slots(self, count: int) -> List[tuple]:
        """Generate time slots for activities"""
        if count == 2:
            return [('09:00:00', '12:00:00'), ('14:00:00', '17:00:00')]
        elif count == 3:
            return [
                ('09:00:00', '11:30:00'),
                ('13:00:00', '15:30:00'),
                ('16:00:00', '18:00:00')
            ]
        elif count == 4:
            return [
                ('09:00:00', '11:00:00'),
                ('11:30:00', '13:30:00'),
                ('14:30:00', '16:30:00'),
                ('17:00:00', '19:00:00')
            ]
        else:
            return [('09:00:00', '17:00:00')]  # Full day activity
    
    def _estimate_activity_cost(self, activity_type: str, budget: float, day_number: int) -> float:
        """Estimate cost for an activity"""
        base_costs = {
            'sightseeing': 20,
            'adventure': 50,
            'cultural': 15,
            'relaxation': 30,
            'food_and_drink': 25,
            'shopping': 40,
            'nature': 10,
            'historical': 15,
            'religious': 5,
            'entertainment': 35,
            'sports': 45,
            'photography': 10
        }
        
        base_cost = base_costs.get(activity_type, 25)
        
        # Add some randomness and adjust for budget
        cost_multiplier = min(budget / 50, 3.0)  # Cap at 3x base cost
        estimated_cost = base_cost * cost_multiplier * random.uniform(0.7, 1.3)
        
        return round(estimated_cost, 2)
    
    def _generate_activity_notes(self, place: Place, activity_type: str) -> str:
        """Generate notes for an activity"""
        notes_templates = {
            'sightseeing': f"Explore the beautiful {place.name} and take in the scenic views.",
            'adventure': f"Experience thrilling adventures at {place.name}.",
            'cultural': f"Discover the rich cultural heritage of {place.name}.",
            'relaxation': f"Relax and unwind at the peaceful {place.name}.",
            'food_and_drink': f"Enjoy local cuisine and specialties near {place.name}.",
            'shopping': f"Browse local markets and shops around {place.name}.",
            'nature': f"Connect with nature and enjoy the natural beauty of {place.name}.",
            'historical': f"Learn about the fascinating history of {place.name}.",
            'religious': f"Experience the spiritual atmosphere of {place.name}.",
            'entertainment': f"Enjoy entertainment and local performances near {place.name}.",
            'sports': f"Engage in sports activities at {place.name}.",
            'photography': f"Capture stunning photographs at the picturesque {place.name}."
        }
        
        return notes_templates.get(activity_type, f"Visit and explore {place.name}.")
    
    def _get_day_theme(self, day_number: int, trip_type: str) -> str:
        """Get theme for a specific day"""
        themes = {
            'adventure': ['Arrival & Exploration', 'Mountain Adventures', 'Water Activities', 'Cultural Discovery', 'Nature Trails', 'Local Experiences', 'Departure'],
            'cultural': ['Arrival & City Tour', 'Historical Sites', 'Museums & Galleries', 'Local Traditions', 'Cultural Immersion', 'Art & Crafts', 'Departure'],
            'relaxation': ['Arrival & Settling In', 'Spa & Wellness', 'Nature Walks', 'Peaceful Exploration', 'Leisure Activities', 'Final Relaxation', 'Departure'],
            'family': ['Arrival & Fun Start', 'Family Adventures', 'Educational Visits', 'Outdoor Activities', 'Entertainment', 'Memory Making', 'Departure']
        }
        
        trip_themes = themes.get(trip_type, themes['adventure'])
        theme_index = min(day_number - 1, len(trip_themes) - 1)
        return trip_themes[theme_index]
    
    def _generate_day_description(self, day_number: int, activities: List[Dict], trip_type: str) -> str:
        """Generate description for a day"""
        if day_number == 1:
            return "Start your journey with exciting exploration and get acquainted with the local area."
        elif activities:
            activity_types = [act.get('activity_type', 'sightseeing') for act in activities]
            return f"Enjoy a day filled with {', '.join(set(activity_types))} activities."
        else:
            return "A wonderful day of exploration and discovery awaits."
    
    def _calculate_confidence_score(self, destinations: List[Place], trip_type: str,
                                  interests: List[str], budget: float, duration: int) -> float:
        """Calculate AI confidence score for the generated plan"""
        score = 0.5  # Base score
        
        # Destination availability
        if len(destinations) >= 3:
            score += 0.2
        elif len(destinations) >= 1:
            score += 0.1
        
        # Budget adequacy
        if budget >= 500:
            score += 0.1
        elif budget >= 200:
            score += 0.05
        
        # Duration appropriateness
        if 3 <= duration <= 14:
            score += 0.1
        elif 1 <= duration <= 21:
            score += 0.05
        
        # Interest matching
        if interests:
            score += min(len(interests) * 0.05, 0.1)
        
        return min(score, 1.0)


class TripRecommendationService:
    """Service for generating personalized trip recommendations"""
    
    def __init__(self):
        self.ai_service = TripPlannerAIService()
    
    def get_recommendations(self, user, limit: int = 5) -> List[Dict[str, Any]]:
        """Get personalized trip recommendations for a user"""
        # Analyze user's trip history
        user_preferences = self._analyze_user_preferences(user)
        
        # Get popular destinations
        popular_destinations = self._get_popular_destinations()
        
        # Get trending trip types
        trending_types = self._get_trending_trip_types()
        
        # Generate recommendations
        recommendations = []
        
        # Recommendation 1: Based on user history
        if user_preferences['favorite_trip_type']:
            rec = self._create_recommendation(
                title=f"More {user_preferences['favorite_trip_type'].title()} Adventures",
                description=f"Based on your love for {user_preferences['favorite_trip_type']} trips",
                trip_type=user_preferences['favorite_trip_type'],
                destinations=popular_destinations[:3],
                reason="Based on your trip history"
            )
            recommendations.append(rec)
        
        # Recommendation 2: Popular destinations
        if popular_destinations:
            rec = self._create_recommendation(
                title=f"Discover {popular_destinations[0].district.name}",
                description="One of the most popular destinations among travelers",
                trip_type='sightseeing',
                destinations=[popular_destinations[0]],
                reason="Popular destination"
            )
            recommendations.append(rec)
        
        # Recommendation 3: Trending trip type
        if trending_types:
            trending_type = trending_types[0]['trip_type']
            rec = self._create_recommendation(
                title=f"Trending: {trending_type.title()} Experience",
                description=f"Join the trend with this popular {trending_type} trip",
                trip_type=trending_type,
                destinations=popular_destinations[:2],
                reason="Trending trip type"
            )
            recommendations.append(rec)
        
        # Recommendation 4: Budget-friendly option
        rec = self._create_recommendation(
            title="Budget-Friendly Adventure",
            description="Great experiences without breaking the bank",
            trip_type='adventure',
            destinations=popular_destinations[2:4] if len(popular_destinations) > 2 else popular_destinations,
            reason="Budget-friendly",
            estimated_budget=300
        )
        recommendations.append(rec)
        
        # Recommendation 5: Weekend getaway
        rec = self._create_recommendation(
            title="Perfect Weekend Getaway",
            description="Short and sweet 2-day escape",
            trip_type='relaxation',
            destinations=popular_destinations[1:3] if len(popular_destinations) > 1 else popular_destinations,
            reason="Weekend trip",
            duration=2
        )
        recommendations.append(rec)
        
        return recommendations[:limit]
    
    def _analyze_user_preferences(self, user) -> Dict[str, Any]:
        """Analyze user's trip preferences from history"""
        user_trips = user.trip_plans.all()
        
        if not user_trips.exists():
            return {
                'favorite_trip_type': 'adventure',
                'average_budget': 500,
                'average_duration': 5,
                'preferred_destinations': []
            }
        
        # Most common trip type
        trip_type_counts = user_trips.values('trip_type').annotate(
            count=Count('trip_type')
        ).order_by('-count')
        
        favorite_trip_type = trip_type_counts.first()['trip_type'] if trip_type_counts else 'adventure'
        
        # Average budget
        avg_budget = user_trips.aggregate(avg=Avg('budget'))['avg'] or 500
        
        # Average duration
        avg_duration = 5  # Default, would need to calculate from dates
        
        return {
            'favorite_trip_type': favorite_trip_type,
            'average_budget': avg_budget,
            'average_duration': avg_duration,
            'preferred_destinations': []
        }
    
    def _get_popular_destinations(self) -> List[Place]:
        """Get popular destinations based on trip plans and ratings"""
        # This would ideally analyze which places appear most in trip plans
        # For now, return top-rated places
        return list(Place.objects.filter(is_active=True).annotate(
            avg_rating=Avg('feedbacks__rating'),
            feedback_count=Count('feedbacks')
        ).order_by('-avg_rating', '-feedback_count')[:10])
    
    def _get_trending_trip_types(self) -> List[Dict[str, Any]]:
        """Get trending trip types based on recent activity"""
        # Analyze recent trip plans to find trending types
        recent_date = timezone.now() - timedelta(days=30)
        
        trending = TripPlan.objects.filter(
            created_at__gte=recent_date
        ).values('trip_type').annotate(
            count=Count('trip_type')
        ).order_by('-count')
        
        return list(trending[:5])
    
    def _create_recommendation(self, title: str, description: str, trip_type: str,
                             destinations: List[Place], reason: str,
                             estimated_budget: Optional[float] = None,
                             duration: Optional[int] = None) -> Dict[str, Any]:
        """Create a recommendation object"""
        return {
            'title': title,
            'description': description,
            'trip_type': trip_type,
            'destinations': [{
                'id': dest.id,
                'name': dest.name,
                'district': dest.district.name,
                'province': dest.province.name
            } for dest in destinations],
            'estimated_budget': estimated_budget or 500,
            'estimated_duration': duration or 5,
            'reason': reason,
            'confidence_score': random.uniform(0.7, 0.95)
        }