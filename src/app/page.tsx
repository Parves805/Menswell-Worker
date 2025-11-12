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

const USER_CREDENTIAL_KEY = 'garmentflow_user_credential';

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberedCredential, setRememberedCredential] = useState<string | null>(null);

  useEffect(() => {
    const savedCredential = localStorage.getItem(USER_CREDENTIAL_KEY);
    if (savedCredential) {
      setRememberedCredential(savedCredential);
      setCredential(savedCredential);
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

    if (!credential.includes('@')) {
      try {
        const worker = await getUserByPhoneNumber(firestore, credential);
        if (worker && 'email' in worker && typeof worker.email === 'string') {
          emailToLogin = worker.email;
        } else {
          throw new Error('এই ফোন নম্বরের সাথে কোনো ইমেইল যুক্ত নেই।');
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'লগইন ব্যর্থ হয়েছে',
          description: error.message || 'ব্যবহারকারী খুঁজে পাওয়া যায়নি।',
        });
        setIsSubmitting(false);
        return;
      }
    }
    
    initiateEmailSignIn(auth, emailToLogin, password);

    toast({
        title: 'লগইন করার চেষ্টা করা হচ্ছে...',
        description: 'সফল হলে আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হবে।',
    });

    setTimeout(() => {
        setIsSubmitting(false);
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
                 <Label htmlFor="credential">ইমেইল অথবা মোবাইল নম্বর</Label>
                 {rememberedCredential && (
                    <Button variant="link" size="sm" className="h-auto p-0" onClick={handleForgetCredential}>
                      পরিবর্তন করুন
                    </Button>
                 )}
              </div>
              <Input
                id="credential"
                type="text"
                placeholder="email@example.com or 01..."
                required
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                disabled={!!rememberedCredential}
                className={!!rememberedCredential ? 'bg-muted' : ''}
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
