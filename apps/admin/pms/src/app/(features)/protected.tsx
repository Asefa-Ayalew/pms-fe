'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserInfo } from '@pms/auth';

export default function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = getUserInfo();
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);
  return <>{children}</>;
}
