'use client';

import { ShellContext } from '@pms/core';
import { ReactNode } from 'react';
import { Menu } from '../../../config/menu';

interface ShellProviderProps {
  children: ReactNode;
}

export function ShellProvider({ children }: ShellProviderProps) {
  const value = {
    menuItems: Menu,
    currentApplication: 'Training Center',
  };
  return (
    <>
      <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
    </>
  );
}
