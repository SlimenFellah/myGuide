/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import { useState, useEffect } from 'react';
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
  Camera
} from 'lucide-react';

const ExplorePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [places, setPlaces] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'All Places', icon: Grid },
    { id: 'historic', name: 'Historic Sites', icon: Building },
    { id: 'nature', name: 'Nature & Parks', icon: TreePine },
    { id: 'restaurants', name: 'Restaurants', icon: Users },
    { id: 'entertainment', name: 'Entertainment', icon: Camera }
  ];

  useEffect(() => {
    // Simulate API call to fetch data
    setTimeout(() => {
      setProvinces([
        { id: 1, name: 'Algiers', placesCount: 45 },
        { id: 2, name: 'Oran', placesCount: 32 },
        { id: 3, name: 'Constantine', placesCount: 28 },
        { id: 4, name: 'Annaba', placesCount: 22 },
        { id: 5, name: 'Batna', placesCount: 18 },
        { id: 6, name: 'Tlemcen', placesCount: 25 }
      ]);

      setPlaces([
        {
          id: 1,
          name: 'Casbah of Algiers',
          description: 'Historic citadel and UNESCO World Heritage site with traditional architecture.',
          province: 'Algiers',
          district: 'Algiers Center',
          municipality: 'Casbah',
          category: 'historic',
          rating: 4.8,
          reviews: 234,
          averageCost: 15,
          costType: 'per person',
          coordinates: { lat: 36.7828, lng: 3.0594 },
          image: '/assets/427318025.png',
          tags: ['UNESCO', 'Architecture', 'History'],
          openingHours: '9:00 AM - 6:00 PM',
          isFavorite: false
        },
        {
          id: 2,
          name: 'Tassili n\'Ajjer National Park',
          description: 'Stunning desert landscape with ancient rock art and unique geological formations.',
          province: 'Illizi',
          district: 'Illizi',
          municipality: 'Djanet',
          category: 'nature',
          rating: 4.9,
          reviews: 156,
          averageCost: 80,
          costType: 'per day',
          coordinates: { lat: 24.5, lng: 9.5 },
          image: '/assets/427318025.png',
          tags: ['Desert', 'Rock Art', 'Camping'],
          openingHours: '24/7',
          isFavorite: true
        },
        {
          id: 3,
          name: 'Timgad Archaeological Site',
          description: 'Well-preserved Roman ruins showcasing ancient urban planning.',
          province: 'Batna',
          district: 'Batna',
          municipality: 'Timgad',
          category: 'historic',
          rating: 4.7,
          reviews: 189,
          averageCost: 12,
          costType: 'per person',
          coordinates: { lat: 35.4833, lng: 6.4667 },
          image: '/assets/427318025.png',
          tags: ['Roman', 'Archaeology', 'UNESCO'],
          openingHours: '8:00 AM - 5:00 PM',
          isFavorite: false
        },
        {
          id: 4,
          name: 'Restaurant El Bahdja',
          description: 'Traditional Algerian cuisine with authentic flavors and warm hospitality.',
          province: 'Algiers',
          district: 'Algiers Center',
          municipality: 'Bab El Oued',
          category: 'restaurants',
          rating: 4.6,
          reviews: 312,
          averageCost: 25,
          costType: 'per person',
          coordinates: { lat: 36.7898, lng: 3.0471 },
          image: '/assets/427318025.png',
          tags: ['Traditional', 'Local Cuisine', 'Family'],
          openingHours: '12:00 PM - 11:00 PM',
          isFavorite: false
        },
        {
          id: 5,
          name: 'Jardin d\'Essai du Hamma',
          description: 'Beautiful botanical garden with diverse plant species and peaceful walkways.',
          province: 'Algiers',
          district: 'Algiers Center',
          municipality: 'El Hamma',
          category: 'nature',
          rating: 4.4,
          reviews: 98,
          averageCost: 8,
          costType: 'per person',
          coordinates: { lat: 36.7333, lng: 3.0667 },
          image: '/assets/427318025.png',
          tags: ['Garden', 'Nature', 'Relaxation'],
          openingHours: '8:00 AM - 6:00 PM',
          isFavorite: true
        },
        {
          id: 6,
          name: 'Oran Opera House',
          description: 'Magnificent cultural venue hosting performances and events.',
          province: 'Oran',
          district: 'Oran Center',
          municipality: 'Oran',
          category: 'entertainment',
          rating: 4.5,
          reviews: 145,
          averageCost: 30,
          costType: 'per person',
          coordinates: { lat: 35.6911, lng: -0.6417 },
          image: '/assets/427318025.png',
          tags: ['Culture', 'Music', 'Architecture'],
          openingHours: 'Varies by event',
          isFavorite: false
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         place.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         place.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
    const matchesProvince = selectedProvince === 'all' || place.province === selectedProvince;
    
    return matchesSearch && matchesCategory && matchesProvince;
  });

  const toggleFavorite = (placeId) => {
    setPlaces(places.map(place => 
      place.id === placeId ? { ...place, isFavorite: !place.isFavorite } : place
    ));
  };

  const PlaceCard = ({ place }) => (
    <div className="card hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <div className="relative">
        <img 
          src={place.image} 
          alt={place.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(place.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors duration-200 ${
            place.isFavorite 
              ? 'bg-red-500 text-white' 
              : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
          }`}
        >
          <Heart size={16} className={place.isFavorite ? 'fill-current' : ''} />
        </button>
        <div className="absolute bottom-3 left-3">
          <span className="bg-white bg-opacity-90 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
            {categories.find(cat => cat.id === place.category)?.name || place.category}
          </span>
        </div>
      </div>
      
      <div className="p-4">
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
        
        <div className="flex flex-wrap gap-1 mt-3">
          {place.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const PlaceListItem = ({ place }) => (
    <div className="card hover:shadow-md transition-all duration-300 cursor-pointer group">
      <div className="flex items-center space-x-4">
        <img 
          src={place.image} 
          alt={place.name}
          className="w-20 h-20 object-cover rounded-lg"
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
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(place.id);
            }}
            className={`p-2 rounded-full transition-colors duration-200 ${
              place.isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Heart size={16} className={place.isFavorite ? 'fill-current' : ''} />
          </button>
          <ChevronRight size={16} className="text-gray-400 group-hover:text-primary-600 transition-colors duration-200" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Algeria</h1>
        <p className="text-gray-600">
          Discover amazing places, from historic sites to natural wonders
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search places, tags, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center space-x-2 ${
              showFilters ? 'bg-primary-50 text-primary-700 border-primary-200' : ''
            }`}
          >
            <Filter size={20} />
            <span>Filters</span>
          </button>
          
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === 'grid' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="card mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors duration-200 ${
                          selectedCategory === category.id
                            ? 'bg-primary-50 border-primary-200 text-primary-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={16} />
                        <span className="text-sm">{category.name}</span>
                      </button>
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
                  className="input w-full"
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
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          {filteredPlaces.length} place{filteredPlaces.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Places Grid/List */}
      {filteredPlaces.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No places found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {filteredPlaces.map((place) => 
            viewMode === 'grid' 
              ? <PlaceCard key={place.id} place={place} />
              : <PlaceListItem key={place.id} place={place} />
          )}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;