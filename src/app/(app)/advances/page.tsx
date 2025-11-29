
'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { WorkerExpense } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);

export default function AdvancesPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const expensesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'workers', user.uid, 'expenses'),
      orderBy('date', 'desc')
    );
  }, [user, firestore]);

  const { data: allExpenses, isLoading } = useCollection<WorkerExpense>(expensesQuery);

  return (
    <Card>
      <CardHeader className='flex-row justify-between items-center'>
        <div>
            <CardTitle className='flex items-center gap-2'>
                <Wallet />
                খরচের ইতিহাস
            </CardTitle>
            <CardDescription>
                আপনার সমস্ত অনুমোদিত খরচের বিস্তারিত হিসাব দেখুন।
            </CardDescription>
        </div>
        <Link href="/request-advance">
            <Button>নতুন অনুরোধ</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
            <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>বিবরণ</TableHead>
                    <TableHead className="text-right">পরিমাণ</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading && Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    </TableRow>
                ))}
                {!isLoading && allExpenses && allExpenses.length > 0 ? (
                allExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                        <TableCell className="font-medium">{new Date(expense.date).toLocaleDateString('bn-BD')}</TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                    </TableRow>
                ))
                ) : (
                !isLoading && (
                    <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                        কোনো খরচের রেকর্ড পাওয়া যায়নি।
                        </TableCell>
                    </TableRow>
                )
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
