
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Scissors, Wallet2, Landmark } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { ProductionChart } from '@/components/admin/ProductionChart';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import type { Worker } from '@/lib/types';
import { TakaIcon } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);

export default function AdminDashboardPage() {
  const firestore = useFirestore();

  const workersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workers') : null),
    [firestore]
  );
  const { data: workers, isLoading: isLoadingWorkers } = useCollection<Worker>(workersQuery);
  
  const [productionData, setProductionData] = React.useState<{ date: string; pieces: number }[]>([]);
  const [isLoadingProduction, setIsLoadingProduction] = React.useState(true);
  const [totalPieces, setTotalPieces] = React.useState(0);
  const [totalAdvances, setTotalAdvances] = React.useState(0);
  const [isLoadingAdvances, setIsLoadingAdvances] = React.useState(true);
  const [totalWorkerExpenses, setTotalWorkerExpenses] = React.useState(0);
  const [isLoadingWorkerExpenses, setIsLoadingWorkerExpenses] = React.useState(true);
  
  React.useEffect(() => {
    if (!firestore || !workers) return;

    const fetchData = async () => {
      setIsLoadingProduction(true);
      setIsLoadingAdvances(true);
      setIsLoadingWorkerExpenses(true);

      let totalPcs = 0;
      let totalAdv = 0;
      let totalWorkerExp = 0;
      const prodData: { date: string, pieces: number }[] = [];

      for (const worker of workers) {
        const prodQuery = query(collection(firestore, 'workers', worker.id, 'productionEntries'));
        const advanceQuery = query(collection(firestore, 'workers', worker.id, 'advancePayments'));
        const expenseQuery = query(collection(firestore, 'workers', worker.id, 'expenses'));
        
        const [prodSnapshot, advanceSnapshot, expenseSnapshot] = await Promise.all([
            getDocs(prodQuery),
            getDocs(advanceQuery),
            getDocs(expenseQuery)
        ]);

        prodSnapshot.forEach(doc => {
            const data = doc.data();
            totalPcs += data.pieceCount || 0;
            const dateStr = new Date(data.date).toLocaleDateString('en-CA');
            const existingEntry = prodData.find(e => e.date === dateStr);
            if (existingEntry) {
                existingEntry.pieces += data.pieceCount || 0;
            } else {
                prodData.push({ date: dateStr, pieces: data.pieceCount || 0 });
            }
        });
        
        advanceSnapshot.forEach(doc => {
            totalAdv += doc.data().amount || 0;
        });

        expenseSnapshot.forEach(doc => {
            totalWorkerExp += doc.data().amount || 0;
        });
      }
      setTotalPieces(totalPcs);
      setTotalAdvances(totalAdv);
      setTotalWorkerExpenses(totalWorkerExp);
      setProductionData(prodData.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      
      setIsLoadingProduction(false);
      setIsLoadingAdvances(false);
      setIsLoadingWorkerExpenses(false);
    };

    fetchData();
  }, [firestore, workers]);


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ড্যাশবোর্ড</h1>
          <p className="text-muted-foreground">আপনার ফ্যাক্টরির কার্যক্রমের সারসংক্ষেপ।</p>
        </div>
        <Link href="/admin/production">
          <Button>নতুন এন্ট্রি করুন</Button>
        </Link>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className='bg-primary text-primary-foreground'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট কর্মী</CardTitle>
            <Users className="h-4 w-4 text-primary-foreground/80" />
          </CardHeader>
          <CardContent>
            {isLoadingWorkers ? <Skeleton className="h-7 w-12 bg-white/20" /> : <div className="text-2xl font-bold">{workers?.length ?? 0}</div>}
            <p className="text-xs text-primary-foreground/80">নিবন্ধিত কর্মীর সংখ্যা</p>
          </CardContent>
        </Card>
        <Card className='bg-primary text-primary-foreground'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">আজকের উৎপাদন</CardTitle>
            <Scissors className="h-4 w-4 text-primary-foreground/80" />
          </CardHeader>
          <CardContent>
            {isLoadingProduction ? <Skeleton className="h-7 w-20 bg-white/20" /> : <div className="text-2xl font-bold">{totalPieces.toLocaleString('bn-BD')} পিস</div>}
            <p className="text-xs text-primary-foreground/80">আজ সকল কর্মীর মোট কাজ</p>
          </CardContent>
        </Card>
        <Link href="/admin/expenses" className="transform transition-transform duration-200 hover:scale-105 group">
          <Card className="transition-colors bg-primary text-primary-foreground group-hover:bg-primary/90">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">কর্মীদের মোট খরচ</CardTitle>
              <Wallet2 className="h-4 w-4 text-primary-foreground/80" />
            </CardHeader>
            <CardContent>
              {isLoadingWorkerExpenses ? <Skeleton className="h-7 w-28 bg-white/20" /> : <div className="text-2xl font-bold">{formatCurrency(totalWorkerExpenses)}</div>}
              <p className="text-xs text-primary-foreground/80">এখন পর্যন্ত মোট খরচ</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/advance-payments" className="transform transition-transform duration-200 hover:scale-105 group">
          <Card className="transition-colors bg-primary text-primary-foreground group-hover:bg-primary/90">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">অগ্রিম প্রদান</CardTitle>
              <TakaIcon className="h-4 w-4 text-primary-foreground/80" />
            </CardHeader>
            <CardContent>
              {isLoadingAdvances ? <Skeleton className="h-7 w-28 bg-white/20" /> : <div className="text-2xl font-bold">{formatCurrency(totalAdvances)}</div>}
              <p className="text-xs text-primary-foreground/80">চলতি মাসে মোট প্রদান</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductionChart data={productionData} />
        <ActivityFeed />
      </div>
    </div>
  );
}
