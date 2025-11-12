
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
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { AdvancePayment } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { CircleDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
  }).format(amount);

export default function AdvancesPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const advancesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'workers', user.uid, 'advancePayments'),
      orderBy('date', 'desc')
    );
  }, [user, firestore]);

  const { data: allAdvances, isLoading } = useCollection<AdvancePayment>(advancesQuery);

  return (
    <Card>
      <CardHeader className='flex-row justify-between items-center'>
        <div>
            <CardTitle className='flex items-center gap-2'>
                <CircleDollarSign />
                অগ্রিম পেমেন্টের ইতিহাস
            </CardTitle>
            <CardDescription>
                আপনার সমস্ত অগ্রিম পেমেন্টের বিস্তারিত হিসাব দেখুন।
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
                    <TableHead className="text-right">পরিমাণ</TableHead>
                    <TableHead className="text-center">স্ট্যাটাস</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading && Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-6 w-24 mx-auto" /></TableCell>
                    </TableRow>
                ))}
                {!isLoading && allAdvances && allAdvances.length > 0 ? (
                allAdvances.map((advance) => (
                    <TableRow key={advance.id}>
                        <TableCell className="font-medium">{new Date(advance.date).toLocaleDateString('bn-BD')}</TableCell>
                        <TableCell className="text-right">{formatCurrency(advance.amount)}</TableCell>
                        <TableCell className="text-center">
                            <Badge variant={advance.deducted ? "default" : "secondary"}>
                                {advance.deducted ? 'কর্তন হয়েছে' : 'বিচারাধীন'}
                            </Badge>
                        </TableCell>
                    </TableRow>
                ))
                ) : (
                !isLoading && (
                    <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                        কোনো অগ্রিমের রেকর্ড পাওয়া যায়নি।
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
