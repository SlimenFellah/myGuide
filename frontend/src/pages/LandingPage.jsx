/*
 * Developed & maintained by Slimene Fellah — Available for freelance work at slimenefellah.dev
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowRight, 
  MapPin, 
  MessageCircle, 
  Calendar, 
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
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import myGuideLogo from '../assets/myGuide-logo.png';
import heroImage from '../assets/427318025.png';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src={myGuideLogo} 
              alt="MyGuide" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-gradient">MyGuide</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground hover:scale-105 transition-all duration-300 hover:bg-muted/50 px-3 py-2 rounded-md">
              Features
            </a>
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground hover:scale-105 transition-all duration-300 hover:bg-muted/50 px-3 py-2 rounded-md">
              About
            </a>
            <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground hover:scale-105 transition-all duration-300 hover:bg-muted/50 px-3 py-2 rounded-md">
              Contact
            </a>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild className="border border-border hover:bg-foreground hover:text-background transition-all duration-300">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild className="border border-primary hover:bg-background hover:text-foreground transition-all duration-300">
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <div className="container py-4 space-y-4">
              <a href="#features" className="block text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                Features
              </a>
              <a href="#about" className="block text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                About
              </a>
              <a href="#contact" className="block text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md">
                Contact
              </a>
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Button variant="ghost" asChild className="justify-start border border-border hover:bg-foreground hover:text-background transition-all duration-300">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild className="justify-start border border-primary hover:bg-background hover:text-foreground transition-all duration-300">
                  <Link to="/register">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative py-12 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium">
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI-Powered Travel Assistant
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Discover Algeria with 
                  <span className="text-gradient"> Intelligent </span> 
                  Travel Guidance
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Your smart companion for exploring Algeria's rich culture, stunning landscapes, 
                  and hidden treasures. Get personalized recommendations and plan unforgettable journeys.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="text-base border border-primary hover:bg-background hover:text-foreground transition-all duration-300">
                  <Link to="/register">
                    <Navigation className="mr-2 h-5 w-5" />
                    Start Your Journey
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base border border-border hover:bg-foreground hover:text-background transition-all duration-300">
                  <Link to="/explore">
                    <Globe className="mr-2 h-5 w-5" />
                    Explore Destinations
                  </Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold">{stat.number}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative lg:ml-8">
              <div className="relative">
                <img 
                  src={heroImage} 
                  alt="Algeria Travel" 
                  className="rounded-2xl w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 lg:py-20">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium mb-4">
              <Heart className="mr-2 h-4 w-4" />
              Why Choose MyGuide
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Everything you need for the perfect trip
            </h2>
            <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
              Discover what makes MyGuide the ultimate companion for exploring Algeria's wonders
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="group relative overflow-hidden border-0 bg-gradient-to-br from-background to-muted/50 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-20">
        <div className="container">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80">
            <CardContent className="p-12 text-center text-primary-foreground">
              <div className="mx-auto max-w-2xl">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                  Ready to Explore Algeria?
                </h2>
                <p className="text-lg opacity-90 mb-8">
                  Join thousands of travelers who have discovered the magic of Algeria 
                  with MyGuide's intelligent travel assistance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="secondary" asChild className="text-base border border-secondary hover:bg-primary-foreground hover:text-primary transition-all duration-300">
                    <Link to="/register">
                      Get Started Free
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="text-base border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-all duration-300">
                    <Link to="/explore">
                      Explore Now
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t bg-muted/50">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src={myGuideLogo} 
                  alt="MyGuide" 
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold">MyGuide</span>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md">
                Your AI-powered companion for discovering the beauty and culture of Algeria. 
                Plan smarter, travel better, experience more.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" className="h-9 w-9 hover:scale-110 hover:bg-blue-500/20 hover:text-blue-500 transition-all duration-300">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 hover:scale-110 hover:bg-sky-500/20 hover:text-sky-500 transition-all duration-300">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 hover:scale-110 hover:bg-pink-500/20 hover:text-pink-500 transition-all duration-300">
                  <Instagram className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/explore" className="text-muted-foreground hover:text-foreground hover:translate-x-2 transition-all duration-300">Explore</Link></li>
                <li><Link to="/trip-planner" className="text-muted-foreground hover:text-foreground hover:translate-x-2 transition-all duration-300">Trip Planner</Link></li>
                <li><Link to="/chatbot" className="text-muted-foreground hover:text-foreground hover:translate-x-2 transition-all duration-300">AI Assistant</Link></li>
                <li><a href="#about" className="text-muted-foreground hover:text-foreground hover:translate-x-2 transition-all duration-300">About Us</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground hover:translate-x-2 transition-all duration-300">Help Center</a></li>
                <li><a href="#contact" className="text-muted-foreground hover:text-foreground hover:translate-x-2 transition-all duration-300">Contact Us</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground hover:translate-x-2 transition-all duration-300">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground hover:translate-x-2 transition-all duration-300">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            {/* <p>&copy; 2024 MyGuide. All rights reserved. Built with ❤️ for Algeria.</p> */}
            <p className="mt-2">Developed & maintained by Slimene Fellah — Available for freelance work at <a href="https://slimenefellah.dev" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">slimenefellah.dev</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;