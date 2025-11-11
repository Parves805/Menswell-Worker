'use client';

import Link from 'next/link';
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
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { FormEvent, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState('manager@example.com');
  const [password, setPassword] = useState('password');

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    try {
      // First, try to sign in.
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener in the provider will handle the redirect.
    } catch (error: any) {
      // If sign-in fails because the user doesn't exist, create the user.
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        initiateEmailSignUp(auth, email, password);
      } else {
        // Handle other errors (e.g., wrong password, network issues)
        console.error('Login Error:', error);
        // Optionally, show a toast notification to the user about the error.
      }
    }
  };

  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="items-center text-center">
          <GarmentFlowIcon className="mb-4 h-12 w-12 text-primary" />
          <CardTitle className="text-2xl font-bold">গার্মেন্টফ্লোতে স্বাগতম</CardTitle>
          <CardDescription>আপনার ড্যাশবোর্ড অ্যাক্সেস করতে আপনার তথ্য দিন।</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">ইমেইল</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="manager@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">পাসওয়ার্ড</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              লগইন
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              অ্যাকাউন্ট নেই?{' '}
              <Link href="#" className="underline">
                অ্যাডমিনের সাথে যোগাযোগ করুন
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
