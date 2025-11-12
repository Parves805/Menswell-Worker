
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
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { ProductionEntry } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Hourglass } from 'lucide-react';

export default function OvertimePage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const overtimeQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'workers', user.uid, 'productionEntries'),
      where('overtimeHours', '>', 0),
      orderBy('overtimeHours', 'desc'),
      orderBy('date', 'desc')
    );
  }, [user, firestore]);

  const { data: overtimeEntries, isLoading } = useCollection<ProductionEntry>(overtimeQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
            <Hourglass />
            ওভারটাইম লগ
        </CardTitle>
        <CardDescription>
          আপনার সমস্ত ওভারটাইম কাজের বিস্তারিত হিসাব দেখুন।
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
            <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>তারিখ</TableHead>
                    <TableHead className="text-right">ওভারটাইম (ঘণ্টা)</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading && Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    </TableRow>
                ))}
                {!isLoading && overtimeEntries && overtimeEntries.length > 0 ? (
                overtimeEntries.map((entry) => (
                    <TableRow key={entry.id}>
                        <TableCell className="font-medium">{new Date(entry.date).toLocaleDateString('bn-BD')}</TableCell>
                        <TableCell className="text-right">{entry.overtimeHours} ঘণ্টা</TableCell>
                    </TableRow>
                ))
                ) : (
                !isLoading && (
                    <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
                        কোনো ওভারটাইমের রেকর্ড পাওয়া যায়নি।
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
