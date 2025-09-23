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
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          maxHeight: '90vh'
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

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </Box>
        ) : place ? (
          <Box>
            {/* Image Gallery */}
            <Box sx={{ position: 'relative', height: 400, overflow: 'hidden' }}>
              <img
                src={place.images?.[selectedImageIndex]?.image || place.main_image || '/api/placeholder/800/400'}
                alt={place.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              
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

            {/* Content */}
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Main Info */}
                <Grid item xs={12} md={8}>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Chip
                        icon={React.createElement(getPlaceTypeIcon(place.place_type), { size: 16 })}
                        label={place.place_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        variant="outlined"
                        sx={{ borderColor: '#3b82f6', color: '#3b82f6' }}
                      />
                      {place.is_featured && (
                        <Chip
                          label="Featured"
                          color="primary"
                          size="small"
                        />
                      )}
                    </Box>
                    
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {place.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <MapPin size={16} style={{ color: '#6b7280' }} />
                      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        {place.address || `${place.municipality?.name || place.municipality}, ${place.district?.name || place.district}, ${place.province?.name || place.province}`}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={parseFloat(place.average_rating)} readOnly precision={0.1} size="small" />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {place.average_rating} ({place.total_ratings} reviews)
                        </Typography>
                      </Box>
                      
                      {place.entry_fee && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DollarSign size={16} style={{ color: '#6b7280' }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            ${place.entry_fee} entry fee
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  {/* Description */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      About this place
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
                      {place.description}
                    </Typography>
                  </Box>
                  
                  {/* Tags */}
                  {place.tags && place.tags.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Tags
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {place.tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            variant="outlined"
                            size="small"
                            sx={{ borderColor: '#e5e7eb', color: '#6b7280' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {/* Amenities */}
                  {place.amenities && place.amenities.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Amenities
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {place.amenities.map((amenity, index) => {
                          const AmenityIcon = getAmenityIcon(amenity);
                          return (
                            <Chip
                              key={index}
                              icon={AmenityIcon ? <AmenityIcon size={16} /> : undefined}
                              label={amenity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              variant="filled"
                              size="small"
                              sx={{ backgroundColor: '#f3f4f6', color: '#374151' }}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  )}
                </Grid>
                
                {/* Sidebar */}
                <Grid item xs={12} md={4}>
                  {/* Contact Info */}
                  <Card sx={{ mb: 3, boxShadow: 1 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
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
                    <Card sx={{ mb: 3, boxShadow: 1 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Clock size={16} />
                          Opening Hours
                        </Typography>
                        {formatOpeningHours(place.opening_hours)}
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Location Details */}
                  <Card sx={{ boxShadow: 1 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
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