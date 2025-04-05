'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentSession } from '@pms/auth';

export default function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = getCurrentSession();
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);
  return <>{children}</>;
}
