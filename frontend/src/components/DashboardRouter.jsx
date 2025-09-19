/*
 * Developed & maintained by Slimene Fellah — Available for freelance work at slimenefellah.dev
 */
import { useIsAdmin } from '../store/hooks';
import Dashboard from '../pages/Dashboard';
import AdminDashboard from '../pages/AdminDashboard';

const DashboardRouter = () => {
  const isAdmin = useIsAdmin();
  
  // Return AdminDashboard for admin users, regular Dashboard for normal users
  return isAdmin ? <AdminDashboard /> : <Dashboard />;
};

export default DashboardRouter;