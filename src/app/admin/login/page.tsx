'use client';

import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { GarmentFlowIcon } from '@/components/icons';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FormEvent, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function AdminLoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until user status is determined
    }

    if (user) {
      user.getIdTokenResult().then((idTokenResult) => {
        if (idTokenResult.claims.isAdmin) {
          router.push('/admin/dashboard');
        } else {
          // If a non-admin user lands here, send them to their own dashboard.
          router.push('/dashboard');
        }
      });
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth || !email || !password) {
      toast({
        variant: 'destructive',
        title: 'Form is incomplete',
        description: 'Please provide your email and password.',
      });
      return;
    }
    setIsSubmitting(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idTokenResult = await userCredential.user.getIdTokenResult();

      if (!idTokenResult.claims.isAdmin) {
        // Not an admin, sign them out and show an error
        await auth.signOut();
        throw new Error('Access denied. Not an administrator.');
      }

      toast({
        title: 'Login Successful',
        description: 'Redirecting to admin dashboard.',
      });
      // The useEffect hook will handle the redirect upon user state change
    } catch (error: any) {
      console.error('Admin Login Error:', error);
      let description = 'An unknown error occurred.';
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        description = 'Invalid email or password.';
      } else if (error.message === 'Access denied. Not an administrator.') {
        description = 'You do not have permission to access the admin panel.';
      }
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: description,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render loading state if user status is pending or if a logged-in user is being redirected.
  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center admin-panel">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 admin-panel">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="items-center text-center">
          <GarmentFlowIcon className="mb-4 h-12 w-12 text-primary" />
          <CardTitle className="text-2xl font-bold">Admin Panel Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the dashboard.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
