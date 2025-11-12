'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminRootPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) {
      // Wait until the auth state is confirmed
      return;
    }

    if (user) {
      // If user is logged in, check if they are an admin
      user.getIdTokenResult(true).then((idTokenResult) => {
        if (idTokenResult.claims.isAdmin) {
          // If admin, go to admin dashboard
          router.replace('/admin/dashboard');
        } else {
          // If not an admin, they shouldn't be here. Go to user dashboard.
          router.replace('/dashboard');
        }
      });
    } else {
      // If no user, go to admin login page
      router.replace('/admin/login');
    }
  }, [user, isUserLoading, router]);

  // This page now only serves as a loading placeholder and router.
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>অ্যাডমিন প্যানেল লোড হচ্ছে...</p>
    </div>
  );
}
