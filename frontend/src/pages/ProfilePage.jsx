/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import React, { useState, useEffect } from 'react';
import { useCurrentUser } from '../store/hooks';
import { useAppDispatch } from '../store/hooks';
import { useSavedPlans, useFavorites } from '../store/hooks';
import { addNotification } from '../store/slices/appSlice';
import { apiService } from '../services';
import { Button, Card, CardContent, Typography, Box, TextField, Switch, Select, MenuItem, FormControl, InputLabel, Tabs, Tab, FormControlLabel, Grid, Container, CircularProgress } from '@mui/material';
import { CalendarToday as Calendar } from '@mui/icons-material';
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Camera, 
  MapPin, 
  Star, 
  Heart, 
  Lock, 
  Eye, 
  EyeOff, 
  Settings,
  Bell,
  Globe,
  Shield,
  MessageSquare
} from 'lucide-react';

const ProfilePage = () => {
  const user = useCurrentUser();
  const dispatch = useAppDispatch();
  const savedPlans = useSavedPlans();
  const favorites = useFavorites();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    dateOfBirth: '',
    avatar: null
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    language: 'en',
    theme: 'light',
    privacy: 'public'
  });

  const [userStats, setUserStats] = useState({
    placesVisited: 0,
    reviewsWritten: 0,
    tripsPlanned: 0,
    favoriteSpots: 0,
    joinDate: '',
    lastActive: ''
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        dateOfBirth: user.dateOfBirth || '',
        avatar: user.avatar || null
      });

      // Simulate loading user stats and activity
      setUserStats({
        placesVisited: 23,
        reviewsWritten: 15,
        tripsPlanned: 8,
        favoriteSpots: 31,
        joinDate: '2024-01-15',
        lastActive: '2024-01-20'
      });

      setRecentActivity([
        {
          id: 1,
          type: 'review',
          title: 'Reviewed Casbah of Algiers',
          description: 'Left a 5-star review',
          date: '2024-01-19',
          icon: Star
        },
        {
          id: 2,
          type: 'favorite',
          title: 'Added to favorites',
          description: 'Timgad Archaeological Site',
          date: '2024-01-18',
          icon: Heart
        },
        {
          id: 3,
          type: 'trip',
          title: 'Created trip plan',
          description: 'Weekend in Constantine',
          date: '2024-01-17',
          icon: MapPin
        },
        {
          id: 4,
          type: 'comment',
          title: 'Commented on place',
          description: 'Shared experience at Oran Beach',
          date: '2024-01-16',
          icon: MessageSquare
        }
      ]);
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await apiService.auth.updateProfile(profileData);
      setIsEditing(false);
      
      // Show success message
      dispatch(addNotification({
        type: 'success',
        message: 'Profile updated successfully!'
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to update profile. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      dispatch(addNotification({
        type: 'error',
        message: 'New passwords do not match!'
      }));
      return;
    }

    if (passwordData.newPassword.length < 6) {
      dispatch(addNotification({
        type: 'error',
        message: 'Password must be at least 6 characters long!'
      }));
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      dispatch(addNotification({
        type: 'success',
        message: 'Password changed successfully!'
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to change password. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      dispatch(addNotification({
        type: 'success',
        message: 'Preferences updated successfully!'
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to update preferences. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData({ ...profileData, avatar: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className="text-center border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105">
      <CardContent className="p-6">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3 ${color}`}>
          <Icon className="text-white" size={24} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
      </CardContent>
    </Card>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {profileData.avatar ? (
                <img 
                  src={profileData.avatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="text-gray-400" size={32} />
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 hover:scale-110 transition-all duration-300 shadow-lg">
                <Camera size={16} />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {profileData.firstName} {profileData.lastName}
            </h2>
            <p className="text-gray-600 mb-2">{profileData.email}</p>
            {profileData.bio && (
              <p className="text-gray-700">{profileData.bio}</p>
            )}
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-sm text-gray-500">
              {profileData.location && (
                <div className="flex items-center">
                  <MapPin size={14} className="mr-1" />
                  {profileData.location}
                </div>
              )}
              <div className="flex items-center">
                <Calendar size={14} className="mr-1" />
                Joined {new Date(userStats.joinDate).toLocaleDateString()}
              </div>
            </div>
          </div>
          
            <div className="flex space-x-2">
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center space-x-2 hover:scale-105 hover:shadow-xl transition-all duration-300"
                >
                  <Edit3 size={16} />
                  <span>Edit Profile</span>
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex items-center space-x-2 hover:scale-105 hover:bg-muted/50 transition-all duration-300"
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </Button>
              </div>
               )}
             </div>
           </div>
         </CardContent>
       </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="Places Visited" 
          value={userStats.placesVisited} 
          icon={MapPin} 
          color="bg-blue-500"
        />
        <StatCard 
          title="Reviews Written" 
          value={userStats.reviewsWritten} 
          icon={Star} 
          color="bg-yellow-500"
        />
        <StatCard 
          title="Trips Planned" 
          value={userStats.tripsPlanned} 
          icon={Calendar} 
          color="bg-green-500"
        />
        <StatCard 
          title="Favorite Spots" 
          value={userStats.favoriteSpots} 
          icon={Heart} 
          color="bg-red-500"
        />
      </div>

        {/* Profile Form */}
        {isEditing && (
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{
                fontWeight: 600,
                background: 'linear-gradient(45deg, #1976d2, #9c27b0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Edit Profile Information
              </Typography>
            </Box>
            <CardContent>
              <form onSubmit={handleProfileUpdate}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  id="firstName"
                  label="First Name"
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  fullWidth
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s',
                      '&:focus-within': {
                        transform: 'scale(1.02)'
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  id="lastName"
                  label="Last Name"
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  fullWidth
                  required
                />
               </Grid>
            </Grid>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  id="email"
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  fullWidth
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s',
                      '&:focus-within': {
                        transform: 'scale(1.02)'
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  id="phone"
                  label="Phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s',
                      '&:focus-within': {
                        transform: 'scale(1.02)'
                      }
                    }
                  }}
                />
              </Grid>
            </Grid>
            
                <Grid item xs={12}>
                  <TextField
                    id="bio"
                    label="Bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    multiline
                    rows={3}
                    placeholder="Tell us about yourself..."
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        transition: 'all 0.3s',
                        '&:focus-within': {
                          transform: 'scale(1.02)'
                        }
                      }
                    }}
                  />
                </Grid>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      id="location"
                      label="Location"
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      placeholder="City, Country"
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          transition: 'all 0.3s',
                          '&:focus-within': {
                            transform: 'scale(1.02)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      id="dateOfBirth"
                      label="Date of Birth"
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          transition: 'all 0.3s',
                          '&:focus-within': {
                            transform: 'scale(1.02)'
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                  <Button 
                    type="button"
                    variant="outlined"
                    onClick={() => setIsEditing(false)}
                    sx={{
                      '&:hover': {
                        transform: 'scale(1.05)',
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      },
                      transition: 'all 0.3s'
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(45deg, #2196f3, #9c27b0)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1976d2, #7b1fa2)',
                        transform: 'scale(1.05)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                      },
                      '&:disabled': {
                        '&:hover': {
                          transform: 'none',
                          boxShadow: 'none'
                        }
                      },
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={16} sx={{ color: 'white' }} />
                    ) : (
                      <Save size={16} />
                    )}
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                   </Button>
                 </Box>
               </form>
             </CardContent>
           </Card>
         )}

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <Icon className="text-primary-600" size={16} />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(activity.date).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-sm font-medium">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="pr-12 transition-all duration-300 focus:scale-[1.02]"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 h-full px-3 hover:bg-muted/50 hover:scale-110 transition-all duration-300"
              >
                {showCurrentPassword ? (
                  <EyeOff className="text-muted-foreground" size={20} />
                ) : (
                  <Eye className="text-muted-foreground" size={20} />
                )}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-medium">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="pr-12 transition-all duration-300 focus:scale-[1.02]"
                required
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 h-full px-3 hover:bg-muted/50 hover:scale-110 transition-all duration-300"
              >
                {showNewPassword ? (
                  <EyeOff className="text-muted-foreground" size={20} />
                ) : (
                  <Eye className="text-muted-foreground" size={20} />
                )}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="pr-12 transition-all duration-300 focus:scale-[1.02]"
                required
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 h-full px-3 hover:bg-muted/50 hover:scale-110 transition-all duration-300"
              >
                {showConfirmPassword ? (
                  <EyeOff className="text-muted-foreground" size={20} />
                ) : (
                  <Eye className="text-muted-foreground" size={20} />
                )}
              </Button>
            </div>
          </div>
          
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center space-x-2 hover:scale-105 hover:shadow-xl transition-all duration-300 disabled:hover:scale-100 disabled:hover:shadow-none"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Lock size={16} />
                )}
                <span>{loading ? 'Updating...' : 'Update Password'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      {/* Notifications */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-all duration-300">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
              className="data-[state=checked]:bg-primary"
            />
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-all duration-300">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
            </div>
            <Switch
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) => setPreferences({ ...preferences, pushNotifications: checked })}
              className="data-[state=checked]:bg-primary"
            />
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-all duration-300">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">Receive promotional emails and updates</p>
            </div>
            <Switch
              checked={preferences.marketingEmails}
              onCheckedChange={(checked) => setPreferences({ ...preferences, marketingEmails: checked })}
              className="data-[state=checked]:bg-primary"
            />
          </div>
          </div>
        </CardContent>
      </Card>

      {/* Language & Region */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Language & Region
          </CardTitle>
        </CardHeader>
        <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language" className="text-sm font-medium">
              Language
            </Label>
            <Select
              value={preferences.language}
              onValueChange={(value) => setPreferences({ ...preferences, language: value })}
            >
              <SelectTrigger className="transition-all duration-300 hover:scale-[1.02]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Privacy
          </CardTitle>
        </CardHeader>
        <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Visibility
            </label>
            <Select value={preferences.privacy} onValueChange={(value) => setPreferences({ ...preferences, privacy: value })}>
              <SelectTrigger className="w-full hover:bg-muted/50 transition-colors duration-200">
                <SelectValue placeholder="Select privacy level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Anyone can see your profile</SelectItem>
                <SelectItem value="friends">Friends only</SelectItem>
                <SelectItem value="private">Private - Only you can see your profile</SelectItem>
              </SelectContent>
            </Select>
          </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handlePreferencesUpdate}
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105 text-white flex items-center space-x-2 transition-all duration-300 hover:shadow-xl"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Save size={16} />
          )}
          <span>{loading ? 'Saving...' : 'Save Preferences'}</span>
        </Button>
      </div>
    </div>
  );

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'preferences', name: 'Preferences', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full">
        <div className="container-content py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <User className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                My Profile
              </h1>
              <p className="text-gray-600">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Box sx={{ width: '100%', mb: 4 }}>
          <Tabs 
            value={activeTab} 
            onChange={(event, newValue) => setActiveTab(newValue)}
            sx={{ 
              mb: 3,
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(45deg, #2196F3 30%, #9C27B0 90%)'
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
                    textTransform: 'none',
                    minWidth: 120,
                    '&.Mui-selected': {
                      background: 'linear-gradient(45deg, #2196F3 30%, #9C27B0 90%)',
                      color: 'white',
                      borderRadius: 1
                    }
                  }}
                />
              );
            })}
          </Tabs>

          {/* Tab Content */}
          {activeTab === 'profile' && (
            <Box>
              {renderProfile()}
            </Box>
          )}
          {activeTab === 'security' && (
            <Box>
              {renderSecurity()}
            </Box>
          )}
          {activeTab === 'preferences' && (
            <Box>
              {renderPreferences()}
            </Box>
          )}
        </Box>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;