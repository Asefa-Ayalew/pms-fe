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
    { key: 'registration', name: 'Registration', icon: IconAdjustments },
    { key: 'pms', name: 'Training Center', icon: IconBuildingBank },
];

export const CurrentApplication = (key: string): ApplicationType => {
  const application = Applications.find((app) => app.key === key) ?? Applications[0];
  return application;
};


console.log('CurrentApplication', CurrentApplication);
