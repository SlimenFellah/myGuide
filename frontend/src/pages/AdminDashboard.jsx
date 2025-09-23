/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  MessageSquare, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Download, 
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  Star,
  Flag
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  Box, 
  TextField, 
  Tabs, 
  Tab, 
  Chip, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Grid, 
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  Avatar,
  CircularProgress
} from '@mui/material';
import { CalendarToday as Calendar } from '@mui/icons-material';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPlaces: 0,
    pendingFeedbacks: 0,
    monthlyVisits: 0
  });
  const [users, setUsers] = useState([]);
  const [places, setPlaces] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [showEditPlaceModal, setShowEditPlaceModal] = useState(false);
  const [showViewPlaceModal, setShowViewPlaceModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [spamFilter, setSpamFilter] = useState('all'); // all, spam, not_spam
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected
  const [newPlace, setNewPlace] = useState({
    name: '',
    description: '',
    municipality: '',
    category: '',
    place_type: '',
    address: '',
    latitude: '',
    longitude: '',
    entry_fee: '',
    opening_hours: '',
    phone: '',
    website: '',
    image: null
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch statistics
      const [usersRes, placesStatsRes, provincesStatsRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/auth/admin/users/', { headers }),
        fetch('http://127.0.0.1:8000/api/tourism/admin/stats/places/', { headers }),
        fetch('http://127.0.0.1:8000/api/tourism/admin/stats/provinces/', { headers })
      ]);

      const usersData = await usersRes.json();
      const placesStats = await placesStatsRes.json();
      const provincesStats = await provincesStatsRes.json();

      // Handle paginated response - extract results array with better error handling
      let users = [];
      if (usersData && typeof usersData === 'object') {
        if (Array.isArray(usersData.results)) {
          users = usersData.results;
        } else if (Array.isArray(usersData)) {
          users = usersData;
        }
      }
      
      // Calculate statistics from real data
      setStats({
        totalUsers: usersData.count || users.length || 0,
        totalPlaces: placesStats.total_places || 0,
        pendingFeedbacks: placesStats.total_feedbacks || 0,
        monthlyVisits: Math.floor(Math.random() * 10000) + 5000 // Simulated for now
      });

      // Set real users data with null check
      const formattedUsers = Array.isArray(users) ? users.map(user => ({
        id: user.id,
        firstName: user.first_name || 'Unknown',
        lastName: user.last_name || 'User',
        email: user.email,
        role: user.is_staff ? 'admin' : 'user',
        status: user.is_active ? 'active' : 'inactive',
        joinDate: user.date_joined ? user.date_joined.split('T')[0] : '2024-01-01',
        lastLogin: user.last_login ? user.last_login.split('T')[0] : '2024-01-01'
      })) : [];
      setUsers(formattedUsers);

      // Fetch real places data
      const placesRes = await fetch('http://127.0.0.1:8000/api/tourism/places/', { headers });
      const placesData = await placesRes.json();
      
      const formattedPlaces = placesData.results ? placesData.results.map(place => ({
        id: place.id,
        name: place.name,
        province: typeof place.province === 'object' ? place.province?.name : place.province || 'Unknown',
        district: typeof place.district === 'object' ? place.district?.name : place.district || 'Unknown',
        municipality: typeof place.municipality === 'object' ? place.municipality?.name : place.municipality || 'Unknown',
        category: typeof place.category === 'object' ? place.category?.name : place.category || 'Unknown',
        status: place.is_active ? 'active' : 'inactive',
        rating: place.average_rating || 0,
        reviews: place.feedback_count || 0,
        averageCost: place.average_cost || 0,
        addedBy: place.created_by?.is_staff ? 'admin' : 'user',
        addedDate: place.created_at ? place.created_at.split('T')[0] : '2024-01-01'
      })) : [];
      setPlaces(formattedPlaces);

      // Fetch real feedbacks data from all places
      let allFeedbacks = [];
      try {
        console.log('🔍 Starting to fetch feedbacks...');
        // Fetch all feedbacks at once
        const feedbackRes = await fetch('http://127.0.0.1:8000/api/tourism/feedbacks/', { 
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📡 Feedback API response status:', feedbackRes.status);
        
        if (!feedbackRes.ok) {
          throw new Error(`HTTP error! Status: ${feedbackRes.status}`);
        }
        
        const feedbackData = await feedbackRes.json();
        console.log('📊 Raw feedback data:', feedbackData);
        
        if (feedbackData.results) {
          console.log('✅ Found feedbacks in results:', feedbackData.results.length);
          allFeedbacks = feedbackData.results.map(feedback => {
            const place = formattedPlaces.find(p => p.id === feedback.place) || { name: 'Unknown Place' };
            return {
              id: feedback.id,
              placeId: feedback.place,
              placeName: place.name,
              userId: feedback.user?.id || 0,
              userName: feedback.user_name || 'Anonymous',
              userEmail: feedback.user_email || '',
              rating: feedback.rating,
              comment: feedback.comment,
              status: feedback.status || 'pending',
              date: feedback.created_at ? feedback.created_at.split('T')[0] : '2024-01-01',
              createdAt: feedback.created_at,
              updatedAt: feedback.updated_at,
              reviewedBy: feedback.reviewed_by_name || null,
              reviewedAt: feedback.reviewed_at,
              helpfulCount: feedback.helpful_count || 0,
              isSpam: feedback.is_spam || false,
              spamConfidence: feedback.spam_confidence || 0,
              spamDetectedAt: feedback.spam_detected_at,
              spamReasons: feedback.spam_reasons || [],
              type: feedback.rating <= 2 ? 'complaint' : 'review'
            };
          });
          console.log('🎯 Processed feedbacks:', allFeedbacks);
        } else {
          console.log('❌ No results key in feedback data');
        }
      } catch (error) {
        console.error('❌ Error fetching feedbacks:', error);
      }
      console.log('💾 Setting feedbacks state:', allFeedbacks);
      setFeedbacks(allFeedbacks);

      // Set provinces data from the stats we already fetched
      if (provincesStats.provinces) {
        setProvinces(provincesStats.provinces.map(province => ({
          id: province.id || Math.random(),
          name: province.name || 'Unknown',
          districts: province.districts_count || 0,
          municipalities: province.municipalities_count || 0,
          places: province.places_count || 0
        })));
      } else {
        setProvinces([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError(error.message || 'Failed to load admin data. Please try again.');
      setLoading(false);
      // Set empty data on error
      setStats({ totalUsers: 0, totalPlaces: 0, pendingFeedbacks: 0, monthlyVisits: 0 });
      setUsers([]);
      setPlaces([]);
      setFeedbacks([]);
      setProvinces([]);
    }
  };

  const handleApprovePlace = (placeId) => {
    setPlaces(places.map(place => 
      place.id === placeId ? { ...place, status: 'approved' } : place
    ));
  };

  const handleRejectPlace = (placeId) => {
    setPlaces(places.map(place => 
      place.id === placeId ? { ...place, status: 'rejected' } : place
    ));
  };

  const handleApproveFeedback = async (feedbackId) => {
    try {
      const token = localStorage.getItem('access_token');
      const feedback = feedbacks.find(f => f.id === feedbackId);
      const response = await fetch(`http://127.0.0.1:8000/api/tourism/places/${feedback.placeId}/feedbacks/${feedbackId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'approved' })
      });

      if (response.ok) {
        const updatedFeedback = await response.json();
        setFeedbacks(feedbacks.map(f => 
          f.id === feedbackId ? { ...f, status: 'approved', reviewedBy: 'Admin', reviewedAt: new Date().toISOString() } : f
        ));
      }
    } catch (error) {
      console.error('Error approving feedback:', error);
    }
  };

  const handleRejectFeedback = async (feedbackId) => {
    try {
      const token = localStorage.getItem('access_token');
      const feedback = feedbacks.find(f => f.id === feedbackId);
      const response = await fetch(`http://127.0.0.1:8000/api/tourism/places/${feedback.placeId}/feedbacks/${feedbackId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'rejected' })
      });

      if (response.ok) {
        const updatedFeedback = await response.json();
        setFeedbacks(feedbacks.map(f => 
          f.id === feedbackId ? { ...f, status: 'rejected', reviewedBy: 'Admin', reviewedAt: new Date().toISOString() } : f
        ));
      }
    } catch (error) {
      console.error('Error rejecting feedback:', error);
    }
  };

  // Place management functions
  const handleAddPlace = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      
      // Add all form fields to FormData
      Object.keys(newPlace).forEach(key => {
        if (newPlace[key] !== null && newPlace[key] !== '') {
          formData.append(key, newPlace[key]);
        }
      });

      const response = await fetch('http://127.0.0.1:8000/api/tourism/places/create/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const newPlaceData = await response.json();
        setPlaces([...places, {
          id: newPlaceData.id,
          name: newPlaceData.name,
          province: newPlaceData.municipality?.district?.province?.name || 'Unknown',
          district: newPlaceData.municipality?.district?.name || 'Unknown',
          municipality: newPlaceData.municipality?.name || 'Unknown',
          category: newPlaceData.category?.name || 'Unknown',
          status: newPlaceData.is_approved ? 'approved' : 'pending',
          rating: newPlaceData.average_rating || 0,
          reviews: newPlaceData.feedback_count || 0,
          averageCost: newPlaceData.average_cost || 0,
          addedBy: 'admin',
          addedDate: new Date().toISOString().split('T')[0]
        }]);
        setShowAddPlaceModal(false);
        setNewPlace({
          name: '',
          description: '',
          municipality: '',
          category: '',
          place_type: 'restaurant',
          address: '',
          latitude: '',
          longitude: '',
          entry_fee: '',
          opening_hours: '',
          phone: '',
          website: '',
          image: null
        });
      } else {
        console.error('Failed to add place');
      }
    } catch (error) {
      console.error('Error adding place:', error);
    }
  };

  const handleEditPlace = async (place) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/tourism/places/${place.id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const detailedPlace = await response.json();
        setSelectedPlace(detailedPlace);
        setNewPlace({
          name: detailedPlace.name || '',
          description: detailedPlace.description || '',
          province: detailedPlace.municipality?.district?.province?.id || '',
          district: detailedPlace.municipality?.district?.id || '',
          municipality: detailedPlace.municipality?.id || '',
          category: detailedPlace.category?.id || '',
          address: detailedPlace.address || '',
          latitude: detailedPlace.latitude || '',
          longitude: detailedPlace.longitude || '',
          entry_fee: detailedPlace.entry_fee || '',
          opening_hours: detailedPlace.opening_hours ? JSON.stringify(detailedPlace.opening_hours) : '',
          phone: detailedPlace.phone || '',
          website: detailedPlace.website || '',
          place_type: detailedPlace.place_type || '',
          email: detailedPlace.email || '',
          tags: detailedPlace.tags ? JSON.stringify(detailedPlace.tags) : '',
          amenities: detailedPlace.amenities ? JSON.stringify(detailedPlace.amenities) : '',
          image: null
        });
      } else {
        setSelectedPlace(place);
        setNewPlace({
          name: place.name || '',
          description: place.description || '',
          province: place.province || '',
          district: place.district || '',
          municipality: place.municipality || '',
          category: place.category || '',
          address: place.address || '',
          latitude: place.latitude || '',
          longitude: place.longitude || '',
          average_cost: place.averageCost || '',
          opening_hours: place.opening_hours || '',
          contact_info: place.contact_info || '',
          website: place.website || '',
          image: null
        });
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      setSelectedPlace(place);
      setNewPlace({
        name: place.name || '',
        description: place.description || '',
        province: place.province || '',
        district: place.district || '',
        municipality: place.municipality || '',
        category: place.category || '',
        address: place.address || '',
        latitude: place.latitude || '',
        longitude: place.longitude || '',
        average_cost: place.averageCost || '',
        opening_hours: place.opening_hours || '',
        contact_info: place.contact_info || '',
        website: place.website || '',
        image: null
      });
    }
    setShowEditPlaceModal(true);
  };

  const handleUpdatePlace = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      
      // Add all fields to formData
      Object.keys(newPlace).forEach(key => {
        if (key === 'image' && newPlace[key] instanceof File) {
          formData.append('image', newPlace[key]);
        } else if (newPlace[key] !== null && newPlace[key] !== undefined && key !== 'image') {
          formData.append(key, newPlace[key]);
        }
      });

      const response = await fetch(`http://127.0.0.1:8000/api/tourism/places/${selectedPlace.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const updatedPlaceData = await response.json();
        setPlaces(places.map(place => 
          place.id === selectedPlace.id ? {
            ...place,
            id: updatedPlaceData.id,
            name: updatedPlaceData.name,
            description: updatedPlaceData.description,
            province: updatedPlaceData.province,
            district: updatedPlaceData.district,
            municipality: updatedPlaceData.municipality,
            category: updatedPlaceData.category?.name || 'Unknown',
            latitude: updatedPlaceData.latitude,
            longitude: updatedPlaceData.longitude,
            address: updatedPlaceData.address,
            averageCost: updatedPlaceData.average_cost || 0,
            opening_hours: updatedPlaceData.opening_hours,
            contact_info: updatedPlaceData.contact_info,
            website: updatedPlaceData.website,
            image_url: updatedPlaceData.image_url
          } : place
        ));
        setShowEditPlaceModal(false);
        setSelectedPlace(null);
      } else {
        const errorData = await response.json();
        console.error('Error updating place:', errorData);
        alert('Failed to update place. Please check the form and try again.');
      }
    } catch (error) {
      console.error('Error updating place:', error);
      alert('An error occurred while updating the place.');
    }
  };

  const handleDeletePlace = async (placeId) => {
    if (window.confirm('Are you sure you want to delete this place?')) {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`http://127.0.0.1:8000/api/tourism/places/${placeId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setPlaces(places.filter(place => place.id !== placeId));
        }
      } catch (error) {
        console.error('Error deleting place:', error);
      }
    }
  };

  const handleViewPlace = async (place) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/tourism/places/${place.id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const detailedPlace = await response.json();
        setSelectedPlace(detailedPlace);
      } else {
        setSelectedPlace(place);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      setSelectedPlace(place);
    }
    setShowViewPlaceModal(true);
  };

  // User management functions
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminService.users.delete(userId);
        setUsers(users.filter(user => user.id !== userId));
        console.log('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await adminService.users.updateStatus(userId, newStatus);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      console.log('User status updated successfully');
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status. Please try again.');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await adminService.users.updateRole(userId, newRole);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      setShowEditUserModal(false);
      console.log('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role. Please try again.');
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewUserModal(true);
  };

  const handleDeleteFeedback = async (feedbackId) => {
     if (window.confirm('Are you sure you want to delete this feedback?')) {
       try {
         const token = localStorage.getItem('access_token');
         const feedback = feedbacks.find(f => f.id === feedbackId);
         const response = await fetch(`http://127.0.0.1:8000/api/tourism/places/${feedback.placeId}/feedbacks/${feedbackId}/`, {
           method: 'DELETE',
           headers: {
             'Authorization': `Bearer ${token}`
           }
         });
 
         if (response.ok) {
           setFeedbacks(feedbacks.filter(feedback => feedback.id !== feedbackId));
         }
       } catch (error) {
         console.error('Error deleting feedback:', error);
       }
     }
   };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <Card sx={{
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: 6,
        transform: 'scale(1.05)'
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {value.toLocaleString()}
            </Typography>
            {change && (
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 0.5, 
                  display: 'flex', 
                  alignItems: 'center',
                  color: change > 0 ? 'success.main' : 'error.main'
                }}
              >
                <TrendingUp size={14} style={{ marginRight: 4 }} />
                {change > 0 ? '+' : ''}{change}% from last month
              </Typography>
            )}
          </Box>
          <Box sx={{
            p: 1.5,
            borderRadius: 3,
            background: color,
            boxShadow: 2
          }}>
            <Icon style={{ color: 'white' }} size={24} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderOverview = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Stats Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            icon={Users} 
            color="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
            change={12}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard 
            title="Total Places" 
            value={stats.totalPlaces} 
            icon={MapPin} 
            color="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            change={8}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard 
            title="Pending Feedbacks" 
            value={stats.pendingFeedbacks} 
            icon={MessageSquare} 
            color="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
            change={-5}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard 
            title="Monthly Visits" 
            value={stats.monthlyVisits} 
            icon={TrendingUp} 
            color="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
            change={23}
          />
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Card sx={{
            transition: 'box-shadow 0.3s ease',
            '&:hover': { boxShadow: 4 }
          }}>
            <CardHeader 
              title={
                <Typography variant="h6">Recent Places</Typography>
              }
              action={
                <Button 
                  variant="text" 
                  size="small"
                  sx={{
                    color: 'primary.main',
                    '&:hover': {
                      color: 'primary.dark',
                      backgroundColor: 'primary.50'
                    }
                  }}
                >
                  View all
                </Button>
              }
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {places.slice(0, 5).map((place) => (
                  <Box 
                    key={place.id} 
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      backgroundColor: 'grey.50',
                      borderRadius: 2,
                      transition: 'background-color 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'grey.100'
                      }
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                        {place.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {place.municipality}, {place.province}
                      </Typography>
                    </Box>
                    <Chip 
                      label={place.status}
                      color={
                        place.status === 'approved' ? 'success' :
                        place.status === 'pending' ? 'warning' :
                        'error'
                      }
                      size="small"
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card sx={{
            transition: 'box-shadow 0.3s ease',
            '&:hover': { boxShadow: 4 }
          }}>
            <CardHeader 
              title={
                <Typography variant="h6">Recent Feedbacks</Typography>
              }
              action={
                <Button 
                  variant="text" 
                  size="small"
                  sx={{
                    color: 'primary.main',
                    '&:hover': {
                      color: 'primary.dark',
                      backgroundColor: 'primary.50'
                    }
                  }}
                >
                  View all
                </Button>
              }
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {feedbacks.slice(0, 5).map((feedback) => (
                  <Box 
                    key={feedback.id} 
                    sx={{
                      p: 1.5,
                      backgroundColor: 'grey.50',
                      borderRadius: 2,
                      transition: 'background-color 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'grey.100'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                        {feedback.placeName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Star style={{ color: '#facc15', fill: 'currentColor' }} size={14} />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                          {feedback.rating}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {feedback.comment.substring(0, 100)}...
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">
                        by {feedback.userName}
                      </Typography>
                      <Chip 
                        label={feedback.status}
                        color={
                          feedback.status === 'approved' ? 'success' :
                          feedback.status === 'pending' ? 'warning' :
                          feedback.status === 'flagged' ? 'error' :
                          'default'
                        }
                        size="small"
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderUsers = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          User Management
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 2 
      }}>
        <TextField
          fullWidth
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} color="#6b7280" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              transition: 'border-color 0.2s ease',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main'
              }
            }
          }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by status</InputLabel>
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            label="Filter by status"
            sx={{
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main'
              }
            }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Users Table */}
      <TableContainer 
        component={Paper} 
        sx={{
          transition: 'box-shadow 0.3s ease',
          '&:hover': { boxShadow: 4 }
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: 'grey.50' }}>
            <TableRow>
              <TableCell 
                sx={{ 
                  fontWeight: 600, 
                  textTransform: 'uppercase', 
                  fontSize: '0.75rem', 
                  color: 'text.secondary',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'grey.100' }
                }}
                onClick={() => handleUsersSort('firstName')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  User
                  {usersSortConfig.key === 'firstName' && (
                    usersSortConfig.direction === 'asc' ? <TrendingUp size={14} /> : <TrendingDown size={14} />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 600, 
                  textTransform: 'uppercase', 
                  fontSize: '0.75rem', 
                  color: 'text.secondary',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'grey.100' }
                }}
                onClick={() => handleUsersSort('role')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Role
                  {usersSortConfig.key === 'role' && (
                    usersSortConfig.direction === 'asc' ? <TrendingUp size={14} /> : <TrendingDown size={14} />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 600, 
                  textTransform: 'uppercase', 
                  fontSize: '0.75rem', 
                  color: 'text.secondary',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'grey.100' }
                }}
                onClick={() => handleUsersSort('status')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Status
                  {usersSortConfig.key === 'status' && (
                    usersSortConfig.direction === 'asc' ? <TrendingUp size={14} /> : <TrendingDown size={14} />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 600, 
                  textTransform: 'uppercase', 
                  fontSize: '0.75rem', 
                  color: 'text.secondary',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'grey.100' }
                }}
                onClick={() => handleUsersSort('joinDate')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Join Date
                  {usersSortConfig.key === 'joinDate' && (
                    usersSortConfig.direction === 'asc' ? <TrendingUp size={14} /> : <TrendingDown size={14} />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 600, 
                  textTransform: 'uppercase', 
                  fontSize: '0.75rem', 
                  color: 'text.secondary',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'grey.100' }
                }}
                onClick={() => handleUsersSort('lastLogin')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Last Login
                  {usersSortConfig.key === 'lastLogin' && (
                    usersSortConfig.direction === 'asc' ? <TrendingUp size={14} /> : <TrendingDown size={14} />
                  )}
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', color: 'text.secondary' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(users) && getSortedUsers(users).map((user) => (
              <TableRow 
                key={user.id} 
                sx={{
                  '&:hover': { backgroundColor: 'grey.50' },
                  '&:last-child td, &:last-child th': { border: 0 }
                }}
              >
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.role}
                    color={user.role === 'admin' ? 'secondary' : 'default'}
                    variant={user.role === 'admin' ? 'filled' : 'outlined'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.status}
                    color={user.status === 'active' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(user.joinDate).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(user.lastLogin).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton 
                      size="small"
                      onClick={() => handleViewUser(user)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'primary.50',
                          color: 'primary.main'
                        }
                      }}
                    >
                      <Eye size={16} />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={() => handleEditUser(user)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'grey.100'
                        }
                      }}
                    >
                      <Edit size={16} />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={() => handleDeleteUser(user.id)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'error.50',
                          color: 'error.main'
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderPlaces = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Places Management</Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button 
            variant="contained" 
            startIcon={<Plus size={16} />}
            onClick={() => setShowAddPlaceModal(true)}
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: 4
              }
            }}
          >
            Add Place
          </Button>
        </Box>
      </Box>

      {/* Places Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: 'grey.50' }}>
            <TableRow>
              <TableCell 
                sx={{ 
                  fontWeight: 600, 
                  textTransform: 'uppercase', 
                  fontSize: '0.75rem', 
                  color: 'text.secondary',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'grey.100' }
                }}
                onClick={() => handlePlacesSort('name')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Place
                  {placesSortConfig.key === 'name' && (
                    placesSortConfig.direction === 'asc' ? <TrendingUp size={14} /> : <TrendingDown size={14} />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 600, 
                  textTransform: 'uppercase', 
                  fontSize: '0.75rem', 
                  color: 'text.secondary',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'grey.100' }
                }}
                onClick={() => handlePlacesSort('municipality')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Location
                  {placesSortConfig.key === 'municipality' && (
                    placesSortConfig.direction === 'asc' ? <TrendingUp size={14} /> : <TrendingDown size={14} />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 600, 
                  textTransform: 'uppercase', 
                  fontSize: '0.75rem', 
                  color: 'text.secondary',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'grey.100' }
                }}
                onClick={() => handlePlacesSort('category')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Category
                  {placesSortConfig.key === 'category' && (
                    placesSortConfig.direction === 'asc' ? <TrendingUp size={14} /> : <TrendingDown size={14} />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 600, 
                  textTransform: 'uppercase', 
                  fontSize: '0.75rem', 
                  color: 'text.secondary',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'grey.100' }
                }}
                onClick={() => handlePlacesSort('status')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Status
                  {placesSortConfig.key === 'status' && (
                    placesSortConfig.direction === 'asc' ? <TrendingUp size={14} /> : <TrendingDown size={14} />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 600, 
                  textTransform: 'uppercase', 
                  fontSize: '0.75rem', 
                  color: 'text.secondary',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'grey.100' }
                }}
                onClick={() => handlePlacesSort('rating')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Rating
                  {placesSortConfig.key === 'rating' && (
                    placesSortConfig.direction === 'asc' ? <TrendingUp size={14} /> : <TrendingDown size={14} />
                  )}
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', color: 'text.secondary' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getSortedPlaces(places).map((place) => (
              <TableRow 
                key={place.id} 
                sx={{
                  '&:hover': { backgroundColor: 'grey.50' },
                  '&:last-child td, &:last-child th': { border: 0 }
                }}
              >
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{place.name}</Typography>
                    <Typography variant="body2" color="text.secondary">Added by {place.addedBy}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{place.municipality}</Typography>
                    <Typography variant="body2" color="text.secondary">{place.province}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={place.category}
                    color="secondary"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={place.status}
                    color={
                      place.status === 'approved' ? 'success' :
                      place.status === 'pending' ? 'warning' :
                      'error'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Star sx={{ color: 'warning.main', fontSize: 14 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                      {place.rating} ({place.reviews})
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton 
                      onClick={() => handleViewPlace(place)}
                      size="small"
                      title="View Details"
                      sx={{
                        color: 'info.main',
                        '&:hover': {
                          backgroundColor: 'info.50',
                          color: 'info.dark'
                        }
                      }}
                    >
                      <Eye size={16} />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleEditPlace(place)}
                      size="small"
                      title="Edit Place"
                      sx={{
                        '&:hover': {
                          backgroundColor: 'grey.100'
                        }
                      }}
                    >
                      <Edit size={16} />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDeletePlace(place.id)}
                      size="small"
                      title="Delete Place"
                      sx={{
                        color: 'error.main',
                        '&:hover': {
                          backgroundColor: 'error.50',
                          color: 'error.dark'
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [placesSortConfig, setPlacesSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [usersSortConfig, setUsersSortConfig] = useState({ key: 'joinDate', direction: 'desc' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', feedbackId: null, feedbackTitle: '' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handlePlacesSort = (key) => {
    let direction = 'asc';
    if (placesSortConfig.key === key && placesSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setPlacesSortConfig({ key, direction });
  };

  const handleUsersSort = (key) => {
    let direction = 'asc';
    if (usersSortConfig.key === key && usersSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setUsersSortConfig({ key, direction });
  };

  const getSortedFeedbacks = (feedbacks) => {
    const filteredFeedbacks = feedbacks.filter(feedback => {
      const spamMatch = spamFilter === 'all' || 
                       (spamFilter === 'spam' && feedback.isSpam) ||
                       (spamFilter === 'not_spam' && !feedback.isSpam);
      const statusMatch = statusFilter === 'all' || feedback.status === statusFilter;
      return spamMatch && statusMatch;
    });

    return [...filteredFeedbacks].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle different data types
      if (sortConfig.key === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortConfig.key === 'rating') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const getSortedPlaces = (places) => {
    return [...places].sort((a, b) => {
      let aValue = a[placesSortConfig.key];
      let bValue = b[placesSortConfig.key];
      
      // Handle different data types
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) {
        return placesSortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return placesSortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const getSortedUsers = (users) => {
    return [...users].sort((a, b) => {
      let aValue = a[usersSortConfig.key];
      let bValue = b[usersSortConfig.key];
      
      // Handle different data types
      if (usersSortConfig.key === 'joinDate' || usersSortConfig.key === 'dateJoined') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) {
        return usersSortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return usersSortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const handleToggleStatus = (feedbackId, currentStatus) => {
    const feedback = feedbacks.find(f => f.id === feedbackId);
    const newStatus = currentStatus === 'pending' ? 'approved' : 'pending';
    const actionType = newStatus === 'approved' ? 'approve' : 'mark as pending';
    
    setConfirmDialog({
      open: true,
      type: 'toggle',
      feedbackId,
      feedbackTitle: feedback?.placeName || 'Unknown Place',
      currentStatus,
      newStatus,
      actionType
    });
  };

  const handleDeleteConfirm = (feedbackId) => {
    const feedback = feedbacks.find(f => f.id === feedbackId);
    setConfirmDialog({
      open: true,
      type: 'delete',
      feedbackId,
      feedbackTitle: feedback?.placeName || 'Unknown Place'
    });
  };

  const executeAction = async () => {
    const { type, feedbackId, newStatus } = confirmDialog;
    
    if (type === 'toggle') {
      if (newStatus === 'approved') {
        await handleApproveFeedback(feedbackId);
      } else {
        // Create a function to mark as pending
        await handleMarkAsPending(feedbackId);
      }
    } else if (type === 'delete') {
      await handleDeleteFeedback(feedbackId);
    }
    
    setConfirmDialog({ open: false, type: '', feedbackId: null, feedbackTitle: '' });
  };

  const handleMarkAsPending = async (feedbackId) => {
    try {
      const token = localStorage.getItem('access_token');
      const feedback = feedbacks.find(f => f.id === feedbackId);
      const response = await fetch(`http://127.0.0.1:8000/api/tourism/places/${feedback.placeId}/feedbacks/${feedbackId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'pending' })
      });

      if (response.ok) {
        setFeedbacks(feedbacks.map(f => 
          f.id === feedbackId ? { ...f, status: 'pending', reviewedBy: null, reviewedAt: null } : f
        ));
      }
    } catch (error) {
      console.error('Error marking feedback as pending:', error);
    }
  };

  const renderFeedbacks = () => {
    console.log('🎨 Rendering feedbacks, current feedbacks state:', feedbacks);
    console.log('📊 Feedbacks array length:', feedbacks.length);
    
    const sortedFeedbacks = getSortedFeedbacks(feedbacks);
    
    const getSortIcon = (columnKey) => {
      if (sortConfig.key !== columnKey) {
        return <TrendingUp size={14} style={{ opacity: 0.3 }} />;
      }
      return sortConfig.direction === 'asc' ? 
        <TrendingUp size={14} /> : 
        <TrendingDown size={14} />;
    };
    
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Feedback Management</Typography>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Spam Filter</InputLabel>
            <Select
              value={spamFilter}
              label="Spam Filter"
              onChange={(e) => setSpamFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="spam">Spam Only</MenuItem>
              <MenuItem value="not_spam">Not Spam</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          
          <Typography variant="body2" color="text.secondary">
            Showing {sortedFeedbacks.length} of {feedbacks.length} feedbacks
          </Typography>
        </Box>

        {/* Feedbacks Table */}
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell 
                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  onClick={() => handleSort('placeName')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Place {getSortIcon('placeName')}
                  </Box>
                </TableCell>
                <TableCell 
                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  onClick={() => handleSort('rating')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Rating {getSortIcon('rating')}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Comment</TableCell>
                <TableCell 
                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  onClick={() => handleSort('userName')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    User {getSortIcon('userName')}
                  </Box>
                </TableCell>
                <TableCell 
                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  onClick={() => handleSort('createdAt')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Posted Date {getSortIcon('createdAt')}
                  </Box>
                </TableCell>
                <TableCell 
                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  onClick={() => handleSort('status')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Status {getSortIcon('status')}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Spam</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedFeedbacks.map((feedback) => (
                <TableRow 
                  key={feedback.id}
                  sx={{
                    '&:hover': { backgroundColor: '#f9f9f9' },
                    backgroundColor: feedback.isSpam ? '#ffebee' : 'inherit'
                  }}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {feedback.placeName}
                      </Typography>
                      <Chip 
                        label={feedback.type}
                        color={feedback.type === 'complaint' ? 'error' : 'secondary'}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          style={{
                            color: i < feedback.rating ? '#facc15' : '#d1d5db',
                            fill: i < feedback.rating ? '#facc15' : '#d1d5db'
                          }}
                        />
                      ))}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({feedback.rating})
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontStyle: feedback.isSpam ? 'italic' : 'normal',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {feedback.comment}
                    </Typography>
                    {feedback.helpfulCount > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        👍 {feedback.helpfulCount} helpful
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {feedback.userName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {feedback.userEmail}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(feedback.createdAt).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={feedback.status.toUpperCase()}
                      color={
                        feedback.status === 'approved' ? 'success' :
                        feedback.status === 'pending' ? 'warning' :
                        feedback.status === 'rejected' ? 'error' :
                        'default'
                      }
                      variant={feedback.status === 'approved' ? 'filled' : 'outlined'}
                      size="small"
                    />
                    {feedback.reviewedBy && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        by {feedback.reviewedBy}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {feedback.isSpam ? (
                      <Box>
                        <Chip 
                          label={`SPAM (${Math.round(feedback.spamConfidence * 100)}%)`}
                          color="error"
                          size="small"
                          icon={<Flag size={12} />}
                        />
                        {feedback.spamReasons && feedback.spamReasons.length > 0 && (
                          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                            {feedback.spamReasons.slice(0, 2).join(', ')}
                            {feedback.spamReasons.length > 2 && '...'}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Chip label="Clean" color="success" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button
                        size="small"
                        variant={feedback.status === 'pending' ? 'contained' : 'outlined'}
                        color={feedback.status === 'pending' ? 'success' : 'warning'}
                        onClick={() => handleToggleStatus(feedback.id, feedback.status)}
                        startIcon={feedback.status === 'pending' ? <CheckCircle size={14} /> : <Clock size={14} />}
                        sx={{ minWidth: 'auto' }}
                      >
                        {feedback.status === 'pending' ? 'Approve' : 'Pending'}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteConfirm(feedback.id)}
                        startIcon={<Trash2 size={14} />}
                        sx={{ minWidth: 'auto' }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ open: false, type: '', feedbackId: null, feedbackTitle: '' })}
        >
          <DialogTitle>
            {confirmDialog.type === 'delete' ? 'Confirm Delete' : 'Confirm Status Change'}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {confirmDialog.type === 'delete' 
                ? `Are you sure you want to delete the feedback for "${confirmDialog.feedbackTitle}"? This action cannot be undone.`
                : `Are you sure you want to ${confirmDialog.actionType} the feedback for "${confirmDialog.feedbackTitle}"?`
              }
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setConfirmDialog({ open: false, type: '', feedbackId: null, feedbackTitle: '' })}
              color="inherit"
            >
              Cancel
            </Button>
            <Button 
              onClick={executeAction}
              color={confirmDialog.type === 'delete' ? 'error' : 'primary'}
              variant="contained"
            >
              {confirmDialog.type === 'delete' ? 'Delete' : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>

        {feedbacks.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No feedbacks found. Total feedbacks in state: {feedbacks.length}
          </Typography>
        )}
      </Box>
    );
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'places', name: 'Places', icon: MapPin },
    { id: 'feedbacks', name: 'Feedbacks', icon: MessageSquare }
  ];

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #faf5ff 100%)'
      }}>
        <Box sx={{ width: '100%' }}>
          <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '16rem',
              gap: 2
            }}>
              <Box sx={{
                width: 48,
                height: 48,
                border: '4px solid #dbeafe',
                borderTop: '4px solid #2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }} />
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 }
                  }
                }}
              >
                Loading admin dashboard...
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #faf5ff 100%)'
      }}>
        <Box sx={{ width: '100%' }}>
          <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '16rem',
              gap: 2
            }}>
              <Box sx={{
                width: 48,
                height: 48,
                backgroundColor: '#fee2e2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography sx={{ color: '#dc2626', fontSize: '24px' }}>⚠</Typography>
              </Box>
              <Typography 
                variant="h6" 
                color="error"
                sx={{ textAlign: 'center', mb: 1 }}
              >
                Error Loading Dashboard
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ textAlign: 'center', mb: 2 }}
              >
                {error}
              </Typography>
              <Button 
                variant="contained" 
                onClick={fetchAdminData}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
                  }
                }}
              >
                Retry
              </Button>
            </Box>
          </Container>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #faf5ff 100%)'
    }}>
      <Box sx={{ width: '100%' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
            <Box sx={{
              p: 1.5,
              background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)',
              borderRadius: 3
            }}>
              <BarChart3 style={{ color: 'white' }} size={28} />
            </Box>
            <Box>
              <Typography variant="h3" sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #2563eb 0%, #9333ea 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                mb: 0.5
              }}>
                Admin Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage users, places, and feedbacks for the myGuide platform
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ width: '100%' }}>
          <Tabs 
            value={activeTab} 
            onChange={(event, newValue) => setActiveTab(newValue)}
            sx={{ 
              mb: 4,
              '& .MuiTabs-flexContainer': {
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(8px)',
                borderRadius: 2
              }
            }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Tab 
                  key={tab.id} 
                  value={tab.id}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon size={16} />
                      <span>{tab.name}</span>
                    </Box>
                  }
                  sx={{
                    transition: 'all 0.3s ease',
                    '&.Mui-selected': {
                      background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)',
                      color: 'white',
                      borderRadius: 1
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                />
              );
            })}
          </Tabs>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'places' && renderPlaces()}
          {activeTab === 'feedbacks' && renderFeedbacks()}
        </Box>
        </Container>
      </Box>
      
      {/* Modals */}
      <AddPlaceModal 
        open={showAddPlaceModal}
        onClose={() => setShowAddPlaceModal(false)}
        newPlace={newPlace}
        setNewPlace={setNewPlace}
        onSubmit={handleAddPlace}
      />
      
      <EditPlaceModal 
        open={showEditPlaceModal}
        onClose={() => setShowEditPlaceModal(false)}
        place={selectedPlace}
        setPlace={setSelectedPlace}
        onSubmit={handleUpdatePlace}
      />
      
      <ViewPlaceModal 
        open={showViewPlaceModal}
        onClose={() => setShowViewPlaceModal(false)}
        place={selectedPlace}
      />
      
      <ViewUserModal
        open={showViewUserModal}
        onClose={() => setShowViewUserModal(false)}
        user={selectedUser}
      />
      
      <EditUserModal
        open={showEditUserModal}
        onClose={() => setShowEditUserModal(false)}
        user={selectedUser}
        onUpdateRole={handleUpdateUserRole}
      />
    </Box>
  );
};

