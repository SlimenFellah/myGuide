/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Pagination,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Divider
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Users,
  DollarSign,
  Clock,
  Star,
  X,
  Download,
  Share,
  Calendar
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create numbered marker icons
const createNumberedIcon = (number, isActive = false) => {
  const backgroundColor = isActive ? '#1976d2' : '#666';
  const textColor = 'white';
  
  return L.divIcon({
    className: 'custom-numbered-marker',
    html: `
      <div style="
        background-color: ${backgroundColor};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        color: ${textColor};
      ">
        ${number}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

// Create curved path between points
const createCurvedPath = (points) => {
  if (points.length < 2) return [];
  
  const curvedPoints = [];
  
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    
    // Calculate control point for curve (offset perpendicular to the line)
    const midLat = (start[0] + end[0]) / 2;
    const midLng = (start[1] + end[1]) / 2;
    
    // Create a slight curve by offsetting the midpoint
    const offset = 0.002; // Adjust this value to control curve intensity
    const perpLat = -(end[1] - start[1]) * offset;
    const perpLng = (end[0] - start[0]) * offset;
    
    const controlLat = midLat + perpLat;
    const controlLng = midLng + perpLng;
    
    // Create curved path using quadratic bezier approximation
    const segments = 10;
    for (let t = 0; t <= segments; t++) {
      const ratio = t / segments;
      const lat = Math.pow(1 - ratio, 2) * start[0] + 
                  2 * (1 - ratio) * ratio * controlLat + 
                  Math.pow(ratio, 2) * end[0];
      const lng = Math.pow(1 - ratio, 2) * start[1] + 
                  2 * (1 - ratio) * ratio * controlLng + 
                  Math.pow(ratio, 2) * end[1];
      curvedPoints.push([lat, lng]);
    }
  }
  
  return curvedPoints;
};

const TripDetailsWithMapModal = ({ trip, isOpen, onClose }) => {
  if (!trip) return null;

  const [selectedDay, setSelectedDay] = useState(1);
  const [mapCenter, setMapCenter] = useState([35.6976, 0.6330]); // Default to Algeria center
  const [mapZoom, setMapZoom] = useState(10);

  const tripPlan = trip.trip_plan || trip;
  const dailyPlans = tripPlan.daily_plans || [];
  const currentDayPlan = dailyPlans.find(day => day.day_number === selectedDay) || dailyPlans[selectedDay - 1];
  
  // Extract coordinates from activities for the selected day
  const getDayActivities = () => {
    if (!currentDayPlan || !currentDayPlan.activities) return [];
    
    return currentDayPlan.activities.map((activity, index) => ({
      ...activity,
      number: index + 1,
      // Mock coordinates - in real app, these would come from the place data
      coordinates: generateMockCoordinates(index, dailyPlans.length)
    }));
  };

  // Generate mock coordinates for demonstration
  const generateMockCoordinates = (activityIndex, totalDays) => {
    // Base coordinates for Oran area
    const baseLatitude = 35.6976;
    const baseLongitude = -0.6330;
    
    // Create some variation based on activity index and day
    const latOffset = (Math.sin(activityIndex * 0.5) * 0.01) + (selectedDay - 1) * 0.005;
    const lngOffset = (Math.cos(activityIndex * 0.7) * 0.01) + (selectedDay - 1) * 0.005;
    
    return [
      baseLatitude + latOffset,
      baseLongitude + lngOffset
    ];
  };

  const dayActivities = getDayActivities();
  const activityCoordinates = dayActivities.map(activity => activity.coordinates);
  const curvedPath = createCurvedPath(activityCoordinates);

  // Update map center when day changes
  useEffect(() => {
    if (dayActivities.length > 0) {
      // Calculate center of all activities for the day
      const avgLat = dayActivities.reduce((sum, activity) => sum + activity.coordinates[0], 0) / dayActivities.length;
      const avgLng = dayActivities.reduce((sum, activity) => sum + activity.coordinates[1], 0) / dayActivities.length;
      setMapCenter([avgLat, avgLng]);
      setMapZoom(13);
    }
  }, [selectedDay, dayActivities.length]);

  const handleDayChange = (event, value) => {
    setSelectedDay(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { 
          maxHeight: '95vh',
          height: '95vh'
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {tripPlan.title || `Trip to ${tripPlan.province}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tripPlan.start_date && tripPlan.end_date && (
                  `${formatDate(tripPlan.start_date)} - ${formatDate(tripPlan.end_date)}`
                )}
              </Typography>
            </Box>
          </Box>
          <Button onClick={onClose} sx={{ minWidth: 'auto', p: 1 }}>
            <X size={20} />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Trip Overview */}
        <Paper sx={{ p: 2, m: 2, bgcolor: 'grey.50' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Trip Overview</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <MapPin size={32} style={{ margin: '0 auto 8px', color: '#1976d2' }} />
                <Typography variant="body2" color="text.secondary">Destination</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {tripPlan.province?.name || tripPlan.province || 'N/A'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Calendar size={32} style={{ margin: '0 auto 8px', color: '#1976d2' }} />
                <Typography variant="body2" color="text.secondary">Duration</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {tripPlan.duration_days || dailyPlans.length || 'Multi'} days
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Users size={32} style={{ margin: '0 auto 8px', color: '#1976d2' }} />
                <Typography variant="body2" color="text.secondary">Group Size</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {tripPlan.group_size || 1} {(tripPlan.group_size || 1) === 1 ? 'person' : 'people'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <DollarSign size={32} style={{ margin: '0 auto 8px', color: '#1976d2' }} />
                <Typography variant="body2" color="text.secondary">Budget</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  ${tripPlan.estimated_cost || 'N/A'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Description */}
        {tripPlan.ai_description && (
          <Paper sx={{ p: 2, mx: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <Star size={16} style={{ marginRight: 8 }} />
              Description
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tripPlan.ai_description}
            </Typography>
          </Paper>
        )}

        {/* Main Content Area */}
        <Box sx={{ display: 'flex', flex: 1, gap: 2, px: 2, pb: 2, minHeight: 0 }}>
          {/* Left Side - Daily Itinerary */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Paper sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Clock size={20} style={{ marginRight: 8 }} />
                  Daily Itinerary
                </Typography>
                {dailyPlans.length > 1 && (
                  <Pagination
                    count={dailyPlans.length}
                    page={selectedDay}
                    onChange={handleDayChange}
                    color="primary"
                    size="small"
                  />
                )}
              </Box>
              
              {currentDayPlan && (
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Day {currentDayPlan.day_number || selectedDay}: {currentDayPlan.title || `Day ${selectedDay} Activities`}
                  </Typography>
                  {currentDayPlan.date && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {formatDate(currentDayPlan.date)}
                    </Typography>
                  )}
                  {currentDayPlan.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                      {currentDayPlan.description}
                    </Typography>
                  )}
                  
                  {dayActivities.length > 0 && (
                    <List dense>
                      {dayActivities.map((activity, activityIndex) => (
                        <ListItem key={activity.id || activityIndex} sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              {activity.number}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {activity.place?.name || activity.name || 'Activity'}
                                </Typography>
                                {activity.start_time && activity.end_time && (
                                  <Chip 
                                    label={`${activity.start_time} - ${activity.end_time}`}
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {activity.description || activity.activity_type}
                                </Typography>
                                {activity.place?.address && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                    <MapPin size={12} />
                                    {activity.place.address}
                                  </Typography>
                                )}
                                {activity.estimated_cost && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                    <DollarSign size={12} />
                                    ${activity.estimated_cost}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              )}
            </Paper>
          </Box>

          {/* Right Side - Map */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Paper sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Day {selectedDay} Route Map
              </Typography>
              <Box sx={{ flex: 1, minHeight: 400, borderRadius: 1, overflow: 'hidden' }}>
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: '100%', width: '100%' }}
                  key={`${selectedDay}-${mapCenter[0]}-${mapCenter[1]}`}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* Activity Markers */}
                  {dayActivities.map((activity, index) => (
                    <Marker
                      key={index}
                      position={activity.coordinates}
                      icon={createNumberedIcon(activity.number, true)}
                    >
                      <Popup>
                        <Box sx={{ minWidth: 200 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            {activity.number}. {activity.place?.name || activity.name || 'Activity'}
                          </Typography>
                          {activity.start_time && activity.end_time && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                              <Clock size={12} style={{ marginRight: 4 }} />
                              {activity.start_time} - {activity.end_time}
                            </Typography>
                          )}
                          {activity.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {activity.description}
                            </Typography>
                          )}
                          {activity.estimated_cost && (
                            <Typography variant="caption" color="text.secondary">
                              <DollarSign size={12} style={{ marginRight: 4 }} />
                              ${activity.estimated_cost}
                            </Typography>
                          )}
                        </Box>
                      </Popup>
                    </Marker>
                  ))}
                  
                  {/* Curved Path */}
                  {curvedPath.length > 0 && (
                    <Polyline
                      positions={curvedPath}
                      pathOptions={{
                        color: '#1976d2',
                        weight: 3,
                        opacity: 0.8,
                        dashArray: '10, 10'
                      }}
                    />
                  )}
                </MapContainer>
              </Box>
            </Paper>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="outlined" startIcon={<Download />}>
          Export
        </Button>
        <Button variant="contained" startIcon={<Share />}>
          Share Trip
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TripDetailsWithMapModal;