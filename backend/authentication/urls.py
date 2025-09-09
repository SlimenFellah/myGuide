from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'authentication'

urlpatterns = [
    # Authentication endpoints
    path('login/', views.CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    
    # Password management
    path('password/change/', views.ChangePasswordView.as_view(), name='change_password'),
    path('password/reset/', views.PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password/reset/confirm/<str:uidb64>/<str:token>/', views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # User profile
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('preferences/', views.UserPreferencesView.as_view(), name='user_preferences'),
    path('activity/', views.UserActivityListView.as_view(), name='user_activity'),
    path('dashboard/stats/', views.user_dashboard_stats, name='dashboard_stats'),
    path('activity/log/', views.log_user_activity, name='log_activity'),
    
    # Admin endpoints
    path('admin/users/', views.UserListView.as_view(), name='admin_user_list'),
    path('admin/users/<int:pk>/', views.UserDetailView.as_view(), name='admin_user_detail'),
]