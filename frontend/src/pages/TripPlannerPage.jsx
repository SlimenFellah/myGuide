/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { useProvinces, useActiveTrip, useGeneratedPlan, useTripPlannerLoading, useSavedPlans, useTripPlannerFormData, useAuth } from '../store/hooks';
import { fetchProvinces } from '../store/slices/tourismSlice';
import { generateTripPlan, saveTripPlan, updateTripPlannerData } from '../store/slices/tripPlannerSlice';
import { addNotification } from '../store/slices/appSlice';
import { apiService } from '../services';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  LinearProgress,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  InputAdornment
} from '@mui/material';
import { CalendarToday as Calendar, AccessTime } from '@mui/icons-material';
import {
  LocationOn as MapPin,
  People as Users,
  AttachMoney as DollarSign,
  Favorite as Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  Download,
  Share,
  AutoAwesome as Sparkles,
  ErrorOutline as AlertCircle,
  CheckCircle,
  Refresh as Loader2
} from '@mui/icons-material';
import tripPlannerImage from '../assets/448618032.png';

const TripPlannerPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const provinces = useProvinces() || [];
  const currentPlan = useGeneratedPlan();
  const isGenerating = useTripPlannerLoading();
  const savedTrips = useSavedPlans();
  const formData = useTripPlannerFormData();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDay, setSelectedDay] = useState(0);
  

  // Load provinces on component mount only when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const loadProvinces = async () => {
        if (!provinces || provinces.length === 0) {
          dispatch(fetchProvinces());
        }
      };
      loadProvinces();
    }
  }, [dispatch, provinces, isAuthenticated, authLoading]);
  
  const provinceNames = (provinces && provinces.length > 0) 
    ? provinces.map(p => p.name) 
    : ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Batna', 'Tlemcen', 
       'Sétif', 'Béjaïa', 'Tizi Ouzou', 'Blida', 'Skikda', 'Mostaganem'];

  const tripTypes = [
    { id: 'cultural', name: 'Cultural Heritage', icon: '🏛️', description: 'Explore history and traditions' },
    { id: 'adventure', name: 'Adventure & Nature', icon: '🏔️', description: 'Outdoor activities and exploration' },
    { id: 'relaxation', name: 'Relaxation & Wellness', icon: '🧘', description: 'Rest and rejuvenation' },
    { id: 'family', name: 'Family Fun', icon: '👨‍👩‍👧‍👦', description: 'Kid-friendly adventures' },
    { id: 'historical', name: 'Historical Sites', icon: '🏺', description: 'Ancient monuments and heritage' },
    { id: 'culinary', name: 'Culinary Experience', icon: '🍽️', description: 'Food and dining adventures' },
    { id: 'photography', name: 'Photography Tour', icon: '📸', description: 'Capture beautiful moments' },
    { id: 'business', name: 'Business Travel', icon: '💼', description: 'Professional trips with leisure' }
  ];

  const preferenceOptions = [
    { key: 'quietPlaces', label: 'Quiet Places', icon: '🤫' },
    { key: 'restaurants', label: 'Local Restaurants', icon: '🍽️' },
    { key: 'parks', label: 'Parks & Nature', icon: '🌳' },
    { key: 'historicSites', label: 'Historic Sites', icon: '🏛️' },
    { key: 'entertainment', label: 'Entertainment', icon: '🎭' },
    { key: 'shopping', label: 'Shopping', icon: '🛍️' }
  ];

  const handleInputChange = (field, value) => {
    // Update Redux store
    dispatch(updateTripPlannerData({ [field]: value }));
  };

  const handlePreferenceChange = (preference) => {
    console.log('Preference button clicked:', preference);
    console.log('Current preferences before change:', formData.preferences);
    
    const newPreferences = {
      ...formData.preferences,
      [preference]: !formData.preferences[preference]
    };
    console.log('New preferences after change:', newPreferences);
    
    // Update Redux store
    dispatch(updateTripPlannerData({ preferences: newPreferences }));
  };

  const generateTrip = async () => {
    if (!formData.province || !formData.tripType || !formData.startDate || !formData.endDate || !formData.budget || !formData.groupSize) {
      dispatch(addNotification({
        type: 'error',
        message: 'Please fill in all required fields'
      }));
      return;
    }

    // Validate group size
    if (formData.groupSize < 1 || formData.groupSize > 20) {
      dispatch(addNotification({
        type: 'error',
        message: 'Group size must be between 1 and 20 people'
      }));
      return;
    }

    // Map frontend data to backend expected format
    const tripData = {
      destination: formData.province, // Province name as destination
      trip_type: formData.tripType,
      start_date: formData.startDate,
      end_date: formData.endDate,
      budget: parseFloat(formData.budget),
      budget_currency: 'USD', // Default currency
      group_size: formData.groupSize,
      interests: Object.keys(formData.preferences).filter(key => formData.preferences[key]), // Convert preferences to interests array
      accommodation_preference: 'mid-range', // Valid choice: budget, mid-range, luxury
      activity_level: 'moderate', // Valid choice: low, moderate, high
      special_requirements: [formData.allergies, formData.additionalNotes].filter(Boolean).join('. ') // Combine allergies and notes
    };

    console.log('Sending trip data:', tripData);
    
    // Show loading state
    setCurrentStep(3.5); // Intermediate loading step
    
    try {
      const result = await dispatch(generateTripPlan(tripData)).unwrap();
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        message: `Trip plan "${result.title}" generated successfully!`
      }));
      
      setCurrentStep(4);
    } catch (error) {
      console.error('Error generating trip:', error);
      
      // Show detailed error notification
      const errorMessage = error.message || 'Failed to generate trip plan. Please try again.';
      dispatch(addNotification({
        type: 'error',
        message: errorMessage
      }));
      
      // Go back to step 3 to allow retry
      setCurrentStep(3);
    }
  };

  const calculateDuration = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const canProceed = (step) => {
    switch (step) {
      case 1:
        return formData.province && formData.tripType;
      case 2:
        return formData.startDate && formData.endDate && formData.budget;
      case 3:
        const hasPreferences = Object.values(formData.preferences).some(Boolean);
        console.log('Step 3 validation - preferences:', formData.preferences, 'hasPreferences:', hasPreferences);
        return hasPreferences;
      default:
        return true;
    }
  };



  const renderStep1 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" component="h2" sx={{ 
          fontWeight: 'bold', 
          background: 'linear-gradient(45deg, #1976d2, #1565c0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1.5
        }}>
          Where would you like to go?
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Choose your destination and trip type
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)' }}>
            <CardHeader>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Select Province
              </Typography>
            </CardHeader>
            <CardContent>
              <FormControl fullWidth>
                <InputLabel>Choose a province...</InputLabel>
                <Select
                  value={formData.province}
                  onChange={(e) => handleInputChange('province', e.target.value)}
                  label="Choose a province..."
                >
                  <MenuItem value="">Choose a province...</MenuItem>
                  {provinceNames.map((province) => (
                    <MenuItem key={province} value={province}>{province}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)' }}>
            <CardHeader>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Trip Type
              </Typography>
            </CardHeader>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {tripTypes.map((type) => (
                  <Button
                    key={type.id}
                    onClick={() => handleInputChange('tripType', type.id)}
                    variant={formData.tripType === type.id ? "contained" : "outlined"}
                    sx={{
                      p: 2,
                      height: 'auto',
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      ...(formData.tripType === type.id ? {
                        background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1565c0, #0d47a1)'
                        }
                      } : {
                        borderColor: 'grey.300',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: 'primary.50'
                        }
                      })
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography sx={{ fontSize: '1.5rem' }}>{type.icon}</Typography>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {type.name}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          {type.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Button>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderStep2 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" component="h2" sx={{ 
          fontWeight: 'bold', 
          background: 'linear-gradient(45deg, #1976d2, #1565c0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1.5
        }}>
          Trip Details
        </Typography>
        <Typography variant="h6" color="text.secondary">
          When are you traveling and what's your budget?
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)' }}>
            <CardHeader>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Travel Information
              </Typography>
            </CardHeader>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
              />
              
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: formData.startDate || new Date().toISOString().split('T')[0] }}
              />
              
              <TextField
                fullWidth
                type="number"
                label="Total Budget (USD)"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                placeholder="500"
                variant="outlined"
                inputProps={{ min: 0 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DollarSign size={20} />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                fullWidth
                type="number"
                label="Group Size"
                value={formData.groupSize}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  const constrainedValue = Math.min(Math.max(value, 1), 20);
                  handleInputChange('groupSize', constrainedValue);
                }}
                variant="outlined"
                inputProps={{ min: 1, max: 20 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Users size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}>
            <CardHeader>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                Trip Summary
              </Typography>
            </CardHeader>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.6)' }}>
                  <Typography sx={{ color: 'text.primary', fontWeight: 500 }}>Duration:</Typography>
                  <Typography sx={{ fontWeight: 600, color: 'primary.dark' }}>{calculateDuration()} day{calculateDuration() !== 1 ? 's' : ''}</Typography>
                </Paper>
                <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.6)' }}>
                  <Typography sx={{ color: 'text.primary', fontWeight: 500 }}>Province:</Typography>
                  <Typography sx={{ fontWeight: 600, color: 'primary.dark' }}>{formData.province || 'Not selected'}</Typography>
                </Paper>
                <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.6)' }}>
                  <Typography sx={{ color: 'text.primary', fontWeight: 500 }}>Trip Type:</Typography>
                  <Typography sx={{ fontWeight: 600, color: 'primary.dark' }}>{formData.tripType || 'Not selected'}</Typography>
                </Paper>
                <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.6)' }}>
                  <Typography sx={{ color: 'text.primary', fontWeight: 500 }}>Budget:</Typography>
                  <Typography sx={{ fontWeight: 600, color: 'primary.dark' }}>{formData.budget ? `$${formData.budget}` : 'Not set'}</Typography>
                </Paper>
                <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.6)' }}>
                  <Typography sx={{ color: 'text.primary', fontWeight: 500 }}>Travelers:</Typography>
                  <Typography sx={{ fontWeight: 600, color: 'primary.dark' }}>{formData.groupSize || 'Not set'}</Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderStep3 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" component="h2" sx={{ 
          fontWeight: 'bold', 
          background: 'linear-gradient(45deg, #1976d2, #1565c0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1.5
        }}>
          Your Preferences
        </Typography>
        <Typography variant="h6" color="text.secondary">
          What kind of experiences are you looking for?
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Card sx={{ boxShadow: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)' }}>
          <CardHeader>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Select your interests
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Choose all that apply
            </Typography>
          </CardHeader>
          <CardContent>
            <Grid container spacing={2}>
              {preferenceOptions.map((option) => {
                const isSelected = formData.preferences[option.key];
                return (
                  <Grid item xs={6} md={4} key={option.key}>
                    <Button
                      onClick={() => handlePreferenceChange(option.key)}
                      variant={isSelected ? "contained" : "outlined"}
                      sx={{
                        p: 2,
                        height: 'auto',
                        width: '100%',
                        flexDirection: 'column',
                        gap: 1,
                        textTransform: 'none',
                        ...(isSelected ? {
                          background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1565c0, #0d47a1)'
                          }
                        } : {
                          borderColor: 'grey.300',
                          '&:hover': {
                            borderColor: 'primary.main',
                            backgroundColor: 'primary.50'
                          }
                        })
                      }}
                    >
                      <Typography sx={{ fontSize: '1.5rem' }}>{option.icon}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {option.label}
                      </Typography>
                    </Button>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)' }}>
              <CardHeader>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Dietary Information
                </Typography>
              </CardHeader>
              <CardContent>
                <TextField
                  fullWidth
                  label="Dietary Restrictions/Allergies"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  placeholder="e.g., Nuts, Gluten, Vegetarian..."
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)' }}>
              <CardHeader>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Special Requests
                </Typography>
              </CardHeader>
              <CardContent>
                <TextField
                  fullWidth
                  label="Special Requests or Notes"
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  placeholder="Any special requests or preferences..."
                  multiline
                  rows={4}
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );

  const renderGenerating = () => (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <Card sx={{ boxShadow: 4, background: 'linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)', maxWidth: 600, mx: 'auto' }}>
        <CardContent sx={{ p: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Box sx={{ position: 'relative' }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 3
              }}>
                <Loader2 sx={{ width: 40, height: 40, color: 'white', animation: 'spin 1s linear infinite' }} />
              </Box>
              <Box sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                opacity: 0.2,
                animation: 'ping 2s infinite'
              }} />
            </Box>
          </Box>
          
          <Typography variant="h4" component="h2" sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #1976d2, #0d47a1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}>
            Creating Your Perfect Trip
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4 }}>
            Our AI is analyzing your preferences and crafting a personalized itinerary...
          </Typography>
          
          <Box sx={{ maxWidth: 400, mx: 'auto' }}>
            <LinearProgress 
              variant="determinate"
              value={75}
              sx={{
                height: 12,
                borderRadius: 6,
                mb: 2,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                  borderRadius: 6,
                  boxShadow: 1
                }
              }}
            />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              This usually takes 30-60 seconds
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const renderTripPlan = () => {
    if (!currentPlan) return null;
    
    const currentDay = currentPlan.daily_plans[selectedDay];
    
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Plan Header */}
        <Card sx={{ boxShadow: 4, background: 'linear-gradient(45deg, #1976d2, #1565c0)', color: 'white' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Your {currentPlan.province} Adventure
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {currentPlan.duration} days • {tripTypes.find(t => t.id === currentPlan.trip_type)?.name}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Total Budget
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  ${currentPlan.total_cost}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<Download />}
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.3)', 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                    borderColor: 'rgba(255,255,255,0.5)'
                  }
                }}
              >
                Export
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<Share />}
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.3)', 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                    borderColor: 'rgba(255,255,255,0.5)'
                  }
                }}
              >
                Share
              </Button>
            </Box>
          </CardContent>
        </Card>
        
        {/* Day Navigation */}
        <Card sx={{ boxShadow: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Daily Itinerary
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
                  disabled={selectedDay === 0}
                  variant="outlined"
                  size="small"
                  sx={{ 
                    p: 1, 
                    minWidth: 'auto',
                    borderColor: 'grey.300',
                    '&:disabled': { opacity: 0.5 },
                    '&:hover': { bgcolor: 'grey.50' }
                  }}
                >
                  <ChevronLeft size={16} />
                </Button>
                <Box sx={{ 
                  px: 2, 
                  py: 1, 
                  bgcolor: 'primary.50', 
                  color: 'primary.main', 
                  borderRadius: 2, 
                  fontWeight: 500 
                }}>
                  Day {selectedDay + 1} of {currentPlan.duration}
                </Box>
                <Button
                  onClick={() => setSelectedDay(Math.min(currentPlan.daily_plans.length - 1, selectedDay + 1))}
                  disabled={selectedDay === currentPlan.daily_plans.length - 1}
                  variant="outlined"
                  size="small"
                  sx={{ 
                    p: 1, 
                    minWidth: 'auto',
                    borderColor: 'grey.300',
                    '&:disabled': { opacity: 0.5 },
                    '&:hover': { bgcolor: 'grey.50' }
                  }}
                >
                  <ChevronRight size={16} />
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        {/* Current Day Details */}
        <Card sx={{ boxShadow: 4, background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)' }}>
          <CardHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {new Date(currentDay.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                <DollarSign size={16} style={{ marginRight: 4 }} />
                <Typography variant="body2">
                  Daily budget: ${currentDay.total_cost}
                </Typography>
              </Box>
            </Box>
          </CardHeader>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {currentDay.activities.map((activity, index) => (
                <Card key={activity.id} sx={{ borderLeft: 4, borderColor: 'primary.main', boxShadow: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ flexShrink: 0 }}>
                        <Avatar sx={{ 
                          width: 32, 
                          height: 32, 
                          bgcolor: 'primary.main', 
                          color: 'white', 
                          fontSize: '0.875rem',
                          fontWeight: 600
                        }}>
                          {index + 1}
                        </Avatar>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {activity.place?.name || activity.name}
                          </Typography>
                          <Chip 
                            label={activity.place?.category || activity.category}
                            size="small"
                            sx={{ bgcolor: 'white', color: 'text.secondary' }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                          {activity.place?.description || activity.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTime size={14} style={{ marginRight: 4 }} />
                            <Typography variant="body2">
                              {activity.start_time} ({activity.duration} hours)
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <DollarSign size={14} style={{ marginRight: 4 }} />
                            <Typography variant="body2">
                              ${activity.estimated_cost}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <MapPin size={14} style={{ marginRight: 4 }} />
                            <Typography variant="body2">
                              View on map
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>
        
        {/* Action Buttons */}
        <Card sx={{ boxShadow: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button 
                onClick={() => {
                  setCurrentStep(1);
                  dispatch({ type: 'CLEAR_CURRENT_PLAN' });
                  setSelectedDay(0);
                }}
                variant="outlined"
                sx={{ 
                  px: 4, 
                  py: 1.5, 
                  borderColor: 'grey.300', 
                  '&:hover': { 
                    borderColor: 'primary.main', 
                    bgcolor: 'primary.50' 
                  }
                }}
              >
                Plan Another Trip
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    // Transform currentPlan to match TripPlanCreateSerializer format
                    const startDate = new Date(currentPlan.start_date);
                    const endDate = new Date(currentPlan.end_date);
                    const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                    
                    // Find province ID based on province name
                    const provinceName = currentPlan.destination || currentPlan.province;
                    const provincesArray = Array.isArray(provinces) ? provinces : [];
                    const province = provincesArray.find(p => p.name === provinceName);
                    const provinceId = province ? province.id : (provincesArray.length > 0 ? provincesArray[0].id : 1);
                    
                    const planData = {
                      title: currentPlan.title || `${currentPlan.destination || currentPlan.province} Trip`,
                      ai_description: currentPlan.ai_description || currentPlan.description || '',
                      start_date: currentPlan.start_date,
                      end_date: currentPlan.end_date,
                      duration_days: durationDays,
                      budget_range: currentPlan.budget_range || 'medium',
                      estimated_cost: currentPlan.total_cost || currentPlan.estimated_cost || 0,
                      group_size: currentPlan.group_size || 1,
                      trip_type: currentPlan.trip_type,
                      preferences: currentPlan.preferences || {},
                      is_public: false,
                      province: provinceId
                    };
                    
                    const savedTrip = await saveTripPlan(planData);
                    
                    // Show success notification
                    dispatch(addNotification({
                      type: 'success',
                      message: `Your ${currentPlan.destination || currentPlan.province} trip has been saved to your collection.`
                    }));
                    
                    // Redirect to the saved trip details (for now, redirect to dashboard)
                    // In the future, you can create a trip details page and redirect there
                    setTimeout(() => {
                      navigate('/dashboard');
                    }, 2000); // Wait 2 seconds to show the success message
                    
                  } catch (error) {
                    console.error('Error saving trip:', error);
                    // Error notification is already handled by the saveTripPlan function
                  }
                }}
                variant="contained"
                sx={{ 
                  px: 4, 
                  py: 1.5, 
                  background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0, #0d47a1)'
                  }
                }}
              >
                Save This Plan
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 50%, #f3e5f5 100%)' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: 64, 
            height: 64, 
            background: 'linear-gradient(45deg, #1976d2, #1565c0)', 
            borderRadius: '50%', 
            mb: 3,
            boxShadow: 3
          }}>
            <Sparkles sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Typography variant="h2" component="h1" sx={{ 
            fontWeight: 'bold', 
            background: 'linear-gradient(45deg, #1976d2, #0d47a1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}>
            AI Trip Planner
          </Typography>
          <Typography variant="h5" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}>
            Let our AI create the perfect personalized itinerary for your Morocco adventure
          </Typography>
        </Box>

        {/* Progress Steps */}
        {currentStep < 4 && (
          <Card sx={{ mb: 4, boxShadow: 3, bgcolor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                {[1, 2, 3].map((step) => (
                  <Box key={step} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      transition: 'all 0.3s',
                      ...(currentStep >= step || currentStep === 3.5
                        ? {
                            background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                            color: 'white',
                            boxShadow: 2
                          }
                        : {
                            bgcolor: 'grey.300',
                            color: 'grey.600'
                          })
                    }}>
                      {currentStep > step || (currentStep === 3.5 && step === 3) ? (
                        <CheckCircle sx={{ fontSize: 18 }} />
                      ) : currentStep === 3.5 && step === 3 ? (
                        <Loader2 sx={{ fontSize: 18, animation: 'spin 1s linear infinite' }} />
                      ) : (
                        step
                      )}
                    </Box>
                    {step < 3 && (
                      <Box sx={{
                        width: 80,
                        height: 8,
                        mx: 1.5,
                        borderRadius: 4,
                        transition: 'all 0.3s',
                        ...(currentStep > step || currentStep === 3.5
                          ? { background: 'linear-gradient(45deg, #1976d2, #1565c0)' }
                          : { bgcolor: 'grey.300' })
                      }} />
                    )}
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  {currentStep === 3.5 ? 'Generating Your Trip...' : `Step ${Math.floor(currentStep)} of 3: ${currentStep === 1 ? 'Destination' : currentStep === 2 ? 'Details' : 'Preferences'}`}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Form Content */}
        <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
          <Card sx={{ boxShadow: 4, bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}>
            <CardContent sx={{ p: 4 }}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 3.5 && renderGenerating()}
              {currentStep === 4 && renderTripPlan()}
          
              {/* Navigation Buttons */}
              {currentStep < 4 && currentStep !== 3.5 && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  mt: 4, 
                  pt: 3, 
                  borderTop: 1, 
                  borderColor: 'grey.300' 
                }}>
                  <Button
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                    variant="outlined"
                    startIcon={<ChevronLeft />}
                    sx={{ 
                      px: 3, 
                      py: 1, 
                      textTransform: 'none',
                      fontWeight: 500
                    }}
                  >
                    Previous
                  </Button>
                  
                  {currentStep < 3 ? (
                    <Button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      disabled={!canProceed(currentStep)}
                      variant="contained"
                      endIcon={<ChevronRight />}
                      sx={{ 
                        px: 3, 
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 500,
                        background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1565c0, #0d47a1)'
                        }
                      }}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={generateTrip}
                      disabled={!canProceed(currentStep)}
                      variant="contained"
                      startIcon={<Sparkles />}
                      sx={{ 
                        px: 3, 
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 500,
                        background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1565c0, #0d47a1)'
                        }
                      }}
                    >
                      Generate My Trip
                    </Button>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default TripPlannerPage;