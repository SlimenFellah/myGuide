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
        dietary_restrictions = kwargs.get('dietary_restrictions', '')
        travel_style = kwargs.get('travel_style', '')
        preferences = kwargs.get('preferences', '')
        
        # Calculate trip duration
        duration = (end_date - start_date).days + 1
        
        # Calculate budget distribution
        total_budget = float(budget) * group_size  # Total budget for entire group
        activity_budget_percentage = 0.7  # 70% for activities, 30% for accommodation/transport
        total_activity_budget = total_budget * activity_budget_percentage
        per_person_activity_budget = total_activity_budget / max(group_size, 1)
        
        # Get suitable destinations
        destinations = self._get_suitable_destinations(
            trip_type, interests, destination_preference, budget, duration, travel_style
        )
        
        if not destinations:
            raise ValueError("No suitable destinations found for the given criteria")
        
        # Select primary destination
        primary_destination = destinations[0]
        
        # Generate trip title and description
        title = self._generate_trip_title(trip_type, primary_destination, duration, travel_style)
        description = self._generate_trip_description(
            trip_type, primary_destination, duration, group_size, interests, travel_style
        )
        
        # Generate daily plans with improved logic
        daily_plans = self._generate_daily_plans(
            start_date, end_date, destinations, trip_type, interests,
            per_person_activity_budget, group_size, activity_level, special_requirements, dietary_restrictions
        )
        
        # Calculate total cost more accurately
        total_cost = 0
        for day_plan in daily_plans:
            for activity in day_plan['activities']:
                # Activity cost is already per person, multiply by group size for total
                activity_cost = activity.get('estimated_cost', 0) * group_size
                total_cost += activity_cost
        
        # Ensure total cost doesn't exceed budget by more than 20%
        budget_limit = total_budget * 1.2
        if total_cost > budget_limit:
            # Scale down costs proportionally
            scale_factor = budget_limit / total_cost
            for day_plan in daily_plans:
                for activity in day_plan['activities']:
                    activity['estimated_cost'] = round(activity['estimated_cost'] * scale_factor, 2)
            total_cost = budget_limit
        # If total cost is too low (less than 80% of budget), scale up slightly
        elif total_cost < total_budget * 0.8:
            # Scale up costs to better utilize budget
            scale_factor = min(1.2, (total_budget * 0.9) / total_cost)  # Target 90% of budget
            for day_plan in daily_plans:
                for activity in day_plan['activities']:
                    activity['estimated_cost'] = round(activity['estimated_cost'] * scale_factor, 2)
            total_cost = total_cost * scale_factor
        
        # Calculate confidence score
        confidence_score = self._calculate_confidence_score(
            destinations, trip_type, interests, budget, duration
        )
        
        return {
            'title': title,
            'description': description,
            'daily_plans': daily_plans,
            'confidence_score': confidence_score,
            'estimated_total_cost': round(total_cost, 2),
            'recommended_destinations': [dest.name for dest in destinations[:3]]
        }
    
    def _get_suitable_destinations(self, trip_type: str, interests: List[str], 
                                 destination_preference: Optional[str], 
                                 budget: float, duration: int, travel_style: str = '') -> List[Place]:
        """Find suitable destinations based on criteria"""
        queryset = Place.objects.filter(is_active=True)
        
        # Map common English destination names to local names
        destination_mapping = {
            'algiers': 'Algiers',
            'alger': 'Algiers',
            'constantine': 'constantine',
            'oran': 'Oran',
            'annaba': 'annaba',
            'tlemcen': 'tlemcen',
            'bejaia': 'béjaïa',
            'béjaïa': 'béjaïa'
        }
        
        # Filter by destination preference (province/district)
        if destination_preference:
            # Normalize destination preference
            normalized_dest = destination_preference.lower()
            mapped_dest = destination_mapping.get(normalized_dest, destination_preference)
            
            queryset = queryset.filter(
                Q(municipality__district__province__name__icontains=mapped_dest) |
                Q(municipality__district__name__icontains=mapped_dest) |
                Q(municipality__name__icontains=mapped_dest)
            )
        
        # Filter by categories that match trip type, interests, and travel style
        preferred_activities = self.trip_type_preferences.get(trip_type, [])
        if interests:
            preferred_activities.extend(interests)
        if travel_style:
            # Map travel style to activities
            style_mapping = {
                'cultural heritage': ['cultural', 'historical', 'religious'],
                'adventure': ['adventure', 'nature', 'sports'],
                'relaxation': ['relaxation', 'nature', 'spa'],
                'photography': ['photography', 'sightseeing', 'nature'],
                'food and drink': ['food_and_drink', 'cultural'],
                'shopping': ['shopping', 'cultural'],
                'nightlife': ['entertainment', 'nightlife']
            }
            style_activities = style_mapping.get(travel_style.lower(), [])
            preferred_activities.extend(style_activities)
        
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
                'entertainment': ['entertainment', 'nightlife', 'festival'],
                'photography': ['scenic', 'viewpoint', 'landmark'],
                'spa': ['spa', 'wellness', 'resort']
            }
            
            category_names = []
            for interest in preferred_activities:
                category_names.extend(category_mapping.get(interest, [interest]))
            
            if category_names:
                # Try to filter by categories, but be more lenient
                category_filtered = queryset.filter(
                    category__name__in=category_names
                ).distinct()
                
                # If we have some matches but not enough variety, expand the search
                if category_filtered.count() < 12:  # Increased threshold to include more places
                    # Include places with partial category matches or no category filtering
                    expanded_queryset = queryset.filter(
                        Q(category__name__in=category_names) |
                        Q(category__isnull=True) |
                        Q(category__name__icontains='museum') |
                        Q(category__name__icontains='cultural') |
                        Q(category__name__icontains='historical') |
                        Q(category__name__icontains='entertainment') |
                        Q(category__name__icontains='restaurant') |
                        Q(category__name__icontains='landmark') |
                        Q(category__name__icontains='market') |
                        Q(category__name__icontains='mosque') |
                        Q(category__name__icontains='park') |
                        Q(category__name__icontains='square') |
                        Q(category__name__icontains='monument')
                    ).distinct()
                    
                    # If expanded search gives us more places, use it
                    if expanded_queryset.count() > category_filtered.count():
                        queryset = expanded_queryset
                    else:
                        queryset = category_filtered
                else:
                    queryset = category_filtered
                
                # If still no matches or very few, don't filter by category at all
                if queryset.count() < 10:  # More inclusive threshold for small destinations like Oran
                    queryset = Place.objects.filter(is_active=True)
                    if destination_preference:
                        normalized_dest = destination_preference.lower()
                        mapped_dest = destination_mapping.get(normalized_dest, destination_preference)
                        queryset = queryset.filter(
                            Q(municipality__district__province__name__icontains=mapped_dest) |
                            Q(municipality__district__name__icontains=mapped_dest) |
                            Q(municipality__name__icontains=mapped_dest)
                        )
        
        # Order by rating and popularity
        queryset = queryset.annotate(
            avg_rating=Avg('feedbacks__rating'),
            feedback_count=Count('feedbacks')
        ).order_by('-avg_rating', '-feedback_count')
        
        return list(queryset[:15])  # Increased limit to include more destinations
    
    def _generate_trip_title(self, trip_type: str, destination: Place, duration: int, travel_style: str = '') -> str:
        """Generate an attractive trip title"""
        location_name = destination.municipality.district.province.name
        
        if travel_style:
            style_titles = {
                'cultural heritage': f"Cultural Heritage: {duration} Days in {location_name}",
                'adventure': f"Adventure Quest: {duration} Days in {location_name}",
                'relaxation': f"Relaxing Retreat: {duration} Days in {location_name}",
                'photography': f"Photography Tour: {duration} Days in {location_name}",
                'food and drink': f"Culinary Journey: {duration} Days in {location_name}",
                'shopping': f"Shopping & Culture: {duration} Days in {location_name}",
                'nightlife': f"Nightlife & Entertainment: {duration} Days in {location_name}"
            }
            if travel_style.lower() in style_titles:
                return style_titles[travel_style.lower()]
        
        trip_type_titles = {
            'adventure': f"{duration}-Day Adventure in {location_name}",
            'cultural': f"Cultural Discovery: {duration} Days in {location_name}",
            'relaxation': f"Relaxing {duration}-Day Getaway to {location_name}",
            'family': f"Family Fun: {duration} Days in {location_name}",
            'business': f"Business & Leisure: {duration} Days in {location_name}",
            'romantic': f"Romantic {duration}-Day Escape to {location_name}",
            'solo': f"Solo Journey: {duration} Days Exploring {location_name}",
            'group': f"Group Adventure: {duration} Days in {location_name}"
        }
        
        return trip_type_titles.get(trip_type, f"{duration}-Day Trip to {location_name}")
    
    def _generate_trip_description(self, trip_type: str, destination: Place, 
                                 duration: int, group_size: int, interests: List[str], travel_style: str = '') -> str:
        """Generate trip description"""
        location_name = destination.municipality.district.province.name
        base_description = f"Discover the beauty of {location_name} in this carefully planned {duration}-day itinerary."
        
        if travel_style:
            style_descriptions = {
                'cultural heritage': " Immerse yourself in rich cultural heritage, historical sites, and traditional experiences.",
                'adventure': " Experience thrilling adventures and explore stunning natural landscapes.",
                'relaxation': " Unwind and rejuvenate in peaceful, scenic locations perfect for relaxation.",
                'photography': " Capture stunning photographs at the most picturesque locations and scenic viewpoints.",
                'food and drink': " Savor local cuisine and discover the culinary traditions of the region.",
                'shopping': " Explore local markets, traditional crafts, and unique shopping experiences.",
                'nightlife': " Experience vibrant nightlife and entertainment venues."
            }
            base_description += style_descriptions.get(travel_style.lower(), "")
        elif trip_type == 'adventure':
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
                            trip_type: str, interests: List[str], per_person_budget: float,
                            group_size: int, activity_level: str, special_requirements: str = '',
                            dietary_restrictions: str = '') -> List[Dict[str, Any]]:
        """Generate daily plans for the trip with improved logic to avoid duplicates"""
        daily_plans = []
        current_date = start_date
        duration = (end_date - start_date).days + 1
        daily_budget = per_person_budget / duration if duration > 0 else per_person_budget
        
        # Determine activities per day based on activity level
        activities_per_day = {
            'low': 2,
            'moderate': 3,
            'high': 4
        }.get(activity_level, 3)
        
        # Create a global place distribution strategy to minimize duplicates
        total_activities = duration * activities_per_day
        place_distribution = self._distribute_places_globally(destinations, total_activities)
        
        day_number = 1
        activity_index = 0
        
        while current_date <= end_date:
            # Get places for this day from the global distribution
            day_places = place_distribution[activity_index:activity_index + activities_per_day]
            
            # Generate activities for the day
            activities = self._generate_day_activities_improved(
                day_places, trip_type, interests, daily_budget,
                activities_per_day, day_number, special_requirements, dietary_restrictions
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
            activity_index += activities_per_day
        
        return daily_plans
    
    def _distribute_places_globally(self, destinations: List[Place], total_activities: int) -> List[Place]:
        """Distribute places globally across all days to minimize repetition with improved algorithm"""
        if not destinations:
            return []
        
        # If we have enough places to avoid any repetition, use each place only once
        if len(destinations) >= total_activities:
            selected_places = destinations[:total_activities]
            random.shuffle(selected_places)
            return selected_places
        
        # If we need repetition, use a more sophisticated distribution
        place_distribution = []
        
        # Calculate minimum uses per place and how many places need extra uses
        min_uses_per_place = total_activities // len(destinations)
        extra_uses_needed = total_activities % len(destinations)
        
        # Create usage plan for each place
        usage_plan = []
        for i, place in enumerate(destinations):
            uses = min_uses_per_place
            if i < extra_uses_needed:
                uses += 1
            usage_plan.append((place, uses))
        
        # Distribute places with maximum spacing between repetitions
        for round_num in range(max(uses for _, uses in usage_plan)):
            # Shuffle the order for this round to avoid patterns
            places_this_round = []
            for place, uses in usage_plan:
                if round_num < uses:
                    places_this_round.append(place)
            
            # Randomize order within each round
            random.shuffle(places_this_round)
            place_distribution.extend(places_this_round)
        
        # Final shuffle to break any remaining patterns
        random.shuffle(place_distribution)
        
        # Ensure exact count
        return place_distribution[:total_activities]
    
    def _select_day_destinations_improved(self, available_places: List[Place], 
                                        used_places: set, day_number: int, 
                                        total_days: int, activities_per_day: int) -> List[Place]:
        """Select destinations for a specific day, avoiding recent duplicates"""
        if not available_places:
            return []
        
        # Filter out recently used places (unless we have no choice)
        unused_places = [place for place in available_places if place.id not in used_places]
        
        # If we have enough unused places, use them
        if len(unused_places) >= activities_per_day:
            # Shuffle to get variety and select needed amount
            random.shuffle(unused_places)
            return unused_places[:activities_per_day]
        
        # If we don't have enough unused places, use all unused + some used
        selected_places = unused_places.copy()
        remaining_needed = activities_per_day - len(unused_places)
        
        if remaining_needed > 0:
            used_places_list = [place for place in available_places if place.id in used_places]
            # Shuffle used places to avoid always picking the same ones
            random.shuffle(used_places_list)
            selected_places.extend(used_places_list[:remaining_needed])
        
        return selected_places
    
    def _generate_day_activities_improved(self, destinations: List[Place], trip_type: str,
                                        interests: List[str], daily_budget: float,
                                        activities_count: int, day_number: int,
                                        special_requirements: str = '', dietary_restrictions: str = '') -> List[Dict[str, Any]]:
        """Generate activities for a single day with improved logic"""
        activities = []
        # Use the full daily budget as reference, not divided by activities
        # This allows for more realistic cost estimation
        activity_budget = daily_budget  # Use full daily budget as reference
        
        # Get preferred activity types
        preferred_types = self.trip_type_preferences.get(trip_type, self.activity_types[:4])
        if interests:
            preferred_types = list(set(preferred_types + interests))
        
        # Generate time slots for activities
        time_slots = self._generate_time_slots(activities_count)
        
        # Use the pre-distributed places directly
        for i in range(min(activities_count, len(destinations))):
            place = destinations[i]
            
            activity_type = preferred_types[i % len(preferred_types)]
            start_time, end_time = time_slots[i] if i < len(time_slots) else (None, None)
            
            # Calculate duration based on activity type and time slot
            if start_time and end_time:
                start_hour = int(start_time.split(':')[0])
                end_hour = int(end_time.split(':')[0])
                duration_hours = end_hour - start_hour
            else:
                duration_hours = 2.0 + random.uniform(-0.5, 1.0)  # 1.5 to 3 hours
            
            # Calculate cost more consistently - use daily budget as reference
            estimated_cost = self._estimate_activity_cost_improved(
                activity_type, activity_budget, place, special_requirements, dietary_restrictions
            )
            
            activity = {
                'place_id': place.id,
                'activity_type': activity_type,
                'start_time': start_time,
                'end_time': end_time,
                'duration_hours': duration_hours,
                'estimated_cost': estimated_cost,
                'notes': self._generate_activity_notes_improved(place, activity_type, special_requirements, dietary_restrictions)
            }
            
            activities.append(activity)
        
        return activities
    
    def _estimate_activity_cost_improved(self, activity_type: str, budget: float, place: Place,
                                       special_requirements: str = '', dietary_restrictions: str = '') -> float:
        """Estimate cost for an activity with improved consistency"""
        # Significantly increased base costs to better utilize budget
        base_costs = {
            'sightseeing': 45,
            'adventure': 80,
            'cultural': 35,
            'relaxation': 55,
            'food_and_drink': 50,
            'shopping': 65,
            'nature': 30,
            'historical': 35,
            'religious': 20,
            'entertainment': 65,
            'sports': 70,
            'photography': 25
        }
        
        base_cost = base_costs.get(activity_type, 25)
        
        # Adjust for place category
        if hasattr(place, 'category') and place.category:
            category_multipliers = {
                'museum': 1.2,
                'restaurant': 1.5,
                'hotel': 2.0,
                'shopping': 1.3,
                'entertainment': 1.4,
                'adventure': 1.6,
                'spa': 1.8
            }
            category_name = place.category.name.lower()
            for key, multiplier in category_multipliers.items():
                if key in category_name:
                    base_cost *= multiplier
                    break
        
        # Adjust for special requirements
        if special_requirements:
            if 'private' in special_requirements.lower() or 'guide' in special_requirements.lower():
                base_cost *= 1.5
            if 'luxury' in special_requirements.lower() or 'premium' in special_requirements.lower():
                base_cost *= 1.8
        
        # Adjust for dietary restrictions (might affect restaurant costs)
        if dietary_restrictions and activity_type == 'food_and_drink':
            if any(restriction in dietary_restrictions.lower() for restriction in ['vegan', 'gluten-free', 'kosher', 'halal']):
                base_cost *= 1.2
        
        # Scale based on available budget to better utilize it - increased scaling
        budget_factor = min(2.5, max(1.0, budget / 50))  # Scale between 1x and 2.5x based on budget
        base_cost *= budget_factor
        
        # Add controlled randomness (±20%)
        cost_variation = random.uniform(0.8, 1.2)
        estimated_cost = float(base_cost) * cost_variation
        
        # Ensure cost is within reasonable bounds relative to budget
        max_cost = budget * 0.6  # Don't exceed 60% of daily budget per activity
        min_cost = budget * 0.2   # Don't go below 20% of daily budget per activity
        
        estimated_cost = max(min_cost, min(estimated_cost, max_cost))
        
        return round(estimated_cost, 2)
    
    def _generate_activity_notes_improved(self, place: Place, activity_type: str,
                                        special_requirements: str = '', dietary_restrictions: str = '') -> str:
        """Generate notes for an activity with improved personalization"""
        base_notes = {
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
        
        notes = base_notes.get(activity_type, f"Visit and explore {place.name}.")
        
        # Add special requirements notes
        if special_requirements:
            if 'accessible' in special_requirements.lower():
                notes += " Wheelchair accessible facilities available."
            if 'guide' in special_requirements.lower():
                notes += " Professional guide service included."
            if 'private' in special_requirements.lower():
                notes += " Private tour experience."
        
        # Add dietary restriction notes for food activities
        if dietary_restrictions and activity_type == 'food_and_drink':
            notes += f" Accommodates {dietary_restrictions} dietary requirements."
        
        return notes
    
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
        cost_multiplier = min(float(budget) / 50, 3.0)  # Cap at 3x base cost
        estimated_cost = float(base_cost) * cost_multiplier * random.uniform(0.7, 1.3)
        
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