/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import React, { useState } from 'react';
import { useCurrentUser } from '../store/hooks';
import { useAppDispatch } from '../store/hooks';
import { addNotification } from '../store/slices/appSlice';
import { Button, Card, CardContent, Typography, Box, TextField, Switch, Select, MenuItem, FormControl, InputLabel, Tabs, Tab, FormControlLabel, Grid, Container } from '@mui/material';
import { 
  Settings,
  Bell,
  Globe,
  Shield,
  Palette,
  User,
  Lock,
  Save
} from 'lucide-react';

const SettingsPage = () => {
  const user = useCurrentUser();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  
  const [settings, setSettings] = useState({
    // General Settings
    language: 'en',
    theme: 'light',
    timezone: 'UTC',
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    tripReminders: true,
    
    // Privacy Settings
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    dataSharing: false,
    
    // App Settings
    autoSave: true,
    offlineMode: false,
    highQualityImages: true
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Here you would typically save to backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      dispatch(addNotification({
        type: 'success',
        message: 'Settings saved successfully!'
      }));
    } catch (error) {
      console.error('Failed to save settings:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to save settings. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(255, 255, 255, 1) 50%, rgba(33, 198, 83, 0.05) 100%)',
      pt: 2
    }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Settings className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">
                Customize your MyGuide experience
              </p>
            </div>
          </div>
        </div>

        {/* Settings Tabs */}
        <Box sx={{ width: '100%', mb: 4 }}>
          <Tabs 
            value={activeTab} 
            onChange={(event, newValue) => setActiveTab(newValue)}
            sx={{ 
              mb: 3,
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(45deg, #2196F3 30%, #21C653 90%)'
              }
            }}
          >
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <Tab 
                  key={tab.id} 
                  value={tab.id}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconComponent size={18} />
                      <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                        {tab.label}
                      </Box>
                    </Box>
                  }
                  sx={{
                    textTransform: 'none',
                    minWidth: 100,
                    '&.Mui-selected': {
                      background: 'linear-gradient(45deg, #2196F3 30%, #21C653 90%)',
                      color: 'white',
                      borderRadius: 1
                    }
                  }}
                />
              );
            })}
          </Tabs>

          {/* Tab Content */}
          {activeTab === 'general' && (
            <Box sx={{ mt: 3 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Globe size={20} />
                  General Preferences
                </Typography>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Language</InputLabel>
                      <Select 
                        value={settings.language} 
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                        label="Language"
                      >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="fr">Français</MenuItem>
                        <MenuItem value="ar">العربية</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Timezone</InputLabel>
                      <Select 
                        value={settings.timezone} 
                        onChange={(e) => handleSettingChange('timezone', e.target.value)}
                        label="Timezone"
                      >
                        <MenuItem value="UTC">UTC</MenuItem>
                        <MenuItem value="Africa/Algiers">Algeria Time</MenuItem>
                        <MenuItem value="Europe/Paris">Central European Time</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1">Auto-save</Typography>
                      <Typography variant="body2" color="text.secondary">Automatically save your progress</Typography>
                    </Box>
                    <Switch 
                      checked={settings.autoSave} 
                      onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1">Offline Mode</Typography>
                      <Typography variant="body2" color="text.secondary">Enable offline functionality</Typography>
                    </Box>
                    <Switch 
                      checked={settings.offlineMode} 
                      onChange={(e) => handleSettingChange('offlineMode', e.target.checked)}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          )}
          {activeTab === 'notifications' && (
            <Box sx={{ mt: 3 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Bell size={20} />
                  Notification Preferences
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1">Email Notifications</Typography>
                      <Typography variant="body2" color="text.secondary">Receive updates via email</Typography>
                    </Box>
                    <Switch 
                      checked={settings.emailNotifications} 
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1">Push Notifications</Typography>
                      <Typography variant="body2" color="text.secondary">Receive push notifications</Typography>
                    </Box>
                    <Switch 
                      checked={settings.pushNotifications} 
                      onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1">Marketing Emails</Typography>
                      <Typography variant="body2" color="text.secondary">Receive promotional content</Typography>
                    </Box>
                    <Switch 
                      checked={settings.marketingEmails} 
                      onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1">Trip Reminders</Typography>
                      <Typography variant="body2" color="text.secondary">Get reminders about your trips</Typography>
                    </Box>
                    <Switch 
                      checked={settings.tripReminders} 
                      onChange={(e) => handleSettingChange('tripReminders', e.target.checked)}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
            </Box>
          )}
          {activeTab === 'privacy' && (
            <Box sx={{ mt: 3 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Shield size={20} />
                  Privacy & Security
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Profile Visibility</InputLabel>
                    <Select 
                      value={settings.profileVisibility} 
                      onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                      label="Profile Visibility"
                    >
                      <MenuItem value="public">Public</MenuItem>
                      <MenuItem value="friends">Friends Only</MenuItem>
                      <MenuItem value="private">Private</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1">Show Email</Typography>
                      <Typography variant="body2" color="text.secondary">Display email on profile</Typography>
                    </Box>
                    <Switch 
                      checked={settings.showEmail} 
                      onChange={(e) => handleSettingChange('showEmail', e.target.checked)}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1">Show Phone</Typography>
                      <Typography variant="body2" color="text.secondary">Display phone on profile</Typography>
                    </Box>
                    <Switch 
                      checked={settings.showPhone} 
                      onChange={(e) => handleSettingChange('showPhone', e.target.checked)}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1">Data Sharing</Typography>
                      <Typography variant="body2" color="text.secondary">Share anonymous usage data</Typography>
                    </Box>
                    <Switch 
                      checked={settings.dataSharing} 
                      onChange={(e) => handleSettingChange('dataSharing', e.target.checked)}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
            </Box>
          )}
          {activeTab === 'appearance' && (
            <Box sx={{ mt: 3 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Palette size={20} />
                  Appearance
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Theme</InputLabel>
                    <Select 
                      value={settings.theme} 
                      onChange={(e) => handleSettingChange('theme', e.target.value)}
                      label="Theme"
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="system">System</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1">High Quality Images</Typography>
                      <Typography variant="body2" color="text.secondary">Load high resolution images</Typography>
                    </Box>
                    <Switch 
                      checked={settings.highQualityImages} 
                      onChange={(e) => handleSettingChange('highQualityImages', e.target.checked)}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
            </Box>
          )}
        </Box>

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="px-8 py-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </Container>
    </Box>
  );
};

export default SettingsPage;