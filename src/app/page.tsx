
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
import { useAuth, useUser, getUserByPhoneNumber, useFirestore, initiateEmailSignIn } from '@/firebase';
import { FormEvent, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import type { FirebaseError } from 'firebase/app';
import type { Worker } from '@/lib/types';

const USER_CREDENTIAL_KEY = 'garmentflow_user_credential';

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberedCredential, setRememberedCredential] = useState<string | null>(null);

  useEffect(() => {
    const savedCredential = localStorage.getItem(USER_CREDENTIAL_KEY);
    if (savedCredential) {
      // setRememberedCredential(savedCredential);
      // setCredential(savedCredential);
    }
  }, []);

  useEffect(() => {
    if (!isUserLoading && user) {
        // Save credential on successful login
        const savedCredential = localStorage.getItem(USER_CREDENTIAL_KEY);
        if (user.email && user.email !== savedCredential) {
            localStorage.setItem(USER_CREDENTIAL_KEY, user.email);
        }
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);


  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore || !credential || !password) {
      toast({
        variant: 'destructive',
        title: 'ফর্ম অসম্পূর্ণ',
        description: 'অনুগ্রহ করে আপনার ইমেইল/ফোন এবং পাসওয়ার্ড দিন।',
      });
      return;
    }
    setIsSubmitting(true);

    let emailToLogin = credential;
    let workerToLogin: Worker | null = null;

    try {
        if (!credential.includes('@')) {
            const worker = await getUserByPhoneNumber(firestore, credential);
            if (worker && 'email' in worker && typeof worker.email === 'string') {
              emailToLogin = worker.email;
              workerToLogin = worker as Worker;
            } else {
              throw new Error('এই ফোন নম্বরের সাথে কোনো ইমেইল যুক্ত নেই।');
            }
        } else {
             // If logging in with email, we might still need the worker doc
             const workerByEmail = await getUserByPhoneNumber(firestore, credential); // Reusing function, assumes unique email
             if(workerByEmail) workerToLogin = workerByEmail as Worker;
        }

        if (workerToLogin && workerToLogin.status === 'blocked') {
            throw new Error('আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।');
        }

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
        
        initiateEmailSignIn(auth, emailToLogin, password, handleAuthError);

        toast({
            title: 'লগইন করার চেষ্টা করা হচ্ছে...',
            description: 'সফল হলে আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হবে।',
        });

    } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'লগইন ব্যর্থ হয়েছে',
          description: error.message || 'ব্যবহারকারী খুঁজে পাওয়া যায়নি।',
        });
        setIsSubmitting(false);
        return;
    }

    // Fallback to re-enable button if onAuthStateChanged doesn't fire
    setTimeout(() => {
        if (!user) { // Only re-enable if still not logged in
            setIsSubmitting(false);
        }
    }, 5000);
  };
  
  const handleForgetCredential = () => {
    localStorage.removeItem(USER_CREDENTIAL_KEY);
    setRememberedCredential(null);
    setCredential('');
    setPassword('');
  }


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
          <CardTitle className="text-2xl font-bold">লগইন করুন</CardTitle>
          <CardDescription>আপনার অ্যাকাউন্টে প্রবেশ করতে তথ্য দিন।</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                 <Label htmlFor="credential">ইমেইল</Label>
                 {rememberedCredential && (
                    <Button variant="link" size="sm" className="h-auto p-0" onClick={handleForgetCredential}>
                      পরিবর্তন করুন
                    </Button>
                 )}
              </div>
              <Input
                id="credential"
                type="text"
                placeholder="এখানে লিখুন..."
                required
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                disabled={!!rememberedCredential}
                className={!!rememberedCredential ? 'bg-muted' : ''}
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
            <p className="text-center text-sm text-muted-foreground">
              কোনো অ্যাকাউন্ট নেই?{' '}
              <Link href="/signup" className="underline">
                নিবন্ধন করুন
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
