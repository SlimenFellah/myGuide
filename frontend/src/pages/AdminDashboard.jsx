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
  Badge
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

      // Handle paginated response - extract results array
      const users = usersData.results || usersData || [];
      
      // Calculate statistics from real data
      setStats({
        totalUsers: usersData.count || users.length || 0,
        totalPlaces: placesStats.total_places || 0,
        pendingFeedbacks: placesStats.total_feedbacks || 0,
        monthlyVisits: Math.floor(Math.random() * 10000) + 5000 // Simulated for now
      });

      // Set real users data
      const formattedUsers = users.map(user => ({
        id: user.id,
        firstName: user.first_name || 'Unknown',
        lastName: user.last_name || 'User',
        email: user.email,
        role: user.is_staff ? 'admin' : 'user',
        status: user.is_active ? 'active' : 'inactive',
        joinDate: user.date_joined ? user.date_joined.split('T')[0] : '2024-01-01',
        lastLogin: user.last_login ? user.last_login.split('T')[0] : '2024-01-01'
      }));
      setUsers(formattedUsers);

      // Fetch real places data
      const placesRes = await fetch('http://127.0.0.1:8000/api/tourism/places/', { headers });
      const placesData = await placesRes.json();
      
      const formattedPlaces = placesData.results ? placesData.results.map(place => ({
        id: place.id,
        name: place.name,
        province: place.municipality?.district?.province?.name || 'Unknown',
        district: place.municipality?.district?.name || 'Unknown',
        municipality: place.municipality?.name || 'Unknown',
        category: place.category?.name || 'Unknown',
        status: place.is_approved ? 'approved' : 'pending',
        rating: place.average_rating || 0,
        reviews: place.feedback_count || 0,
        averageCost: place.average_cost || 0,
        addedBy: place.created_by?.is_staff ? 'admin' : 'user',
        addedDate: place.created_at ? place.created_at.split('T')[0] : '2024-01-01'
      })) : [];
      setPlaces(formattedPlaces);

      // Fetch real feedbacks data from all places
      let allFeedbacks = [];
      if (formattedPlaces.length > 0) {
        const feedbackPromises = formattedPlaces.slice(0, 5).map(async (place) => {
          try {
            const feedbackRes = await fetch(`http://127.0.0.1:8000/api/tourism/places/${place.id}/feedbacks/`, { headers });
            const feedbackData = await feedbackRes.json();
            return feedbackData.results ? feedbackData.results.map(feedback => ({
              id: feedback.id,
              placeId: place.id,
              placeName: place.name,
              userId: feedback.user?.id || 0,
              userName: feedback.user ? `${feedback.user.first_name || ''} ${feedback.user.last_name || ''}`.trim() || feedback.user.username : 'Anonymous',
              rating: feedback.rating,
              comment: feedback.comment,
              status: feedback.is_approved ? 'approved' : (feedback.is_flagged ? 'flagged' : 'pending'),
              date: feedback.created_at ? feedback.created_at.split('T')[0] : '2024-01-01',
              type: feedback.rating <= 2 ? 'complaint' : 'review'
            })) : [];
          } catch (error) {
            console.error(`Error fetching feedbacks for place ${place.id}:`, error);
            return [];
          }
        });
        
        const feedbackArrays = await Promise.all(feedbackPromises);
        allFeedbacks = feedbackArrays.flat();
      }
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

  const handleApproveFeedback = (feedbackId) => {
    setFeedbacks(feedbacks.map(feedback => 
      feedback.id === feedbackId ? { ...feedback, status: 'approved' } : feedback
    ));
  };

  const handleRejectFeedback = (feedbackId) => {
    setFeedbacks(feedbacks.map(feedback => 
      feedback.id === feedbackId ? { ...feedback, status: 'rejected' } : feedback
    ));
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
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button 
            variant="outlined"
            startIcon={<Download size={16} />}
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          >
            Export
          </Button>
          <Button 
            variant="contained"
            startIcon={<Plus size={16} />}
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: 4
              }
            }}
          >
            Add User
          </Button>
        </Box>
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
              <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', color: 'text.secondary' }}>
                User
              </TableCell>
              <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', color: 'text.secondary' }}>
                Role
              </TableCell>
              <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', color: 'text.secondary' }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', color: 'text.secondary' }}>
                Join Date
              </TableCell>
              <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', color: 'text.secondary' }}>
                Last Login
              </TableCell>
              <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', color: 'text.secondary' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
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
            variant="outlined" 
            startIcon={<Upload size={16} />}
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          >
            Import
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Plus size={16} />}
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
              <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', color: 'text.secondary' }}>
                Place
              </TableCell>
              <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', color: 'text.secondary' }}>
                Location
              </TableCell>
              <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', color: 'text.secondary' }}>
                Category
              </TableCell>
              <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', color: 'text.secondary' }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', color: 'text.secondary' }}>
                Rating
              </TableCell>
              <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', color: 'text.secondary' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {places.map((place) => (
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
                    {place.status === 'pending' && (
                      <>
                        <IconButton 
                          onClick={() => handleApprovePlace(place.id)}
                          size="small"
                          title="Approve"
                          sx={{
                            color: 'success.main',
                            '&:hover': {
                              backgroundColor: 'success.50',
                              color: 'success.dark'
                            }
                          }}
                        >
                          <CheckCircle size={16} />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleRejectPlace(place.id)}
                          size="small"
                          title="Reject"
                          sx={{
                            color: 'error.main',
                            '&:hover': {
                              backgroundColor: 'error.50',
                              color: 'error.dark'
                            }
                          }}
                        >
                          <XCircle size={16} />
                        </IconButton>
                      </>
                    )}
                    <IconButton 
                      size="small"
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
                      size="small"
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

  const renderFeedbacks = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Feedback Management</Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button 
            variant="outlined" 
            startIcon={<Filter size={16} />}
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          >
            Filter
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Download size={16} />}
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Feedbacks List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {feedbacks.map((feedback) => (
          <Card 
            key={feedback.id} 
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 4
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{feedback.placeName}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          style={{
                            color: i < feedback.rating ? '#facc15' : '#d1d5db',
                            fill: i < feedback.rating ? '#facc15' : '#d1d5db'
                          }}
                        />
                      ))}
                    </Box>
                    <Chip 
                      label={feedback.type}
                      color={feedback.type === 'complaint' ? 'error' : 'secondary'}
                      size="small"
                    />
                  </Box>
                  <Typography color="text.secondary" sx={{ mb: 1.5 }}>{feedback.comment}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.875rem' }}>
                    <Typography variant="body2" color="text.secondary">by {feedback.userName}</Typography>
                    <Typography variant="body2" color="text.secondary">{new Date(feedback.date).toLocaleDateString()}</Typography>
                    <Chip 
                      label={feedback.status}
                      color={
                        feedback.status === 'approved' ? 'success' :
                        feedback.status === 'pending' ? 'warning' :
                        feedback.status === 'flagged' ? 'error' :
                        'default'
                      }
                      variant={feedback.status === 'approved' ? 'filled' : 'outlined'}
                      size="small"
                    />
                  </Box>
                </Box>
                
                {feedback.status === 'pending' && (
                  <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                    <Button 
                      onClick={() => handleApproveFeedback(feedback.id)}
                      variant="outlined"
                      size="small"
                      startIcon={<CheckCircle size={16} />}
                      sx={{
                        color: 'success.main',
                        borderColor: 'success.light',
                        '&:hover': {
                          backgroundColor: 'success.50',
                          borderColor: 'success.main'
                        }
                      }}
                    >
                      Approve
                    </Button>
                    <Button 
                      onClick={() => handleRejectFeedback(feedback.id)}
                      variant="outlined"
                      size="small"
                      startIcon={<XCircle size={16} />}
                      sx={{
                        color: 'error.main',
                        borderColor: 'error.light',
                        '&:hover': {
                          backgroundColor: 'error.50',
                          borderColor: 'error.main'
                        }
                      }}
                    >
                      Reject
                    </Button>
                  </Box>
                )}
                
                {feedback.status === 'flagged' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                    <AlertTriangle style={{ color: '#ef4444' }} size={16} />
                    <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 500 }}>Flagged for Review</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );

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
    </Box>
  );
};

export default AdminDashboard;