/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import { useState } from 'react';
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
  Loader
} from 'lucide-react';

const TripPlannerPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  
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

  const provinces = [
    'Algiers', 'Oran', 'Constantine', 'Annaba', 'Batna', 'Tlemcen', 
    'Sétif', 'Béjaïa', 'Tizi Ouzou', 'Blida', 'Skikda', 'Mostaganem'
  ];

  const tripTypes = [
    { id: 'solo', name: 'Solo Adventure', icon: '🧳', description: 'Perfect for self-discovery' },
    { id: 'couple', name: 'Romantic Getaway', icon: '💕', description: 'Intimate experiences for two' },
    { id: 'friends', name: 'Friends Trip', icon: '👥', description: 'Fun activities with your crew' },
    { id: 'family', name: 'Family Vacation', icon: '👨‍👩‍👧‍👦', description: 'Kid-friendly adventures' }
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
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [preference]: !prev.preferences[preference]
      }
    }));
  };

  const generateTrip = async () => {
    setIsGenerating(true);
    
    // Simulate AI trip generation
    setTimeout(() => {
      const mockPlan = {
        id: 1,
        province: formData.province,
        tripType: formData.tripType,
        duration: calculateDuration(),
        totalCost: Math.floor(Math.random() * 500) + 200,
        days: generateMockDays()
      };
      
      setGeneratedPlan(mockPlan);
      setIsGenerating(false);
      setCurrentStep(4);
    }, 3000);
  };

  const calculateDuration = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const generateMockDays = () => {
    const duration = calculateDuration();
    const days = [];
    
    for (let i = 0; i < duration; i++) {
      const date = new Date(formData.startDate);
      date.setDate(date.getDate() + i);
      
      days.push({
        date: date.toISOString().split('T')[0],
        dayNumber: i + 1,
        places: [
          {
            id: i * 3 + 1,
            name: `Historic Site ${i + 1}`,
            time: '9:00 AM',
            duration: '2 hours',
            cost: 15,
            coordinates: { lat: 36.7 + Math.random() * 0.1, lng: 3.0 + Math.random() * 0.1 },
            description: 'Beautiful historic location with rich cultural heritage.',
            category: 'Historic Site'
          },
          {
            id: i * 3 + 2,
            name: `Restaurant ${i + 1}`,
            time: '12:30 PM',
            duration: '1.5 hours',
            cost: 25,
            coordinates: { lat: 36.7 + Math.random() * 0.1, lng: 3.0 + Math.random() * 0.1 },
            description: 'Traditional Algerian cuisine with authentic flavors.',
            category: 'Restaurant'
          },
          {
            id: i * 3 + 3,
            name: `Park ${i + 1}`,
            time: '3:00 PM',
            duration: '2 hours',
            cost: 8,
            coordinates: { lat: 36.7 + Math.random() * 0.1, lng: 3.0 + Math.random() * 0.1 },
            description: 'Peaceful park perfect for relaxation and nature walks.',
            category: 'Nature'
          }
        ],
        totalCost: 48
      });
    }
    
    return days;
  };

  const canProceed = (step) => {
    switch (step) {
      case 1:
        return formData.province && formData.tripType;
      case 2:
        return formData.startDate && formData.endDate && formData.budget;
      case 3:
        return Object.values(formData.preferences).some(Boolean);
      default:
        return true;
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Where would you like to go?</h2>
        <p className="text-gray-600">Choose your destination and trip type</p>
      </div>
      
      {/* Province Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Select Province</label>
        <select
          value={formData.province}
          onChange={(e) => handleInputChange('province', e.target.value)}
          className="input w-full"
        >
          <option value="">Choose a province...</option>
          {provinces.map((province) => (
            <option key={province} value={province}>{province}</option>
          ))}
        </select>
      </div>
      
      {/* Trip Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Trip Type</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tripTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleInputChange('tripType', type.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                formData.tripType === type.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{type.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{type.name}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip Details</h2>
        <p className="text-gray-600">When are you traveling and what's your budget?</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className="input w-full"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            className="input w-full"
            min={formData.startDate || new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
      
      {/* Budget and Group Size */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Total Budget (USD)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
              placeholder="500"
              className="input pl-10 w-full"
              min="0"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Group Size</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="number"
              value={formData.groupSize}
              onChange={(e) => handleInputChange('groupSize', parseInt(e.target.value))}
              className="input pl-10 w-full"
              min="1"
              max="20"
            />
          </div>
        </div>
      </div>
      
      {formData.startDate && formData.endDate && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800">
            <strong>Trip Duration:</strong> {calculateDuration()} day{calculateDuration() !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Preferences</h2>
        <p className="text-gray-600">What kind of experiences are you looking for?</p>
      </div>
      
      {/* Preferences */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Select your interests</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {preferenceOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => handlePreferenceChange(option.key)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                formData.preferences[option.key]
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <span className="text-2xl mb-2 block">{option.icon}</span>
                <span className="text-sm font-medium text-gray-900">{option.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Additional Information */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Allergies or Dietary Restrictions</label>
          <input
            type="text"
            value={formData.allergies}
            onChange={(e) => handleInputChange('allergies', e.target.value)}
            placeholder="e.g., Nuts, Gluten, Vegetarian..."
            className="input w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
          <textarea
            value={formData.additionalNotes}
            onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
            placeholder="Any special requests or preferences..."
            rows={3}
            className="input w-full resize-none"
          />
        </div>
      </div>
    </div>
  );

  const renderGenerating = () => (
    <div className="text-center py-12">
      <div className="mb-6">
        <img 
          src="/assets/448618032.png" 
          alt="Generating trip plan"
          className="w-32 h-32 mx-auto mb-4 rounded-full object-cover"
        />
      </div>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Creating Your Perfect Trip</h2>
      <p className="text-gray-600 mb-4">Our AI is analyzing your preferences and crafting a personalized itinerary...</p>
      <div className="max-w-md mx-auto">
        <div className="bg-gray-200 rounded-full h-2">
          <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
        </div>
      </div>
    </div>
  );

  const renderTripPlan = () => {
    if (!generatedPlan) return null;
    
    const currentDay = generatedPlan.days[selectedDay];
    
    return (
      <div className="space-y-6">
        {/* Plan Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your {generatedPlan.province} Adventure</h2>
              <p className="text-primary-100">
                {generatedPlan.duration} days • {tripTypes.find(t => t.id === generatedPlan.tripType)?.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-primary-100 text-sm">Total Budget</p>
              <p className="text-2xl font-bold">${generatedPlan.totalCost}</p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2">
              <Download size={16} />
              <span>Export</span>
            </button>
            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2">
              <Share size={16} />
              <span>Share</span>
            </button>
          </div>
        </div>
        
        {/* Day Navigation */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Daily Itinerary</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
              disabled={selectedDay === 0}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium">
              Day {selectedDay + 1} of {generatedPlan.duration}
            </span>
            <button
              onClick={() => setSelectedDay(Math.min(generatedPlan.days.length - 1, selectedDay + 1))}
              disabled={selectedDay === generatedPlan.days.length - 1}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        {/* Current Day Details */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              {new Date(currentDay.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h4>
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign size={16} className="mr-1" />
              <span>Daily budget: ${currentDay.totalCost}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {currentDay.places.map((place, index) => (
              <div key={place.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-semibold text-gray-900">{place.name}</h5>
                    <span className="text-sm bg-white px-2 py-1 rounded-full text-gray-600">
                      {place.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{place.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      <span>{place.time} ({place.duration})</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign size={14} className="mr-1" />
                      <span>${place.cost}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-1" />
                      <span>View on map</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button 
            onClick={() => {
              setCurrentStep(1);
              setGeneratedPlan(null);
              setSelectedDay(0);
            }}
            className="btn-secondary"
          >
            Plan Another Trip
          </button>
          <button className="btn-primary">
            Save This Plan
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <Sparkles className="mr-2 text-primary-600" />
          AI Trip Planner
        </h1>
        <p className="text-gray-600">
          Let our AI create the perfect personalized itinerary for your Algeria adventure
        </p>
      </div>

      {/* Progress Steps */}
      {currentStep < 4 && (
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= step 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step ? <CheckCircle size={16} /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <div className="text-sm text-gray-600">
              Step {currentStep} of 3: {currentStep === 1 ? 'Destination' : currentStep === 2 ? 'Details' : 'Preferences'}
            </div>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="max-w-4xl mx-auto">
        <div className="card">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {isGenerating && renderGenerating()}
          {currentStep === 4 && renderTripPlan()}
          
          {/* Navigation Buttons */}
          {currentStep < 4 && !isGenerating && (
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {currentStep < 3 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canProceed(currentStep)}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={generateTrip}
                  disabled={!canProceed(currentStep)}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Sparkles size={16} />
                  <span>Generate My Trip</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripPlannerPage;