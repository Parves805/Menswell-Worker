"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { advancePayments, bonuses } from "@/lib/data";

export default function AdvancesPage() {
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 0,
    }).format(amount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advances & Bonuses</CardTitle>
        <CardDescription>Manage advance payments and issue bonuses to workers.</CardDescription>
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
                  {advancePayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>{payment.workerName}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={payment.deducted ? "default" : "secondary"}>
                          {payment.deducted ? "Deducted" : "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="bonuses">
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
                  {bonuses.map((bonus) => (
                    <TableRow key={bonus.id}>
                      <TableCell>{bonus.date}</TableCell>
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
