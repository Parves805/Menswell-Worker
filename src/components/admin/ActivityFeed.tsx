'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import React from 'react';

// Dummy data for recent activities
const activities = [
  {
    id: 1,
    user: { name: 'অ্যাডমিন', avatar: 'https://i.pravatar.cc/40?u=admin' },
    action: 'বেতন প্রদান করেছেন',
    details: 'জুন ২০২৪ মাসের জন্য।',
    timestamp: '২ ঘণ্টা আগে',
    type: 'payment',
  },
  {
    id: 2,
    user: { name: 'সিস্টেম', avatar: null },
    action: 'নতুন কর্মী যোগ হয়েছে',
    details: 'কামাল হাসান সেলাই বিভাগে যোগ দিয়েছেন।',
    timestamp: '১ দিন আগে',
    type: 'user',
  },
  {
    id: 3,
    user: { name: 'রহিম শেখ', avatar: 'https://i.pravatar.cc/40?u=supervisor' },
    action: 'অগ্রিম অনুমোদন করেছেন',
    details: 'আয়েশা খানমের জন্য (আইডি: WRK-001)।',
    timestamp: '২ দিন আগে',
    type: 'approval',
  },
   {
    id: 4,
    user: { name: 'অ্যাডমিন', avatar: 'https://i.pravatar.cc/40?u=admin' },
    action: 'খরচ রেকর্ড করা হয়েছে',
    details: 'কাঁচামাল কেনার জন্য।',
    timestamp: '৩ দিন আগে',
    type: 'expense',
  },
];

const typeVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    payment: 'default',
    user: 'secondary',
    approval: 'outline',
    expense: 'destructive',
}

export function ActivityFeed() {
  return (
    <Card className="font-sans">
      <CardHeader>
        <CardTitle>সাম্প্রতিক কার্যকলাপ</CardTitle>
        <CardDescription>
          সিস্টেমের সাম্প্রতিক কার্যকলাপের একটি লগ।
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4">
            <Avatar className="h-9 w-9 border">
                {activity.user.avatar && <AvatarImage src={activity.user.avatar} alt={activity.user.name} />}
              <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">
                <span className="font-semibold">{activity.user.name}</span>{' '}
                {activity.action}
              </p>
              <p className="text-sm text-muted-foreground">{activity.details}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={typeVariant[activity.type] || 'secondary'}>{activity.type}</Badge>
                <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
