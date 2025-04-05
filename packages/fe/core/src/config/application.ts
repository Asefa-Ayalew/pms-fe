import type { Icon as TablerIcon, IconProps } from '@tabler/icons-react';
import {
  IconAdjustments,
  IconAdjustmentsCog,
  IconBasketCog,
  IconBook,
  IconBuildingBank,
  IconBuildingStore,
  IconCalendar,
  IconCalendarEvent,
  IconUsers,
  IconUsersGroup,
} from '@tabler/icons-react';
import { JSX, ForwardRefExoticComponent, RefAttributes } from 'react';

interface ApplicationType {
  key: string;
  name: string;
  icon: ForwardRefExoticComponent<IconProps & RefAttributes<TablerIcon>>;
}

export const Applications = [
    { key: 'reg', name: 'Registration', icon: IconAdjustments },
    { key: 'bsc', name: 'Balanced Score Card', icon: IconBuildingBank },
    { key: 'hr', name: 'Human Resource', icon: IconUsersGroup },
    { key: 'pm', name: 'Property Management', icon: IconUsers },
    { key: 'rp', name: 'Research Publication', icon: IconBook },
    { key: 'cs', name: 'Community Service', icon: IconCalendar },
    { key: 'tt', name: 'Technology Transfer', icon: IconUsersGroup }
];

export const CurrentApplication = (key = 'cs'): ApplicationType => {
  const application = Applications.find((app) => app.key === key) ?? Applications[0];
  return application;
};
