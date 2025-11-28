
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
import { useAuth, useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { FormEvent, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function SignUpPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  // Pre-fill for admin creation
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('Admin');
  
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('01234567890'); // Dummy phone
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isAdminCreation = true; // Forcing admin creation mode

  useEffect(() => {
    // If a regular user is already logged in, redirect them
    if (!isUserLoading && user && !isAdminCreation) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router, isAdminCreation]);


  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore || !name || !email || !password) {
        toast({
            variant: "destructive",
            title: "ফর্ম পূরণ করুন",
            description: "অনুগ্রহ করে সমস্ত প্রয়োজনীয় তথ্য পূরণ করুন।",
        });
        return;
    }
    setIsSubmitting(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(newUser, {
        displayName: name,
      });

      // Save additional worker info to Firestore
      const workerDocRef = doc(firestore, 'workers', newUser.uid);
      const workerData = {
        id: newUser.uid,
        name: name,
        contact: phone,
        email: email,
        joinDate: new Date().toISOString(),
        designation: 'Admin',
        department: 'Management',
        basicSalary: 0,
        photo: `https://picsum.photos/seed/${newUser.uid}/200/200`
      };
      
      setDocumentNonBlocking(workerDocRef, workerData, { merge: false });

      toast({
        title: "নিবন্ধন সফল হয়েছে",
        description: "অ্যাডমিন অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। এখন লগইন করুন।",
      });

      // Redirect admin to admin login page after creation
      router.push('/admin/login');
      
    } catch (error: any) {
      console.error('Sign Up Error:', error);
       let description = "একটি অজানা ত্রুটি ঘটেছে।";
        if (error.code === 'auth/email-already-in-use') {
            description = "এই ইমেইল ঠিকানাটি ইতিমধ্যে ব্যবহৃত হয়েছে। অনুগ্রহ করে লগইন করুন।";
             if (isAdminCreation) {
                router.push('/admin/login');
            }
        } else if (error.code === 'auth/weak-password') {
            description = "পাসওয়ার্ডটি খুব দুর্বল। অনুগ্রহ করে আরও শক্তিশালী পাসওয়ার্ড ব্যবহার করুন।";
        } else if (error.code === 'auth/invalid-email') {
            description = "ইমেইল ঠিকানাটি সঠিক নয়।";
        }
      toast({
        variant: "destructive",
        title: "নিবন্ধন ব্যর্থ হয়েছে",
        description: description,
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isUserLoading || (user && !isAdminCreation)) {
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
          <CardTitle className="text-2xl font-bold">
            অ্যাডমিন অ্যাকাউন্ট তৈরি করুন
          </CardTitle>
          <CardDescription>
            অ্যাডমিন প্যানেলে প্রবেশ করার জন্য অ্যাকাউন্ট তৈরি করুন।
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">পুরো নাম</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  readOnly
                  className={'bg-muted'}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">ইমেইল</Label>
                    <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    readOnly
                    className={'bg-muted'}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone">মোবাইল নম্বর (ঐচ্ছিক)</Label>
                    <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    readOnly
                    className={'bg-muted'}
                    />
                </div>
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
                    readOnly
                    className={'bg-muted'}
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
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "অ্যাকাউন্ট তৈরি করা হচ্ছে..." : "অ্যাডমিন অ্যাকাউন্ট নিবন্ধন করুন"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

    