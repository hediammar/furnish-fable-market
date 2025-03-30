
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requireAdmin = false,
  redirectTo = '/auth',
}) => {
  const { user, isAdmin, isLoading, profile, refreshProfile } = useAuth();
  const location = useLocation();

  // Force profile refresh when entering a protected route
  useEffect(() => {
    if (user && !isLoading) {
      refreshProfile();
    }
  }, [user, isLoading, refreshProfile]);

  // Debug logs to help troubleshoot
  useEffect(() => {
    console.log('ProtectedRoute for path:', location.pathname);
    console.log('User authenticated:', !!user);
    console.log('Admin required:', requireAdmin);
    console.log('Is admin:', isAdmin);
    console.log('Profile:', profile);
    
    if (requireAdmin) {
      console.log('Admin check details:', {
        hasRole: profile?.role === 'admin',
        hasFlag: profile?.is_admin === true
      });
    }
  }, [user, isAdmin, requireAdmin, location.pathname, profile]);

  // Show loading while checking authentication
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // Check if user is authenticated
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check if admin access is required but user is not an admin
  if (requireAdmin && !isAdmin) {
    console.log('Admin access denied - redirecting to home');
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has required permissions
  return <Outlet />;
};

export default ProtectedRoute;
