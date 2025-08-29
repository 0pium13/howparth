import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: 'admin' | 'premium' | 'pro';
  redirectTo?: string;
}

const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requireAuth = false,
  requireRole,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if specific role is required
  if (requireRole && user) {
    const userRole = user.role || 'USER';
    const roleHierarchy = {
      'admin': 4,
      'pro': 3,
      'premium': 2,
      'registered': 1,
      'public': 0
    };

    // Map server roles to hierarchy levels
    const roleMapping = {
      'ADMIN': 4,
      'MODERATOR': 3,
      'USER': 1
    };

    const requiredLevel = roleHierarchy[requireRole];
    const userLevel = roleMapping[userRole as keyof typeof roleMapping] || 0;

    if (userLevel < requiredLevel) {
      return <Navigate to="/upgrade" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
};

export default RouteGuard;
