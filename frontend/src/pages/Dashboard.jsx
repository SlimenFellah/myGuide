/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  Navigation
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTrips: 0,
    placesVisited: 0,
    reviewsGiven: 0,
    favoriteSpots: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [popularPlaces, setPopularPlaces] = useState([]);

  useEffect(() => {
    // Simulate loading user stats and data
    // In real app, this would be API calls
    setStats({
      totalTrips: 3,
      placesVisited: 12,
      reviewsGiven: 8,
      favoriteSpots: 5
    });

    setRecentActivity([
      {
        id: 1,
        type: 'trip',
        title: 'Trip to Algiers planned',
        description: 'Created a 3-day itinerary for Algiers',
        time: '2 hours ago',
        icon: Calendar
      },
      {
        id: 2,
        type: 'review',
        title: 'Reviewed Casbah of Algiers',
        description: 'Gave 5 stars to this historic site',
        time: '1 day ago',
        icon: Star
      },
      {
        id: 3,
        type: 'favorite',
        title: 'Added to favorites',
        description: 'Saved Tassili n\'Ajjer National Park',
        time: '2 days ago',
        icon: Heart
      }
    ]);

    setPopularPlaces([
      {
        id: 1,
        name: 'Casbah of Algiers',
        location: 'Algiers',
        rating: 4.8,
        reviews: 234,
        image: '/assets/427318025.png',
        category: 'Historic Site'
      },
      {
        id: 2,
        name: 'Tassili n\'Ajjer',
        location: 'Illizi',
        rating: 4.9,
        reviews: 156,
        image: '/assets/427318025.png',
        category: 'National Park'
      },
      {
        id: 3,
        name: 'Timgad Ruins',
        location: 'Batna',
        rating: 4.7,
        reviews: 189,
        image: '/assets/427318025.png',
        category: 'Archaeological Site'
      }
    ]);
  }, []);

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
    <div className="container py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName || 'Explorer'}! 👋
        </h1>
        <p className="text-gray-600">
          Ready to discover more amazing places in Algeria?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={stat.color} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.link}
                className={`card ${action.color} ${action.hoverColor} text-white transition-all duration-300 hover:shadow-lg hover:scale-105`}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                  <ArrowRight size={20} className="opacity-70" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <Link 
              to="/profile" 
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Icon className="text-primary-600" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <div className="flex items-center mt-1">
                      <Clock size={12} className="text-gray-400 mr-1" />
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Places */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Popular Places</h2>
            <Link 
              to="/explore" 
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Explore all
            </Link>
          </div>
          
          <div className="space-y-4">
            {popularPlaces.map((place) => (
              <div key={place.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                <img 
                  src={place.image} 
                  alt={place.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{place.name}</h3>
                  <p className="text-sm text-gray-600">{place.location}</p>
                  <div className="flex items-center mt-1">
                    <Star className="text-yellow-400 fill-current" size={14} />
                    <span className="text-sm text-gray-600 ml-1">
                      {place.rating} ({place.reviews} reviews)
                    </span>
                  </div>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {place.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Ready for Your Next Adventure?</h2>
        <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
          Let our AI-powered trip planner create the perfect itinerary for your next journey through Algeria.
        </p>
        <Link 
          to="/trip-planner" 
          className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center"
        >
          Plan Your Trip
          <ArrowRight className="ml-2" size={20} />
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;