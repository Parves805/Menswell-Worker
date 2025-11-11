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
import { Download, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { attendanceRecords } from '@/lib/data';
import { DatePicker } from '@/components/DatePicker';

export default function AttendancePage() {

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Present': return 'default';
            case 'Absent': return 'destructive';
            case 'Late': return 'secondary';
            case 'On Leave': return 'outline';
            default: return 'secondary';
        }
    }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Daily Attendance</CardTitle>
            <CardDescription>
              View and manage daily attendance records for all workers.
            </CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-full max-w-sm'>
              <DatePicker />
            </div>
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
                <TableHead>Worker Name</TableHead>
                <TableHead>Worker ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRecords.length > 0 ? (
                attendanceRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.workerName}
                    </TableCell>
                    <TableCell>{record.workerId}</TableCell>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-center">
                        <Badge variant={getStatusVariant(record.status) as any}>{record.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No attendance records found for this date.
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
