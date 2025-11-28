'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * This is the root page for the /admin route.
 * Its primary responsibility is to act as a router, directing users
 * to the correct page based on their authentication and authorization status.
 */
export default function AdminRootPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Don't do anything until Firebase has confirmed the auth state.
    if (isUserLoading) {
      return;
    }

    if (user) {
      // If a user is logged in, the layout will verify if they are an admin.
      // This page's only job is to redirect them to the dashboard.
      router.replace('/admin/dashboard');
    } else {
      // If no user is logged in, send them to the admin login page.
      router.replace('/admin/login');
    }
  }, [user, isUserLoading, router]);

  // This page just shows a loading indicator while the routing logic runs.
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>অ্যাডমিন প্যানেল লোড হচ্ছে...</p>
    </div>
  );
}
