'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { advancePayments, bonuses } from '@/lib/data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);

export default function AdminTransactionsPage() {
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Manage Transactions</CardTitle>
                <CardDescription>
                Review and manage all advance and bonus payments for workers.
                </CardDescription>
            </div>
            <div className="flex gap-2">
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Bonus
                </Button>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Advance
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="advances">
          <TabsList className="mb-4">
            <TabsTrigger value="advances">Advance Payments</TabsTrigger>
            <TabsTrigger value="bonuses">Bonus Payments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="advances">
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
                                Reject/Delete
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
          </TabsContent>

          <TabsContent value="bonuses">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bonuses.length > 0 ? (
                    bonuses.map((bonus) => (
                      <TableRow key={bonus.id}>
                         <TableCell className="font-medium">
                          <div className="font-semibold">{bonus.workerName}</div>
                          <div className="text-xs text-muted-foreground">{bonus.workerId}</div>
                        </TableCell>
                        <TableCell>{new Date(bonus.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{bonus.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(bonus.amount)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No bonus payments found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
