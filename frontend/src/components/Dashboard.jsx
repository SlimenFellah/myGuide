import React from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useCurrentUser } from '../store/hooks';
import { logoutUser } from '../store/slices/authSlice';
import './Dashboard.css';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const user = useCurrentUser();

  const handleLogout = async () => {
    await dispatch(logoutUser());
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🏛️ MyGuide Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user?.first_name || user?.username}!</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome to MyGuide!</h2>
          <p>
            Discover amazing places, plan your trips, and get personalized recommendations 
            for your next adventure in Algeria.
          </p>
        </div>

        <div className="quick-actions">
          <Link to="/places" className="action-card">
            <h3>🏛️ Explore Places</h3>
            <p>Discover historical sites, museums, and attractions</p>
          </Link>

          <Link to="/trip-planner" className="action-card">
            <h3>🗺️ Plan Your Trip</h3>
            <p>Create personalized itineraries for your journey</p>
          </Link>

          <Link to="/chatbot" className="action-card">
            <h3>🤖 AI Assistant</h3>
            <p>Get instant help and recommendations</p>
          </Link>

          <Link to="/profile" className="action-card">
            <h3>👤 My Profile</h3>
            <p>Manage your account and preferences</p>
          </Link>
        </div>

        <div className="welcome-section">
          <h2>🌟 Featured Destinations</h2>
          <p>
            From the ancient ruins of Timgad to the stunning landscapes of the Sahara, 
            Algeria offers countless wonders waiting to be explored.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;