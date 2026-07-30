import React, { lazy, Suspense } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import { RoleGuard } from '@/utils/RoleGuard';

const OwnerDashboardPage = lazy(() =>
  import('@/projects/owner/pages/Dashboard/DashboardPage').then((m) => ({ default: m.OwnerDashboardPage }))
);

const StaffDirectoryPage = lazy(() =>
  import('@/projects/owner/pages/Staff/StaffDirectoryPage').then((m) => ({ default: m.StaffDirectoryPage }))
);

const AppointmentsPage = lazy(() =>
  import('@/projects/owner/pages/Appointments/AppointmentsPage').then((m) => ({ default: m.AppointmentsPage }))
);

const ReportsPage = lazy(() =>
  import('@/projects/owner/pages/Reports/ReportsPage').then((m) => ({ default: m.ReportsPage }))
);

const OwnerFallback = () => (
  <div className="p-8 text-center text-slate-500 font-medium">
    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
    Loading...
  </div>
);

export const ownerRoutes: RouteObject = {
  path: 'owner',
  element: <RoleGuard allowedRoles={['owner']} />,
  children: [
    {
      path: 'dashboard',
      element: (
        <Suspense fallback={<OwnerFallback />}>
          <OwnerDashboardPage />
        </Suspense>
      ),
    },
    {
      path: 'staff',
      element: <Navigate to="/owner/staff/directory" replace />,
    },
    {
      path: 'staff/directory',
      element: (
        <Suspense fallback={<OwnerFallback />}>
          <StaffDirectoryPage tab="directory" />
        </Suspense>
      ),
    },
    {
      path: 'staff/attendance',
      element: (
        <Suspense fallback={<OwnerFallback />}>
          <StaffDirectoryPage tab="attendance" />
        </Suspense>
      ),
    },
    {
      path: 'staff/leave-requests',
      element: (
        <Suspense fallback={<OwnerFallback />}>
          <StaffDirectoryPage tab="leave" />
        </Suspense>
      ),
    },
    {
      path: 'staff/performance',
      element: (
        <Suspense fallback={<OwnerFallback />}>
          <StaffDirectoryPage tab="performance" />
        </Suspense>
      ),
    },
    {
      path: 'appointments',
      element: (
        <Suspense fallback={<OwnerFallback />}>
          <AppointmentsPage />
        </Suspense>
      ),
    },
    {
      path: 'reports',
      element: (
        <Suspense fallback={<OwnerFallback />}>
          <ReportsPage />
        </Suspense>
      ),
    },
  ],
};