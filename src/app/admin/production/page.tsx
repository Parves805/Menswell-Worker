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
import { Button } from '@/components/ui/button';
import { PlusCircle, Download } from 'lucide-react';
import { DatePicker } from '@/components/DatePicker';


export default function ProductionPage() {
  const productionEntries: any[] = [];
  return (
    <Card className="font-sans">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>উৎপাদন এন্ট্রি</CardTitle>
            <CardDescription>
              সকল কর্মীর উৎপাদন এন্ট্রি দেখুন এবং পরিচালনা করুন।
            </CardDescription>
          </div>
           <div className='flex items-center gap-2'>
            <div className='w-full max-w-sm'>
              <DatePicker />
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              এন্ট্রি যোগ করুন
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              রিপোর্ট এক্সপোর্ট
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>তারিখ</TableHead>
                <TableHead>কর্মীর নাম</TableHead>
                <TableHead>কর্মী আইডি</TableHead>
                <TableHead className="text-center">পিস সংখ্যা</TableHead>
                <TableHead className="text-center">ওভারটাইম (ঘণ্টা)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productionEntries && productionEntries.length > 0 ? (
                productionEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.date).toLocaleDateString('bn-BD')}</TableCell>
                    <TableCell className="font-medium">{entry.workerName}</TableCell>
                    <TableCell>{entry.workerId}</TableCell>
                    <TableCell className="text-center">{entry.pieceCount}</TableCell>
                    <TableCell className="text-center">{entry.overtimeHours}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    কোনো উৎপাদন এন্ট্রি পাওয়া যায়নি।
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
