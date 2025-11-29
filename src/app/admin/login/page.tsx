
'use client';

import { useRouter, usePathname } from 'next/navigation';
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
import { useAuth, useUser, initiateEmailSignIn, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { FormEvent, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import type { FirebaseError } from 'firebase/app';
import type { AppSettings } from '@/lib/types';
import { doc } from 'firebase/firestore';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { GarmentFlowIcon } from '@/components/icons';


const ADMIN_CREDENTIAL_KEY = 'garmentflow_admin_credential';

export default function AdminLoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const pathname = usePathname();
  const firestore = useFirestore();


  const settingsDocRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'settings', 'global') : null,
    [firestore]
  );
  const { data: settings, isLoading: isLoadingSettings } = useDoc<AppSettings>(settingsDocRef);


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If a user is already logged in, redirect them away from the login page
    // to the central admin routing page which will decide where they should go.
    if (!isUserLoading && user) {
      router.replace('/admin');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!auth || !email || !password) {
      toast({
        variant: 'destructive',
        title: 'ফর্ম অসম্পূর্ণ',
        description: 'অনুগ্রহ করে আপনার ইমেইল এবং পাসওয়ার্ড দিন।',
      });
      return;
    }
    setIsSubmitting(true);
    
    const handleAuthError = (error: FirebaseError) => {
        setIsSubmitting(false);
        if (error.code === 'auth/invalid-credential') {
            toast({
                variant: 'destructive',
                title: 'লগইন ব্যর্থ হয়েছে',
                description: 'ভুল ইমেইল অথবা পাসওয়ার্ড। অনুগ্রহ করে আবার চেষ্টা করুন।',
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'লগইন ব্যর্থ হয়েছে',
                description: error.message || 'একটি অজানা ত্রুটি ঘটেছে।',
            });
        }
    };

    initiateEmailSignIn(auth, email, password, handleAuthError);

    toast({
      title: 'লগইন করার চেষ্টা করা হচ্ছে...',
      description: 'সফল হলে আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হবে।',
    });
    
    // The onAuthStateChanged listener will handle redirects on success/failure.
    // We'll also re-enable the button after a timeout in case of an issue where
    // the listener doesn't fire (e.g. auth/invalid-credential).
    setTimeout(() => {
        setIsSubmitting(false);
    }, 5000);
  };
  
  // Show a loading screen while we determine auth state
  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>অ্যাডমিন প্যানেল লোড হচ্ছে...</p>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="items-center text-center">
          <div className="mb-4 h-12 flex items-center justify-center">
            {isLoadingSettings ? (
              <Skeleton className="h-12 w-48" />
            ) : settings?.logoUrl ? (
              <div className="relative h-12 w-48">
                <Image 
                  src={settings.logoUrl} 
                  alt={settings.companyName || 'Company Logo'} 
                  fill 
                  className="object-contain"
                />
              </div>
            ) : (
               <GarmentFlowIcon className="h-12 w-12 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">অ্যাডমিন লগইন</CardTitle>
          <CardDescription>অ্যাডমিন প্যানেলে প্রবেশ করতে লগইন করুন।</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
               <div className="flex justify-between items-center">
                 <Label htmlFor="email">ইমেইল</Label>
              </div>
              <Input
                id="email"
                type="email"
                placeholder="আপনার ইমেইল"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">পাসওয়ার্ড</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                  <span className="sr-only">
                    {showPassword ? 'Hide password' : 'Show password'}
                  </span>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'লগইন করা হচ্ছে...' : 'লগইন করুন'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
