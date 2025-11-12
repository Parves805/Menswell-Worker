'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scissors, CircleDollarSign, Hourglass, Wallet } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { RecentProductionTable } from '@/components/RecentProductionTable';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import React from 'react';
import { ProductionEntry, AdvancePayment } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const sliderImages = PlaceHolderImages.filter(img => img.id.startsWith('hero-slider'));

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
  }).format(amount);

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayEntriesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, 'workers', user.uid, 'productionEntries'),
        where('date', '>=', Timestamp.fromDate(today)),
        where('date', '<', Timestamp.fromDate(tomorrow))
    );
  }, [user, firestore]);

  const advancePaymentsQuery = useMemoFirebase(() => {
      if(!user || !firestore) return null;
      return query(
          collection(firestore, 'workers', user.uid, 'advancePayments'),
          where('deducted', '==', false)
      );
  }, [user, firestore]);

  const { data: todayEntries, isLoading: isLoadingEntries } = useCollection<ProductionEntry>(todayEntriesQuery);
  const { data: unpaidAdvances, isLoading: isLoadingAdvances } = useCollection<AdvancePayment>(advancePaymentsQuery);

  const { todayProduction, todayOvertime, todayEarnings } = React.useMemo(() => {
    if (!todayEntries) {
      return { todayProduction: 0, todayOvertime: 0, todayEarnings: 0 };
    }
    return todayEntries.reduce(
      (acc, entry) => {
        acc.todayProduction += entry.pieceCount || 0;
        acc.todayOvertime += entry.overtimeHours || 0;
        acc.todayEarnings += entry.total || 0;
        return acc;
      },
      { todayProduction: 0, todayOvertime: 0, todayEarnings: 0 }
    );
  }, [todayEntries]);
  
  const advanceBalance = React.useMemo(() => {
      if (!unpaidAdvances) return 0;
      return unpaidAdvances.reduce((sum, payment) => sum + payment.amount, 0);
  }, [unpaidAdvances]);


  return (
    <div className="flex flex-col gap-6">
      
      <Card className="w-full bg-primary text-primary-foreground border-none">
        <CardHeader>
          <CardTitle>স্বাগতম, {user?.displayName ?? 'কর্মী'}!</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            আপনার আজকের কাজের সারসংক্ষেপ নিচে দেওয়া হলো।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">আজকের মোট আয়</p>
              {isLoadingEntries ? <Skeleton className="h-9 w-36 mt-1" /> : (
                <p className="text-3xl font-bold">
                    {formatCurrency(todayEarnings)}
                </p>
              )}
            </div>
            <Link href="/entry">
              <Button variant="secondary">নতুন এন্ট্রি করুন</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
       <Carousel
        opts={{
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {sliderImages.map((image) => (
            <CarouselItem key={image.id}>
              <Card className="overflow-hidden border-none">
                <CardContent className="p-0">
                  <div className="relative aspect-[16/7] w-full">
                    <Image
                      src={image.imageUrl}
                      alt={image.description}
                      fill
                      className="object-cover"
                      data-ai-hint={image.imageHint}
                    />
                     <div className="absolute inset-0 bg-black/40" />
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-none" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover-bg-black/50 border-none" />
      </Carousel>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/all-entries" className="transform transition-transform duration-200 hover:scale-105">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">আজকের সেলাই</CardTitle>
              <Scissors className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingEntries ? <Skeleton className="h-7 w-20" /> : (
                  <div className="text-2xl font-bold">{todayProduction} পিস</div>
              )}
            </CardContent>
          </Card>
        </Link>
        <Link href="/expenses" className="transform transition-transform duration-200 hover:scale-105">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট খরচ</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                  ৳ ১২,৩০০
                </div>
              <p className="text-xs text-muted-foreground">চলতি মাসের মোট খরচ</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/advances" className="transform transition-transform duration-200 hover:scale-105">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">বকেয়া অগ্রিম</CardTitle>
              <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               {isLoadingAdvances ? <Skeleton className="h-7 w-28" /> : (
                  <div className="text-2xl font-bold text-destructive">
                  {formatCurrency(advanceBalance)}
                  </div>
               )}
              <p className="text-xs text-muted-foreground">পরবর্তী বেতন থেকে কর্তনযোগ্য</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/overtime" className="transform transition-transform duration-200 hover:scale-105">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">আজকের ওভারটাইম</CardTitle>
              <Hourglass className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               {isLoadingEntries ? <Skeleton className="h-7 w-20" /> : (
                  <div className="text-2xl font-bold">{todayOvertime} ঘণ্টা</div>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>

      <RecentProductionTable />
    </div>
  );
}
