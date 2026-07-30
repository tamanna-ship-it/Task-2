import React, { lazy, Suspense } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import { RoleGuard } from '@/utils/RoleGuard';

const StaffDashboardPage = lazy(() =>
  import('@/projects/staff/pages/Dashboard/DashboardPage').then((m) => ({ default: m.StaffDashboardPage }))
);

export const staffRoutes: RouteObject = {
  path: 'staff',
  element: <RoleGuard allowedRoles={['staff']} />,
  children: [
    {
      index: true,
      element: <Navigate to="dashboard" replace />,
    },
    {
      path: 'dashboard',
      element: (
        <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Loading Staff Dashboard...</div>}>
          <StaffDashboardPage />
        </Suspense>
      ),
    },
    {
      path: '*',
      element: <Navigate to="dashboard" replace />,
    },
  ],
};
