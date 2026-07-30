import { MenuItem } from './ownerMenu';

export const managerMenu: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/manager/dashboard',
    iconName: 'LayoutDashboard',
  },
  {
    id: 'appointments',
    title: 'Appointments Booking',
    path: '/manager/appointments',
    iconName: 'Calendar',
  },
];
