/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  MessageSquare, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Download, 
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  Star,
  Flag
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPlaces: 0,
    pendingFeedbacks: 0,
    monthlyVisits: 0
  });
  const [users, setUsers] = useState([]);
  const [places, setPlaces] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    // Simulate API calls to fetch admin data
    setTimeout(() => {
      setStats({
        totalUsers: 1247,
        totalPlaces: 156,
        pendingFeedbacks: 23,
        monthlyVisits: 8934
      });

      setUsers([
        {
          id: 1,
          firstName: 'Ahmed',
          lastName: 'Benali',
          email: 'ahmed.benali@email.com',
          role: 'user',
          status: 'active',
          joinDate: '2024-01-15',
          lastLogin: '2024-01-20'
        },
        {
          id: 2,
          firstName: 'Fatima',
          lastName: 'Khelifi',
          email: 'fatima.khelifi@email.com',
          role: 'user',
          status: 'active',
          joinDate: '2024-01-10',
          lastLogin: '2024-01-19'
        },
        {
          id: 3,
          firstName: 'Youcef',
          lastName: 'Mammeri',
          email: 'youcef.mammeri@email.com',
          role: 'user',
          status: 'inactive',
          joinDate: '2024-01-05',
          lastLogin: '2024-01-12'
        }
      ]);

      setPlaces([
        {
          id: 1,
          name: 'Casbah of Algiers',
          province: 'Algiers',
          district: 'Algiers Center',
          municipality: 'Casbah',
          category: 'Historic Site',
          status: 'approved',
          rating: 4.8,
          reviews: 234,
          averageCost: 15,
          addedBy: 'admin',
          addedDate: '2024-01-01'
        },
        {
          id: 2,
          name: 'New Restaurant Proposal',
          province: 'Oran',
          district: 'Oran Center',
          municipality: 'Oran',
          category: 'Restaurant',
          status: 'pending',
          rating: 0,
          reviews: 0,
          averageCost: 30,
          addedBy: 'user',
          addedDate: '2024-01-18'
        },
        {
          id: 3,
          name: 'Timgad Archaeological Site',
          province: 'Batna',
          district: 'Batna',
          municipality: 'Timgad',
          category: 'Historic Site',
          status: 'approved',
          rating: 4.7,
          reviews: 189,
          averageCost: 12,
          addedBy: 'admin',
          addedDate: '2024-01-01'
        }
      ]);

      setFeedbacks([
        {
          id: 1,
          placeId: 1,
          placeName: 'Casbah of Algiers',
          userId: 1,
          userName: 'Ahmed Benali',
          rating: 5,
          comment: 'Amazing historical site! The architecture is breathtaking and the guided tour was very informative.',
          status: 'pending',
          date: '2024-01-19',
          type: 'review'
        },
        {
          id: 2,
          placeId: 1,
          placeName: 'Casbah of Algiers',
          userId: 2,
          userName: 'Fatima Khelifi',
          rating: 1,
          comment: 'Very disappointed. The place was dirty and poorly maintained. Not worth the entrance fee.',
          status: 'flagged',
          date: '2024-01-18',
          type: 'complaint'
        },
        {
          id: 3,
          placeId: 3,
          placeName: 'Timgad Archaeological Site',
          userId: 3,
          userName: 'Youcef Mammeri',
          rating: 4,
          comment: 'Great place to learn about Roman history in Algeria. Could use better signage in Arabic.',
          status: 'approved',
          date: '2024-01-17',
          type: 'review'
        }
      ]);

      setProvinces([
        { id: 1, name: 'Algiers', districts: 13, municipalities: 57, places: 45 },
        { id: 2, name: 'Oran', districts: 9, municipalities: 26, places: 32 },
        { id: 3, name: 'Constantine', districts: 6, municipalities: 12, places: 28 },
        { id: 4, name: 'Annaba', districts: 4, municipalities: 12, places: 22 }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const handleApprovePlace = (placeId) => {
    setPlaces(places.map(place => 
      place.id === placeId ? { ...place, status: 'approved' } : place
    ));
  };

  const handleRejectPlace = (placeId) => {
    setPlaces(places.map(place => 
      place.id === placeId ? { ...place, status: 'rejected' } : place
    ));
  };

  const handleApproveFeedback = (feedbackId) => {
    setFeedbacks(feedbacks.map(feedback => 
      feedback.id === feedbackId ? { ...feedback, status: 'approved' } : feedback
    ));
  };

  const handleRejectFeedback = (feedbackId) => {
    setFeedbacks(feedbacks.map(feedback => 
      feedback.id === feedbackId ? { ...feedback, status: 'rejected' } : feedback
    ));
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {change && (
            <p className={`text-sm mt-1 ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={Users} 
          color="bg-blue-500"
          change={12}
        />
        <StatCard 
          title="Total Places" 
          value={stats.totalPlaces} 
          icon={MapPin} 
          color="bg-green-500"
          change={8}
        />
        <StatCard 
          title="Pending Feedbacks" 
          value={stats.pendingFeedbacks} 
          icon={MessageSquare} 
          color="bg-yellow-500"
          change={-5}
        />
        <StatCard 
          title="Monthly Visits" 
          value={stats.monthlyVisits} 
          icon={TrendingUp} 
          color="bg-purple-500"
          change={23}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Places</h3>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {places.slice(0, 5).map((place) => (
              <div key={place.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{place.name}</h4>
                  <p className="text-sm text-gray-600">{place.municipality}, {place.province}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  place.status === 'approved' ? 'bg-green-100 text-green-800' :
                  place.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {place.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Feedbacks</h3>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {feedbacks.slice(0, 5).map((feedback) => (
              <div key={feedback.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{feedback.placeName}</h4>
                  <div className="flex items-center">
                    <Star className="text-yellow-400 fill-current" size={14} />
                    <span className="text-sm text-gray-600 ml-1">{feedback.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{feedback.comment.substring(0, 100)}...</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">by {feedback.userName}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    feedback.status === 'approved' ? 'bg-green-100 text-green-800' :
                    feedback.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    feedback.status === 'flagged' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {feedback.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <Download size={16} />
            <span>Export</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Plus size={16} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="input"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.lastLogin).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-primary-600 hover:text-primary-900">
                        <Eye size={16} />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPlaces = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Places Management</h2>
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <Upload size={16} />
            <span>Import</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Plus size={16} />
            <span>Add Place</span>
          </button>
        </div>
      </div>

      {/* Places Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Place
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {places.map((place) => (
                <tr key={place.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{place.name}</div>
                    <div className="text-sm text-gray-500">Added by {place.addedBy}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{place.municipality}</div>
                    <div className="text-sm text-gray-500">{place.province}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {place.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      place.status === 'approved' ? 'bg-green-100 text-green-800' :
                      place.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {place.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="text-yellow-400 fill-current" size={14} />
                      <span className="text-sm text-gray-600 ml-1">
                        {place.rating} ({place.reviews})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {place.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprovePlace(place.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button 
                            onClick={() => handleRejectPlace(place.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      <button className="text-primary-600 hover:text-primary-900">
                        <Eye size={16} />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderFeedbacks = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Feedback Management</h2>
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button className="btn-secondary flex items-center space-x-2">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Feedbacks List */}
      <div className="space-y-4">
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{feedback.placeName}</h3>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        className={i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                      />
                    ))}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    feedback.type === 'complaint' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {feedback.type}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{feedback.comment}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>by {feedback.userName}</span>
                  <span>{new Date(feedback.date).toLocaleDateString()}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    feedback.status === 'approved' ? 'bg-green-100 text-green-800' :
                    feedback.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    feedback.status === 'flagged' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {feedback.status}
                  </span>
                </div>
              </div>
              
              {feedback.status === 'pending' && (
                <div className="flex space-x-2 ml-4">
                  <button 
                    onClick={() => handleApproveFeedback(feedback.id)}
                    className="btn-secondary text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle size={16} className="mr-1" />
                    Approve
                  </button>
                  <button 
                    onClick={() => handleRejectFeedback(feedback.id)}
                    className="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <XCircle size={16} className="mr-1" />
                    Reject
                  </button>
                </div>
              )}
              
              {feedback.status === 'flagged' && (
                <div className="flex items-center space-x-2 ml-4">
                  <Flag className="text-red-500" size={16} />
                  <span className="text-sm text-red-600 font-medium">Flagged for Review</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'places', name: 'Places', icon: MapPin },
    { id: 'feedbacks', name: 'Feedbacks', icon: MessageSquare }
  ];

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Manage users, places, and feedbacks for the myGuide platform
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'places' && renderPlaces()}
        {activeTab === 'feedbacks' && renderFeedbacks()}
      </div>
    </div>
  );
};

export default AdminDashboard;