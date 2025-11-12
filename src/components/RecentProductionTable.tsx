'use client';

import React from 'react';
import Link from 'next/link';
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
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { ProductionEntry } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
  }).format(amount);

export function RecentProductionTable() {
  const { user } = useUser();
  const firestore = useFirestore();

  const entriesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'workers', user.uid, 'productionEntries'),
      orderBy('date', 'desc'),
      limit(5)
    );
  }, [user, firestore]);

  const { data: recentEntries, isLoading } = useCollection<ProductionEntry>(entriesQuery);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>সাম্প্রতিক কাজের এন্ট্রি</CardTitle>
          <CardDescription>
            আপনার সাম্প্রতিক কাজ এবং আয়ের হিসাব দেখুন।
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/all-entries">
            সব দেখুন
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>তারিখ</TableHead>
                <TableHead>ক্যাটাগরি</TableHead>
                <TableHead className="text-center">পিস</TableHead>
                <TableHead className="text-right">মোট টাকা</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-5 w-10 mx-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && recentEntries && recentEntries.length > 0 ? (
                recentEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {new Date(entry.date).toLocaleDateString('bn-BD')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.categoryName}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{entry.pieceCount}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(entry.total)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                !isLoading && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      কোনো এন্ট্রি পাওয়া যায়নি।
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
