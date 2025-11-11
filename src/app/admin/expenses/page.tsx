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
import { PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Dummy data for expenses
const expenses = [
    { id: 'EXP-001', date: '2024-07-25', description: 'Purchase of new sewing needles', category: 'Raw Materials', amount: 5000 },
    { id: 'EXP-002', date: '2024-07-24', description: 'Electricity Bill - June 2024', category: 'Utilities', amount: 75000 },
    { id: 'EXP-003', date: '2024-07-22', description: 'Factory floor cleaning supplies', category: 'Maintenance', amount: 8500 },
    { id: 'EXP-004', date: '2024-07-20', description: 'Transportation for fabric delivery', category: 'Logistics', amount: 12000 },
    { id: 'EXP-005', date: '2024-07-18', description: 'Office stationery', category: 'Office Supplies', amount: 3000 },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);

export default function ExpensesPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Company Expenses</CardTitle>
            <CardDescription>
              Track and manage all company expenses.
            </CardDescription>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Expense
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length > 0 ? (
                expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                     <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No expenses found.
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
