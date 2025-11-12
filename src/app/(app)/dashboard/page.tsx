
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scissors, CircleDollarSign, Hourglass, Wallet2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { RecentProductionTable } from '@/components/RecentProductionTable';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp, orderBy } from 'firebase/firestore';
import React from 'react';
import { ProductionEntry, AdvancePayment, SliderImage } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

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

  const allEntriesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, 'workers', user.uid, 'productionEntries')
    );
  }, [user, firestore]);

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

  const sliderImagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'sliderImages'), orderBy('createdAt', 'desc'));
  }, [firestore]);
  
  const { data: allEntries, isLoading: isLoadingAllEntries } = useCollection<ProductionEntry>(allEntriesQuery);
  const { data: todayEntries, isLoading: isLoadingTodayEntries } = useCollection<ProductionEntry>(todayEntriesQuery);
  const { data: unpaidAdvances, isLoading: isLoadingAdvances } = useCollection<AdvancePayment>(advancePaymentsQuery);
  const { data: sliderImages, isLoading: isLoadingSlider } = useCollection<SliderImage>(sliderImagesQuery);

  const { todayOvertime } = React.useMemo(() => {
    if (!todayEntries) {
      return { todayOvertime: 0 };
    }
    return todayEntries.reduce(
      (acc, entry) => {
        acc.todayOvertime += entry.overtimeHours || 0;
        return acc;
      },
      { todayOvertime: 0 }
    );
  }, [todayEntries]);
  
  const totalProduction = React.useMemo(() => {
    if (!allEntries) return 0;
    return allEntries.reduce((sum, entry) => sum + (entry.pieceCount || 0), 0);
  }, [allEntries]);
  
  const totalEarnings = React.useMemo(() => {
    if (!allEntries) return 0;
    return allEntries.reduce((sum, entry) => sum + (entry.total || 0), 0);
  }, [allEntries]);
  
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
            আপনার কাজের সারসংক্ষেপ নিচে দেওয়া হলো।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">মোট আয়</p>
              {isLoadingAllEntries ? <Skeleton className="h-9 w-36 mt-1 bg-white/20" /> : (
                <p className="text-3xl font-bold">
                    {formatCurrency(totalEarnings)}
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
          {isLoadingSlider && (
             <CarouselItem>
              <Skeleton className="aspect-[16/7] w-full" />
            </CarouselItem>
          )}
          {!isLoadingSlider && sliderImages?.map((image) => (
            <CarouselItem key={image.id}>
               <Link href={image.link || '#'} target="_blank" rel="noopener noreferrer">
              <Card className="overflow-hidden border-none relative group">
                <CardContent className="p-0">
                  <div className="relative aspect-[16/7] w-full">
                    <Image
                      src={image.imageUrl}
                      alt={image.title}
                      fill
                      className="object-cover"
                    />
                     <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <h3 className="text-xl font-bold text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">{image.title}</h3>
                        <p className="text-sm text-white/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">{image.description}</p>
                     </div>
                  </div>
                </CardContent>
              </Card>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-none" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover-bg-black/50 border-none" />
      </Carousel>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/all-entries" className="transform transition-transform duration-200 hover:scale-105 group">
          <Card className="transition-colors group-hover:border-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট সেলাই</CardTitle>
              <Scissors className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingAllEntries ? <Skeleton className="h-7 w-20" /> : (
                  <div className="text-2xl font-bold">{totalProduction.toLocaleString('bn-BD')} পিস</div>
              )}
               <p className="text-xs text-muted-foreground">এখন পর্যন্ত মোট কাজ</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/expenses" className="transform transition-transform duration-200 hover:scale-105 group">
          <Card className="transition-colors group-hover:border-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট খরচ</CardTitle>
              <Wallet2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                  ৳ ১২,৩০০
                </div>
              <p className="text-xs text-muted-foreground">চলতি মাসের মোট খরচ</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/advances" className="transform transition-transform duration-200 hover:scale-105 group">
          <Card className="transition-colors group-hover:border-primary">
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
        <Link href="/overtime" className="transform transition-transform duration-200 hover:scale-105 group">
          <Card className="transition-colors group-hover:border-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">আজকের ওভারটাইম</CardTitle>
              <Hourglass className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               {isLoadingTodayEntries ? <Skeleton className="h-7 w-20" /> : (
                  <div className="text-2xl font-bold">{todayOvertime.toLocaleString('bn-BD')} ঘণ্টা</div>
              )}
               <p className="text-xs text-muted-foreground">আজকের মোট ওভারটাইম</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <RecentProductionTable />
    </div>
  );
}
