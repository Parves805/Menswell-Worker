'use client';

import React, { useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [allowProfilePictureChange, setAllowProfilePictureChange] = useState(true);

  const handleSaveChanges = () => {
    // In a real app, you would save all these settings to Firestore
    console.log({
      allowProfilePictureChange,
    });
    toast({
      title: 'সেটিংস সংরক্ষিত হয়েছে',
      description: 'আপনার পরিবর্তনগুলো সফলভাবে সংরক্ষণ করা হয়েছে।',
    });
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">সেটিংস</h1>
        <p className="text-muted-foreground">আপনার ফ্যাক্টরি এবং অ্যাপ্লিকেশন সেটিংস পরিচালনা করুন।</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>অ্যাপ্লিকেশন সেটিংস</CardTitle>
          <CardDescription>
            কর্মী-মুখী অ্যাপ্লিকেশনের জন্য সাধারণ সেটিংস কনফিগার করুন।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="allow-profile-pic-change" className="text-base">প্রোফাইল ছবি পরিবর্তনের অনুমতি</Label>
                    <p className="text-sm text-muted-foreground">
                        কর্মীদের অ্যাপ থেকে তাদের নিজস্ব প্রোফাইল ছবি পরিবর্তন করার অনুমতি দিন।
                    </p>
                </div>
                <Switch
                    id="allow-profile-pic-change"
                    checked={allowProfilePictureChange}
                    onCheckedChange={setAllowProfilePictureChange}
                />
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>অ্যাডমিন প্রোফাইল</CardTitle>
          <CardDescription>আপনার ব্যক্তিগত অ্যাডমিনিস্ট্রেটর অ্যাকাউন্ট পরিচালনা করুন।</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="admin-name">নাম</Label>
                <Input id="admin-name" defaultValue="অ্যাডমিন" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="admin-email">ইমেইল</Label>
                <Input id="admin-email" defaultValue="admin@example.com" disabled />
            </div>
             <Separator />
             <div className="space-y-2">
                <Label htmlFor="new-password">নতুন পাসওয়ার্ড</Label>
                <Input id="new-password" type="password" placeholder="নতুন পাসওয়ার্ড লিখুন" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="confirm-password">নতুন পাসওয়ার্ড নিশ্চিত করুন</Label>
                <Input id="confirm-password" type="password" placeholder="নতুন পাসওয়ার্ড নিশ্চিত করুন" />
            </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveChanges}>সমস্ত পরিবর্তন সংরক্ষণ করুন</Button>
      </div>

    </div>
  );
}
