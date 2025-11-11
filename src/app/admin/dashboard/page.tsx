'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, Factory, Banknote, AreaChart } from 'lucide-react';
import React from 'react';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import { ProductionChart } from '@/components/admin/ProductionChart';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Worker } from '@/lib/types';


const formatNumber = (num: number) => {
  return new Intl.NumberFormat('bn-BD').format(num);
};
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

    const summaryData = {
        totalWorkers: workers?.length ?? 0,
        totalProductionToday: 0, // This would require a more complex query
        totalSalaryPaid: 0, // This would require a more complex query
        totalExpenses: 0, // This would require a more complex query
    };


  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট কর্মী</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingWorkers ? '...' : formatNumber(summaryData.totalWorkers)}
            </div>
            <p className="text-xs text-muted-foreground">এখন পর্যন্ত</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              আজকের উৎপাদন
            </CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(summaryData.totalProductionToday)} পিস
            </div>
            <p className="text-xs text-muted-foreground">আজ</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              বেতন প্রদান (এই মাসে)
            </CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summaryData.totalSalaryPaid)}
            </div>
            <p className="text-xs text-muted-foreground">চলতি মাসের হিসাব</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              মোট খরচ (এই মাসে)
            </CardTitle>
            <AreaChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summaryData.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              চলতি মাসের হিসাব
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductionChart />
        <ActivityFeed />
      </div>
    </div>
  );
}
