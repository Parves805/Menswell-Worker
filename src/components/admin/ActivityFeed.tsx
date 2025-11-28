'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { ActivityLog } from '@/lib/types';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';

export function ActivityFeed() {
  const firestore = useFirestore();

  const activityLogsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'activityLogs'), orderBy('timestamp', 'desc'), limit(5))
        : null,
    [firestore]
  );

  const { data: activities, isLoading } = useCollection<ActivityLog>(activityLogsQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle>সাম্প্রতিক কার্যকলাপ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="grid gap-1 flex-1">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-1/5" />
            </div>
          </div>
        ))}
        {!isLoading && activities && activities.length > 0 ? activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src={activity.userPhotoUrl} alt="Avatar" />
              <AvatarFallback>{activity.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">
                <span className="font-semibold">{activity.userName}</span> {activity.description}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: bn })}
              </p>
            </div>
          </div>
        )) : (
            !isLoading && <p className='text-sm text-muted-foreground text-center py-10'>কোনো সাম্প্রতিক কার্যকলাপ নেই।</p>
        )}
      </CardContent>
    </Card>
  );
}
