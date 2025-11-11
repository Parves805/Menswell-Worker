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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);

export default function AdminTransactionsPage() {
  const advancePayments: any[] = [];
  const bonuses: any[] = [];
  
  return (
    <Card className="font-sans">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>লেনদেন পরিচালনা</CardTitle>
                <CardDescription>
                কর্মীদের সমস্ত অগ্রিম এবং বোনাস পেমেন্ট পর্যালোচনা ও পরিচালনা করুন।
                </CardDescription>
            </div>
            <div className="flex gap-2">
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    নতুন বোনাস
                </Button>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    নতুন অগ্রিম
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="advances">
          <TabsList className="mb-4">
            <TabsTrigger value="advances">অগ্রিম পেমেন্ট</TabsTrigger>
            <TabsTrigger value="bonuses">বোনাস পেমেন্ট</TabsTrigger>
          </TabsList>
          
          <TabsContent value="advances">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>কর্মী</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead className="text-right">পরিমাণ</TableHead>
                    <TableHead className="text-center">অবস্থা</TableHead>
                    <TableHead className="text-right">פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advancePayments && advancePayments.length > 0 ? (
                    advancePayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          <div className="font-semibold">{payment.workerName}</div>
                          <div className="text-xs text-muted-foreground">{payment.workerId}</div>
                        </TableCell>
                        <TableCell>{new Date(payment.date).toLocaleDateString('bn-BD')}</TableCell>
                        <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={payment.deducted ? 'default' : 'secondary'}>
                            {payment.deducted ? 'কর্তন হয়েছে' : 'বিচারাধীন'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">মেনু খুলুন</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>অ্যাকশন</DropdownMenuLabel>
                              <DropdownMenuItem>বিস্তারিত দেখুন</DropdownMenuItem>
                              {!payment.deducted && <DropdownMenuItem>কর্তন হয়েছে হিসেবে চিহ্নিত করুন</DropdownMenuItem>}
                              <DropdownMenuItem className="text-destructive">
                                বাতিল/মুছুন
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        কোনো অগ্রিম পেমেন্ট পাওয়া যায়নি।
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
                    <TableHead>কর্মী</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>ধরন</TableHead>
                    <TableHead className="text-right">পরিমাণ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bonuses && bonuses.length > 0 ? (
                    bonuses.map((bonus) => (
                      <TableRow key={bonus.id}>
                         <TableCell className="font-medium">
                          <div className="font-semibold">{bonus.workerName}</div>
                          <div className="text-xs text-muted-foreground">{bonus.workerId}</div>
                        </TableCell>
                        <TableCell>{new Date(bonus.date).toLocaleDateString('bn-BD')}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{bonus.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(bonus.amount)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        কোনো বোনাস পেমেন্ট পাওয়া যায়নি।
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
