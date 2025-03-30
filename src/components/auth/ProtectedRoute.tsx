
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requireAdmin = false,
  redirectTo = '/auth',
}) => {
  const { user, isAdmin, isLoading } = useAuth();

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
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has required permissions
  return <Outlet />;
};

export default ProtectedRoute;
