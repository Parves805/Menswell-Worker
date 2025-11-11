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
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { AdvancePayment, Bonus } from '@/lib/types';
import React from 'react';

export default function TransactionsPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const advancesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'workers', user.uid, 'advancePayments'), orderBy('date', 'desc'));
  }, [firestore, user]);

  const bonusesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'workers', user.uid, 'bonusPayments'), orderBy('date', 'desc'));
  }, [firestore, user]);

  const { data: advancePayments, isLoading: isLoadingAdvances } =
    useCollection<AdvancePayment>(advancesQuery);
  const { data: bonuses, isLoading: isLoadingBonuses } =
    useCollection<Bonus>(bonusesQuery);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>আমার লেনদেন</CardTitle>
        <CardDescription>
          আপনার সমস্ত অগ্রিম এবং বোনাস পেমেন্টের ইতিহাস দেখুন।
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="advances">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="advances">অগ্রিম</TabsTrigger>
              <TabsTrigger value="bonuses">বোনাস</TabsTrigger>
            </TabsList>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              অগ্রিমের জন্য অনুরোধ
            </Button>
          </div>
          <TabsContent value="advances">
            {isLoadingAdvances ? <p>লোড হচ্ছে...</p> : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>তারিখ</TableHead>
                    <TableHead className="text-right">পরিমাণ</TableHead>
                    <TableHead className="text-center">অবস্থা</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advancePayments?.length ? advancePayments.map((payment) => (
                    <TableRow key={payment.id}>
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
                        <TableCell colSpan={3} className="h-24 text-center">
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
            {isLoadingBonuses ? <p>লোড হচ্ছে...</p> : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>ধরন</TableHead>
                    <TableHead className="text-right">পরিমাণ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bonuses?.length ? bonuses.map((bonus) => (
                    <TableRow key={bonus.id}>
                      <TableCell>{new Date(bonus.date).toLocaleDateString('bn-BD')}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{bonus.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(bonus.amount)}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
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
