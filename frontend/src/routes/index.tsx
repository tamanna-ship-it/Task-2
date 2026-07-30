import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Login } from '@/pages/Login';
import { RootLayout } from '@/layout/RootLayout';
import { DashboardRedirect } from '@/utils/DashboardRedirect';
import { ownerRoutes } from './owner.routes';
import { managerRoutes } from './manager.routes';
import { staffRoutes } from './staff.routes';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <DashboardRedirect />,
      },
      {
        path: 'dashboard',
        element: <DashboardRedirect />,
      },
      ownerRoutes,
      managerRoutes,
      staffRoutes,
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
