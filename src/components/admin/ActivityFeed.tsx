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
    user: { name: 'Admin', avatar: 'https://i.pravatar.cc/40?u=admin' },
    action: 'Paid Salaries',
    details: 'for the month of June 2024.',
    timestamp: '2 hours ago',
    type: 'payment',
  },
  {
    id: 2,
    user: { name: 'System', avatar: null },
    action: 'New worker added',
    details: 'Kamal Hasan joined the Sewing department.',
    timestamp: '1 day ago',
    type: 'user',
  },
  {
    id: 3,
    user: { name: 'Rahim Sheikh', avatar: 'https://i.pravatar.cc/40?u=supervisor' },
    action: 'Approved Advance',
    details: 'for Ayesha Khan (ID: WRK-001).',
    timestamp: '2 days ago',
    type: 'approval',
  },
   {
    id: 4,
    user: { name: 'Admin', avatar: 'https://i.pravatar.cc/40?u=admin' },
    action: 'Expense Recorded',
    details: 'for Raw Materials purchase.',
    timestamp: '3 days ago',
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
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          A log of recent activities in the system.
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
