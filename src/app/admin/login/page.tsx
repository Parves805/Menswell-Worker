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
import { useAuth, useUser, initiateEmailSignIn } from '@/firebase';
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
    if (isUserLoading) return;
    if (user) {
      user.getIdTokenResult(true).then((idTokenResult) => {
        if (idTokenResult.claims.isAdmin) {
          if (router.pathname !== '/admin/dashboard') {
             router.replace('/admin/dashboard');
          }
        } else {
          auth?.signOut();
          toast({
            variant: 'destructive',
            title: 'প্রবেশাধিকার নেই',
            description: 'শুধুমাত্র অ্যাডমিন এই প্যানেলে প্রবেশ করতে পারবেন।',
          });
          router.replace('/');
        }
      });
    }
  }, [user, isUserLoading, router, auth, toast]);

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
    
    // Special password for mafuz@gmail.com
    const finalPassword = email === 'mafuz@gmail.com' ? 'password' : password;

    initiateEmailSignIn(auth, email, finalPassword);

    toast({
      title: 'লগইন করার চেষ্টা করা হচ্ছে...',
      description: 'সফল হলে আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হবে।',
    });
    
    // We don't need to setIsSubmitting(false) immediately because the useEffect will handle the redirect.
    // If there's an auth error, it will be caught globally or the user will remain on the page.
    // A timeout can prevent the button from being permanently disabled on failed login.
    setTimeout(() => setIsSubmitting(false), 5000);
  };

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
          <GarmentFlowIcon className="mb-4 h-12 w-12 text-primary" />
          <CardTitle className="text-2xl font-bold">অ্যাডমিন লগইন</CardTitle>
          <CardDescription>অ্যাডমিন প্যানেলে প্রবেশ করতে লগইন করুন।</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">ইমেইল</Label>
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
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
