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
import { salaryDetails } from '@/lib/data';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);

export default function SalariesPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Salary Management</CardTitle>
            <CardDescription>
              Process and view monthly salary statements for all workers.
            </CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Process Salaries
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Basic</TableHead>
                <TableHead className="text-right">Overtime</TableHead>
                <TableHead className="text-right">Production</TableHead>
                <TableHead className="text-right text-destructive">Deductions</TableHead>
                <TableHead className="text-right font-bold">Net Salary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaryDetails.length > 0 ? (
                salaryDetails.map((salary) => (
                  <TableRow key={salary.id}>
                    <TableCell className="font-medium">
                        <div className="font-semibold">{salary.workerName}</div>
                        <div className="text-xs text-muted-foreground">{salary.workerId}</div>
                    </TableCell>
                    <TableCell>{salary.month}</TableCell>
                    <TableCell className="text-right">{formatCurrency(salary.basicSalary)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(salary.overtimePay)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(salary.productionPay)}</TableCell>
                    <TableCell className="text-right text-destructive">
                      - {formatCurrency(salary.advanceDeduction + salary.absenceDeduction)}
                    </TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(salary.netSalary)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No salary records found.
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
