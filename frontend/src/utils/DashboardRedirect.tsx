import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/utils/authContext';

export const DashboardRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'owner') {
    return <Navigate to="/owner/dashboard" replace />;
  }

  if (user.role === 'manager') {
    return <Navigate to="/manager/dashboard" replace />;
  }

  if (user.role === 'staff') {
    return <Navigate to="/staff/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};
