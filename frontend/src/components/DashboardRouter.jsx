/*
 * Developed & maintained by Slimene Fellah — Available for freelance work at slimenefellah.dev
 */
import Dashboard from '../pages/Dashboard';

const DashboardRouter = () => {
  // Always return regular Dashboard for /dashboard route
  // Admin users should use /admin route for admin functionality
  return <Dashboard />;
};

export default DashboardRouter;