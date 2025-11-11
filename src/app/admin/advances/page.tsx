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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { advancePayments } from '@/lib/data';


const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);

export default function AdvancesPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Manage Advance Payments</CardTitle>
            <CardDescription>
              Approve, track, and manage all worker advance payments.
            </CardDescription>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Advance
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {advancePayments.length > 0 ? (
                advancePayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      <div className="font-semibold">{payment.workerName}</div>
                      <div className="text-xs text-muted-foreground">{payment.workerId}</div>
                    </TableCell>
                    <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={payment.deducted ? 'default' : 'secondary'}>
                        {payment.deducted ? 'Deducted' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          {!payment.deducted && <DropdownMenuItem>Mark as Deducted</DropdownMenuItem>}
                           <DropdownMenuItem className="text-destructive">
                            Reject Request
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No advance payments found.
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
