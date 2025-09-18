/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { apiService } from '../services';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign,
  Users,
  ChevronRight,
  Grid,
  List,
  Heart,
  Navigation,
  TreePine,
  Building,
  Camera,
  Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';

const ExplorePage = () => {
  const { state, dispatch, fetchProvinces, fetchPlaces, searchPlaces } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const { provinces, places, loading } = state;

  const categories = [
    { id: 'all', name: 'All Places', icon: Grid },
    { id: 'historic', name: 'Historic Sites', icon: Building },
    { id: 'nature', name: 'Nature & Parks', icon: TreePine },
    { id: 'restaurants', name: 'Restaurants', icon: Users },
    { id: 'entertainment', name: 'Entertainment', icon: Camera }
  ];

  useEffect(() => {
    // Fetch initial data
    const loadData = async () => {
      await fetchProvinces();
      await fetchPlaces();
    };
    
    loadData();
  }, []);

  // Handle search
  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      await searchPlaces({
        search: term,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        province: selectedProvince !== 'all' ? selectedProvince : undefined
      });
    } else {
      await fetchPlaces();
    }
  };

  // Handle filter changes
  const handleFilterChange = async () => {
    const filters = {
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      province: selectedProvince !== 'all' ? selectedProvince : undefined
    };
    
    if (searchTerm.trim()) {
      filters.search = searchTerm;
    }
    
    if (Object.keys(filters).length > 0) {
      await searchPlaces(filters);
    } else {
      await fetchPlaces();
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async (placeId) => {
    try {
      const place = places.find(p => p.id === placeId);
      if (place?.isFavorite) {
        await apiService.tourism.removeFromFavorites(placeId);
      } else {
        await apiService.tourism.addToFavorites(placeId);
      }
      // Refresh places to update favorite status
      await fetchPlaces();
    } catch (error) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: {
        type: 'error',
        message: 'Failed to update favorites'
      }});
    }
  };

  // Filter places based on current selections
  const filteredPlaces = places.filter(place => {
    const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
    const matchesProvince = selectedProvince === 'all' || place.province === selectedProvince;
    return matchesCategory && matchesProvince;
  });

  // Effect to handle filter changes
  useEffect(() => {
    if (selectedCategory !== 'all' || selectedProvince !== 'all') {
      handleFilterChange();
    }
  }, [selectedCategory, selectedProvince]);

  const PlaceCard = ({ place }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border-0 shadow-sm hover:shadow-xl">
      <div className="relative">
        <img 
          src={place.main_image || '/api/placeholder/400/300'} 
          alt={place.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Button 
          size="sm"
          variant={place.isFavorite ? "default" : "secondary"}
          onClick={(e) => {
            e.stopPropagation();
            handleFavoriteToggle(place.id);
          }}
          className={`absolute top-3 right-3 h-8 w-8 p-0 rounded-full shadow-md ${
            place.isFavorite 
              ? 'bg-red-500 hover:bg-red-600 text-white border-0' 
              : 'bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 border-0'
          }`}
        >
          <Heart size={14} className={place.isFavorite ? 'fill-current' : ''} />
        </Button>
        <div className="absolute bottom-3 left-3">
          <span className="bg-white/95 backdrop-blur-sm text-gray-800 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
            {categories.find(cat => cat.id === place.category)?.name || place.category}
          </span>
        </div>
      </div>
      
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
          {place.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{place.description}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin size={14} className="mr-1" />
          <span>{place.municipality}, {place.province}</span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Star className="text-yellow-400 fill-current" size={14} />
            <span className="text-sm text-gray-600 ml-1">
              {place.rating} ({place.reviews} reviews)
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign size={14} className="mr-1" />
            <span>${place.averageCost} {place.costType}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Clock size={14} className="mr-1" />
            <span>{place.openingHours}</span>
          </div>
          <ChevronRight size={16} className="text-gray-400 group-hover:text-primary-600 transition-colors duration-200" />
        </div>
        
        <div className="flex flex-wrap gap-1.5 mt-4">
          {(place.tags || []).slice(0, 3).map((tag, index) => (
            <span key={index} className="text-xs bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full font-medium">
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const PlaceListItem = ({ place }) => (
    <Card className="group hover:shadow-md transition-all duration-300 cursor-pointer border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <img 
            src={place.main_image || '/api/placeholder/400/300'} 
            alt={place.name}
            className="w-20 h-20 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
          />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors duration-200">
            {place.name}
          </h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-1">{place.description}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <MapPin size={14} className="mr-1" />
              <span>{place.municipality}, {place.province}</span>
            </div>
            <div className="flex items-center">
              <Star className="text-yellow-400 fill-current" size={14} />
              <span className="ml-1">{place.rating} ({place.reviews})</span>
            </div>
            <div className="flex items-center">
              <DollarSign size={14} className="mr-1" />
              <span>${place.averageCost} {place.costType}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            size="sm"
            variant={place.isFavorite ? "default" : "secondary"}
            onClick={(e) => {
              e.stopPropagation();
              handleFavoriteToggle(place.id);
            }}
            className={`h-8 w-8 p-0 rounded-full ${
              place.isFavorite 
                ? 'bg-red-500 hover:bg-red-600 text-white border-0' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-red-500 border-0'
            }`}
          >
            <Heart size={14} className={place.isFavorite ? 'fill-current' : ''} />
          </Button>
          <Button size="sm" className="h-8 w-8 p-0 rounded-full bg-primary-500 hover:bg-primary-600 text-white border-0">
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="p-8 shadow-lg border-0">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading amazing places...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="w-full">
        <div className="container-content py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mb-6">
            <Navigation className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Explore Amazing Places
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover hidden gems and popular destinations across Morocco
          </p>
        </div>

      {/* Search and Filters */}
      <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search places, tags, or descriptions..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-12 border-0 bg-gray-50 focus:bg-white transition-colors duration-200"
              />
            </div>
            
            {/* Filter Toggle */}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant={showFilters ? "default" : "outline"}
              className={`h-12 px-6 ${
                showFilters 
                  ? 'bg-primary-500 hover:bg-primary-600 text-white border-0' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              <Filter size={20} className="mr-2" />
              <span>Filters</span>
            </Button>
            
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                onClick={() => setViewMode('grid')}
                variant="ghost"
                size="sm"
                className={`px-4 h-10 rounded-md transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-white text-primary-600 shadow-sm hover:bg-white' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Grid size={18} className="mr-2" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
              <Button
                onClick={() => setViewMode('list')}
                variant="ghost"
                size="sm"
                className={`px-4 h-10 rounded-md transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-white text-primary-600 shadow-sm hover:bg-white' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <List size={18} className="mr-2" />
                <span className="hidden sm:inline">List</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6 border-0 shadow-md">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <Button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          variant={selectedCategory === category.id ? "default" : "outline"}
                          className={`flex items-center space-x-2 p-3 h-auto justify-start transition-colors duration-200 ${
                            selectedCategory === category.id
                              ? 'bg-primary-50 border-primary-200 text-primary-700 hover:bg-primary-100'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Icon size={16} />
                          <span className="text-sm">{category.name}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Province Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Province</label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                  >
                    <option value="all">All Provinces</option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.name}>
                        {province.name} ({province.placesCount} places)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-1 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredPlaces.length} {filteredPlaces.length === 1 ? 'place' : 'places'} found
          </h2>
        </div>
      </div>

      {/* Places Grid/List */}
      {filteredPlaces.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No places found</h3>
            <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
              Try adjusting your search terms or filters to discover amazing places
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {filteredPlaces.map((place) => (
            <div key={place.id} onClick={() => console.log('Navigate to place:', place.id)}>
              {viewMode === 'grid' 
                ? <PlaceCard place={place} />
                : <PlaceListItem place={place} />
              }
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;