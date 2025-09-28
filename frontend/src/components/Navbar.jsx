/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useCurrentUser, useIsAdmin } from '../store/hooks';
import { useSubscription } from '../hooks/useSubscription';
import { logoutUser } from '../store/slices/authSlice';
import { 
  Menu, 
  X, 
  Home, 
  Map, 
  MessageCircle, 
  Settings, 
  LogOut,
  User,
  ChevronDown,
  Briefcase,
  Crown
} from 'lucide-react';
import { Button, AppBar, Toolbar, Typography, Box, IconButton, Menu as MuiMenu, MenuItem, Avatar, Chip, Container } from '@mui/material';
import { CalendarToday as Calendar } from '@mui/icons-material';
// Material-UI components for navigation
import myGuideLogo from '../assets/myGuide-logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const user = useCurrentUser();
  const isAdmin = useIsAdmin();
  const { isPremium, planName } = useSubscription();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Explore', path: '/explore', icon: Map },
    { name: 'Trip Planner', path: '/trip-planner', icon: Calendar },
    { name: 'My Trips', path: '/my-trips', icon: Briefcase },
    { name: 'Chatbot', path: '/chatbot', icon: MessageCircle },
    { name: 'Subscription', path: '/subscription', icon: Crown },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Admin', path: '/admin', icon: Settings });
  }

  return (
    <AppBar position="sticky" sx={{
      zIndex: 50,
      backgroundColor: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: 1,
      borderColor: 'rgba(229,231,235,1)',
      boxShadow: 'none'
    }}>
      <Container maxWidth="xl" sx={{ px: 2 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 64 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component={Link} to="/dashboard" sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              textDecoration: 'none',
              '&:hover img': {
                transform: 'scale(1.05)'
              }
            }}>
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={myGuideLogo}
                  alt="MyGuide"
                  sx={{
                    height: 36,
                    width: 'auto',
                    transition: 'transform 0.2s'
                  }}
                />
                <Box sx={{
                  position: 'absolute',
                  inset: -1,
                  background: 'linear-gradient(45deg, #1976d2, #9c27b0)',
                  borderRadius: '50%',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  filter: 'blur(4px)',
                  '&:hover': { opacity: 0.2 }
                }} />
              </Box>
              <Typography variant="h6" sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #1976d2, #9c27b0)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                MyGuide
              </Typography>
              {isAdmin && (
                <Chip
                  label="Admin"
                  size="small"
                  sx={{
                    fontSize: '0.75rem',
                    height: 20,
                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                    color: '#9c27b0',
                    fontWeight: 500
                  }}
                />
              )}
              <Chip
                icon={isPremium ? <Crown size={12} /> : null}
                label={planName}
                size="small"
                sx={{
                  fontSize: '0.75rem',
                  height: 20,
                  backgroundColor: isPremium ? 'rgba(255, 193, 7, 0.1)' : 'rgba(156, 39, 176, 0.1)',
                  color: isPremium ? '#ff8f00' : '#9c27b0',
                  fontWeight: 500,
                  ml: 0.5
                }}
              />
            </Box>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Box
                  key={item.name}
                  component={Link}
                  to={item.path}
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1.25,
                    borderRadius: 3,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    ...(isActive ? {
                      background: 'linear-gradient(45deg, rgba(25, 118, 210, 0.1), rgba(156, 39, 176, 0.1))',
                      color: '#1976d2',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    } : {
                      color: '#666',
                      '&:hover': {
                        color: '#1976d2',
                        bgcolor: 'rgba(0,0,0,0.04)'
                      }
                    }),
                    '&:hover .nav-icon': {
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <Icon 
                    size={18} 
                    className="nav-icon"
                    style={{
                      transition: 'transform 0.2s',
                      color: isActive ? '#1976d2' : 'inherit'
                    }}
                  />
                  <span>{item.name}</span>
                  {isActive && (
                    <Box sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 4,
                      height: 4,
                      bgcolor: '#1976d2',
                      borderRadius: '50%'
                    }} />
                  )}
                </Box>
              );
            })}
          </Box>

          {/* User Menu */}
          <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1 }}>
              <Avatar sx={{
                width: 32,
                height: 32,
                background: 'linear-gradient(45deg, #1976d2, #9c27b0)'
              }}>
                <User size={16} style={{ color: 'white' }} />
              </Avatar>
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" sx={{
                  fontWeight: 500,
                  color: 'text.primary',
                  lineHeight: 1.2
                }}>
                  {user?.firstName || user?.name}
                </Typography>
                <Typography variant="caption" sx={{
                  color: 'text.secondary',
                  lineHeight: 1.2,
                  fontWeight: 400
                }}>
                  {user?.email}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button 
                variant="text" 
                size="small" 
                component={Link} 
                to="/profile"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  minWidth: 'auto',
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
              >
                <User size={16} />
                <Typography variant="body2" sx={{ display: { xs: 'none', xl: 'block' } }}>
                  Profile
                </Typography>
              </Button>
              <Button 
                variant="text" 
                size="small" 
                component={Link} 
                to="/settings"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  minWidth: 'auto',
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
              >
                <Settings size={16} />
                <Typography variant="body2" sx={{ display: { xs: 'none', xl: 'block' } }}>
                  Settings
                </Typography>
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={handleLogout}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  minWidth: 'auto',
                  color: '#d32f2f',
                  '&:hover': {
                    color: '#b71c1c',
                    backgroundColor: 'rgba(211, 47, 47, 0.1)'
                  }
                }}
              >
                <LogOut size={16} />
                <Typography variant="body2" sx={{ display: { xs: 'none', xl: 'block' } }}>
                  Logout
                </Typography>
              </Button>
            </Box>
          </Box>

          {/* Mobile menu button */}
          <Box sx={{ display: { lg: 'none' }, alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
              <Avatar sx={{
                width: 28,
                height: 28,
                background: 'linear-gradient(45deg, #1976d2, #9c27b0)'
              }}>
                <User size={14} style={{ color: 'white' }} />
              </Avatar>
              <Typography variant="body2" sx={{
                fontWeight: 500,
                color: 'text.primary',
                display: { xs: 'none', sm: 'block' }
              }}>
                {user?.firstName || user?.name}
              </Typography>
            </Box>
            <IconButton
              onClick={() => setIsOpen(!isOpen)}
              sx={{
                p: 0.5,
                color: 'text.secondary'
              }}
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </IconButton>
          </Box>
        </Toolbar>

        {/* Mobile Navigation */}
        {isOpen && (
          <Box sx={{
            display: { lg: 'none' },
            borderTop: 1,
            borderColor: 'rgba(229,231,235,0.6)',
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)'
          }}>
            <Box sx={{ px: 2, py: 3, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Box
                    key={item.name}
                    component={Link}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      px: 2,
                      py: 1.5,
                      borderRadius: 3,
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      ...(isActive ? {
                        background: 'linear-gradient(45deg, rgba(25, 118, 210, 0.1), rgba(156, 39, 176, 0.1))',
                        color: '#1976d2',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid rgba(25, 118, 210, 0.2)'
                      } : {
                        color: '#666',
                        '&:hover': {
                          color: '#1976d2',
                          bgcolor: 'rgba(0,0,0,0.04)'
                        }
                      })
                    }}
                  >
                    <Box sx={{
                      p: 0.75,
                      borderRadius: 2,
                      transition: 'colors 0.2s',
                      ...(isActive ? {
                        bgcolor: 'rgba(25, 118, 210, 0.2)',
                        color: '#1976d2'
                      } : {
                        bgcolor: '#f5f5f5'
                      })
                    }}>
                      <Icon size={18} />
                    </Box>
                    <Box sx={{ flex: 1 }}>{item.name}</Box>
                    {isActive && (
                      <Box sx={{ width: 8, height: 8, bgcolor: '#1976d2', borderRadius: '50%' }} />
                    )}
                  </Box>
                );
              })}
              
              <Box sx={{ borderTop: 1, borderColor: 'rgba(0,0,0,0.1)', pt: 3, mt: 3 }}>
                <Box
                  component={Link}
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    px: 2,
                    py: 1.5,
                    borderRadius: 3,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#666',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      color: '#1976d2',
                      bgcolor: 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: '#f5f5f5', transition: 'colors 0.2s' }}>
                    <User size={18} />
                  </Box>
                  <span>Profile</span>
                </Box>
                <Box
                  component={Link}
                  to="/settings"
                  onClick={() => setIsOpen(false)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    px: 2,
                    py: 1.5,
                    borderRadius: 3,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#666',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      color: '#1976d2',
                      bgcolor: 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: '#f5f5f5', transition: 'colors 0.2s' }}>
                    <Settings size={18} />
                  </Box>
                  <span>Settings</span>
                </Box>
                <Box
                  component="button"
                  onClick={handleLogout}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    px: 2,
                    py: 1.5,
                    borderRadius: 3,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#d32f2f',
                    bgcolor: 'transparent',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(211, 47, 47, 0.1)'
                    }
                  }}
                >
                  <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#d32f2f' }}>
                    <LogOut size={18} />
                  </Box>
                  <span>Logout</span>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Container>
    </AppBar>
  );
};

export default Navbar;