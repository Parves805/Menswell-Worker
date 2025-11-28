
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Scissors, CircleDollarSign, Wallet2 } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { ProductionChart } from '@/components/admin/ProductionChart';
import { ActivityFeed } from '@/components/admin/ActivityFeed';

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
  const { data: workers, isLoading: isLoadingWorkers } = useCollection(workersQuery);
  
  const expensesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'expenses') : null),
    [firestore]
  );
  const { data: expenses, isLoading: isLoadingExpenses } = useCollection(expensesQuery);

  const [productionData, setProductionData] = React.useState<{ date: string; pieces: number }[]>([]);
  const [totalPieces, setTotalPieces] = React.useState(0);
  const [totalAdvance, setTotalAdvance] = React.useState(0);
  const [totalExpenses, setTotalExpenses] = React.useState(0);

  React.useEffect(() => {
    if (!firestore || !workers) return;

    const fetchData = async () => {
      let totalPcs = 0;
      let totalAdv = 0;
      const prodData: { date: string, pieces: number }[] = [];

      for (const worker of workers) {
        const prodQuery = query(collection(firestore, 'workers', worker.id, 'productionEntries'));
        const advQuery = query(collection(firestore, 'workers', worker.id, 'advancePayments'));
        
        const prodSnapshot = await getDocs(prodQuery);
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

        const advSnapshot = await getDocs(advQuery);
        advSnapshot.forEach(doc => {
            totalAdv += doc.data().amount || 0;
        });
      }
      setTotalPieces(totalPcs);
      setTotalAdvance(totalAdv);
      setProductionData(prodData.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    };

    fetchData();
  }, [firestore, workers]);

  React.useEffect(() => {
    if(expenses) {
        const total = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        setTotalExpenses(total);
    }
  }, [expenses]);


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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট কর্মী</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingWorkers ? '...' : workers?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">নিবন্ধিত কর্মীর সংখ্যা</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">আজকের উৎপাদন</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPieces.toLocaleString('bn-BD')} পিস</div>
            <p className="text-xs text-muted-foreground">আজ সকল কর্মীর মোট কাজ</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট অগ্রিম প্রদান</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(totalAdvance)}
            </div>
            <p className="text-xs text-muted-foreground">চলতি মাসে মোট প্রদান</p>
          </CardContent>
        </Card>
         <Link href="/admin/expenses" className="transform transition-transform duration-200 hover:scale-105 group">
            <Card className="transition-colors group-hover:border-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">মোট খরচ</CardTitle>
                    <Wallet2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                    {isLoadingExpenses ? '...' : formatCurrency(totalExpenses)}
                    </div>
                    <p className="text-xs text-muted-foreground">এখন পর্যন্ত মোট খরচ</p>
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
