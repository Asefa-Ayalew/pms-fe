import { MenuItem } from '@pms/core';
import {
  IconGauge,
  IconUser,
  IconHome,
  IconDoor,
  IconChartBar,
} from '@tabler/icons-react';

export const Menu: MenuItem[] = [
  { label: 'Dashboard', icon: IconGauge, link: '/dashboard' },
  { label: 'Tenants', icon: IconHome, link: '/tenant' },
  { label: 'Available Rooms', icon: IconDoor, link: '/room' },
  {
    label: 'Reports and Analytics',
    icon: IconChartBar,
    link: '/report-and-analytic',
  },
  {
    label: 'User Management',
    icon: IconUser,
    links: [
      { label: 'Users', link: '/user' },
      { label: 'Roles', link: '/roles' },
      { label: 'Departments', link: '/departments' },
    ],
  },
];
