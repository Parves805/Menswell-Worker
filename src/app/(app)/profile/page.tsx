'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase';
import { Camera } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const { user } = useUser();

  if (!user) {
    return <p>লোড হচ্ছে...</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>আমার প্রোফাইল</CardTitle>
          <CardDescription>
            আপনার ব্যক্তিগত তথ্য দেখুন এবং সম্পাদনা করুন।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24 border">
                <AvatarImage
                  src={user.photoURL ?? 'https://picsum.photos/seed/99/200/200'}
                  alt="ব্যবহারকারীর ছবি"
                />
                <AvatarFallback>
                  {user.displayName?.charAt(0) ?? user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8"
              >
                <Camera className="h-4 w-4" />
                <span className="sr-only">ছবি পরিবর্তন করুন</span>
              </Button>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold">{user.displayName ?? "আয়েশা খানম"}</h2>
              <p className="text-muted-foreground">সুইং অপারেটর</p>
            </div>
          </div>
          
          <Separator />

          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">পুরো নাম</Label>
                <Input id="name" defaultValue={user.displayName ?? "আয়েশা খানম"} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">ইমেইল</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user.email ?? 'worker@example.com'}
                  disabled
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="phone">মোবাইল নম্বর</Label>
                <Input id="phone" type="tel" defaultValue={user.phoneNumber ?? "+8801712345678"} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="department">বিভাগ</Label>
                <Input id="department" defaultValue="সুইং" disabled />
              </div>
            </div>
            <Button>পরিবর্তন সংরক্ষণ করুন</Button>
          </form>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>নিরাপত্তা</CardTitle>
          <CardDescription>আপনার পাসওয়ার্ড পরিবর্তন করুন।</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
              <Label htmlFor="current-password">বর্তমান পাসওয়ার্ড</Label>
              <Input id="current-password" type="password" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="new-password">নতুন পাসওয়ার্ড</Label>
              <Input id="new-password" type="password" />
            </div>
          <Button>পাসওয়ার্ড আপডেট করুন</Button>
        </CardContent>
      </Card>
    </div>
  );
}
