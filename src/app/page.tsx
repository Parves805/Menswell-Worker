'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        // User is logged in, check if admin
        user.getIdTokenResult().then((idTokenResult) => {
          if (idTokenResult.claims.isAdmin) {
            router.push('/admin/dashboard');
          } else {
            router.push('/dashboard');
          }
        });
      } else {
        // No user, redirect to worker login
        router.push('/login');
      }
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <p>লোড হচ্ছে...</p>
    </div>
  );
}
