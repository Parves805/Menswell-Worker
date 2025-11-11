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
import { PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { AdvancePayment, Bonus } from '@/lib/types';
import React from 'react';

export default function AdvancesPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const advancesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'workers', user.uid, 'advancePayments'));
  }, [firestore, user]);

  const bonusesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'workers', user.uid, 'bonusPayments'));
  }, [firestore, user]);

  const { data: advancePayments, isLoading: isLoadingAdvances } =
    useCollection<AdvancePayment>(advancesQuery);
  const { data: bonuses, isLoading: isLoadingBonuses } =
    useCollection<Bonus>(bonusesQuery);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advances & Bonuses</CardTitle>
        <CardDescription>
          Manage advance payments and issue bonuses to workers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="advances">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="advances">Advances</TabsTrigger>
              <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
            </TabsList>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Record
            </Button>
          </div>
          <TabsContent value="advances">
            {isLoadingAdvances ? <p>Loading advances...</p> : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Worker Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advancePayments?.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                      <TableCell>{payment.workerName}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={payment.deducted ? 'default' : 'secondary'}
                        >
                          {payment.deducted ? 'Deducted' : 'Pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            )}
          </TabsContent>
          <TabsContent value="bonuses">
            {isLoadingBonuses ? <p>Loading bonuses...</p> : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Worker Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bonuses?.map((bonus) => (
                    <TableRow key={bonus.id}>
                      <TableCell>{new Date(bonus.date).toLocaleDateString()}</TableCell>
                      <TableCell>{bonus.workerName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{bonus.type}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(bonus.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
