'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@pms/auth';

export default function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
    else {
    router.push('/dashboard');
    }
  }, [user, router]);
  return <>{children}</>;
}
