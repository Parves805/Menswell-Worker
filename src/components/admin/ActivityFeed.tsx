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

const activities: any[] = [];

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
        {activities.length > 0 ? activities.map((activity) => (
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
        )) : (
            <div className="text-center text-muted-foreground py-10">
                <p>কোনো সাম্প্রতিক কার্যকলাপ নেই।</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
