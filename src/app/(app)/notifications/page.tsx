'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Bell, Circle } from 'lucide-react';
import Image from 'next/image';
import {
  useCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
  updateDocumentNonBlocking,
} from '@/firebase';
import { collection, query, doc, orderBy } from 'firebase/firestore';
import type { Notification } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';

export default function NotificationsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [sortedNotifications, setSortedNotifications] = useState<Notification[] | null>(null);

  const notificationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'workers', user.uid, 'notifications'),
      orderBy('createdAt', 'desc')
    );
  }, [user, firestore]);

  const { data: notifications, isLoading } =
    useCollection<Notification>(notificationsQuery);

  useEffect(() => {
    if (notifications) {
      setSortedNotifications(notifications);
    }
  }, [notifications]);


  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead && firestore && notification.id && user) {
      const notifDocRef = doc(firestore, 'workers', user.uid, 'notifications', notification.id);
      updateDocumentNonBlocking(notifDocRef, { isRead: true });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell /> নোটিফিকেশন
        </CardTitle>
        <CardDescription>
          আপনার সাম্প্রতিক নোটিফিকেশনগুলো এখানে দেখুন।
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="mt-1 h-3 w-3 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLoading && sortedNotifications && sortedNotifications.length > 0 ? (
          <div className="flex flex-col gap-4">
            {sortedNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={cn(
                  'flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50',
                  !notif.isRead && 'bg-blue-50 dark:bg-blue-900/20'
                )}
              >
                {!notif.isRead && (
                  <Circle className="mt-1 h-3 w-3 flex-shrink-0 fill-current text-primary" />
                )}
                <div className={cn('flex-1', notif.isRead && 'pl-7')}>
                  <p className="font-medium">{notif.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {notif.message}
                  </p>
                   {notif.imageUrl && (
                    <div className="relative mt-2 aspect-video w-full max-w-sm overflow-hidden rounded-md">
                        <Image src={notif.imageUrl} alt={notif.title} fill className="object-cover"/>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString('bn-BD', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    }) : 'কিছুক্ষণ আগে'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="flex h-40 flex-col items-center justify-center text-center">
              <Bell className="h-10 w-10 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                আপনার কোনো নোটিফিকেশন নেই।
              </p>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
