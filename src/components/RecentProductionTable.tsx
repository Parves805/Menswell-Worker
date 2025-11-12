'use client';

import React, { useState } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import {
  useCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
} from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { ProductionEntry } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
  }).format(amount);

export function RecentProductionTable() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [selectedEntry, setSelectedEntry] = useState<ProductionEntry | null>(
    null
  );

  const entriesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'workers', user.uid, 'productionEntries'),
      orderBy('date', 'desc'),
      limit(5)
    );
  }, [user, firestore]);

  const { data: recentEntries, isLoading } =
    useCollection<ProductionEntry>(entriesQuery);

  const handleRowClick = (entry: ProductionEntry) => {
    setSelectedEntry(entry);
  };

  return (
    <>
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
                {isLoading &&
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-10 w-10 rounded-md" />
                            <Skeleton className="h-5 w-20" />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Skeleton className="h-5 w-10 mx-auto" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-5 w-20 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                {!isLoading && recentEntries && recentEntries.length > 0 ? (
                  recentEntries.map((entry) => (
                    <TableRow
                      key={entry.id}
                      onClick={() => handleRowClick(entry)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        {new Date(entry.date).toLocaleDateString('bn-BD')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 font-medium">
                            <Avatar className="h-10 w-10 rounded-md">
                                <AvatarImage src={entry.categoryImageUrl} alt={entry.categoryName} className="object-cover" />
                                <AvatarFallback className="rounded-md"><ImageIcon /></AvatarFallback>
                            </Avatar>
                           <span>{entry.categoryName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {entry.pieceCount}
                      </TableCell>
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
      
      <Dialog open={!!selectedEntry} onOpenChange={(isOpen) => !isOpen && setSelectedEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>এন্ট্রির বিস্তারিত</DialogTitle>
            <DialogDescription>
                আপনার কাজের এন্ট্রির সম্পূর্ণ বিবরণ নিচে দেওয়া হলো।
            </DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-3 pt-4 font-sans">
                <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-sm text-muted-foreground">তারিখ</span>
                    <span className="font-medium text-sm">{new Date(selectedEntry.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                 <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-sm text-muted-foreground">কর্মীর নাম</span>
                    <span className="font-medium text-sm">{selectedEntry.workerName}</span>
                </div>
                 <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-sm text-muted-foreground">ক্যাটাগরি</span>
                    <span className="font-medium text-sm">{selectedEntry.categoryName}</span>
                </div>
                 <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-sm text-muted-foreground">পিসের সংখ্যা</span>
                    <span className="font-medium text-sm">{selectedEntry.pieceCount}</span>
                </div>
                 <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-sm text-muted-foreground">দর (প্রতি পিস)</span>
                    <span className="font-medium text-sm">{formatCurrency(selectedEntry.rate)}</span>
                </div>
                 <div className="bg-muted p-4 rounded-md mt-4">
                    <div className='flex justify-between items-center'>
                      <span className="text-base font-semibold">মোট টাকা</span>
                      <span className="font-bold text-xl text-primary">{formatCurrency(selectedEntry.total)}</span>
                    </div>
                </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
