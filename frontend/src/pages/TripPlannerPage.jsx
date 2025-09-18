/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { apiService } from '../services';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Heart, 
  Clock, 
  Star,
  ChevronLeft,
  ChevronRight,
  Download,
  Share,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import tripPlannerImage from '../assets/448618032.png';

const TripPlannerPage = () => {
  const { state, dispatch, generateTripPlan, saveTripPlan, fetchProvinces, setNotification } = useAppContext();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDay, setSelectedDay] = useState(0);
  
  const { activeTrip: currentPlan, loading: isGenerating, savedPlans, provinces } = state;
  
  const [formData, setFormData] = useState({
    province: '',
    tripType: '',
    startDate: '',
    endDate: '',
    budget: '',
    groupSize: 1,
    preferences: {
      quietPlaces: false,
      restaurants: false,
      parks: false,
      historicSites: false,
      entertainment: false,
      shopping: false
    },
    allergies: '',
    additionalNotes: ''
  });

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      if (!provinces || provinces.length === 0) {
        await fetchProvinces();
      }
    };
    loadProvinces();
  }, []); // Empty dependency array to run only once on mount
  
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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (preference) => {
    alert(`Preference button clicked: ${preference}`);
    console.log('Preference button clicked:', preference);
    console.log('Current preferences before change:', formData.preferences);
    
    setFormData(prev => {
      const newPreferences = {
        ...prev.preferences,
        [preference]: !prev.preferences[preference]
      };
      console.log('New preferences after change:', newPreferences);
      
      return {
        ...prev,
        preferences: newPreferences
      };
    });
  };

  const generateTrip = async () => {
    if (!formData.province || !formData.tripType || !formData.startDate || !formData.endDate || !formData.budget || !formData.groupSize) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: {
        type: 'error',
        message: 'Please fill in all required fields'
      }});
      return;
    }

    // Validate group size
    if (formData.groupSize < 1 || formData.groupSize > 20) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: {
        type: 'error',
        message: 'Group size must be between 1 and 20 people'
      }});
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
      const result = await generateTripPlan(tripData);
      
      // Show success notification
      dispatch({ type: 'ADD_NOTIFICATION', payload: {
        type: 'success',
        message: `Trip plan "${result.title}" generated successfully!`
      }});
      
      setCurrentStep(4);
    } catch (error) {
      console.error('Error generating trip:', error);
      
      // Show detailed error notification
      const errorMessage = error.message || 'Failed to generate trip plan. Please try again.';
      dispatch({ type: 'ADD_NOTIFICATION', payload: {
        type: 'error',
        message: errorMessage
      }});
      
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
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-3">
          Where would you like to go?
        </h2>
        <p className="text-gray-600 text-lg">Choose your destination and trip type</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Select Province
            </CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={formData.province}
              onChange={(e) => handleInputChange('province', e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white shadow-sm transition-all"
            >
              <option value="">Choose a province...</option>
              {provinceNames.map((province) => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Trip Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {tripTypes.map((type) => (
                <Button
                  key={type.id}
                  onClick={() => handleInputChange('tripType', type.id)}
                  variant={formData.tripType === type.id ? "default" : "outline"}
                  className={`p-4 h-auto text-left transition-all ${
                    formData.tripType === type.id
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <h3 className="font-semibold">{type.name}</h3>
                      <p className="text-sm opacity-80">{type.description}</p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-3">
          Trip Details
        </h2>
        <p className="text-gray-600 text-lg">When are you traveling and what's your budget?</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Travel Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Start Date
              </label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full p-4 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                End Date
              </label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="w-full p-4 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
                min={formData.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Total Budget (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="500"
                  className="pl-10 w-full p-4 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
                  min="0"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Group Size
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="number"
                  value={formData.groupSize}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    const constrainedValue = Math.min(Math.max(value, 1), 20);
                    handleInputChange('groupSize', constrainedValue);
                  }}
                  className="pl-10 w-full p-4 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
                  min="1"
                  max="20"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary-50 to-primary-100">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary-800">
              Trip Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                <span className="text-gray-700 font-medium">Duration:</span>
                <span className="font-semibold text-primary-700">{calculateDuration()} day{calculateDuration() !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                <span className="text-gray-700 font-medium">Province:</span>
                <span className="font-semibold text-primary-700">{formData.province || 'Not selected'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                <span className="text-gray-700 font-medium">Trip Type:</span>
                <span className="font-semibold text-primary-700">{formData.tripType || 'Not selected'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                <span className="text-gray-700 font-medium">Budget:</span>
                <span className="font-semibold text-primary-700">{formData.budget ? `$${formData.budget}` : 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                <span className="text-gray-700 font-medium">Travelers:</span>
                <span className="font-semibold text-primary-700">{formData.groupSize || 'Not set'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-3">
          Your Preferences
        </h2>
        <p className="text-gray-600 text-lg">What kind of experiences are you looking for?</p>
      </div>
      
      <div className="space-y-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Select your interests
            </CardTitle>
            <p className="text-gray-600 mt-2">Choose all that apply</p>
          </CardHeader>
          <CardContent>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {preferenceOptions.map((option) => {
                const isSelected = formData.preferences[option.key];
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => handlePreferenceChange(option.key)}
                    className={`p-4 h-auto transition-all duration-200 cursor-pointer rounded-lg border-2 w-full ${
                      isSelected
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg border-primary'
                        : 'border-gray-200 hover:border-primary/30 hover:bg-primary/5 bg-white'
                    }`}
                  >
                    <div className="text-center">
                      <span className="text-2xl mb-2 block">{option.icon}</span>
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Dietary Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                placeholder="e.g., Nuts, Gluten, Vegetarian..."
                className="w-full p-4 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
              />
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Special Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={formData.additionalNotes}
                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                placeholder="Any special requests or preferences..."
                rows={4}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-white shadow-sm transition-all"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderGenerating = () => (
    <div className="text-center py-12">
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-primary-50 max-w-2xl mx-auto">
        <CardContent className="p-12">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 opacity-20 animate-ping"></div>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-4">
            Creating Your Perfect Trip
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Our AI is analyzing your preferences and crafting a personalized itinerary...
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-1000 shadow-sm" style={{width: '75%'}}></div>
            </div>
            <p className="text-sm text-gray-500 font-medium">This usually takes 30-60 seconds</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTripPlan = () => {
    if (!currentPlan) return null;
    
    const currentDay = currentPlan.daily_plans[selectedDay];
    
    return (
      <div className="space-y-6">
        {/* Plan Header */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Your {currentPlan.province} Adventure</h2>
                <p className="text-primary-100">
                  {currentPlan.duration} days • {tripTypes.find(t => t.id === currentPlan.trip_type)?.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-primary-100 text-sm">Total Budget</p>
                <p className="text-2xl font-bold">${currentPlan.total_cost}</p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Button variant="ghost" className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0">
                <Download size={16} className="mr-2" />
                Export
              </Button>
              <Button variant="ghost" className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0">
                <Share size={16} className="mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Day Navigation */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Daily Itinerary</h3>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
                  disabled={selectedDay === 0}
                  variant="outline"
                  size="sm"
                  className="p-2 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft size={16} />
                </Button>
                <span className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium">
                  Day {selectedDay + 1} of {currentPlan.duration}
                </span>
                <Button
                  onClick={() => setSelectedDay(Math.min(currentPlan.daily_plans.length - 1, selectedDay + 1))}
                disabled={selectedDay === currentPlan.daily_plans.length - 1}
                  variant="outline"
                  size="sm"
                  className="p-2 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Current Day Details */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {new Date(currentDay.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardTitle>
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign size={16} className="mr-1" />
                <span>Daily budget: ${currentDay.total_cost}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentDay.activities.map((activity, index) => (
                <Card key={activity.id} className="border-l-4 border-primary-500 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold text-gray-900">{activity.place?.name || activity.name}</h5>
                          <span className="text-sm bg-white px-2 py-1 rounded-full text-gray-600">
                            {activity.place?.category || activity.category}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{activity.place?.description || activity.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            <span>{activity.start_time} ({activity.duration} hours)</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign size={14} className="mr-1" />
                            <span>${activity.estimated_cost}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin size={14} className="mr-1" />
                            <span>View on map</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Action Buttons */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-6">
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => {
                  setCurrentStep(1);
                  dispatch({ type: 'CLEAR_CURRENT_PLAN' });
                  setSelectedDay(0);
                }}
                variant="outline"
                className="px-8 py-3 border-gray-300 hover:border-primary-300 hover:bg-primary-50"
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
                    setNotification({
                      type: 'success',
                      title: 'Trip Saved Successfully!',
                      message: `Your ${currentPlan.destination || currentPlan.province} trip has been saved to your collection.`
                    });
                    
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
                className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
              >
                Save This Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="w-full">
        <div className="container-content py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            AI Trip Planner
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Let our AI create the perfect personalized itinerary for your Morocco adventure
          </p>
        </div>
        </div>

        {/* Progress Steps */}
        {currentStep < 4 && (
          <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      currentStep >= step || currentStep === 3.5
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {currentStep > step || (currentStep === 3.5 && step === 3) ? (
                        <CheckCircle size={18} />
                      ) : currentStep === 3.5 && step === 3 ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        step
                      )}
                    </div>
                    {step < 3 && (
                      <div className={`w-20 h-2 mx-3 rounded-full transition-all duration-300 ${
                        currentStep > step || currentStep === 3.5 ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-6">
                <div className="text-base font-medium text-gray-700">
                  {currentStep === 3.5 ? 'Generating Your Trip...' : `Step ${Math.floor(currentStep)} of 3: ${currentStep === 1 ? 'Destination' : currentStep === 2 ? 'Details' : 'Preferences'}`}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 3.5 && renderGenerating()}
              {currentStep === 4 && renderTripPlan()}
          
              {/* Navigation Buttons */}
              {currentStep < 4 && currentStep !== 3.5 && (
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                  <Button
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                    variant="outline"
                    className="px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </Button>
                  
                  {currentStep < 3 ? (
                    <Button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      disabled={!canProceed(currentStep)}
                      className="px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={generateTrip}
                      disabled={!canProceed(currentStep)}
                      className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Sparkles size={16} className="mr-2" />
                      <span>Generate My Trip</span>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TripPlannerPage;