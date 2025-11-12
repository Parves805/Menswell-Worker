'use client';

import React, { useState, useMemo } from 'react';
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
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, where, Timestamp } from 'firebase/firestore';
import type { Expense } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet2, PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/DatePicker';
import { useToast } from '@/hooks/use-toast';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
  }).format(amount);

function AddExpenseDialog({ open, onOpenChange, onExpenseAdded }: { open: boolean, onOpenChange: (open: boolean) => void, onExpenseAdded: () => void }) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !description || !category || amount <= 0) {
      toast({
        variant: 'destructive',
        title: 'ফর্ম অসম্পূর্ণ',
        description: 'অনুগ্রহ করে সমস্ত ঘর পূরণ করুন।',
      });
      return;
    }
    setIsSubmitting(true);
    
    const newExpense = {
      date: date.toISOString(),
      description,
      category,
      amount,
    };

    try {
      await addDocumentNonBlocking(collection(firestore, 'expenses'), newExpense);
      toast({
        title: 'খরচ যোগ হয়েছে',
        description: 'আপনার নতুন খরচ সফলভাবে যোগ করা হয়েছে।',
      });
      // Reset form and close dialog
      setDescription('');
      setCategory('');
      setAmount(0);
      setDate(new Date());
      onExpenseAdded();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: 'খরচ যোগ করার সময় একটি সমস্যা হয়েছে।',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>নতুন খরচ যোগ করুন</DialogTitle>
          <DialogDescription>আপনার কোম্পানির একটি নতুন খরচ যোগ করুন।</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">তারিখ</Label>
            <DatePicker value={date} onSelect={setDate} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">বিবরণ</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">ক্যাটাগরি</Label>
            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., কাঁচামাল" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">পরিমাণ</Label>
            <Input id="amount" type="number" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} required />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'জমা হচ্ছে...' : 'খরচ যোগ করুন'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ExpensesPage() {
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [key, setKey] = useState(0); // To force re-fetch

  const firstDayOfMonth = useMemo(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }, []);

  const expensesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'expenses'),
      orderBy('date', 'desc')
    );
  }, [firestore, key]);

  const { data: allExpenses, isLoading } = useCollection<Expense>(expensesQuery);
  
  const monthlyTotal = useMemo(() => {
    if (!allExpenses) return 0;
    const currentMonthExpenses = allExpenses.filter(
        expense => new Date(expense.date) >= firstDayOfMonth
    );
    return currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [allExpenses, firstDayOfMonth]);


  const handleExpenseAdded = () => {
    setKey(prev => prev + 1);
  }

  return (
    <>
      <AddExpenseDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onExpenseAdded={handleExpenseAdded} />
      <Card>
          <CardHeader className="flex-row justify-between items-center">
              <div>
                  <CardTitle className="flex items-center gap-2">
                      <Wallet2 />
                      খরচের বিবরণ
                  </CardTitle>
                  <CardDescription>
                      আপনার সমস্ত খরচের বিস্তারিত হিসাব দেখুন।
                  </CardDescription>
              </div>
              <Button onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                নতুন খরচ যোগ করুন
              </Button>
          </CardHeader>
          <CardContent>
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <CardDescription>চলতি মাসের মোট খরচ</CardDescription>
                  <CardTitle className="text-3xl text-primary">
                    {isLoading ? <Skeleton className="h-8 w-40" /> : formatCurrency(monthlyTotal)}
                  </CardTitle>
                </CardHeader>
              </Card>

              <div className="rounded-md border">
                  <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>তারিখ</TableHead>
                          <TableHead>বিবরণ</TableHead>
                          <TableHead>ক্যাটাগরি</TableHead>
                          <TableHead className="text-right">পরিমাণ</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {isLoading && Array.from({length: 5}).map((_, i) => (
                          <TableRow key={i}>
                              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                              <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                              <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                          </TableRow>
                      ))}
                      {!isLoading && allExpenses && allExpenses.length > 0 ? (
                      allExpenses.map((expense) => (
                          <TableRow key={expense.id}>
                              <TableCell className="font-medium">{new Date(expense.date).toLocaleDateString('bn-BD')}</TableCell>
                              <TableCell>{expense.description}</TableCell>
                              <TableCell>{expense.category}</TableCell>
                              <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                          </TableRow>
                      ))
                      ) : (
                      !isLoading && (
                          <TableRow>
                              <TableCell colSpan={4} className="h-24 text-center">
                              কোনো খরচের রেকর্ড পাওয়া যায়নি।
                              </TableCell>
                          </TableRow>
                      )
                      )}
                  </TableBody>
                  </Table>
              </div>
          </CardContent>
      </Card>
    </>
  );
}
