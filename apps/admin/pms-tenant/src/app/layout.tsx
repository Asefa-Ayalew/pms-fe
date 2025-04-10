import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import MantineProviderRegistry from './mantine';
import { AuthProvider } from '@pms/auth';
import { Providers } from '@pms/entity';

export const metadata: Metadata = {
  title: 'PMS Tenant',
  description: 'PMS Tenant',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className="dark:bg-black dark:text-white">
        <MantineProviderRegistry>
          <Providers>
          <AuthProvider>{children}</AuthProvider>
          </Providers>
        </MantineProviderRegistry>
      </body>
    </html>
  );
}
