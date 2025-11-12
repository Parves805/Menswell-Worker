
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
import { GarmentFlowIcon } from '@/components/icons';
import { useAuth, useUser, initiateEmailSignIn } from '@/firebase';
import { FormEvent, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

const ADMIN_CREDENTIAL_KEY = 'garmentflow_admin_credential';

export default function AdminLoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const pathname = usePathname();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberedEmail, setRememberedEmail] = useState<string | null>(null);

  useEffect(() => {
    // Check for remembered credential on mount
    const savedCredential = localStorage.getItem(ADMIN_CREDENTIAL_KEY);
    if (savedCredential) {
      setRememberedEmail(savedCredential);
      setEmail(savedCredential);
    }
  }, []);

  useEffect(() => {
    if (isUserLoading) return;
    if (user) {
      user.getIdTokenResult(true).then((idTokenResult) => {
        if (idTokenResult.claims.isAdmin) {
            if(user.email) {
              localStorage.setItem(ADMIN_CREDENTIAL_KEY, user.email);
            }
            if (pathname !== '/admin/dashboard') {
                router.replace('/admin/dashboard');
            }
        }
      });
    }
  }, [user, isUserLoading, router, pathname]);

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
    
    initiateEmailSignIn(auth, email, password);

    toast({
      title: 'লগইন করার চেষ্টা করা হচ্ছে...',
      description: 'সফল হলে আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হবে।',
    });
    
    // Fallback to re-enable button after some time
    setTimeout(() => {
        if(isSubmitting) {
            setIsSubmitting(false)
        }
    }, 5000);
  };
  
  const handleForgetCredential = () => {
    localStorage.removeItem(ADMIN_CREDENTIAL_KEY);
    setRememberedEmail(null);
    setEmail('');
    setPassword('');
  }

  if (isUserLoading) {
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
               <div className="flex justify-between items-center">
                 <Label htmlFor="email">ইমেইল</Label>
                 {rememberedEmail && (
                    <Button variant="link" size="sm" className="h-auto p-0" onClick={handleForgetCredential}>
                      পরিবর্তন করুন
                    </Button>
                 )}
              </div>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!rememberedEmail}
                className={!!rememberedEmail ? 'bg-muted' : ''}
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
