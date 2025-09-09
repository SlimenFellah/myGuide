/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  MessageCircle, 
  Calendar, 
  Star, 
  Users, 
  Shield,
  ArrowRight
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: MessageCircle,
      title: 'AI Chatbot',
      description: 'Get instant answers about Algeria\'s tourist destinations, culture, and travel tips from our intelligent chatbot.'
    },
    {
      icon: Calendar,
      title: 'Trip Planner',
      description: 'Create personalized itineraries based on your budget, preferences, and travel dates with AI recommendations.'
    },
    {
      icon: MapPin,
      title: 'Interactive Maps',
      description: 'Explore provinces, districts, and municipalities with detailed information about places and attractions.'
    },
    {
      icon: Star,
      title: 'Reviews & Ratings',
      description: 'Read authentic reviews from fellow travelers and share your own experiences to help others.'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join a community of travelers exploring Algeria and discover hidden gems recommended by locals.'
    },
    {
      icon: Shield,
      title: 'Trusted Information',
      description: 'Access verified information about costs, safety, and logistics for a worry-free travel experience.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img 
                src="/assets/myGuide-logo.png" 
                alt="MyGuide" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-gradient">MyGuide</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Discover 
                <span className="text-gradient"> Algeria</span>
                <br />with AI-Powered Guidance
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Explore the beauty of Algeria with personalized trip recommendations, 
                interactive maps, and an intelligent chatbot that knows every corner 
                of this magnificent country.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/register" 
                  className="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center"
                >
                  Start Exploring
                  <ArrowRight className="ml-2" size={20} />
                </Link>
                <Link 
                  to="/login" 
                  className="btn-secondary text-lg px-8 py-3 inline-flex items-center justify-center"
                >
                  Sign In
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/assets/427318025.png" 
                alt="Algeria Tourism" 
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-500/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for the Perfect Trip
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform combines local knowledge with cutting-edge technology 
              to create unforgettable travel experiences in Algeria.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-primary-100 rounded-lg mr-4">
                      <Icon className="text-primary-600" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="container text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Explore Algeria?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who have discovered the magic of Algeria 
            with MyGuide's intelligent travel companion.
          </p>
          <Link 
            to="/register" 
            className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center"
          >
            Get Started Free
            <ArrowRight className="ml-2" size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/assets/myGuide-logo.png" 
                  alt="MyGuide" 
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold">MyGuide</span>
              </div>
              <p className="text-gray-400">
                Your AI-powered companion for exploring the beauty of Algeria.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>AI Chatbot</li>
                <li>Trip Planner</li>
                <li>Interactive Maps</li>
                <li>Reviews & Ratings</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Developer</h4>
              <p className="text-gray-400">
                Created by <span className="text-primary-400 font-medium">Slimene Fellah</span>
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Available for freelance projects
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MyGuide. All rights reserved. Developed by Slimene Fellah.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;