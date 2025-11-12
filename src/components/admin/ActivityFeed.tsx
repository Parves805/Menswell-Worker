'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const activities = [
    { user: 'কামাল হাসান', action: 'একটি নতুন উৎপাদন এন্ট্রি যোগ করেছেন', time: '৫ মিনিট আগে' },
    { user: 'অ্যাডমিন', action: 'একটি নতুন ক্যাটাগরি "পোলো শার্ট" যোগ করেছেন', time: '১৫ মিনিট আগে' },
    { user: 'আয়েশা খানম', action: 'অগ্রিম টাকার জন্য অনুরোধ করেছেন', time: '১ ঘণ্টা আগে' },
    { user: 'রহিম শেখ', action: 'প্রোফাইল ছবি পরিবর্তন করেছেন', time: '৩ ঘণ্টা আগে' },
];

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>সাম্প্রতিক কার্যকলাপ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length > 0 ? activities.map((activity, index) => (
          <div key={index} className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src={`https://picsum.photos/seed/${activity.user}/40/40`} alt="Avatar" />
              <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">
                <span className="font-semibold">{activity.user}</span> {activity.action}
              </p>
              <p className="text-sm text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        )) : (
            <p className='text-sm text-muted-foreground text-center py-10'>কোনো সাম্প্রতিক কার্যকলাপ নেই।</p>
        )}
      </CardContent>
    </Card>
  );
}
