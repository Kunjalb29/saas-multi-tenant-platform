import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Pages
import Landing from '../pages/Landing';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import TenantDashboard from '../pages/dashboard/TenantDashboard';
import UserDashboard from '../pages/dashboard/UserDashboard';
import SuperAdminDashboard from '../pages/admin/SuperAdminDashboard';
import UserManagement from '../pages/users/UserManagement';
import Analytics from '../pages/analytics/Analytics';
import Settings from '../pages/settings/Settings';
import AppLayout from '../components/layout/AppLayout';
import NotFound from '../pages/NotFound';

// Protected Route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/dashboard" replace />;

  return children;
};

// Public Route (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) {
    if (user?.role === 'super_admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'tenant_admin') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/my-dashboard" replace />;
  }
  return children;
};

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  {
    path: '/login',
    element: <PublicRoute><Login /></PublicRoute>,
  },
  {
    path: '/register',
    element: <PublicRoute><Register /></PublicRoute>,
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/dashboard', element: <ProtectedRoute allowedRoles={['tenant_admin']}><TenantDashboard /></ProtectedRoute> },
      { path: '/my-dashboard', element: <ProtectedRoute allowedRoles={['user']}><UserDashboard /></ProtectedRoute> },
      { path: '/admin', element: <ProtectedRoute allowedRoles={['super_admin']}><SuperAdminDashboard /></ProtectedRoute> },
      { path: '/users', element: <ProtectedRoute allowedRoles={['tenant_admin', 'super_admin']}><UserManagement /></ProtectedRoute> },
      { path: '/analytics', element: <ProtectedRoute allowedRoles={['tenant_admin', 'super_admin']}><Analytics /></ProtectedRoute> },
      { path: '/settings', element: <ProtectedRoute><Settings /></ProtectedRoute> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

const AppRouter = () => <RouterProvider router={router} />;
export default AppRouter;
