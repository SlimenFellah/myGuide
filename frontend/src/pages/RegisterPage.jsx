/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useIsAuthenticated, useAuthError, useAuthLoading } from '../store/hooks';
import { registerUser } from '../store/slices/authSlice';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, ArrowLeft, Loader2, CheckCircle, Phone } from 'lucide-react';
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

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const authError = useAuthError();
  const authLoading = useAuthLoading();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) return;
    
    try {
      const result = await dispatch(registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword
      })).unwrap();
      
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
                Join MyGuide
              </Typography>
              <Typography variant="body1" sx={{ 
                color: 'text.secondary' 
              }}>
                Start your journey through Algeria's wonders
              </Typography>
            </Box>
            
            <CardContent sx={{ pt: 0 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Name Field */}
                <TextField
                  id="name"
                  name="name"
                  type="text"
                  label="Full Name"
                  autoComplete="name"
                  required
                  fullWidth
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <User size={20} />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Email Field */}
                <TextField
                  id="email"
                  name="email"
                  type="email"
                  label="Email Address"
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
                  required
                  fullWidth
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
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

                {/* Confirm Password Field */}
                <TextField
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  required
                  fullWidth
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={20} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Terms and Conditions */}
                <FormControlLabel
                  control={
                    <Checkbox
                      id="terms"
                      name="terms"
                      required
                      checked={formData.terms}
                      onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.checked }))}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      I agree to the{' '}
                      <Button
                        component={Link}
                        to="/terms"
                        variant="text"
                        size="small"
                        sx={{ p: 0, minWidth: 'auto', textDecoration: 'underline', fontSize: 'inherit' }}
                      >
                        Terms of Service
                      </Button>{' '}
                      and{' '}
                      <Button
                        component={Link}
                        to="/privacy"
                        variant="text"
                        size="small"
                        sx={{ p: 0, minWidth: 'auto', textDecoration: 'underline', fontSize: 'inherit' }}
                      >
                        Privacy Policy
                      </Button>
                    </Typography>
                  }
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    mt: 2,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: 4
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isLoading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </Box>

              {/* Sign In Link */}
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Already have an account?{' '}
                  <Button
                    component={Link}
                    to="/login"
                    variant="text"
                    sx={{
                      p: 0,
                      minWidth: 'auto',
                      textDecoration: 'underline',
                      fontSize: 'inherit',
                      fontWeight: 600,
                      '&:hover': {
                        transform: 'scale(1.05)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Sign in
                  </Button>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default RegisterPage;