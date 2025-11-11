'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

/**
 * This is the root page for the /admin route.
 * Its sole purpose is to redirect the user to the appropriate page
 * based on their authentication status and role.
 */
export default function AdminRootPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Wait until the user's authentication state is fully loaded.
    if (!isUserLoading) {
      if (user) {
        // If a user is logged in, check their custom claims to see if they are an admin.
        user.getIdTokenResult(true).then((idTokenResult) => {
          if (idTokenResult.claims.isAdmin) {
            // If the user is an admin, redirect them to the admin dashboard.
            router.replace('/admin/dashboard');
          } else {
            // If the user is logged in but not an admin, redirect them to the regular user dashboard.
            router.replace('/dashboard');
          }
        });
      } else {
        // If no user is logged in, redirect to the admin login page.
        router.replace('/admin/login');
      }
    }
  }, [user, isUserLoading, router]);

  // Display a loading message while the authentication check and redirection are in progress.
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>লোড হচ্ছে...</p>
    </div>
  );
}
