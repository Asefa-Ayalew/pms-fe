import { Shell } from '@pms/core';
import type { Metadata } from 'next';
import '@mantine/dates/styles.css';

import { ShellProvider } from './shell';
import Protected from './protected';

export const metadata: Metadata = {
  title: 'Training Center',
  description: 'Training Center',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Protected>
      <ShellProvider>
        <Shell>{children}</Shell>
      </ShellProvider>
     </Protected>
  );
}
