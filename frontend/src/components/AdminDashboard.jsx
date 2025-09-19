import React, { useState, useEffect } from 'react';
import { useAppDispatch, useCurrentUser } from '../store/hooks';
import { logoutUser } from '../store/slices/authSlice';
import './Dashboard.css';

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const user = useCurrentUser();
  const [stats, setStats] = useState({
    places: null,
    provinces: null,
    chats: null,
    knowledgeBase: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      const endpoints = [
        { key: 'places', url: 'http://127.0.0.1:8000/api/tourism/admin/stats/places/' },
        { key: 'provinces', url: 'http://127.0.0.1:8000/api/tourism/admin/stats/provinces/' },
        { key: 'chats', url: 'http://127.0.0.1:8000/api/chatbot/statistics/chat/' },
        { key: 'knowledgeBase', url: 'http://127.0.0.1:8000/api/chatbot/statistics/knowledge-base/' }
      ];

      const results = await Promise.allSettled(
        endpoints.map(endpoint =>
          fetch(endpoint.url, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }).then(res => res.json())
        )
      );

      const newStats = {};
      endpoints.forEach((endpoint, index) => {
        if (results[index].status === 'fulfilled') {
          newStats[endpoint.key] = results[index].value;
        } else {
          console.error(`Failed to fetch ${endpoint.key}:`, results[index].reason);
        }
      });

      setStats(newStats);
    } catch (err) {
      setError('Failed to load admin statistics');
      console.error('Admin stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>🔧 Admin Dashboard</h1>
        </div>
        <div className="loading-message">
          <p>Loading admin statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🔧 Admin Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user?.first_name || user?.username} (Administrator)</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="admin-stats-grid">
          <div className="stat-card">
            <h3>📍 Places Statistics</h3>
            {stats.places ? (
              <div className="stat-details">
                <p>Total Places: {stats.places.total_places || 'N/A'}</p>
                <p>Featured Places: {stats.places.featured_places || 'N/A'}</p>
                <p>Active Places: {stats.places.active_places || 'N/A'}</p>
              </div>
            ) : (
              <p>Unable to load place statistics</p>
            )}
          </div>

          <div className="stat-card">
            <h3>🏛️ Provinces Statistics</h3>
            {stats.provinces ? (
              <div className="stat-details">
                <p>Total Provinces: {stats.provinces.total_provinces || 'N/A'}</p>
                <p>Active Provinces: {stats.provinces.active_provinces || 'N/A'}</p>
              </div>
            ) : (
              <p>Unable to load province statistics</p>
            )}
          </div>

          <div className="stat-card">
            <h3>💬 Chat Statistics</h3>
            {stats.chats ? (
              <div className="stat-details">
                <p>Total Sessions: {stats.chats.total_sessions || 'N/A'}</p>
                <p>Active Sessions: {stats.chats.active_sessions || 'N/A'}</p>
                <p>Total Messages: {stats.chats.total_messages || 'N/A'}</p>
              </div>
            ) : (
              <p>Unable to load chat statistics</p>
            )}
          </div>

          <div className="stat-card">
            <h3>📚 Knowledge Base</h3>
            {stats.knowledgeBase ? (
              <div className="stat-details">
                <p>Total Entries: {stats.knowledgeBase.total_entries || 'N/A'}</p>
                <p>Active Entries: {stats.knowledgeBase.active_entries || 'N/A'}</p>
              </div>
            ) : (
              <p>Unable to load knowledge base statistics</p>
            )}
          </div>
        </div>

        <div className="admin-actions">
          <h2>🛠️ Admin Actions</h2>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => alert('User management coming soon!')}>
              👥 Manage Users
            </button>
            <button className="action-btn" onClick={() => alert('Place management coming soon!')}>
              📍 Manage Places
            </button>
            <button className="action-btn" onClick={() => alert('Feedback management coming soon!')}>
              📝 Manage Feedback
            </button>
            <button className="action-btn" onClick={fetchAdminStats}>
              🔄 Refresh Statistics
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;