'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

export default function AdminRootPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // Don't redirect until we know the user's auth state.
    if (isUserLoading) {
      return;
    }

    if (user) {
        // If the user is logged in, redirect to the main dashboard.
        router.replace('/admin/dashboard');
    } else {
        // If not logged in, redirect to the login page.
        router.replace('/admin/login');
    }

  }, [router, user, isUserLoading]);

  // Render a loading state while the redirect is happening.
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>লোড হচ্ছে...</p>
    </div>
  );
}