// Add Place Modal
const AddPlaceModal = ({ open, onClose, newPlace, setNewPlace, onSubmit }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [availableProvinces, setAvailableProvinces] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableMunicipalities, setAvailableMunicipalities] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  // Fetch provinces and categories on modal open
  useEffect(() => {
    if (open) {
      fetchProvincesData();
      fetchCategoriesData();
    }
  }, [open]);

  const fetchProvincesData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/tourism/provinces/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setAvailableProvinces(data.results || []);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    }
  };

  const fetchDistrictsData = async (provinceId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/tourism/districts/?province=${provinceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setAvailableDistricts(data.results || []);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const fetchMunicipalitiesData = async (districtId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/tourism/municipalities/?district=${districtId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setAvailableMunicipalities(data.results || []);
    } catch (error) {
      console.error('Error fetching municipalities:', error);
    }
  };

  const fetchCategoriesData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/tourism/categories/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setAvailableCategories(data.results || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleProvinceChange = (provinceId) => {
    const selectedProvince = availableProvinces.find(p => p.id === provinceId);
    setNewPlace({ 
      ...newPlace, 
      province: provinceId,
      province_name: selectedProvince?.name || '',
      district: '',
      district_name: '',
      municipality: '',
      municipality_name: ''
    });
    setAvailableDistricts([]);
    setAvailableMunicipalities([]);
    if (provinceId) {
      fetchDistrictsData(provinceId);
    }
  };

  const handleDistrictChange = (districtId) => {
    const selectedDistrict = availableDistricts.find(d => d.id === districtId);
    setNewPlace({ 
      ...newPlace, 
      district: districtId,
      district_name: selectedDistrict?.name || '',
      municipality: '',
      municipality_name: ''
    });
    setAvailableMunicipalities([]);
    if (districtId) {
      fetchMunicipalitiesData(districtId);
    }
  };

  const handleMunicipalityChange = (municipalityId) => {
    const selectedMunicipality = availableMunicipalities.find(m => m.id === municipalityId);
    setNewPlace({ 
      ...newPlace, 
      municipality: municipalityId,
      municipality_name: selectedMunicipality?.name || ''
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setNewPlace({ ...newPlace, image: file });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Place</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Place Name"
            value={newPlace.name || ''}
            onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label="Description"
            value={newPlace.description || ''}
            onChange={(e) => setNewPlace({ ...newPlace, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
            required
          />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Province</InputLabel>
                <Select
                  value={newPlace.province || ''}
                  label="Province"
                  onChange={(e) => handleProvinceChange(e.target.value)}
                >
                  {availableProvinces.map((province) => (
                    <MenuItem key={province.id} value={province.id}>{province.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required disabled={!newPlace.province}>
                <InputLabel>District</InputLabel>
                <Select
                  value={newPlace.district || ''}
                  label="District"
                  onChange={(e) => handleDistrictChange(e.target.value)}
                >
                  {availableDistricts.map((district) => (
                    <MenuItem key={district.id} value={district.id}>{district.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required disabled={!newPlace.district}>
                <InputLabel>Municipality</InputLabel>
                <Select
                  value={newPlace.municipality || ''}
                  label="Municipality"
                  onChange={(e) => handleMunicipalityChange(e.target.value)}
                >
                  {availableMunicipalities.map((municipality) => (
                    <MenuItem key={municipality.id} value={municipality.id}>{municipality.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <FormControl fullWidth required>
            <InputLabel>Place Type</InputLabel>
            <Select
              value={newPlace.place_type || 'restaurant'}
              label="Place Type"
              onChange={(e) => setNewPlace({ ...newPlace, place_type: e.target.value })}
            >
              <MenuItem value="historical">Historical Site</MenuItem>
              <MenuItem value="natural">Natural Attraction</MenuItem>
              <MenuItem value="cultural">Cultural Site</MenuItem>
              <MenuItem value="religious">Religious Site</MenuItem>
              <MenuItem value="museum">Museum</MenuItem>
              <MenuItem value="park">Park/Garden</MenuItem>
              <MenuItem value="beach">Beach</MenuItem>
              <MenuItem value="mountain">Mountain</MenuItem>
              <MenuItem value="restaurant">Restaurant</MenuItem>
              <MenuItem value="hotel">Hotel</MenuItem>
              <MenuItem value="shopping">Shopping</MenuItem>
              <MenuItem value="entertainment">Entertainment</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth required>
            <InputLabel>Category</InputLabel>
            <Select
              value={newPlace.category || ''}
              label="Category"
              onChange={(e) => setNewPlace({ ...newPlace, category: e.target.value })}
            >
              {availableCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Address"
            value={newPlace.address || ''}
            onChange={(e) => setNewPlace({ ...newPlace, address: e.target.value })}
            fullWidth
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Entry Fee"
                type="number"
                value={newPlace.entry_fee || ''}
                onChange={(e) => setNewPlace({ ...newPlace, entry_fee: parseFloat(e.target.value) })}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Opening Hours"
                value={newPlace.opening_hours || ''}
                onChange={(e) => setNewPlace({ ...newPlace, opening_hours: e.target.value })}
                fullWidth
                placeholder="e.g. 9:00 AM - 5:00 PM"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Phone"
                value={newPlace.phone || ''}
                onChange={(e) => setNewPlace({ ...newPlace, phone: e.target.value })}
                fullWidth
                placeholder="e.g. +213 798 157 662"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Website"
                value={newPlace.website || ''}
                onChange={(e) => setNewPlace({ ...newPlace, website: e.target.value })}
                fullWidth
                placeholder="e.g. https://steakhouse.com"
              />
            </Grid>
          </Grid>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Place Image
            </Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="add-image-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="add-image-upload">
              <Button variant="outlined" component="span" startIcon={<Upload />}>
                Upload Image
              </Button>
            </label>
            {imagePreview && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
                />
              </Box>
            )}
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Latitude"
                type="number"
                value={newPlace.latitude || ''}
                onChange={(e) => setNewPlace({ ...newPlace, latitude: parseFloat(e.target.value) })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Longitude"
                type="number"
                value={newPlace.longitude || ''}
                onChange={(e) => setNewPlace({ ...newPlace, longitude: parseFloat(e.target.value) })}
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained">Add Place</Button>
      </DialogActions>
    </Dialog>
  );
};

// Edit Place Modal
const EditPlaceModal = ({ open, onClose, place, setPlace, onSubmit }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [availableProvinces, setAvailableProvinces] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableMunicipalities, setAvailableMunicipalities] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch location and category data on component mount
  useEffect(() => {
    if (open && place && !isInitialized) {
      initializeFormData();
      
      // Set image preview if available
      if (place?.image_url) {
        setImagePreview(place.image_url);
      }
    }
    
    // Reset initialization state when modal closes
    if (!open) {
      setIsInitialized(false);
    }
  }, [open, isInitialized]);

  const initializeFormData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all required data
      await Promise.all([
        fetchProvincesData(),
        fetchCategoriesData()
      ]);
      
      // If place has location data, find and set the corresponding IDs
      if (place?.province) {
        await initializeLocationData();
      }
      
      setIsLoading(false);
      setIsInitialized(true); // Mark as initialized to prevent re-initialization
    } catch (error) {
      console.error('Error initializing form data:', error);
      setIsLoading(false);
      setIsInitialized(true); // Still mark as initialized even on error
    }
  };

  const initializeLocationData = async () => {
    try {
      // First fetch provinces to find province ID
      const provincesResponse = await fetch('http://127.0.0.1:8000/api/tourism/provinces/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      const provincesData = await provincesResponse.json();
      const provinces = provincesData.results || [];
      
      // Handle province - it might be an object or a string
      const provinceName = typeof place.province === 'object' ? place.province?.name : place.province;
      const selectedProvince = provinces.find(p => p.name === provinceName);
      if (selectedProvince) {
        // Update place with province ID
        setPlace(prev => ({ ...prev, province: selectedProvince.id, province_name: selectedProvince.name }));
        
        // Fetch districts for this province
        const districtsResponse = await fetch(`http://127.0.0.1:8000/api/tourism/districts/?province=${selectedProvince.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        });
        const districtsData = await districtsResponse.json();
        const districts = districtsData.results || [];
        setAvailableDistricts(districts);
        
        // Handle district - it might be an object or a string
        const districtName = typeof place.district === 'object' ? place.district?.name : place.district;
        const selectedDistrict = districts.find(d => d.name === districtName);
        if (selectedDistrict) {
          // Update place with district ID
          setPlace(prev => ({ ...prev, district: selectedDistrict.id, district_name: selectedDistrict.name }));
          
          // Fetch municipalities for this district
          const municipalitiesResponse = await fetch(`http://127.0.0.1:8000/api/tourism/municipalities/?district=${selectedDistrict.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              'Content-Type': 'application/json'
            }
          });
          const municipalitiesData = await municipalitiesResponse.json();
          const municipalities = municipalitiesData.results || [];
          setAvailableMunicipalities(municipalities);
          
          // Handle municipality - it might be an object or a string
          const municipalityName = typeof place.municipality === 'object' ? place.municipality?.name : place.municipality;
          const selectedMunicipality = municipalities.find(m => m.name === municipalityName);
          if (selectedMunicipality) {
            // Update place with municipality ID
            setPlace(prev => ({ ...prev, municipality: selectedMunicipality.id, municipality_name: selectedMunicipality.name }));
          }
        }
      }
      
      // Initialize category ID
      const categoriesResponse = await fetch('http://127.0.0.1:8000/api/tourism/categories/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      const categoriesData = await categoriesResponse.json();
      const categories = categoriesData.results || [];
      setAvailableCategories(categories);
      
      // Handle category - it might be an object or a string
      const categoryName = typeof place.category === 'object' ? place.category?.name : place.category;
      const selectedCategory = categories.find(c => c.name === categoryName);
      if (selectedCategory) {
        setPlace(prev => ({ ...prev, category: selectedCategory.id, category_name: selectedCategory.name }));
      }
      
      // Handle place_type - normalize the value to match available options
      if (place.place_type) {
        let normalizedPlaceType = place.place_type;
        
        // Map common variations to correct values
        const placeTypeMapping = {
          'historical': 'historical_site',
          'Historic Site': 'historical_site',
          'Historical Sites': 'historical_site',
          'Historical Site': 'historical_site',
          'Tourist Attraction': 'tourist_attraction',
          'Restaurant': 'restaurant',
          'Hotel': 'hotel',
          'Museum': 'museum',
          'Park': 'park',
          'Beach': 'beach',
          'Mountain': 'mountain',
          'Shopping': 'shopping',
          'Entertainment': 'entertainment',
          'Other': 'other'
        };
        
        // Check if we need to map the value
        if (placeTypeMapping[normalizedPlaceType]) {
          normalizedPlaceType = placeTypeMapping[normalizedPlaceType];
        }
        
        // Validate against available options
        const validPlaceTypes = ['tourist_attraction', 'restaurant', 'hotel', 'museum', 'park', 'beach', 'mountain', 'historical_site', 'shopping', 'entertainment', 'other'];
        if (validPlaceTypes.includes(normalizedPlaceType)) {
          setPlace(prev => ({ ...prev, place_type: normalizedPlaceType }));
        } else {
          // Default to 'other' if no valid mapping found
          setPlace(prev => ({ ...prev, place_type: 'other' }));
        }
      }
      
    } catch (error) {
      console.error('Error initializing location data:', error);
    }
  };

  const fetchProvincesData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/tourism/provinces/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setAvailableProvinces(data.results || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      setIsLoading(false);
    }
  };

  const fetchDistrictsData = async (provinceId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/tourism/districts/?province=${provinceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setAvailableDistricts(data.results || []);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const fetchMunicipalitiesData = async (districtId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/tourism/municipalities/?district=${districtId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setAvailableMunicipalities(data.results || []);
    } catch (error) {
      console.error('Error fetching municipalities:', error);
    }
  };

  const fetchCategoriesData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/tourism/categories/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setAvailableCategories(data.results || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleProvinceChange = (provinceId) => {
    const selectedProvince = availableProvinces.find(p => p.id === provinceId);
    setPlace({ 
      ...place, 
      province: provinceId,
      province_name: selectedProvince?.name || '',
      district: '',
      district_name: '',
      municipality: '',
      municipality_name: ''
    });
    setAvailableDistricts([]);
    setAvailableMunicipalities([]);
    if (provinceId) {
      fetchDistrictsData(provinceId);
    }
  };

  const handleDistrictChange = (districtId) => {
    const selectedDistrict = availableDistricts.find(d => d.id === districtId);
    setPlace({ 
      ...place, 
      district: districtId,
      district_name: selectedDistrict?.name || '',
      municipality: '',
      municipality_name: ''
    });
    setAvailableMunicipalities([]);
    if (districtId) {
      fetchMunicipalitiesData(districtId);
    }
  };

  const handleMunicipalityChange = (municipalityId) => {
    const selectedMunicipality = availableMunicipalities.find(m => m.id === municipalityId);
    setPlace({ 
      ...place, 
      municipality: municipalityId,
      municipality_name: selectedMunicipality?.name || ''
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPlace({ ...place, image: file });
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Place</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <>
              <TextField
                label="Place Name"
                value={place?.name || ''}
                onChange={(e) => setPlace({ ...place, name: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Description"
                value={place?.description || ''}
                onChange={(e) => setPlace({ ...place, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
                required
              />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required sx={{ minHeight: '56px' }}>
                    <InputLabel>Province</InputLabel>
                    <Select
                      value={place?.province || ''}
                      label="Province"
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      displayEmpty
                      sx={{ minHeight: '56px' }}
                    >
                      {availableProvinces.map((province) => (
                        <MenuItem key={province.id} value={province.id}>{province.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required disabled={!place?.province} sx={{ minHeight: '56px' }}>
                <InputLabel>District</InputLabel>
                <Select
                  value={place?.district || ''}
                  label="District"
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  displayEmpty
                  sx={{ minHeight: '56px' }}
                >
                  {availableDistricts.map((district) => (
                    <MenuItem key={district.id} value={district.id}>{district.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required disabled={!place?.district} sx={{ minHeight: '56px' }}>
                <InputLabel>Municipality</InputLabel>
                <Select
                  value={place?.municipality || ''}
                  label="Municipality"
                  onChange={(e) => handleMunicipalityChange(e.target.value)}
                  displayEmpty
                  sx={{ minHeight: '56px' }}
                >
                  {availableMunicipalities.map((municipality) => (
                    <MenuItem key={municipality.id} value={municipality.id}>{municipality.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required sx={{ minHeight: '56px' }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={place?.category || ''}
                  label="Category"
                  onChange={(e) => {
                    const selectedCategory = availableCategories.find(c => c.id === e.target.value);
                    setPlace({ 
                      ...place, 
                      category: e.target.value,
                      category_name: selectedCategory?.name || ''
                    });
                  }}
                  displayEmpty
                  sx={{ minHeight: '56px' }}
                >
                  {availableCategories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ minHeight: '56px' }}>
                <InputLabel>Place Type</InputLabel>
                <Select
                  value={place?.place_type || ''}
                  label="Place Type"
                  onChange={(e) => setPlace({ ...place, place_type: e.target.value })}
                  displayEmpty
                  sx={{ minHeight: '56px' }}
                >
                  <MenuItem value="tourist_attraction">Tourist Attraction</MenuItem>
                  <MenuItem value="restaurant">Restaurant</MenuItem>
                  <MenuItem value="hotel">Hotel</MenuItem>
                  <MenuItem value="museum">Museum</MenuItem>
                  <MenuItem value="park">Park</MenuItem>
                  <MenuItem value="beach">Beach</MenuItem>
                  <MenuItem value="mountain">Mountain</MenuItem>
                  <MenuItem value="historical_site">Historical Site</MenuItem>
                  <MenuItem value="shopping">Shopping</MenuItem>
                  <MenuItem value="entertainment">Entertainment</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TextField
            label="Address"
            value={place?.address || ''}
            onChange={(e) => setPlace({ ...place, address: e.target.value })}
            fullWidth
          />

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Phone"
                value={place?.phone || ''}
                onChange={(e) => setPlace({ ...place, phone: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Email"
                type="email"
                value={place?.email || ''}
                onChange={(e) => setPlace({ ...place, email: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Website"
                type="url"
                value={place?.website || ''}
                onChange={(e) => setPlace({ ...place, website: e.target.value })}
                fullWidth
              />
            </Grid>
          </Grid>

          <TextField
            label="Entry Fee ($)"
            type="number"
            value={place?.entry_fee || ''}
            onChange={(e) => setPlace({ ...place, entry_fee: parseFloat(e.target.value) || 0 })}
            fullWidth
            inputProps={{ step: "0.01", min: "0" }}
          />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Place Image
            </Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="image-upload">
              <Button variant="outlined" component="span" startIcon={<Upload />}>
                Upload Image
              </Button>
            </label>
            {imagePreview && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
                />
              </Box>
            )}
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Latitude"
                type="number"
                value={place?.latitude || ''}
                onChange={(e) => setPlace({ ...place, latitude: parseFloat(e.target.value) })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Longitude"
                type="number"
                value={place?.longitude || ''}
                onChange={(e) => setPlace({ ...place, longitude: parseFloat(e.target.value) })}
                fullWidth
              />
            </Grid>
          </Grid>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Opening Hours
            </Typography>
            <Grid container spacing={2}>
              {[
                { key: 'monday', label: 'Monday' },
                { key: 'tuesday', label: 'Tuesday' },
                { key: 'wednesday', label: 'Wednesday' },
                { key: 'thursday', label: 'Thursday' },
                { key: 'friday', label: 'Friday' },
                { key: 'saturday', label: 'Saturday' },
                { key: 'sunday', label: 'Sunday' }
              ].map((day) => (
                <Grid item xs={12} md={6} lg={4} key={day.key}>
                  <TextField
                    label={day.label}
                    value={place?.opening_hours?.[day.key] || ''}
                    onChange={(e) => setPlace({ 
                      ...place, 
                      opening_hours: {
                        ...place?.opening_hours,
                        [day.key]: e.target.value
                      }
                    })}
                    fullWidth
                    placeholder="e.g., 9:00 AM - 6:00 PM or Closed"
                    size="small"
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Status Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={place?.is_active ?? true}
                      onChange={(e) => setPlace({ ...place, is_active: e.target.checked })}
                    />
                    <label htmlFor="is_active">Active</label>
                  </Box>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={place?.is_featured ?? false}
                      onChange={(e) => setPlace({ ...place, is_featured: e.target.checked })}
                    />
                    <label htmlFor="is_featured">Featured</label>
                  </Box>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
          </>)}
        </Box> 
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained">Update Place</Button>
      </DialogActions>
    </Dialog>
  );
};

// View Place Modal
const ViewPlaceModal = ({ open, onClose, place }) => {
  const formatOpeningHours = (hours) => {
    if (!hours || typeof hours !== 'object') return 'Not specified';
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return days.map((day, index) => (
      <Box key={day} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {dayNames[index]}:
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {hours[day] || 'Closed'}
        </Typography>
      </Box>
    ));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>Place Details</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          {/* Main Image */}
          {(place?.main_image || place?.images?.[0]?.image) && (
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <img 
                src={place.main_image || place.images[0].image} 
                alt={place.name}
                style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
            </Box>
          )}
          
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: 'fit-content' }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>Basic Information</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Name:</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>{place?.name || 'Not specified'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Description:</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>{place?.description || 'No description available'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Category:</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>{typeof place?.category === 'object' ? place?.category?.name : place?.category || 'Unknown'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Place Type:</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>{place?.place_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Status:</Typography>
                    <Chip 
                      label={place?.is_active ? 'Active' : 'Inactive'} 
                      color={place?.is_active ? 'success' : 'error'} 
                      size="small"
                    />
                  </Box>
                  {place?.is_featured && (
                    <Box>
                      <Chip label="Featured Place" color="primary" size="small" />
                    </Box>
                  )}
                </Box>
              </Card>
            </Grid>
            
            {/* Location Information */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: 'fit-content' }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>Location Details</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Province:</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>{typeof place?.province === 'object' ? place?.province?.name : place?.province || 'Unknown'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>District:</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>{typeof place?.district === 'object' ? place?.district?.name : place?.district || 'Unknown'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Municipality:</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>{typeof place?.municipality === 'object' ? place?.municipality?.name : place?.municipality || 'Unknown'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Address:</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>{place?.address || 'Not specified'}</Typography>
                  </Box>
                  {place?.latitude && place?.longitude && (
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Coordinates:</Typography>
                      <Typography variant="body1" sx={{ color: 'text.secondary' }}>{place.latitude}, {place.longitude}</Typography>
                    </Box>
                  )}
                </Box>
              </Card>
            </Grid>
            
            {/* Contact & Business Information */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: 'fit-content' }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>Contact Information</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Phone:</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>{place?.phone || 'Not provided'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Email:</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>{place?.email || 'Not provided'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Website:</Typography>
                    {place?.website ? (
                      <Typography 
                        variant="body1" 
                        component="a" 
                        href={place.website} 
                        target="_blank"
                        sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        {place.website}
                      </Typography>
                    ) : (
                      <Typography variant="body1" sx={{ color: 'text.secondary' }}>Not provided</Typography>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Entry Fee:</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      {place?.entry_fee ? `$${place.entry_fee}` : 'Free'}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
            
            {/* Rating & Reviews */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: 'fit-content' }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>Ratings & Reviews</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Average Rating:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ color: 'primary.main' }}>{place?.average_rating || '0.00'}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>/5.00</Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Total Reviews:</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>{place?.total_ratings || 0} reviews</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Created:</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      {place?.created_at ? new Date(place.created_at).toLocaleDateString() : 'Unknown'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Last Updated:</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      {place?.updated_at ? new Date(place.updated_at).toLocaleDateString() : 'Unknown'}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
            
            {/* Opening Hours */}
            {place?.opening_hours && (
              <Grid item xs={12}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>Opening Hours</Typography>
                  <Box sx={{ maxWidth: 400 }}>
                    {formatOpeningHours(place.opening_hours)}
                  </Box>
                </Card>
              </Grid>
            )}
            
            {/* Additional Images */}
            {place?.images && place.images.length > 1 && (
              <Grid item xs={12}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>Additional Images</Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {place.images.slice(1).map((image, index) => (
                      <img 
                        key={index}
                        src={image.image} 
                        alt={`${place.name} ${index + 2}`}
                        style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    ))}
                  </Box>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
        <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// View User Modal
const ViewUserModal = ({ open, onClose, user }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
      <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
        User Details
      </Typography>
    </DialogTitle>
    <DialogContent sx={{ pt: 3 }}>
      {user && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Full Name
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {user.firstName} {user.lastName}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Email
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {user.email}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Role
            </Typography>
            <Chip 
              label={user.role}
              color={user.role === 'admin' ? 'secondary' : 'default'}
              variant={user.role === 'admin' ? 'filled' : 'outlined'}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Status
            </Typography>
            <Chip 
              label={user.status}
              color={user.status === 'active' ? 'success' : 'error'}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Join Date
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {new Date(user.joinDate).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Last Login
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {new Date(user.lastLogin).toLocaleDateString()}
            </Typography>
          </Grid>
        </Grid>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

// Edit User Modal Component
const EditUserModal = ({ open, onClose, user, onUpdateRole }) => {
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role || 'user');
    }
  }, [user]);

  const handleSave = () => {
    if (user && selectedRole !== user.role) {
      onUpdateRole(user.id, selectedRole);
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          Edit User Role
        </Typography>
      </DialogTitle>
      <DialogContent>
        {user && (
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  User Information
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Name:</strong> {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  <strong>Email:</strong> {user.email}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={selectedRole}
                    label="Role"
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <MenuItem value="user">Normal User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminDashboard;