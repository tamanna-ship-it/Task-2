import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/utils/authContext';
import { UserRole } from '@/types/auth';

interface RoleGuardProps {
  allowedRoles: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-main, #f8fafc)',
        color: 'var(--primary-600, #4f46e5)',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(79, 70, 229, 0.2)',
            borderTopColor: '#4f46e5',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ fontWeight: 500, color: '#64748b' }}>Authenticating session...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role authorization
  if (!allowedRoles.includes(user.role)) {
    // Redirect user to their own role dashboard if trying to access unauthorized role route
    const fallbackPath =
      user.role === 'owner'
        ? '/owner/dashboard'
        : user.role === 'manager'
        ? '/manager/dashboard'
        : '/staff/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};
