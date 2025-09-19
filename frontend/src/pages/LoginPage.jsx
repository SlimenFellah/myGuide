/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useIsAuthenticated, useAuthLoading, useAuthError } from '../store/hooks';
import { loginUser, clearError } from '../store/slices/authSlice';
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Alert,
  Checkbox,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import myGuideLogo from '../assets/myGuide-logo.png';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const dispatch = useAppDispatch();
  const isAuthenticated = useIsAuthenticated();
  const authLoading = useAuthLoading();
  const authError = useAuthError();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (authError) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    dispatch(clearError());

    try {
      const result = await dispatch(loginUser({
        email: formData.email,
        password: formData.password
      })).unwrap();
      
      // Navigate on successful login
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        p: { xs: 2, sm: 3 } 
      }}>
        <Box component={Link} to="/" sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          textDecoration: 'none' 
        }}>
          <img 
            src={myGuideLogo} 
            alt="MyGuide" 
            style={{ height: 32, width: 'auto' }}
          />
          <Typography variant="h5" sx={{ 
            fontWeight: 'bold', 
            background: 'linear-gradient(45deg, #1976d2, #1565c0)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}>
            MyGuide
          </Typography>
        </Box>
        <Button 
          component={Link} 
          to="/" 
          variant="text" 
          startIcon={<ArrowLeft size={16} />}
          sx={{ 
            '&:hover': { 
              transform: 'scale(1.05)', 
              bgcolor: 'rgba(0,0,0,0.04)' 
            },
            transition: 'all 0.3s ease'
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            Back to Home
          </Box>
        </Button>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        p: 2 
      }}>
        <Container maxWidth="sm" sx={{ width: '100%', maxWidth: 400 }}>
          <Card sx={{ 
            boxShadow: 6, 
            bgcolor: 'rgba(255,255,255,0.95)', 
            backdropFilter: 'blur(10px)',
            borderRadius: 2
          }}>
            <Box sx={{ p: 3, textAlign: 'center', pb: 2 }}>
              <Typography variant="h4" component="h1" sx={{ 
                fontWeight: 'bold', 
                mb: 1 
              }}>
                Welcome Back
              </Typography>
              <Typography variant="body1" sx={{ 
                color: 'text.secondary' 
              }}>
                Sign in to continue your journey through Algeria
              </Typography>
            </Box>
            
            <CardContent sx={{ pt: 0 }}>
              {(error || authError) && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error || authError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Email Field */}
                <TextField
                  id="email"
                  name="email"
                  type="email"
                  label="Email"
                  autoComplete="email"
                  required
                  fullWidth
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={20} />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Password Field */}
                <TextField
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  autoComplete="current-password"
                  required
                  fullWidth
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={20} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Remember Me & Forgot Password */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <FormControlLabel
                    control={<Checkbox id="remember" />}
                    label="Remember me"
                  />
                  <Button 
                    component={Link} 
                    to="/forgot-password" 
                    variant="text" 
                    sx={{ 
                      textTransform: 'none',
                      '&:hover': { 
                        transform: 'scale(1.05)' 
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Forgot password?
                  </Button>
                </Box>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={authLoading}
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    py: 1.5,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {authLoading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>


              {/* Sign Up Link */}
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" component="span" sx={{ color: 'text.secondary' }}>
                  Don't have an account?{' '}
                </Typography>
                <Button 
                  component={Link} 
                  to="/register" 
                  variant="text" 
                  sx={{ 
                    textTransform: 'none',
                    '&:hover': { 
                      transform: 'scale(1.05)' 
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Sign up
                </Button>
              </Box>
            </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default LoginPage;