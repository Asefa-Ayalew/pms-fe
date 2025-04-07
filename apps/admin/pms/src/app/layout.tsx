'use client';
import React from 'react';
import { Shell } from '@pms/core';
import { RouteTransition } from '@pms/core/components/route-transition';
import { usePerformanceMonitor } from '@pms/core/utils/performance';
import type { Metadata } from 'next';
import './globals.css';
import MantineProviderRegistry from './mantine';
import { AuthProvider } from '@pms/auth';
import { Providers } from '@pms/entity';

export const metadata: Metadata = {
  title: 'Training Center',
  description: 'Training Center',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  usePerformanceMonitor('RootLayout');

  return (
    <html lang="en">
      <body className="dark:bg-black dark:text-white">
        <MantineProviderRegistry>
          <Providers>
            <AuthProvider>
              <Shell>
                <RouteTransition>
                  {children}
                </RouteTransition>
              </Shell>
            </AuthProvider>
          </Providers>
        </MantineProviderRegistry>
      </body>
    </html>
  );
}
