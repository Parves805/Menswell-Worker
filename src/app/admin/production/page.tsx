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
import { productionEntries } from '@/lib/data';
import { DatePicker } from '@/components/DatePicker';


export default function ProductionPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Production Entries</CardTitle>
            <CardDescription>
              View and manage all worker production entries.
            </CardDescription>
          </div>
           <div className='flex items-center gap-2'>
            <div className='w-full max-w-sm'>
              <DatePicker />
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Worker Name</TableHead>
                <TableHead>Worker ID</TableHead>
                <TableHead className="text-center">Piece Count</TableHead>
                <TableHead className="text-center">Overtime (hrs)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productionEntries.length > 0 ? (
                productionEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{entry.workerName}</TableCell>
                    <TableCell>{entry.workerId}</TableCell>
                    <TableCell className="text-center">{entry.pieceCount}</TableCell>
                    <TableCell className="text-center">{entry.overtimeHours}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No production entries found.
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
