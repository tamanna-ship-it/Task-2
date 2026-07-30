import React, { lazy, Suspense } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import { RoleGuard } from '@/utils/RoleGuard';

const ManagerDashboardPage = lazy(() =>
  import('@/projects/manager/pages/Dashboard/DashboardPage').then((m) => ({ default: m.ManagerDashboardPage }))
);

const ManagerAppointmentsPage = lazy(() =>
  import('@/projects/manager/pages/Appointments/AppointmentsPage').then((m) => ({ default: m.ManagerAppointmentsPage }))
);

export const managerRoutes: RouteObject = {
  path: 'manager',
  element: <RoleGuard allowedRoles={['manager']} />,
  children: [
    {
      index: true,
      element: <Navigate to="dashboard" replace />,
    },
    {
      path: 'dashboard',
      element: (
        <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Loading Manager Dashboard...</div>}>
          <ManagerDashboardPage />
        </Suspense>
      ),
    },
    {
      path: 'appointments',
      element: (
        <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Loading Appointments Booking...</div>}>
          <ManagerAppointmentsPage />
        </Suspense>
      ),
    },
    {
      path: '*',
      element: <Navigate to="dashboard" replace />,
    },
  ],
};
