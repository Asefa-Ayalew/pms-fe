'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@pms/auth';

export default function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isUser } = useAuth();
  useEffect(() => {
    if (!isUser()) {
      router.push('/auth/login');
    }
  }, [isUser, router]);
  return <>{children}</>;
}
