'use client';

import { createContext } from 'react';
import type { MenuItem } from '../models/shell';

interface MenuContextType {
  menuItems: MenuItem[];
  currentApplication: string;
}

export const ShellContext = createContext<MenuContextType>({
  menuItems: [],
  currentApplication: '',
});
