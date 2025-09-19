/*
 * Developed & maintained by Slimene Fellah — Available for freelance work at slimenefellah.dev
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../store/hooks';
import { apiService } from '../services';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Divider,
  Rating,
  LinearProgress
} from '@mui/material';
import { CalendarToday as Calendar } from '@mui/icons-material';
import {
  MapPin,
  MessageCircle,
  Star,
  TrendingUp,
  Users,
  ArrowRight,
  Heart,
  Navigation,
  Sparkles,
  Activity as Timeline,
  Plus as Add,
  Compass as Explore,
  MessageSquare as Chat
} from 'lucide-react';
import { Clock } from 'lucide-react';
import TripDetailsModal from '../components/TripDetailsModal';

const Dashboard = () => {
  const user = useCurrentUser();
  // TODO: Replace with Redux state management for trips, favorites, and places
  const savedPlans = [];
  const favorites = [];
  const places = [];
  const [stats, setStats] = useState({
    totalTrips: 0,
    placesVisited: 0,
    reviewsGiven: 0,
    favoriteSpots: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [popularPlaces, setPopularPlaces] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);

  useEffect(() => {
    // Load dashboard data
    const loadDashboardData = async () => {
      try {
        // TODO: Implement Redux actions for fetching saved plans and places
        // For now, set empty popular places
        setPopularPlaces([]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    loadDashboardData();
  }, []);

  // Initialize stats and recent activity once since data is currently static
  useEffect(() => {
    // Calculate stats from context state with safe defaults
    setStats({
      totalTrips: Array.isArray(savedPlans) ? savedPlans.length : 0,
      placesVisited: Array.isArray(savedPlans) ? savedPlans.reduce((total, plan) => {
        return total + (plan?.daily_plans?.reduce((dayTotal, day) => dayTotal + (day?.activities?.length || 0), 0) || 0);
      }, 0) : 0,
      reviewsGiven: 0, // This would come from a reviews API
      favoriteSpots: Array.isArray(favorites) ? favorites.length : 0
    });

    // Set recent activity based on saved plans
    const activity = Array.isArray(savedPlans) ? savedPlans.slice(0, 3).map((plan, index) => ({
      id: plan?.id || index + 1,
      type: 'trip',
      title: `Trip to ${plan?.province || 'Unknown'} planned`,
      description: `Created a ${plan?.duration_days || 'multi'}-day itinerary for ${plan?.province || 'your destination'}`,
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
  }, []); // Empty dependency array since savedPlans and favorites are static






  const quickActions = [
    {
      title: 'Plan New Trip',
      description: 'Create a personalized itinerary',
      icon: Add,
      link: '/trip-planner',
      color: 'primary'
    },
    {
      title: 'Explore Places',
      description: 'Discover amazing destinations',
      icon: Explore,
      link: '/explore',
      color: 'success'
    },
    {
      title: 'Ask AI Guide',
      description: 'Get instant travel advice',
      icon: Chat,
      link: '/chatbot',
      color: 'secondary'
    }
  ];

  const statCards = [
    {
      title: 'Total Trips',
      value: stats.totalTrips,
      icon: Navigation,
      color: 'primary'
    },
    {
      title: 'Places Visited',
      value: stats.placesVisited,
      icon: MapPin,
      color: 'success'
    },
    {
      title: 'Reviews Given',
      value: stats.reviewsGiven,
      icon: Star,
      color: 'warning'
    },
    {
      title: 'Favorite Spots',
      value: stats.favoriteSpots,
      icon: Heart,
      color: 'error'
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4, width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, width: '100%' }}>
          <Chip 
            icon={<Sparkles />} 
            label="AI-Powered Travel Assistant" 
            color="primary" 
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' } }}>
          Welcome back, {user?.firstName || user?.name || 'Explorer'}! 👋
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          Ready to discover more amazing places in Algeria?
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4, width: '100%' }}>
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Grid item xs={12} sm={6} md={6} lg={6} xl={3} key={index}>
              <Card sx={{ height: '100%', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: `${stat.color}.light`, color: `${stat.color}.main` }}>
                      <IconComponent />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 4, width: '100%' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>Quick Actions</Typography>
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ width: '100%' }}>
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Grid item xs={12} sm={12} md={6} lg={4} key={index}>
                <Card 
                  component={Link} 
                  to={action.link} 
                  sx={{ 
                    height: '100%', 
                    textDecoration: 'none', 
                    transition: 'all 0.3s', 
                    '&:hover': { 
                      transform: 'translateY(-4px)', 
                      boxShadow: 4 
                    } 
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: `${action.color}.main`, 
                        width: 56, 
                        height: 56, 
                        mx: 'auto', 
                        mb: 2 
                      }}
                    >
                      <IconComponent sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Recent Activity */}
      <Box sx={{ mb: 4, width: '100%' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>Recent Activity</Typography>
          <Card>
            <CardContent sx={{ p: 0 }}>
              {recentActivity.length > 0 ? (
                <List>
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <ListItem key={activity.id} sx={{ py: 2 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                            <Icon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={activity.title}
                          secondary={
                            <>
                              <Typography variant="body2" color="text.secondary" component="span" display="block">
                                {activity.description}
                              </Typography>
                              <Box component="span" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <Clock sx={{ fontSize: 12, mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {activity.time}
                                </Typography>
                              </Box>
                            </>
                          }
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Timeline sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary">No recent activity</Typography>
                </Box>
              )}
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
              <Button size="small" component={Link} to="/profile">
                View all
              </Button>
            </CardActions>
          </Card>
        </Box>

        {/* Popular Places */}
        <Box sx={{ mb: 4, width: '100%' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>Popular Places</Typography>
          <Card>
            <CardContent sx={{ p: 0 }}>
              {popularPlaces.length > 0 ? (
                <List>
                  {popularPlaces.slice(0, 3).map((place, index) => (
                    <ListItem key={place.id || index} sx={{ py: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                      <ListItemAvatar>
                        <Avatar 
                          src={place.main_image || '/api/placeholder/400/300'} 
                          alt={place.name}
                          sx={{ width: 60, height: 60, borderRadius: 2 }}
                          variant="rounded"
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={place.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {place.location}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Rating value={place.rating} readOnly size="small" sx={{ mr: 1 }} />
                              <Typography variant="caption" color="text.secondary">
                                {place.rating} ({place.reviews} reviews)
                              </Typography>
                            </Box>
                          </Box>
                        }
                        primaryTypographyProps={{ fontWeight: 600 }}
                        sx={{ ml: 2 }}
                      />
                      <ListItemSecondaryAction>
                        <Chip 
                          label={place.category} 
                          size="small" 
                          variant="outlined"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <MapPin sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary">No popular places available</Typography>
                </Box>
              )}
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
              <Button size="small" component={Link} to="/explore">
                Explore more
              </Button>
            </CardActions>
          </Card>
        </Box>

      {/* Saved Trips Section */}
      {savedPlans && savedPlans.length > 0 && (
        <Box sx={{ mb: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, width: '100%' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
              <Calendar sx={{ mr: 1 }} />
              Your Saved Trips
            </Typography>
            <Button variant="text" size="small">
              View all ({savedPlans.length})
            </Button>
          </Box>
          <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ width: '100%' }}>
            {savedPlans.slice(0, 6).map((tripPlan) => {
              return (
                <Grid item xs={12} sm={12} md={6} lg={4} key={tripPlan.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      cursor: 'pointer', 
                      transition: 'all 0.3s', 
                      '&:hover': { 
                        transform: 'translateY(-4px)', 
                        boxShadow: 4 
                      } 
                    }}
                    onClick={() => {
                      setSelectedTrip(tripPlan);
                      setIsTripModalOpen(true);
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }} noWrap>
                            {tripPlan.title || `Trip to ${tripPlan.province}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            {tripPlan.province} • {tripPlan.duration_days || 'Multi'} days
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {tripPlan.created_at ? new Date(tripPlan.created_at).toLocaleDateString() : 'Recently'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <MapPin sx={{ fontSize: 12, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {tripPlan.trip_type || 'Adventure'}
                          </Typography>
                        </Box>
                        
                        {tripPlan.estimated_cost && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="caption" sx={{ mr: 0.5 }}>💰</Typography>
                            <Typography variant="caption" color="text.secondary">
                              ${tripPlan.estimated_cost}
                            </Typography>
                          </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ mr: 0.5 }}>👥</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {tripPlan.group_size || 1} {tripPlan.group_size === 1 ? 'person' : 'people'}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Divider sx={{ mb: 2 }} />
                      <Button 
                        size="small" 
                        variant="outlined" 
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTrip(tripPlan);
                          setIsTripModalOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          
          {savedPlans.length === 0 && (
            <Paper sx={{ textAlign: 'center', py: 8 }}>
              <Calendar sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                No saved trips yet
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Start planning your first trip to see it here!
              </Typography>
              <Button variant="contained" component={Link} to="/trip-planner" startIcon={<Add />}>
                Plan Your First Trip
              </Button>
            </Paper>
          )}
        </Box>
      )}

      {/* CTA Section */}
      <Paper 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          textAlign: 'center', 
          p: 6, 
          mb: 4 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Sparkles sx={{ mr: 1 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Ready for Your Next Adventure?
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: '600px', mx: 'auto' }}>
          Let our AI-powered trip planner create the perfect itinerary for your next journey through Algeria.
        </Typography>
        <Button 
          size="large" 
          variant="contained" 
          sx={{ 
            bgcolor: 'white', 
            color: 'primary.main', 
            fontWeight: 'bold',
            '&:hover': { bgcolor: 'grey.100' } 
          }}
          component={Link} 
          to="/trip-planner"
          endIcon={<ArrowRight />}
        >
          Plan Your Trip
        </Button>
      </Paper>
      
      {/* Trip Details Modal */}
      <TripDetailsModal 
        trip={selectedTrip}
        isOpen={isTripModalOpen}
        onClose={() => {
          setIsTripModalOpen(false);
          setSelectedTrip(null);
        }}
      />

      {/* Footer */}
      <Box sx={{ mt: 6, pt: 4, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Developed & maintained by Slimene Fellah — Available for freelance work at{' '}
          <Box 
            component="a" 
            href="https://slimenefellah.dev" 
            target="_blank" 
            rel="noopener noreferrer"
            sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            slimenefellah.dev
          </Box>
        </Typography>
      </Box>
    </Container>
  );
};

export default Dashboard;