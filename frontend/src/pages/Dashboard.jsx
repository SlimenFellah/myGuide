/*
 * Developed & maintained by Slimene Fellah — Available for freelance work at slimenefellah.dev
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAppContext } from '../contexts/AppContext';
import { apiService } from '../services';
import { 
  MapPin, 
  MessageCircle, 
  Calendar, 
  Star, 
  TrendingUp,
  Users,
  Clock,
  ArrowRight,
  Heart,
  Navigation,
  Sparkles,
  Activity
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const Dashboard = () => {
  const { user } = useAuth();
  const { state, dispatch } = useAppContext();
  const { savedPlans = [], favorites = [], places = [] } = state || {};
  const [stats, setStats] = useState({
    totalTrips: 0,
    placesVisited: 0,
    reviewsGiven: 0,
    favoriteSpots: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [popularPlaces, setPopularPlaces] = useState([]);

  useEffect(() => {
    // Load dashboard data
    const loadDashboardData = async () => {
      try {
        // Calculate stats from context state with safe defaults
        setStats({
          totalTrips: Array.isArray(savedPlans) ? savedPlans.length : 0,
          placesVisited: Array.isArray(savedPlans) ? savedPlans.reduce((total, plan) => {
            return total + (plan?.days?.reduce((dayTotal, day) => dayTotal + (day?.activities?.length || 0), 0) || 0);
          }, 0) : 0,
          reviewsGiven: 0, // This would come from a reviews API
          favoriteSpots: Array.isArray(favorites) ? favorites.length : 0
        });

        // Load popular places
        if (Array.isArray(places) && places.length === 0) {
          if (dispatch) {
            dispatch({ type: 'SET_LOADING', payload: { places: true } });
          }
          try {
            await apiService.tourism.getPlaces({ limit: 6 });
          } catch (error) {
            console.error('Failed to load places:', error);
          }
        }
        setPopularPlaces(Array.isArray(places) ? places.slice(0, 6) : []);
      } catch (error) {
        dispatch({ type: 'SET_NOTIFICATION', payload: {
          type: 'error',
          message: 'Failed to load dashboard data'
        }});
      }
    };

    loadDashboardData();

    // Set recent activity based on saved plans
    const activity = Array.isArray(savedPlans) ? savedPlans.slice(0, 3).map((plan, index) => ({
      id: plan?.id || index + 1,
      type: 'trip',
      title: `Trip to ${plan?.province || 'Unknown'} planned`,
      description: `Created a ${plan?.duration || 'multi'}-day itinerary for ${plan?.province || 'your destination'}`,
      time: plan?.created_at ? new Date(plan.created_at).toLocaleDateString() : 'Recently',
      icon: Calendar
    })) : [];
    
    // Add some default activities if no saved plans
    const defaultActivity = [
      {
        id: 1,
        type: 'welcome',
        title: 'Welcome to MyGuide!',
        description: 'Start exploring Algeria with our AI-powered travel assistant',
        time: 'Just now',
        icon: Star
      }
    ];
    
    setRecentActivity(activity.length > 0 ? activity : defaultActivity);
  }, [savedPlans, favorites, places, dispatch]);






  const quickActions = [
    {
      title: 'Plan New Trip',
      description: 'Create a personalized itinerary',
      icon: Calendar,
      link: '/trip-planner',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      title: 'Explore Places',
      description: 'Discover amazing destinations',
      icon: MapPin,
      link: '/explore',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      title: 'Ask AI Guide',
      description: 'Get instant travel advice',
      icon: MessageCircle,
      link: '/chatbot',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    }
  ];

  const statCards = [
    {
      title: 'Total Trips',
      value: stats.totalTrips,
      icon: Navigation,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Places Visited',
      value: stats.placesVisited,
      icon: MapPin,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Reviews Given',
      value: stats.reviewsGiven,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Favorite Spots',
      value: stats.favoriteSpots,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="w-full">
      <div className="container-content py-8">
        {/* Welcome Section */}
        <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered Travel Assistant
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Welcome back, {user?.firstName || user?.name || 'Explorer'}! 👋
        </h1>
        <p className="text-xl text-muted-foreground">
          Ready to discover more amazing places in Algeria?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={stat.color} size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden">
                <Link to={action.link} className="block">
                  <CardContent className={`p-6 ${action.color} ${action.hoverColor} text-white transition-all duration-300`}>
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white bg-opacity-20 rounded-lg group-hover:bg-opacity-30 transition-all duration-300">
                        <Icon size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                        <p className="text-sm opacity-90">{action.description}</p>
                      </div>
                      <ArrowRight size={20} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile">
                  View all
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="text-primary" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <div className="flex items-center mt-1">
                        <Clock size={12} className="text-muted-foreground mr-1" />
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Popular Places */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Popular Places</span>
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/explore">
                  Explore all
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularPlaces.map((place) => (
                <div key={place.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200 cursor-pointer group">
                  <div className="relative overflow-hidden rounded-lg">
                    <img 
                      src={place.image} 
                      alt={place.name}
                      className="w-16 h-16 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate">{place.name}</h3>
                    <p className="text-sm text-muted-foreground">{place.location}</p>
                    <div className="flex items-center mt-1">
                      <Star className="text-yellow-400 fill-current" size={14} />
                      <span className="text-sm text-muted-foreground ml-1">
                        {place.rating} ({place.reviews} reviews)
                      </span>
                    </div>
                  </div>
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
                    {place.category}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <Card className="mt-8 border-0 bg-gradient-to-r from-primary to-primary/90">
        <CardContent className="p-8 text-center text-primary-foreground">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Ready for Your Next Adventure?</h2>
          </div>
          <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto text-lg">
            Let our AI-powered trip planner create the perfect itinerary for your next journey through Algeria.
          </p>
          <Button size="lg" variant="secondary" asChild className="font-semibold">
            <Link to="/trip-planner" className="inline-flex items-center">
              Plan Your Trip
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </CardContent>
      </Card>
      
      {/* Footer */}
      <footer className="mt-12 border-t pt-8">
        <div className="text-center text-sm text-muted-foreground">
          <p>Developed & maintained by Slimene Fellah — Available for freelance work at <a href="https://slimenefellah.dev" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">slimenefellah.dev</a></p>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default Dashboard;