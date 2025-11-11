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


// Dummy data for recent production entries
const recentEntries = [
  {
    id: 'ENTRY-001',
    date: '২০২৪-০৭-২৮',
    category: 'টি-শার্ট',
    pieces: 112,
    rate: 5.5,
    total: 616,
  },
  {
    id: 'ENTRY-002',
    date: '২০২৪-০৭-২৭',
    category: 'পোলো শার্ট',
    pieces: 105,
    rate: 6.0,
    total: 630,
  },
  {
    id: 'ENTRY-003',
    date: '۲۰২৪-০৭-২৬',
    category: 'প্যান্ট',
    pieces: 80,
    rate: 12.0,
    total: 960,
  },
  {
    id: 'ENTRY-004',
    date: '২০২৪-০৭-২৫',
    category: 'টি-শার্ট',
    pieces: 115,
    rate: 5.5,
    total: 632.5,
  },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
  }).format(amount);

export function RecentProductionTable() {
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
                {recentEntries.length > 0 ? (
                recentEntries.map((entry) => (
                    <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.date}</TableCell>
                    <TableCell>
                        <Badge variant="outline">{entry.category}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{entry.pieces}</TableCell>
                    <TableCell className="text-right">
                        {formatCurrency(entry.total)}
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
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
