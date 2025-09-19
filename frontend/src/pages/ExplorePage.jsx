/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '../store/hooks';
import { useProvinces, usePlaces, useTourismLoading, useSearchResults, useAuth } from '../store/hooks';
import { fetchProvinces, fetchPlaces, searchPlaces } from '../store/slices/tourismSlice';
import { addNotification } from '../store/slices/appSlice';
import { addToFavorites, removeFromFavorites } from '../store/slices/tripPlannerSlice';
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
import { Button, Card, CardContent, Typography, Box, TextField, Container, MenuItem } from '@mui/material';

const ExplorePage = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const provinces = useProvinces();
  const places = usePlaces();
  const searchResults = useSearchResults();
  const loading = useTourismLoading();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Use search results if available, otherwise use places
  const displayPlaces = Array.isArray(searchResults) && searchResults.length > 0 ? searchResults : Array.isArray(places) ? places : [];

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Loader2 className="animate-spin" size={24} />
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Please log in to explore places
        </Typography>
        <Button variant="contained" href="/login" sx={{ mt: 2 }}>
          Go to Login
        </Button>
      </Container>
    );
  }

  const categories = [
    { id: 'all', name: 'All Places', icon: Grid },
    { id: 'historic', name: 'Historic Sites', icon: Building },
    { id: 'nature', name: 'Nature & Parks', icon: TreePine },
    { id: 'restaurants', name: 'Restaurants', icon: Users },
    { id: 'entertainment', name: 'Entertainment', icon: Camera }
  ];

  useEffect(() => {
    // Only fetch data when user is authenticated and auth is not loading
    if (isAuthenticated && !authLoading) {
      const loadData = async () => {
        dispatch(fetchProvinces());
        dispatch(fetchPlaces());
      };
      
      loadData();
    }
  }, [dispatch, isAuthenticated, authLoading]);

  // Handle search
  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      dispatch(searchPlaces({
        query: term,
        filters: {
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          province: selectedProvince !== 'all' ? selectedProvince : undefined
        }
      }));
    } else {
      dispatch(fetchPlaces());
    }
  };

  // Handle filter changes
  const handleFilterChange = useCallback(async () => {
    const filters = {
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      province: selectedProvince !== 'all' ? selectedProvince : undefined
    };
    
    if (searchTerm.trim()) {
      dispatch(searchPlaces({
        query: searchTerm,
        filters
      }));
    } else if (Object.keys(filters).some(key => filters[key])) {
      dispatch(searchPlaces({ query: '', filters }));
    } else {
      dispatch(fetchPlaces());
    }
  }, [dispatch, selectedCategory, selectedProvince, searchTerm]);

  // Handle favorite toggle
  const handleFavoriteToggle = async (placeId) => {
    try {
      const place = displayPlaces.find(p => p.id === placeId);
      if (place?.isFavorite) {
        dispatch(removeFromFavorites(placeId));
      } else {
        dispatch(addToFavorites(placeId));
      }
      // Refresh places to update favorite status
      dispatch(fetchPlaces());
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to update favorites'
      }));
    }
  };

  // Filter places based on current selections
  const filteredPlaces = Array.isArray(displayPlaces) ? displayPlaces.filter(place => {
    const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
    const matchesProvince = selectedProvince === 'all' || place.province === selectedProvince;
    return matchesCategory && matchesProvince;
  }) : [];

  // Effect to handle filter changes
  useEffect(() => {
    if (selectedCategory !== 'all' || selectedProvince !== 'all') {
      handleFilterChange();
    }
  }, [selectedCategory, selectedProvince, handleFilterChange]);

  const PlaceCard = ({ place }) => (
    <Card sx={{
      cursor: 'pointer',
      overflow: 'hidden',
      border: 0,
      boxShadow: 1,
      transition: 'all 0.3s',
      '&:hover': {
        boxShadow: 6,
        transform: 'scale(1.02)'
      }
    }}>
      <Box sx={{ position: 'relative' }}>
        <img 
          src={place.main_image || '/api/placeholder/400/300'} 
          alt={place.name}
          style={{
            width: '100%',
            height: '192px',
            objectFit: 'cover',
            transition: 'transform 0.3s'
          }}
        />
        <Button 
          size="small"
          variant={place.isFavorite ? "contained" : "outlined"}
          onClick={(e) => {
            e.stopPropagation();
            handleFavoriteToggle(place.id);
          }}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            minWidth: 32,
            width: 32,
            height: 32,
            borderRadius: '50%',
            boxShadow: 2,
            backgroundColor: place.isFavorite ? '#ef4444' : 'rgba(255,255,255,0.9)',
            color: place.isFavorite ? 'white' : '#6b7280',
            border: 0,
            '&:hover': {
              backgroundColor: place.isFavorite ? '#dc2626' : 'white',
              color: place.isFavorite ? 'white' : '#ef4444'
            }
          }}
        >
          <Heart size={14} className={place.isFavorite ? 'fill-current' : ''} />
        </Button>
        <Box sx={{
          position: 'absolute',
          bottom: 12,
          left: 12
        }}>
          <Typography sx={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(4px)',
            color: '#1f2937',
            fontSize: '0.75rem',
            px: 1.5,
            py: 0.75,
            borderRadius: '9999px',
            fontWeight: 500,
            boxShadow: 1
          }}>
            {categories.find(cat => cat.id === place.category)?.name || place.category}
          </Typography>
        </Box>
      </Box>
      
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 600, 
          color: 'text.primary', 
          mb: 1,
          transition: 'color 0.2s'
        }}>
          {place.name}
        </Typography>
        <Typography variant="body2" sx={{ 
          color: 'text.secondary', 
          mb: 2,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {place.description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <MapPin size={14} style={{ marginRight: 4, color: '#6b7280' }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {place.municipality}, {place.province}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Star size={14} style={{ color: '#fbbf24', fill: 'currentColor' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', ml: 0.5 }}>
              {place.rating} ({place.reviews} reviews)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DollarSign size={14} style={{ marginRight: 4, color: '#6b7280' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              ${place.averageCost} {place.costType}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Clock size={14} style={{ marginRight: 4, color: '#6b7280' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {place.openingHours}
            </Typography>
          </Box>
          <ChevronRight size={16} style={{ color: '#9ca3af' }} />
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          {(place.tags || []).slice(0, 3).map((tag, index) => (
            <Typography key={index} variant="caption" sx={{
              backgroundColor: '#f0f9ff',
              color: '#0369a1',
              px: 1.5,
              py: 0.5,
              borderRadius: '9999px',
              fontWeight: 500
            }}>
              {tag}
            </Typography>
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  const PlaceListItem = ({ place }) => (
    <Card sx={{
      cursor: 'pointer',
      border: 0,
      boxShadow: 1,
      transition: 'all 0.3s',
      '&:hover': {
        boxShadow: 3
      }
    }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            component="img"
            src={place.main_image || '/api/placeholder/400/300'}
            alt={place.name}
            sx={{
              width: 80,
              height: 80,
              objectFit: 'cover',
              borderRadius: 1,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: 0.5,
            transition: 'color 0.2s'
          }}>
            {place.name}
          </Typography>
          <Typography variant="body2" sx={{
            color: 'text.secondary',
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {place.description}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MapPin size={14} style={{ marginRight: 4, color: '#6b7280' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {place.municipality}, {place.province}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Star size={14} style={{ color: '#fbbf24', fill: 'currentColor' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', ml: 0.5 }}>
                {place.rating} ({place.reviews})
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DollarSign size={14} style={{ marginRight: 4, color: '#6b7280' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                ${place.averageCost} {place.costType}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant={place.isFavorite ? "contained" : "outlined"}
            onClick={(e) => {
              e.stopPropagation();
              handleFavoriteToggle(place.id);
            }}
            sx={{
              minWidth: 32,
              width: 32,
              height: 32,
              borderRadius: '50%',
              p: 0,
              backgroundColor: place.isFavorite ? '#ef4444' : '#f3f4f6',
              color: place.isFavorite ? 'white' : '#6b7280',
              border: 0,
              '&:hover': {
                backgroundColor: place.isFavorite ? '#dc2626' : '#e5e7eb',
                color: place.isFavorite ? 'white' : '#ef4444'
              }
            }}
          >
            <Heart size={14} style={{ fill: place.isFavorite ? 'currentColor' : 'none' }} />
          </Button>
          <Button
            size="small"
            variant="contained"
            sx={{
              minWidth: 32,
              width: 32,
              height: 32,
              borderRadius: '50%',
              p: 0,
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#2563eb'
              }
            }}
          >
            <ChevronRight size={14} />
          </Button>
        </Box>
      </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Card sx={{
          p: 4,
          boxShadow: 3,
          border: 0
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 2,
              '& svg': {
                animation: 'spin 1s linear infinite'
              },
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }}>
              <Loader2 size={48} style={{ color: '#3b82f6' }} />
            </Box>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Loading amazing places...
            </Typography>
          </Box>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 50%, #f3f4f6 100%)'
    }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            borderRadius: '50%',
            mb: 3
          }}>
            <Navigation size={32} style={{ color: 'white' }} />
          </Box>
          <Typography variant="h2" sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}>
            Explore Amazing Places
          </Typography>
          <Typography variant="h5" sx={{
            color: 'text.secondary',
            maxWidth: '600px',
            mx: 'auto',
            lineHeight: 1.6
          }}>
            Discover hidden gems and popular destinations across Morocco
          </Typography>
        </Box>

      {/* Search and Filters */}
      <Card sx={{
        mb: 4,
        border: 0,
        boxShadow: 3,
        backgroundColor: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(4px)'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2 }}>
            {/* Search Bar */}
            <Box sx={{ flex: 1, position: 'relative' }}>
              <Box sx={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1
              }}>
                <Search size={20} style={{ color: '#9ca3af' }} />
              </Box>
              <TextField
                type="text"
                placeholder="Search places, tags, or descriptions..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                variant="outlined"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    paddingLeft: '40px',
                    height: '48px',
                    backgroundColor: '#f9fafb',
                    '&:hover': {
                      backgroundColor: 'white'
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white'
                    }
                  }
                }}
              />
            </Box>
            
            {/* Filter Toggle */}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant={showFilters ? "contained" : "outlined"}
              sx={{
                height: 48,
                px: 3,
                backgroundColor: showFilters ? '#3b82f6' : 'white',
                color: showFilters ? 'white' : '#374151',
                borderColor: showFilters ? '#3b82f6' : '#d1d5db',
                '&:hover': {
                  backgroundColor: showFilters ? '#2563eb' : '#f9fafb'
                }
              }}
            >
              <Filter size={20} style={{ marginRight: 8 }} />
              Filters
            </Button>
            
            {/* View Mode Toggle */}
            <Box sx={{
              display: 'flex',
              backgroundColor: '#f3f4f6',
              borderRadius: 1,
              p: 0.5
            }}>
              <Button
                onClick={() => setViewMode('grid')}
                variant="text"
                size="small"
                sx={{
                  px: 2,
                  height: 40,
                  borderRadius: 0.5,
                  transition: 'all 0.2s',
                  backgroundColor: viewMode === 'grid' ? 'white' : 'transparent',
                  color: viewMode === 'grid' ? '#2563eb' : '#6b7280',
                  boxShadow: viewMode === 'grid' ? 1 : 0,
                  '&:hover': {
                    backgroundColor: viewMode === 'grid' ? 'white' : '#e5e7eb'
                  }
                }}
              >
                <Grid size={18} style={{ marginRight: 8 }} />
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Grid
                </Box>
              </Button>
              <Button
                onClick={() => setViewMode('list')}
                variant="text"
                size="small"
                sx={{
                  px: 2,
                  height: 40,
                  borderRadius: 0.5,
                  transition: 'all 0.2s',
                  backgroundColor: viewMode === 'list' ? 'white' : 'transparent',
                  color: viewMode === 'list' ? '#2563eb' : '#6b7280',
                  boxShadow: viewMode === 'list' ? 1 : 0,
                  '&:hover': {
                    backgroundColor: viewMode === 'list' ? 'white' : '#e5e7eb'
                  }
                }}
              >
                <List size={18} style={{ marginRight: 8 }} />
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  List
                </Box>
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

        {/* Filters Panel */}
        {showFilters && (
          <Card sx={{
            mb: 3,
            border: 0,
            boxShadow: 2
          }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Category Filter */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ 
                    fontWeight: 500, 
                    color: 'text.primary', 
                    mb: 2 
                  }}>
                    Category
                  </Typography>
                  <Grid container spacing={1}>
                    {categories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <Grid item xs={6} key={category.id}>
                          <Button
                            onClick={() => setSelectedCategory(category.id)}
                            variant={selectedCategory === category.id ? "contained" : "outlined"}
                            fullWidth
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              p: 1.5,
                              height: 'auto',
                              justifyContent: 'flex-start',
                              transition: 'all 0.2s',
                              backgroundColor: selectedCategory === category.id ? '#eff6ff' : 'white',
                              borderColor: selectedCategory === category.id ? '#3b82f6' : '#d1d5db',
                              color: selectedCategory === category.id ? '#1d4ed8' : '#6b7280',
                              '&:hover': {
                                backgroundColor: selectedCategory === category.id ? '#dbeafe' : '#f9fafb'
                              }
                            }}
                          >
                            <Icon size={16} />
                            <Typography variant="body2">{category.name}</Typography>
                          </Button>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Grid>
                
                {/* Province Filter */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ 
                    fontWeight: 500, 
                    color: 'text.primary', 
                    mb: 2 
                  }}>
                    Province
                  </Typography>
                  <TextField
                    select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white'
                      }
                    }}
                  >
                    <MenuItem value="all">All Provinces</MenuItem>
                    {provinces.map((province) => (
                      <MenuItem key={province.id} value={province.name}>
                        {province.name} ({province.placesCount} places)
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

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
        <Card sx={{
          mt: 4,
          border: 0,
          boxShadow: 3
        }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Box sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              backgroundColor: '#f3f4f6',
              borderRadius: '50%',
              mb: 3
            }}>
              <Search size={24} style={{ color: '#9ca3af' }} />
            </Box>
            <Typography variant="h5" sx={{
              fontWeight: 600,
              color: 'text.primary',
              mb: 2
            }}>
              No places found
            </Typography>
            <Typography variant="body1" sx={{
              color: 'text.secondary',
              maxWidth: '400px',
              mx: 'auto',
              lineHeight: 1.6
            }}>
              Try adjusting your search terms or filters to discover amazing places
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{
          ...(viewMode === 'grid' ? {
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
              xl: 'repeat(4, 1fr)'
            },
            gap: 3
          } : {
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          })
        }}>
          {filteredPlaces.map((place) => (
            <Box key={place.id} onClick={() => console.log('Navigate to place:', place.id)} sx={{ cursor: 'pointer' }}>
              {viewMode === 'grid' 
                ? <PlaceCard place={place} />
                : <PlaceListItem place={place} />
              }
            </Box>
          ))}
        </Box>
         )}
      </Container>
     </Box>
   );
};

export default ExplorePage;