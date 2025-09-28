/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Chip,
  Button,
  Grid,
  Divider,
  Card,
  CardContent,
  Avatar,
  Rating,
  CircularProgress
} from '@mui/material';
import {
  X,
  MapPin,
  Star,
  Clock,
  DollarSign,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  Heart,
  Share2,
  Navigation,
  Camera,
  Wifi,
  Car,
  Coffee,
  ShoppingBag,
  TreePine,
  Building,
  Mountain,
  Waves
} from 'lucide-react';
import { apiService } from '../services';

const PlaceDetailModal = ({ open, onClose, placeId }) => {
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (open && placeId) {
      fetchPlaceDetails();
    }
  }, [open, placeId]);

  const fetchPlaceDetails = async () => {
    if (!placeId) return;
    
    setLoading(true);
    setError(null);
    setPlace(null);
    
    try {
      const response = await apiService.tourism.getPlace(placeId);
      if (response.data) {
        setPlace(response.data);
        setIsFavorite(response.data.is_favorite || false);
      } else {
        setError('Place not found');
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      if (error.response?.status === 404) {
        setError('Place not found');
      } else {
        setError('Failed to load place details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite API call
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: place?.name,
        text: place?.short_description || place?.description,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const getPlaceTypeIcon = (type) => {
    const iconMap = {
      historical: Building,
      natural: TreePine,
      cultural: Users,
      religious: Building,
      museum: Building,
      park: TreePine,
      beach: Waves,
      mountain: Mountain,
      restaurant: Coffee,
      hotel: Building,
      shopping: ShoppingBag,
      entertainment: Camera
    };
    return iconMap[type] || MapPin;
  };

  const getAmenityIcon = (amenity) => {
    const iconMap = {
      parking: Car,
      wifi: Wifi,
      restaurant: Coffee,
      shopping: ShoppingBag,
      accessible: Users
    };
    return iconMap[amenity] || null;
  };

  const formatOpeningHours = (hours) => {
    if (!hours || Object.keys(hours).length === 0) return 'Hours not available';
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return days.map((day, index) => (
      <Box key={day} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {dayNames[index]}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {hours[day] || 'Closed'}
        </Typography>
      </Box>
    ));
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
          width: '95vw',
          maxWidth: '1200px'
        }
      }}
    >
      <DialogTitle sx={{ p: 0, position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            zIndex: 1,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)'
            }
          }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: 'auto', maxHeight: '80vh' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </Box>
        ) : place ? (
          <Box>
            {/* Hero Image Section */}
            <Box sx={{ 
              position: 'relative', 
              height: { xs: 250, md: 400 },
              overflow: 'hidden',
              borderRadius: '8px 8px 0 0'
            }}>
              <img
                src={place.images?.[selectedImageIndex]?.image || place.main_image || '/api/placeholder/800/400'}
                alt={place.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              
              {/* Gradient Overlay */}
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'
              }} />
              
              {/* Place Title Overlay */}
              <Box sx={{
                position: 'absolute',
                bottom: 24,
                left: 24,
                right: 24,
                color: 'white'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Chip
                    icon={React.createElement(getPlaceTypeIcon(place.place_type), { size: 16 })}
                    label={place.place_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.9)', 
                      color: '#3b82f6',
                      fontWeight: 600
                    }}
                  />
                  {place.is_featured && (
                    <Chip
                      label="Featured"
                      sx={{ 
                        backgroundColor: '#3b82f6', 
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  )}
                </Box>
                
                <Typography variant="h3" sx={{ 
                  fontWeight: 700, 
                  mb: 1,
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}>
                  {place.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <MapPin size={18} style={{ color: 'white' }} />
                  <Typography variant="h6" sx={{ 
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    {place.address || `${place.municipality?.name || place.municipality}, ${place.district?.name || place.district}, ${place.province?.name || place.province}`}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={parseFloat(place.average_rating)} readOnly precision={0.1} size="small" />
                    <Typography variant="body1" sx={{ 
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                    }}>
                      {place.average_rating} ({place.total_ratings} reviews)
                    </Typography>
                  </Box>
                  
                  {place.entry_fee && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DollarSign size={18} style={{ color: 'white' }} />
                      <Typography variant="body1" sx={{ 
                        color: 'white',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                      }}>
                        ${place.entry_fee} entry fee
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
              
              {/* Image Navigation */}
              {place.images && place.images.length > 1 && (
                <Box sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: 1
                }}>
                  {place.images.map((_, index) => (
                    <Box
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: selectedImageIndex === index ? 'white' : 'rgba(255, 255, 255, 0.5)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    />
                  ))}
                </Box>
              )}
              
              {/* Action Buttons */}
              <Box sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                display: 'flex',
                gap: 1
              }}>
                <IconButton
                  onClick={handleFavoriteToggle}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: isFavorite ? '#ef4444' : '#6b7280',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)'
                    }
                  }}
                >
                  <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
                </IconButton>
                <IconButton
                  onClick={handleShare}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)'
                    }
                  }}
                >
                  <Share2 size={20} />
                </IconButton>
              </Box>
            </Box>

            {/* Content Section */}
            <Box sx={{ p: { xs: 3, md: 4 } }}>
              <Grid container spacing={4}>
                {/* Main Content */}
                <Grid item xs={12} md={8}>
                  {/* About Section */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 700, 
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      About this place
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      lineHeight: 1.7,
                      color: 'text.secondary',
                      fontSize: '1.1rem'
                    }}>
                      {place.description || 'No description available for this place.'}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 4 }} />

                  {/* Features/Amenities Section */}
                  {place.amenities && place.amenities.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 700, 
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        Features & Amenities
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        {place.amenities.map((amenity, index) => {
                          const AmenityIcon = getAmenityIcon(amenity);
                          return (
                            <Chip
                              key={index}
                              icon={AmenityIcon ? React.createElement(AmenityIcon, { size: 16 }) : undefined}
                              label={amenity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              variant="filled"
                              sx={{ 
                                backgroundColor: '#f3f4f6', 
                                color: '#374151',
                                '&:hover': {
                                  backgroundColor: '#e5e7eb'
                                }
                              }}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  )}

                  <Divider sx={{ my: 4 }} />

                  {/* Reviews Section */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 700, 
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Star size={20} />
                      Reviews & Ratings
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Rating value={parseFloat(place.average_rating)} readOnly precision={0.1} size="large" />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {place.average_rating} out of 5
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ({place.total_ratings} reviews)
                      </Typography>
                    </Box>
                    
                    {place.feedbacks && place.feedbacks.length > 0 ? (
                      <Box sx={{ mt: 3 }}>
                        {place.feedbacks.slice(0, 3).map((feedback, index) => (
                          <Card key={index} sx={{ mb: 2, boxShadow: 1 }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Avatar sx={{ width: 40, height: 40 }}>
                                  {feedback.user?.first_name?.[0] || feedback.user?.username?.[0] || 'U'}
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {feedback.user?.first_name || feedback.user?.username || 'Anonymous'}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Rating value={feedback.rating} readOnly size="small" />
                                    <Typography variant="caption" color="text.secondary">
                                      {new Date(feedback.created_at).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {feedback.comment}
                              </Typography>
                            </CardContent>
                          </Card>
                        ))}
                        {place.feedbacks.length > 3 && (
                          <Typography variant="body2" color="primary" sx={{ textAlign: 'center', mt: 2 }}>
                            And {place.feedbacks.length - 3} more reviews...
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No reviews yet. Be the first to review this place!
                      </Typography>
                    )}
                  </Box>
                </Grid>
                
                {/* Sidebar */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ position: 'sticky', top: 24 }}>
                    {/* Quick Information Card */}
                    <Card sx={{ mb: 3, boxShadow: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                          Quick Information
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                            Place Type
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {place.place_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                          </Typography>
                        </Box>
                        
                        {place.entry_fee && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                              Entry Fee
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              ${place.entry_fee}
                            </Typography>
                          </Box>
                        )}
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                            Rating
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating value={parseFloat(place.average_rating)} readOnly size="small" />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {place.average_rating} ({place.total_ratings} reviews)
                            </Typography>
                          </Box>
                        </Box>
                        
                        {place.category && (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                              Category
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {place.category?.name || place.category}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>

                    {/* Contact Info */}
                    <Card sx={{ mb: 3, boxShadow: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                          Contact Information
                        </Typography>
                        
                        {place.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Phone size={16} style={{ color: '#6b7280' }} />
                            <Typography variant="body2">{place.phone}</Typography>
                          </Box>
                        )}
                        
                        {place.email && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Mail size={16} style={{ color: '#6b7280' }} />
                            <Typography variant="body2">{place.email}</Typography>
                          </Box>
                        )}
                        
                        {place.website && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Globe size={16} style={{ color: '#6b7280' }} />
                            <Typography 
                              variant="body2" 
                              component="a" 
                              href={place.website} 
                              target="_blank"
                              sx={{ color: '#3b82f6', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                            >
                              Visit Website
                            </Typography>
                          </Box>
                        )}
                        
                        <Button
                          variant="outlined"
                          startIcon={<Navigation size={16} />}
                          fullWidth
                          sx={{ mt: 2 }}
                          onClick={() => {
                            const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
                            window.open(url, '_blank');
                          }}
                        >
                          Get Directions
                        </Button>
                      </CardContent>
                    </Card>
                    
                    {/* Opening Hours */}
                    {place.opening_hours && Object.keys(place.opening_hours).length > 0 && (
                      <Card sx={{ mb: 3, boxShadow: 2 }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Clock size={16} />
                            Opening Hours
                          </Typography>
                          {formatOpeningHours(place.opening_hours)}
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Location Details */}
                    <Card sx={{ boxShadow: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                          Location Details
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                            Province
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {place.province?.name || place.province}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                            District
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {place.district?.name || place.district}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                            Municipality
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {place.municipality?.name || place.municipality}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 400, gap: 2 }}>
            <Typography variant="h6" color="error">{error}</Typography>
            <Button variant="outlined" onClick={fetchPlaceDetails}>
              Try Again
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <Typography>No place data available</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlaceDetailModal;