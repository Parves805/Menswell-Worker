'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import type { AdvancePayment, Bonus, Worker } from '@/lib/types';
import React from 'react';

interface Transaction extends AdvancePayment, Bonus {
    workerName: string;
}

export default function AdminTransactionsPage() {
  const firestore = useFirestore();
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const workersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workers') : null),
    [firestore]
  );
  const { data: workers } = useCollection<Worker>(workersQuery);

  React.useEffect(() => {
    if (!firestore || !workers) return;
    
    const fetchTransactions = async () => {
      setIsLoading(true);
      const allTransactions: Transaction[] = [];
      for(const worker of workers) {
          const advancesQuery = query(collection(firestore, 'workers', worker.id, 'advancePayments'));
          const bonusesQuery = query(collection(firestore, 'workers', worker.id, 'bonusPayments'));
          
          const advSnapshot = await getDocs(advancesQuery);
          advSnapshot.forEach(doc => {
              allTransactions.push({ ...doc.data(), id: doc.id, workerName: worker.name } as Transaction);
          });

          const bonusSnapshot = await getDocs(bonusesQuery);
          bonusSnapshot.forEach(doc => {
              allTransactions.push({ ...doc.data(), id: doc.id, workerName: worker.name } as Transaction);
          });
      }
      setTransactions(allTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setIsLoading(false);
    }
    
    fetchTransactions();

  }, [firestore, workers]);


  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);

  const advancePayments = transactions.filter(t => t.deducted !== undefined);
  const bonuses = transactions.filter(t => t.type !== undefined);


  return (
    <Card>
      <CardHeader>
        <CardTitle>সকল লেনদেন</CardTitle>
        <CardDescription>
          সকল কর্মীর অগ্রিম এবং বোনাস পেমেন্টের ইতিহাস দেখুন।
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="advances">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="advances">অগ্রিম</TabsTrigger>
              <TabsTrigger value="bonuses">বোনাস</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="advances">
            {isLoading ? <p className='text-center py-10'>লোড হচ্ছে...</p> : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>কর্মী</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead className="text-right">পরিমাণ</TableHead>
                    <TableHead className="text-center">অবস্থা</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advancePayments.length > 0 ? advancePayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.workerName}</TableCell>
                      <TableCell>{new Date(payment.date).toLocaleDateString('bn-BD')}</TableCell>
                      <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={payment.deducted ? 'default' : 'secondary'}
                        >
                          {payment.deducted ? 'কর্তন হয়েছে' : 'বিচারাধীন'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )) : (
                     <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            কোনো অগ্রিমের রেকর্ড পাওয়া যায়নি।
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            )}
          </TabsContent>
          <TabsContent value="bonuses">
            {isLoading ? <p className='text-center py-10'>লোড হচ্ছে...</p> : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>কর্মী</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>ধরন</TableHead>
                    <TableHead className="text-right">পরিমাণ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bonuses.length > 0 ? bonuses.map((bonus) => (
                    <TableRow key={bonus.id}>
                      <TableCell className="font-medium">{bonus.workerName}</TableCell>
                      <TableCell>{new Date(bonus.date).toLocaleDateString('bn-BD')}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{bonus.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(bonus.amount)}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            কোনো বোনাসের রেকর্ড পাওয়া যায়নি।
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
