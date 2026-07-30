export interface MenuItem {
  id: string;
  title: string;
  path: string;
  iconName: string;
  badge?: string;
}

export const ownerMenu: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/owner/dashboard',
    iconName: 'LayoutDashboard',
  },
  {
    id: 'staff',
    title: 'Staff Management',
    path: '/owner/staff/directory',
    iconName: 'Users',
  },
  {
    id: 'appointments',
    title: 'Appointments',
    path: '/owner/appointments',
    iconName: 'Calendar',
  },
  {
    id: 'reports',
    title: 'Reports',
    path: '/owner/reports',
    iconName: 'TrendingUp',
  },
];