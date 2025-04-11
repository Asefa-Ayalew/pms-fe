import type { Icon as TablerIcon, IconProps } from '@tabler/icons-react';
import {
  IconAdjustments,
  IconBuildingBank,
} from '@tabler/icons-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

interface ApplicationType {
  key: string;
  name: string;
  icon: ForwardRefExoticComponent<IconProps & RefAttributes<TablerIcon>>;
}

export const Applications = [
    { key: 'pms-admin', name: 'PMS Admin', icon: IconAdjustments },
    { key: 'pms-tenant', name: 'PMS Tenant', icon: IconBuildingBank },
];

export const CurrentApplication = (key: string): ApplicationType => {
  const application = Applications.find((app) => app.key === key) ?? Applications[0];
  return application;
};
