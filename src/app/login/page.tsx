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
import { useAuth, useUser, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FormEvent, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getUserByPhoneNumber } from '@/firebase/firestore/queries';

// Simple regex to check for email format
const isEmail = (str: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [identifier, setIdentifier] = useState(''); // Can be email or phone
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore || !identifier || !password) {
      toast({
        variant: 'destructive',
        title: 'ফর্ম পূরণ করুন',
        description: 'অনুগ্রহ করে আপনার ইমেইল/মোবাইল এবং পাসওয়ার্ড দিন।',
      });
      return;
    }
    setIsSubmitting(true);

    try {
      let emailToLogin;
      
      if (isEmail(identifier)) {
        // User provided an email
        emailToLogin = identifier;
      } else {
        // User might have provided a phone number
        const worker = await getUserByPhoneNumber(firestore, identifier);
        if (worker && worker.email) {
          emailToLogin = worker.email;
        } else {
          throw new Error('User not found with this phone number.');
        }
      }

      await signInWithEmailAndPassword(auth, emailToLogin, password);
      
      toast({
        title: 'লগইন সফল হয়েছে',
        description: 'আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে।',
      });
      // The onAuthStateChanged listener will redirect to dashboard
    } catch (error: any) {
      console.error('Login Error:', error);
      let description = 'একটি অজানা ত্রুটি ঘটেছে।';
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential' ||
        error.message === 'User not found with this phone number.'
      ) {
        description = 'আপনার দেওয়া ইমেইল/মোবাইল বা পাসওয়ার্ডটি সঠিক নয়।';
      } else if (error.code === 'auth/invalid-email') {
        description = 'ইমেইল ঠিকানাটি সঠিক নয়।';
      }
      toast({
        variant: 'destructive',
        title: 'লগইন ব্যর্থ হয়েছে',
        description: description,
      });
    } finally {
      setIsSubmitting(false);
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
       <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="items-center text-center">
          <GarmentFlowIcon className="mb-4 h-12 w-12 text-primary" />
          <CardTitle className="text-2xl font-bold">আপনার অ্যাকাউন্টে লগইন করুন</CardTitle>
          <CardDescription>
            আপনার কাজের হিসাব দেখতে লগইন করুন।
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="identifier">ইমেইল অথবা মোবাইল নম্বর</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="worker@example.com অথবা +8801..."
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'লগইন করা হচ্ছে...' : 'লগইন করুন'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              কোনো অ্যাকাউন্ট নেই?{' '}
              <Link href="/" className="underline">
                নিবন্ধন করুন
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
