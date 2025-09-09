from django.urls import path
from . import views

app_name = 'tourism'

urlpatterns = [
    # Province URLs
    path('provinces/', views.ProvinceListCreateView.as_view(), name='province-list-create'),
    path('provinces/<int:pk>/', views.ProvinceDetailView.as_view(), name='province-detail'),
    
    # District URLs
    path('districts/', views.DistrictListCreateView.as_view(), name='district-list-create'),
    path('districts/<int:pk>/', views.DistrictDetailView.as_view(), name='district-detail'),
    
    # Municipality URLs
    path('municipalities/', views.MunicipalityListCreateView.as_view(), name='municipality-list-create'),
    path('municipalities/<int:pk>/', views.MunicipalityDetailView.as_view(), name='municipality-detail'),
    
    # Place Category URLs
    path('categories/', views.PlaceCategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', views.PlaceCategoryDetailView.as_view(), name='category-detail'),
    
    # Place URLs
    path('places/', views.PlaceListView.as_view(), name='place-list'),
    path('places/create/', views.PlaceCreateView.as_view(), name='place-create'),
    path('places/<int:pk>/', views.PlaceDetailView.as_view(), name='place-detail'),
    path('places/<int:pk>/update/', views.PlaceUpdateView.as_view(), name='place-update'),
    path('places/<int:pk>/delete/', views.PlaceDeleteView.as_view(), name='place-delete'),
    path('places/featured/', views.FeaturedPlacesView.as_view(), name='featured-places'),
    
    # Place Images URLs
    path('places/<int:place_id>/images/', views.PlaceImageListCreateView.as_view(), name='place-image-list-create'),
    path('images/<int:pk>/', views.PlaceImageDetailView.as_view(), name='place-image-detail'),
    
    # Feedback URLs
    path('places/<int:place_id>/feedbacks/', views.FeedbackListView.as_view(), name='feedback-list'),
    path('feedbacks/create/', views.FeedbackCreateView.as_view(), name='feedback-create'),
    path('feedbacks/<int:pk>/', views.FeedbackDetailView.as_view(), name='feedback-detail'),
    path('feedbacks/<int:feedback_id>/helpful/', views.FeedbackHelpfulToggleView.as_view(), name='feedback-helpful-toggle'),
    
    # Search URLs
    path('search/', views.search_places, name='search-places'),
    
    # Statistics URLs (Admin only)
    path('admin/stats/places/', views.place_statistics, name='place-statistics'),
    path('admin/stats/provinces/', views.province_statistics, name='province-statistics'),
    
    # Bulk operations (Admin only)
    path('admin/feedbacks/bulk-approve/', views.bulk_approve_feedbacks, name='bulk-approve-feedbacks'),
    path('admin/places/bulk-feature/', views.bulk_feature_places, name='bulk-feature-places'),
]