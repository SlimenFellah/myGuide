/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { useAuth } from '../store/hooks';
import { addNotification } from '../store/slices/appSlice';
import { tripPlannerService } from '../services';
import TripDetailsWithMapModal from '../components/TripDetailsWithMapModal';
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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Skeleton
} from '@mui/material';
import {
  LocationOn as MapPin,
  People as Users,
  AttachMoney as DollarSign,
  CalendarToday as Calendar,
  AccessTime,
  Visibility as Eye,
  Delete as Trash2,
  Share,
  Download,
  MoreVert,
  Add as Plus,
  FilterList,
  Search,
  TravelExplore as Compass
} from '@mui/icons-material';

const MyTripsPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTripForMenu, setSelectedTripForMenu] = useState(null);
  const [error, setError] = useState(null);

  // Load trips on component mount
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadTrips();
    }
  }, [isAuthenticated, authLoading]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tripPlannerService.getTripPlans();
      
      if (response.success) {
        setTrips(response.data.results || response.data || []);
      } else {
        setError(response.error || 'Failed to load trips');
        dispatch(addNotification({
          type: 'error',
          message: response.error || 'Failed to load trips'
        }));
      }
    } catch (error) {
      console.error('Error loading trips:', error);
      setError('Failed to load trips');
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to load trips'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (trip) => {
    setSelectedTrip(trip);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedTrip(null);
  };

  const handleMenuOpen = (event, trip) => {
    setAnchorEl(event.currentTarget);
    setSelectedTripForMenu(trip);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTripForMenu(null);
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      const response = await tripPlannerService.deleteTripPlan(tripId);
      
      if (response.success) {
        setTrips(trips.filter(trip => trip.id !== tripId));
        dispatch(addNotification({
          type: 'success',
          message: 'Trip deleted successfully'
        }));
      } else {
        dispatch(addNotification({
          type: 'error',
          message: response.error || 'Failed to delete trip'
        }));
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to delete trip'
      }));
    }
    handleMenuClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTripTypeColor = (tripType) => {
    const colors = {
      'cultural': 'primary',
      'adventure': 'success',
      'relaxation': 'info',
      'family': 'warning',
      'historical': 'secondary',
      'culinary': 'error',
      'photography': 'default',
      'business': 'default'
    };
    return colors[tripType] || 'default';
  };

  const getTripTypeIcon = (tripType) => {
    const icons = {
      'cultural': '🏛️',
      'adventure': '🏔️',
      'relaxation': '🧘',
      'family': '👨‍👩‍👧‍👦',
      'historical': '🏺',
      'culinary': '🍽️',
      'photography': '📸',
      'business': '💼'
    };
    return icons[tripType] || '✈️';
  };

  const renderTripCard = (trip) => (
    <Grid item xs={12} sm={6} md={4} key={trip.id}>
      <Card 
        sx={{ 
          height: '480px', // Fixed height for all cards
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {trip.title || `${trip.destination || 'Trip'} Adventure`}
            </Typography>
            <IconButton 
              size="small" 
              onClick={(e) => handleMenuOpen(e, trip)}
              sx={{ ml: 1 }}
            >
              <MoreVert />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <span style={{ fontSize: '20px' }}>{getTripTypeIcon(trip.trip_type)}</span>
            <Chip 
              label={trip.trip_type?.replace('_', ' ').toUpperCase() || 'TRIP'}
              size="small"
              color={getTripTypeColor(trip.trip_type)}
              variant="outlined"
            />
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapPin size={16} color="#666" />
              <Typography variant="body2" color="text.secondary">
                {trip.destination || trip.province?.name || 'Unknown Destination'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Calendar size={16} color="#666" />
              <Typography variant="body2" color="text.secondary">
                {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTime size={16} color="#666" />
              <Typography variant="body2" color="text.secondary">
                {trip.duration_days || 'N/A'} days
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Users size={16} color="#666" />
              <Typography variant="body2" color="text.secondary">
                {trip.group_size || 1} {(trip.group_size || 1) === 1 ? 'person' : 'people'}
              </Typography>
            </Box>
            
            {trip.estimated_cost && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DollarSign size={16} color="#666" />
                <Typography variant="body2" color="text.secondary">
                  ${trip.estimated_cost}
                </Typography>
              </Box>
            )}
          </Box>
          
          {/* Description with fixed height */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'flex-start',
            minHeight: '72px', // Fixed height for 3 lines
            mb: 2
          }}>
            {trip.ai_description && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.4,
                  height: '100%'
                }}
              >
                {trip.ai_description}
              </Typography>
            )}
          </Box>
        </CardContent>
        
        <CardActions sx={{ p: 2, pt: 0, mt: 'auto' }}>
          <Button 
            size="small" 
            variant="contained"
            onClick={() => handleViewDetails(trip)}
            startIcon={<Eye />}
            sx={{ mr: 1 }}
          >
            View Details
          </Button>
          <Button 
            size="small" 
            variant="outlined"
            startIcon={<Share />}
          >
            Share
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  const renderTripDetails = () => {
    return (
      <TripDetailsWithMapModal
        trip={selectedTrip}
        isOpen={detailsOpen}
        onClose={handleCloseDetails}
      />
    );
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Compass size={60} color="warning" style={{ marginBottom: 16 }} />
            <Typography variant="h5" sx={{ mb: 2 }}>Authentication Required</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Please log in to view your trips.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/login')}
              sx={{ px: 4 }}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
          My Trips
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Manage and view all your saved travel plans
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" color="text.secondary">
              {trips.length} {trips.length === 1 ? 'trip' : 'trips'} found
            </Typography>
            {user?.is_staff && (
              <Chip 
                label="Admin View" 
                color="secondary" 
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => navigate('/trip-planner')}
            sx={{ 
              background: 'linear-gradient(45deg, #1976d2, #1565c0)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0, #0d47a1)'
              }
            }}
          >
            Plan New Trip
          </Button>
        </Box>
      </Box>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="80%" height={32} />
                  <Skeleton variant="text" width="60%" height={24} sx={{ mt: 1 }} />
                  <Skeleton variant="rectangular" width="100%" height={100} sx={{ mt: 2 }} />
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Skeleton variant="rectangular" width={80} height={32} />
                    <Skeleton variant="rectangular" width={80} height={32} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {!loading && trips.length === 0 && !error && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Compass size={80} color="#ccc" style={{ marginBottom: 24 }} />
            <Typography variant="h5" sx={{ mb: 2, color: 'text.secondary' }}>
              No Trips Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Start planning your first adventure with our AI trip planner!
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Plus />}
              onClick={() => navigate('/trip-planner')}
              sx={{ 
                px: 4,
                background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0, #0d47a1)'
                }
              }}
            >
              Plan Your First Trip
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Trips Grid */}
      {!loading && trips.length > 0 && (
        <Grid container spacing={3}>
          {trips.map(renderTripCard)}
        </Grid>
      )}

      {/* Trip Details Modal */}
      {renderTripDetails()}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleViewDetails(selectedTripForMenu);
          handleMenuClose();
        }}>
          <Eye sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Share sx={{ mr: 1 }} />
          Share
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Download sx={{ mr: 1 }} />
          Export
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => handleDeleteTrip(selectedTripForMenu?.id)}
          sx={{ color: 'error.main' }}
        >
          <Trash2 sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default MyTripsPage;