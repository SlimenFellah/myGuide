/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Menu, 
  X, 
  Home, 
  Map, 
  MessageCircle, 
  Calendar, 
  Settings, 
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';
import { Button } from '../components/ui/button';
// Note: Using simpler alternatives until dropdown-menu and badge components are available
import myGuideLogo from '../assets/myGuide-logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Explore', path: '/explore', icon: Map },
    { name: 'Trip Planner', path: '/trip-planner', icon: Calendar },
    { name: 'Chatbot', path: '/chatbot', icon: MessageCircle },
  ];

  if (isAdmin()) {
    navItems.push({ name: 'Admin', path: '/admin', icon: Settings });
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="relative">
                <img 
                  src={myGuideLogo} 
                  alt="MyGuide" 
                  className="h-9 w-auto transition-transform group-hover:scale-105"
                />
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">MyGuide</span>
              {isAdmin() && (
                <span className="text-xs px-2 py-0.5 bg-secondary-100 text-secondary-700 rounded-full font-medium">
                  Admin
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group relative flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50/80'
                  }`}
                >
                  <Icon size={18} className={`transition-transform group-hover:scale-110 ${
                    isActive ? 'text-primary-600' : ''
                  }`} />
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">
                  {user?.firstName || user?.name}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.email}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile" className="flex items-center space-x-1">
                  <User size={16} />
                  <span className="hidden xl:block">Profile</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/settings" className="flex items-center space-x-1">
                  <Settings size={16} />
                  <span className="hidden xl:block">Settings</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut size={16} />
                <span className="hidden xl:block">Logout</span>
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            <div className="flex items-center space-x-2 mr-2">
              <div className="w-7 h-7 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user?.firstName || user?.name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 h-auto"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden border-t border-gray-200/60 bg-white/95 backdrop-blur">
            <div className="px-4 py-6 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`group flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-700 shadow-sm border border-primary-100'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50/80 active:bg-gray-100'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${
                      isActive 
                        ? 'bg-primary-100 text-primary-600' 
                        : 'bg-gray-100 group-hover:bg-primary-50 group-hover:text-primary-600'
                    } transition-colors`}>
                      <Icon size={18} />
                    </div>
                    <span className="flex-1">{item.name}</span>
                    {isActive && (
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    )}
                  </Link>
                );
              })}
              
              <div className="border-t border-gray-200/60 pt-6 mt-6 space-y-1">
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50/80 transition-all duration-200"
                >
                  <div className="p-1.5 rounded-lg bg-gray-100 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                    <User size={18} />
                  </div>
                  <span>Profile</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50/80 transition-all duration-200"
                >
                  <div className="p-1.5 rounded-lg bg-gray-100 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                    <Settings size={18} />
                  </div>
                  <span>Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 active:bg-red-100 transition-all duration-200 w-full text-left"
                >
                  <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
                    <LogOut size={18} />
                  </div>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;