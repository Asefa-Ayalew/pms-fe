import { Shell } from '@pms/core';
import type { Metadata } from 'next';
import '@mantine/dates/styles.css';

import { ShellProvider } from './shell';
import Protected from './protected';
import { Notifications } from '@mantine/notifications';
import NextTopLoader from 'nextjs-toploader';
import { AuthProfileHandler } from '@pms/entity';
import { ModalsProvider } from '@mantine/modals';

export const metadata: Metadata = {
  title: 'PMS Admin',
  description: 'PMS Admin',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ModalsProvider>
      <Notifications />

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        <div id="notification-region"></div>
      </div>
      <NextTopLoader
        color="#23F184"
        initialPosition={0.08}
        crawlSpeed={200}
        height={3}
        crawl={true}
        showSpinner={false}
        easing="ease"
        speed={200}
        shadow="0 0 10px #6adca0,0 0 5px #6adca0"
        template='
                  <div class="bar" role="bar">
                    <div class="peg"></div>
                  </div> 
                  <div class="spinner" role="spinner">
                    <div class="spinner-icon"></div>
                  </div>'
        zIndex={1600}
        showAtBottom={false}
      />
      <AuthProfileHandler />
      <Protected>
        <ShellProvider>
          <Shell>{children}</Shell>
        </ShellProvider>
      </Protected>
    </ModalsProvider>
  );
}
