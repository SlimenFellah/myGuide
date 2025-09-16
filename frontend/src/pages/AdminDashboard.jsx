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
  Clock,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  Calendar,
  Star,
  Flag
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

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
    <Card className="hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold">{value.toLocaleString()}</p>
            {change && (
              <p className={`text-sm mt-1 flex items-center ${
                change > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp size={14} className="mr-1" />
                {change > 0 ? '+' : ''}{change}% from last month
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color} shadow-lg`}>
            <Icon className="text-white" size={24} />
          </div>
        </div>
      </CardContent>
    </Card>
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
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Places</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {places.slice(0, 5).map((place) => (
                <div key={place.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                  <div>
                    <h4 className="font-medium">{place.name}</h4>
                    <p className="text-sm text-muted-foreground">{place.municipality}, {place.province}</p>
                  </div>
                  <Badge variant={
                    place.status === 'approved' ? 'default' :
                    place.status === 'pending' ? 'secondary' :
                    'destructive'
                  }>
                    {place.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Feedbacks</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feedbacks.slice(0, 5).map((feedback) => (
                <div key={feedback.id} className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{feedback.placeName}</h4>
                    <div className="flex items-center">
                      <Star className="text-yellow-400 fill-current" size={14} />
                      <span className="text-sm text-muted-foreground ml-1">{feedback.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{feedback.comment.substring(0, 100)}...</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">by {feedback.userName}</span>
                    <Badge variant={
                      feedback.status === 'approved' ? 'default' :
                      feedback.status === 'pending' ? 'secondary' :
                      feedback.status === 'flagged' ? 'destructive' :
                      'outline'
                    }>
                      {feedback.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex space-x-3">
          <Button variant="outline" className="hover:scale-105 transition-all duration-300">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button className="hover:scale-105 transition-all duration-300 hover:shadow-lg">
            <Plus size={16} className="mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 hover:border-primary/50 transition-colors duration-200"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48 hover:border-primary/50 transition-colors duration-200">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
                    <Badge variant={user.role === 'admin' ? 'secondary' : 'outline'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(user.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(user.lastLogin).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary">
                        <Eye size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted hover:text-foreground">
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderPlaces = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Places Management</h2>
        <div className="flex space-x-3">
          <Button variant="outline" className="hover:scale-105 transition-all duration-300">
            <Upload size={16} className="mr-2" />
            Import
          </Button>
          <Button className="hover:scale-105 transition-all duration-300 hover:shadow-lg">
            <Plus size={16} className="mr-2" />
            Add Place
          </Button>
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
                    <div className="text-sm font-medium">{place.name}</div>
                    <div className="text-sm text-muted-foreground">Added by {place.addedBy}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{place.municipality}</div>
                    <div className="text-sm text-muted-foreground">{place.province}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="secondary">
                      {place.category}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={
                      place.status === 'approved' ? 'default' :
                      place.status === 'pending' ? 'secondary' :
                      'destructive'
                    }>
                      {place.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="text-yellow-400 fill-current" size={14} />
                      <span className="text-sm text-muted-foreground ml-1">
                        {place.rating} ({place.reviews})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {place.status === 'pending' && (
                        <>
                          <Button 
                            onClick={() => handleApprovePlace(place.id)}
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </Button>
                          <Button 
                            onClick={() => handleRejectPlace(place.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <Eye size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" className="hover:bg-muted">
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 size={16} />
                      </Button>
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
        <h2 className="text-2xl font-bold">Feedback Management</h2>
        <div className="flex space-x-3">
          <Button variant="outline" className="hover:scale-105 transition-all duration-300">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
          <Button variant="outline" className="hover:scale-105 transition-all duration-300">
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Feedbacks List */}
      <div className="space-y-4">
        {feedbacks.map((feedback) => (
          <Card key={feedback.id} className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{feedback.placeName}</h3>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          className={i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                        />
                      ))}
                    </div>
                    <Badge variant={feedback.type === 'complaint' ? 'destructive' : 'secondary'}>
                      {feedback.type}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">{feedback.comment}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>by {feedback.userName}</span>
                    <span>{new Date(feedback.date).toLocaleDateString()}</span>
                    <Badge variant={
                      feedback.status === 'approved' ? 'default' :
                      feedback.status === 'pending' ? 'secondary' :
                      feedback.status === 'flagged' ? 'destructive' :
                      'outline'
                    }>
                      {feedback.status}
                    </Badge>
                  </div>
                </div>
                
                {feedback.status === 'pending' && (
                  <div className="flex space-x-2 ml-4">
                    <Button 
                      onClick={() => handleApproveFeedback(feedback.id)}
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Approve
                    </Button>
                    <Button 
                      onClick={() => handleRejectFeedback(feedback.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <XCircle size={16} className="mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
                
                {feedback.status === 'flagged' && (
                  <div className="flex items-center space-x-2 ml-4">
                    <AlertTriangle className="text-red-500" size={16} />
                    <span className="text-sm text-red-600 font-medium">Flagged for Review</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="w-full">
          <div className="container-content py-8">
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <p className="text-muted-foreground animate-pulse">Loading admin dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full">
        <div className="container-content py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <BarChart3 className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage users, places, and feedbacks for the myGuide platform
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/80 backdrop-blur-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white hover:bg-muted/50 transition-all duration-300"
                >
                  <Icon size={16} />
                  <span>{tab.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="overview">
            {renderOverview()}
          </TabsContent>
          <TabsContent value="users">
            {renderUsers()}
          </TabsContent>
          <TabsContent value="places">
            {renderPlaces()}
          </TabsContent>
          <TabsContent value="feedbacks">
            {renderFeedbacks()}
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;