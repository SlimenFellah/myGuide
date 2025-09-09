from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'trip_planner'

urlpatterns = [
    # Trip Plan URLs
    path('trip-plans/', views.TripPlanListCreateView.as_view(), name='trip-plan-list-create'),
    path('trip-plans/<int:pk>/', views.TripPlanDetailView.as_view(), name='trip-plan-detail'),
    
    # Public Trip Plans
    path('public-trip-plans/', views.PublicTripPlanListView.as_view(), name='public-trip-plan-list'),
    path('public-trip-plans/<int:pk>/', views.PublicTripPlanDetailView.as_view(), name='public-trip-plan-detail'),
    
    # Daily Plan URLs
    path('trip-plans/<int:trip_plan_id>/daily-plans/', views.DailyPlanListCreateView.as_view(), name='daily-plan-list-create'),
    path('daily-plans/<int:pk>/', views.DailyPlanDetailView.as_view(), name='daily-plan-detail'),
    
    # Planned Activity URLs
    path('daily-plans/<int:daily_plan_id>/activities/', views.PlannedActivityListCreateView.as_view(), name='planned-activity-list-create'),
    path('activities/<int:pk>/', views.PlannedActivityDetailView.as_view(), name='planned-activity-detail'),
    
    # Trip Plan Template URLs
    path('templates/', views.TripPlanTemplateListView.as_view(), name='trip-plan-template-list'),
    path('templates/<int:pk>/', views.TripPlanTemplateDetailView.as_view(), name='trip-plan-template-detail'),
    
    # Rating URLs
    path('trip-plans/<int:trip_plan_id>/ratings/', views.TripPlanRatingListCreateView.as_view(), name='trip-plan-rating-list-create'),
    path('ratings/<int:pk>/', views.TripPlanRatingDetailView.as_view(), name='trip-plan-rating-detail'),
    
    # Saved Trip Plan URLs
    path('saved-trip-plans/', views.SavedTripPlanListView.as_view(), name='saved-trip-plan-list'),
    
    # AI and Recommendation URLs
    path('generate-trip-plan/', views.generate_trip_plan, name='generate-trip-plan'),
    path('recommendations/', views.trip_recommendations, name='trip-recommendations'),
    
    # Trip Plan Actions
    path('trip-plans/<int:trip_plan_id>/save/', views.save_trip_plan, name='save-trip-plan'),
    path('trip-plans/<int:trip_plan_id>/unsave/', views.unsave_trip_plan, name='unsave-trip-plan'),
    path('trip-plans/<int:trip_plan_id>/duplicate/', views.duplicate_trip_plan, name='duplicate-trip-plan'),
    
    # Search and Statistics
    path('search/', views.search_trip_plans, name='search-trip-plans'),
    path('statistics/user/', views.user_trip_statistics, name='user-trip-statistics'),
    path('statistics/admin/', views.trip_plan_statistics, name='trip-plan-statistics'),
    
    # Bulk Operations
    path('bulk-operations/', views.bulk_trip_plan_operations, name='bulk-trip-plan-operations'),
    path('export/', views.export_trip_plans, name='export-trip-plans'),
]