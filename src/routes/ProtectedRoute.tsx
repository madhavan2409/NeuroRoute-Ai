import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/user';
import { useToast } from '../context/ToastContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, role } = useAuth();
  const location = useLocation();
  const { showToast } = useToast();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Show friendly toast explaining role restriction
    showToast(
      `Access Denied: This section requires an ${allowedRoles.join(' or ')} account. You are currently logged in as a ${role}.`,
      'error'
    );

    // Redirect to respective appropriate dashboard
    const fallback = role === 'ORGANIZER' ? '/organizer/dashboard' : '/student/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};
