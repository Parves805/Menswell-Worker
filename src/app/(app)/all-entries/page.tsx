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

// Dummy data for all production entries. In a real app, you'd fetch this.
const allEntries = [
    { id: 'ENTRY-001', date: '২০২৪-০৭-২৮', category: 'টি-শার্ট', pieces: 112, rate: 5.5, total: 616, },
    { id: 'ENTRY-002', date: '২০২৪-০৭-২৭', category: 'পোলো শার্ট', pieces: 105, rate: 6.0, total: 630, },
    { id: 'ENTRY-003', date: '২০২৪-০৭-২৬', category: 'প্যান্ট', pieces: 80, rate: 12.0, total: 960, },
    { id: 'ENTRY-004', date: '২০২৪-০৭-২৫', category: 'টি-শার্ট', pieces: 115, rate: 5.5, total: 632.5, },
    { id: 'ENTRY-005', date: '২০২৪-০৭-২৪', category: 'শার্ট', pieces: 90, rate: 10.0, total: 900, },
    { id: 'ENTRY-006', date: '২০২৪-০৭-২৩', category: 'পোলো শার্ট', pieces: 108, rate: 6.0, total: 648, },
    { id: 'ENTRY-007', date: '২০২৪-০৭-২২', category: 'টি-শার্ট', pieces: 120, rate: 5.5, total: 660, },
    { id: 'ENTRY-008', date: '২০২৪-০৭-২১', category: 'প্যান্ট', pieces: 85, rate: 12.0, total: 1020, },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
  }).format(amount);

export default function AllEntriesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>সকল কাজের এন্ট্রি</CardTitle>
        <CardDescription>
          আপনার সমস্ত কাজ এবং আয়ের বিস্তারিত হিসাব দেখুন।
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
            <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>ক্যাটাগরি</TableHead>
                    <TableHead className="text-center">পিস</TableHead>
                    <TableHead className="text-center">দর</TableHead>
                    <TableHead className="text-right">মোট টাকা</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {allEntries.length > 0 ? (
                allEntries.map((entry) => (
                    <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.date}</TableCell>
                    <TableCell>
                        <Badge variant="outline">{entry.category}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{entry.pieces}</TableCell>
                    <TableCell className="text-center">{formatCurrency(entry.rate)}</TableCell>
                    <TableCell className="text-right">
                        {formatCurrency(entry.total)}
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                    কোনো এন্ট্রি পাওয়া যায়নি।
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
