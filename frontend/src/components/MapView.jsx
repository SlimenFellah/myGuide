/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Box, Card, CardContent, Typography, Button, IconButton } from '@mui/material';
import { MapPin, Star, DollarSign, X, ExternalLink } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different categories
const createCustomIcon = (category) => {
  const colors = {
    historic: '#8B4513',
    nature: '#22C55E',
    restaurants: '#F59E0B',
    entertainment: '#8B5CF6',
    default: '#3B82F6'
  };
  
  const color = colors[category] || colors.default;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 25px;
        height: 25px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 12px;
          text-align: center;
          line-height: 19px;
        ">📍</div>
      </div>
    `,
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25]
  });
};

const PlaceCard = ({ place, onClose, onViewDetails }) => {
  return (
    <Card sx={{
      position: 'absolute',
      top: 20,
      right: 20,
      width: 320,
      maxHeight: '80vh',
      overflow: 'auto',
      zIndex: 1000,
      boxShadow: 3,
      border: 0
    }}>
      <CardContent sx={{ p: 0 }}>
        {/* Header with close button */}
        <Box sx={{ 
          position: 'relative',
          height: 200,
          overflow: 'hidden'
        }}>
          <img 
            src={place.main_image || '/api/placeholder/400/300'} 
            alt={place.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255,255,255,0.9)',
              '&:hover': {
                backgroundColor: 'white'
              }
            }}
          >
            <X size={20} />
          </IconButton>
        </Box>
        
        {/* Content */}
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            mb: 1,
            color: 'text.primary'
          }}>
            {place.name}
          </Typography>
          
          <Typography variant="body2" sx={{ 
            color: 'text.secondary', 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {place.description}
          </Typography>
          
          {/* Location */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <MapPin size={16} style={{ marginRight: 8, color: '#6b7280' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {typeof place.municipality === 'object' ? place.municipality?.name : place.municipality || 'Unknown'}, {typeof place.province === 'object' ? place.province?.name : place.province || 'Unknown'}
            </Typography>
          </Box>
          
          {/* Rating and Cost */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Star size={16} style={{ color: '#fbbf24', fill: 'currentColor', marginRight: 4 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {place.rating} ({place.reviews} reviews)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DollarSign size={16} style={{ marginRight: 4, color: '#6b7280' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                ${place.averageCost} {place.costType}
              </Typography>
            </Box>
          </Box>
          
          {/* View Details Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={() => onViewDetails(place.id)}
            sx={{
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#2563eb'
              }
            }}
          >
            <ExternalLink size={16} style={{ marginRight: 8 }} />
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const MapView = ({ places, onPlaceSelect, selectedPlace, onCloseCard }) => {
  const mapRef = useRef(null);
  const [selectedPlaceData, setSelectedPlaceData] = useState(null);
  
  // Default center (Morocco)
  const defaultCenter = [31.7917, -7.0926];
  const defaultZoom = 6;
  
  useEffect(() => {
    if (selectedPlace && places.length > 0) {
      const place = places.find(p => p.id === selectedPlace);
      if (place && place.latitude && place.longitude) {
        setSelectedPlaceData(place);
      }
    } else {
      setSelectedPlaceData(null);
    }
  }, [selectedPlace, places]);
  
  // Filter places that have valid coordinates
  const validPlaces = places.filter(place => 
    place.latitude && 
    place.longitude && 
    !isNaN(parseFloat(place.latitude)) && 
    !isNaN(parseFloat(place.longitude))
  );
  
  // Debug logging
  console.log('MapView - Total places received:', places.length);
  console.log('MapView - Valid places with coordinates:', validPlaces.length);
  console.log('MapView - Sample place data:', places[0]);
  console.log('MapView - Valid places:', validPlaces.map(p => ({ name: p.name, lat: p.latitude, lng: p.longitude })));
  
  const handleMarkerClick = (place) => {
    setSelectedPlaceData(place);
    if (onPlaceSelect) {
      onPlaceSelect(place.id);
    }
  };
  
  const handleCloseCard = () => {
    setSelectedPlaceData(null);
    if (onCloseCard) {
      onCloseCard();
    }
  };
  
  const handleViewDetails = (placeId) => {
    if (onPlaceSelect) {
      onPlaceSelect(placeId);
    }
  };
  
  return (
    <Box sx={{ position: 'relative', height: '500px', width: '100%' }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {validPlaces.map((place) => {
          const lat = parseFloat(place.latitude);
          const lng = parseFloat(place.longitude);
          
          return (
            <Marker
              key={place.id}
              position={[lat, lng]}
              icon={createCustomIcon(place.category)}
              eventHandlers={{
                click: () => handleMarkerClick(place)
              }}
            >
              <Popup>
                <Box sx={{ minWidth: 200 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    {place.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    {place.description?.substring(0, 100)}...
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleMarkerClick(place)}
                    sx={{ mt: 1 }}
                  >
                    View Details
                  </Button>
                </Box>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Place Detail Card */}
      {selectedPlaceData && (
        <PlaceCard
          place={selectedPlaceData}
          onClose={handleCloseCard}
          onViewDetails={handleViewDetails}
        />
      )}
    </Box>
  );
};

export default MapView;