/*
 * Developed & maintained by Slimene Fellah — Available for freelance work at slimenefellah.dev
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/hooks';
import { 
  ArrowRight, 
  MapPin, 
  MessageCircle, 
  Star,
  Menu,
  X,
  CheckCircle,
  Users,
  TrendingUp,
  Shield,
  Sparkles,
  Globe,
  Heart,
  Navigation,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react';
import { Button, Card, CardContent, Typography, Box } from '@mui/material';
import { CalendarToday as Calendar } from '@mui/icons-material';
import myGuideLogo from '../assets/myGuide-logo.png';
import heroImage from '../assets/427318025.png';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const auth = useAuth();
  const isAuthenticated = auth.isAuthenticated;
  const navigate = useNavigate();

  // Removed automatic redirect to allow authenticated users to visit landing page

  const features = [
    {
      icon: MapPin,
      title: "Discover Algeria",
      description: "Explore hidden gems and popular destinations across Algeria's diverse landscapes."
    },
    {
      icon: MessageCircle,
      title: "AI Travel Assistant",
      description: "Get personalized recommendations and instant answers to your travel questions."
    },
    {
      icon: Calendar,
      title: "Smart Trip Planning",
      description: "Create detailed itineraries with AI-powered suggestions tailored to your preferences."
    },
    {
      icon: Users,
      title: "Community Insights",
      description: "Connect with fellow travelers and share experiences from your adventures."
    },
    {
      icon: Shield,
      title: "Trusted & Secure",
      description: "Your data is protected with enterprise-grade security and privacy measures."
    },
    {
      icon: Sparkles,
      title: "Personalized Experience",
      description: "Tailored recommendations based on your interests and travel history."
    }
  ];

  const stats = [
    { number: "500+", label: "Destinations" },
    { number: "10K+", label: "Happy Travelers" },
    { number: "4.9", label: "User Rating" },
    { number: "24/7", label: "AI Support" }
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.05) 100%)'
    }}>
      {/* Navigation */}
      <Box component="nav" sx={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)'
      }}>
        <Box sx={{
          maxWidth: '1200px',
          mx: 'auto',
          px: 2,
          display: 'flex',
          height: 64,
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img 
              src={myGuideLogo} 
              alt="MyGuide" 
              style={{ height: 32, width: 'auto' }}
            />
            <Typography variant="h5" sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}>
              MyGuide
            </Typography>
          </Box>
          
          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
            <Typography component="a" href="#features" sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'text.secondary',
              textDecoration: 'none',
              px: 1.5,
              py: 1,
              borderRadius: 1,
              transition: 'all 0.3s',
              '&:hover': {
                color: 'text.primary',
                transform: 'scale(1.05)',
                backgroundColor: 'rgba(0,0,0,0.05)'
              }
            }}>
              Features
            </Typography>
            <Typography component="a" href="#about" sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'text.secondary',
              textDecoration: 'none',
              px: 1.5,
              py: 1,
              borderRadius: 1,
              transition: 'all 0.3s',
              '&:hover': {
                color: 'text.primary',
                transform: 'scale(1.05)',
                backgroundColor: 'rgba(0,0,0,0.05)'
              }
            }}>
              About
            </Typography>
            <Typography component="a" href="#contact" sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'text.secondary',
              textDecoration: 'none',
              px: 1.5,
              py: 1,
              borderRadius: 1,
              transition: 'all 0.3s',
              '&:hover': {
                color: 'text.primary',
                transform: 'scale(1.05)',
                backgroundColor: 'rgba(0,0,0,0.05)'
              }
            }}>
              Contact
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isAuthenticated ? (
                <Button 
                  variant="contained" 
                  component={Link} 
                  to="/dashboard"
                  sx={{
                    '&:hover': {
                      backgroundColor: 'background.paper',
                      color: 'primary.main'
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  View Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outlined" 
                    component={Link} 
                    to="/login"
                    sx={{
                      borderColor: 'divider',
                      color: 'text.primary',
                      '&:hover': {
                        backgroundColor: 'text.primary',
                        color: 'background.paper'
                      },
                      transition: 'all 0.3s'
                    }}
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="contained" 
                    component={Link} 
                    to="/register"
                    sx={{
                      '&:hover': {
                        backgroundColor: 'background.paper',
                        color: 'primary.main'
                      },
                      transition: 'all 0.3s'
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </Box>
          </Box>

          {/* Mobile menu button */}
          <Button
            variant="outlined"
            size="small"
            sx={{
              display: { md: 'none' },
              borderColor: 'divider',
              minWidth: 'auto',
              width: 40,
              height: 40,
              '&:hover': {
                backgroundColor: 'text.primary',
                color: 'background.paper'
              },
              transition: 'all 0.3s'
            }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </Box>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <Box sx={{
            display: { md: 'none' },
            borderTop: 1,
            borderColor: 'divider',
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)'
          }}>
            <Box sx={{
              maxWidth: '1200px',
              mx: 'auto',
              px: 2,
              py: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              <Typography component="a" href="#features" sx={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'text.secondary',
                textDecoration: 'none',
                px: 1.5,
                py: 1,
                borderRadius: 1,
                transition: 'all 0.3s',
                '&:hover': {
                  color: 'text.primary',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  transform: 'scale(1.05)'
                }
              }}>
                Features
              </Typography>
              <Typography component="a" href="#about" sx={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'text.secondary',
                textDecoration: 'none',
                px: 1.5,
                py: 1,
                borderRadius: 1,
                transition: 'all 0.3s',
                '&:hover': {
                  color: 'text.primary',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  transform: 'scale(1.05)'
                }
              }}>
                About
              </Typography>
              <Typography component="a" href="#contact" sx={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'text.secondary',
                textDecoration: 'none',
                px: 1.5,
                py: 1,
                borderRadius: 1,
                transition: 'all 0.3s',
                '&:hover': {
                  color: 'text.primary',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  transform: 'scale(1.05)'
                }
              }}>
                Contact
              </Typography>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                pt: 2,
                borderTop: 1,
                borderColor: 'divider'
              }}>
                {isAuthenticated ? (
                  <Button 
                    variant="contained" 
                    component={Link} 
                    to="/dashboard"
                    sx={{
                      justifyContent: 'flex-start',
                      '&:hover': {
                        backgroundColor: 'background.paper',
                        color: 'primary.main'
                      },
                      transition: 'all 0.3s'
                    }}
                  >
                    View Dashboard
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="outlined" 
                      component={Link} 
                      to="/login"
                      sx={{
                        justifyContent: 'flex-start',
                        borderColor: 'divider',
                        color: 'text.primary',
                        '&:hover': {
                          backgroundColor: 'text.primary',
                          color: 'background.paper'
                        },
                        transition: 'all 0.3s'
                      }}
                    >
                      Sign In
                    </Button>
                    <Button 
                      variant="contained" 
                      component={Link} 
                      to="/register"
                      sx={{
                        justifyContent: 'flex-start',
                        '&:hover': {
                          backgroundColor: 'background.paper',
                          color: 'primary.main'
                        },
                        transition: 'all 0.3s'
                      }}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Hero Section */}
      <Box component="section" sx={{ position: 'relative', py: { xs: 6, lg: 10 }, overflow: 'hidden' }}>
        <Box sx={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 2, position: 'relative' }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { lg: '1fr 1fr' },
            gap: { xs: 6, lg: 12 },
            alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: '50px',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  width: 'fit-content'
                }}>
                  <Sparkles style={{ marginRight: 8, width: 16, height: 16 }} />
                  AI-Powered Travel Assistant
                </Box>
                <Typography variant="h1" sx={{
                  fontSize: { xs: '2.25rem', sm: '3rem', xl: '3.75rem' },
                  fontWeight: 'bold',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.1
                }}>
                  Discover Algeria with{' '}
                  <Box component="span" sx={{
                    background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                  }}>
                    Intelligent
                  </Box>{' '}
                  Travel Guidance
                </Typography>
                <Typography sx={{
                  maxWidth: '600px',
                  color: 'text.secondary',
                  fontSize: { md: '1.25rem' }
                }}>
                  Your smart companion for exploring Algeria's rich culture, stunning landscapes, 
                  and hidden treasures. Get personalized recommendations and plan unforgettable journeys.
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                gap: 2 
              }}>
                {isAuthenticated ? (
                  <>
                    <Button 
                      size="large" 
                      variant="contained"
                      component={Link} 
                      to="/dashboard"
                      sx={{
                        fontSize: '1rem',
                        '&:hover': {
                          backgroundColor: 'background.paper',
                          color: 'primary.main'
                        },
                        transition: 'all 0.3s'
                      }}
                    >
                      <Navigation style={{ marginRight: 8, width: 20, height: 20 }} />
                      Go to Dashboard
                    </Button>
                    <Button 
                      size="large" 
                      variant="outlined" 
                      component={Link} 
                      to="/explore"
                      sx={{
                        fontSize: '1rem',
                        borderColor: 'divider',
                        color: 'text.primary',
                        '&:hover': {
                          backgroundColor: 'text.primary',
                          color: 'background.paper'
                        },
                        transition: 'all 0.3s'
                      }}
                    >
                      <Globe style={{ marginRight: 8, width: 20, height: 20 }} />
                      Continue Exploring
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      size="large" 
                      variant="contained"
                      component={Link} 
                      to="/register"
                      sx={{
                        fontSize: '1rem',
                        '&:hover': {
                          backgroundColor: 'background.paper',
                          color: 'primary.main'
                        },
                        transition: 'all 0.3s'
                      }}
                    >
                      <Navigation style={{ marginRight: 8, width: 20, height: 20 }} />
                      Start Your Journey
                    </Button>
                    <Button 
                      size="large" 
                      variant="outlined" 
                      component={Link} 
                      to="/explore"
                      sx={{
                        fontSize: '1rem',
                        borderColor: 'divider',
                        color: 'text.primary',
                        '&:hover': {
                          backgroundColor: 'text.primary',
                          color: 'background.paper'
                        },
                        transition: 'all 0.3s'
                      }}
                    >
                      <Globe style={{ marginRight: 8, width: 20, height: 20 }} />
                      Explore Destinations
                    </Button>
                  </>
                )}
              </Box>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                gap: 2,
                pt: 4
              }}>
                {stats.map((stat, index) => (
                  <Box key={index} sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stat.number}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            
            <Box sx={{ position: 'relative', ml: { lg: 4 } }}>
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={heroImage}
                  alt="Algeria Travel"
                  sx={{
                    borderRadius: 4,
                    width: '100%',
                    height: 'auto'
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Features Section */}
      <Box component="section" id="features" sx={{ 
        py: { xs: 6, lg: 10 }, 
        backgroundColor: 'rgba(0,0,0,0.02)' 
      }}>
        <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Box sx={{
              display: 'inline-flex',
              alignItems: 'center',
              border: 1,
              borderColor: 'divider',
              borderRadius: '50px',
              px: 1.5,
              py: 0.5,
              fontSize: '0.875rem',
              fontWeight: 500,
              mb: 2
            }}>
              <Heart style={{ marginRight: 8, width: 16, height: 16 }} />
              Why Choose MyGuide
            </Box>
            <Typography variant="h2" sx={{
              fontSize: { xs: '1.875rem', sm: '2.25rem', md: '3rem' },
              fontWeight: 'bold',
              letterSpacing: '-0.025em'
            }}>
              Everything you need for the perfect trip
            </Typography>
            <Typography sx={{
              mx: 'auto',
              mt: 2,
              maxWidth: '700px',
              color: 'text.secondary',
              fontSize: { md: '1.25rem' }
            }}>
              Discover what makes MyGuide the ultimate companion for exploring Algeria's wonders
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'grid', 
            gap: 3, 
            gridTemplateColumns: { sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }
          }}>
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} sx={{
                position: 'relative',
                overflow: 'hidden',
                border: 0,
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(0,0,0,0.05) 100%)',
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: 3
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{
                      mb: 2,
                      display: 'inline-flex',
                      height: 48,
                      width: 48,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2,
                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                      transition: 'background-color 0.3s',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.2)'
                      }
                    }}>
                      <IconComponent style={{ width: 24, height: 24, color: '#1976d2' }} />
                    </Box>
                    <Typography variant="h6" sx={{
                      mb: 1,
                      fontSize: '1.25rem',
                      fontWeight: 600
                    }}>
                      {feature.title}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary' }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* CTA Section */}
      <section className="py-12 lg:py-20">
        <div className="container">
          <Card sx={{
              position: 'relative',
              overflow: 'hidden',
              border: 0,
              background: 'linear-gradient(135deg, #1976d2 0%, rgba(25, 118, 210, 0.8) 100%)',
              color: 'primary.contrastText'
            }}>
              <CardContent sx={{ p: 6, textAlign: 'center', color: 'primary.contrastText' }}>
              <div className="mx-auto max-w-2xl">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                  Ready to Explore Algeria?
                </h2>
                <p className="text-lg opacity-90 mb-8">
                  Join thousands of travelers who have discovered the magic of Algeria 
                  with MyGuide's intelligent travel assistance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {isAuthenticated ? (
                    <>
                      <Button 
                        size="large" 
                        variant="contained" 
                        component={Link} 
                        to="/dashboard"
                        sx={{
                          fontSize: '1rem',
                          backgroundColor: 'background.paper',
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'primary.contrastText',
                            color: 'primary.main'
                          },
                          transition: 'all 0.3s'
                        }}
                      >
                        Access Dashboard
                      </Button>
                      <Button 
                        size="large" 
                        variant="outlined" 
                        component={Link} 
                        to="/explore"
                        sx={{
                          fontSize: '1rem',
                          borderColor: 'rgba(255, 255, 255, 0.4)',
                          color: 'primary.contrastText',
                          '&:hover': {
                            backgroundColor: 'primary.contrastText',
                            color: 'primary.main'
                          },
                          transition: 'all 0.3s'
                        }}
                      >
                        Explore Now
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        size="large" 
                        variant="contained" 
                        component={Link} 
                        to="/register"
                        sx={{
                          fontSize: '1rem',
                          backgroundColor: 'background.paper',
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'primary.contrastText',
                            color: 'primary.main'
                          },
                          transition: 'all 0.3s'
                        }}
                      >
                        Get Started Free
                      </Button>
                      <Button 
                        size="large" 
                        variant="outlined" 
                        component={Link} 
                        to="/explore"
                        sx={{
                          fontSize: '1rem',
                          borderColor: 'rgba(255, 255, 255, 0.4)',
                          color: 'primary.contrastText',
                          '&:hover': {
                            backgroundColor: 'primary.contrastText',
                            color: 'primary.main'
                          },
                          transition: 'all 0.3s'
                        }}
                      >
                        Explore Now
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <Box component="footer" id="contact" sx={{ 
        borderTop: 1, 
        borderColor: 'divider',
        backgroundColor: 'rgba(0,0,0,0.02)' 
      }}>
        <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 2, py: 6 }}>
          <Box sx={{ 
            display: 'grid', 
            gap: 4, 
            gridTemplateColumns: { md: 'repeat(4, 1fr)' }
          }}>
            <Box sx={{ gridColumn: { md: 'span 2' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <img 
                  src={myGuideLogo} 
                  alt="MyGuide" 
                  style={{ height: 32, width: 'auto' }}
                />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  MyGuide
                </Typography>
              </Box>
              <Typography sx={{ 
                color: 'text.secondary', 
                mb: 3, 
                maxWidth: '28rem' 
              }}>
                Your AI-powered companion for discovering the beauty and culture of Algeria. 
                Plan smarter, travel better, experience more.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="text" 
                  sx={{
                    minWidth: 36,
                    width: 36,
                    height: 36,
                    '&:hover': {
                      transform: 'scale(1.1)',
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      color: '#3b82f6'
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  <Facebook style={{ width: 16, height: 16 }} />
                </Button>
                <Button 
                  variant="text" 
                  sx={{
                    minWidth: 36,
                    width: 36,
                    height: 36,
                    '&:hover': {
                      transform: 'scale(1.1)',
                      backgroundColor: 'rgba(14, 165, 233, 0.2)',
                      color: '#0ea5e9'
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  <Twitter style={{ width: 16, height: 16 }} />
                </Button>
                <Button 
                  variant="text" 
                  sx={{
                    minWidth: 36,
                    width: 36,
                    height: 36,
                    '&:hover': {
                      transform: 'scale(1.1)',
                      backgroundColor: 'rgba(236, 72, 153, 0.2)',
                      color: '#ec4899'
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  <Instagram style={{ width: 16, height: 16 }} />
                </Button>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Links
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box component="li">
                  <Typography component={Link} to="/explore" sx={{
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                    '&:hover': {
                      color: 'text.primary',
                      transform: 'translateX(8px)'
                    }
                  }}>
                    Explore
                  </Typography>
                </Box>
                <Box component="li">
                  <Typography component={Link} to="/trip-planner" sx={{
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                    '&:hover': {
                      color: 'text.primary',
                      transform: 'translateX(8px)'
                    }
                  }}>
                    Trip Planner
                  </Typography>
                </Box>
                <Box component="li">
                  <Typography component={Link} to="/chatbot" sx={{
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                    '&:hover': {
                      color: 'text.primary',
                      transform: 'translateX(8px)'
                    }
                  }}>
                    AI Assistant
                  </Typography>
                </Box>
                <Box component="li">
                  <Typography component="a" href="#about" sx={{
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                    '&:hover': {
                      color: 'text.primary',
                      transform: 'translateX(8px)'
                    }
                  }}>
                    About Us
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Support
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box component="li">
                  <Typography component="a" href="#" sx={{
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                    '&:hover': {
                      color: 'text.primary',
                      transform: 'translateX(8px)'
                    }
                  }}>
                    Help Center
                  </Typography>
                </Box>
                <Box component="li">
                  <Typography component="a" href="#contact" sx={{
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                    '&:hover': {
                      color: 'text.primary',
                      transform: 'translateX(8px)'
                    }
                  }}>
                    Contact Us
                  </Typography>
                </Box>
                <Box component="li">
                  <Typography component="a" href="#" sx={{
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                    '&:hover': {
                      color: 'text.primary',
                      transform: 'translateX(8px)'
                    }
                  }}>
                    Privacy Policy
                  </Typography>
                </Box>
                <Box component="li">
                  <Typography component="a" href="#" sx={{
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                    '&:hover': {
                      color: 'text.primary',
                      transform: 'translateX(8px)'
                    }
                  }}>
                    Terms of Service
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ 
            mt: 4, 
            borderTop: 1, 
            borderColor: 'divider',
            pt: 4, 
            textAlign: 'center' 
          }}>
            <Typography variant="body2" sx={{ 
              color: 'text.secondary',
              mt: 1
            }}>
              Developed & maintained by Slimene Fellah — Available for freelance work at{' '}
              <Typography component="a" 
                href="https://slimenefellah.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                slimenefellah.dev
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LandingPage;