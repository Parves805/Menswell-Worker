'use client';

export default function AdminRootPage() {
  // This page now only serves as a loading placeholder.
  // The actual redirection logic is handled by the admin layout and login page
  // to prevent infinite redirect loops.
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>লোড হচ্ছে...</p>
    </div>
  );
}
