
'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import type { Worker, WorkerExpense } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle } from 'lucide-react';
import { TakaIcon } from '@/components/icons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/DatePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
  }).format(amount);

function AddWorkerExpenseDialog({
  isOpen,
  onOpenChange,
  onExpenseAdded,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onExpenseAdded: () => void;
}) {
  const { toast } = useToast();
  const firestore = useFirestore();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const workersQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'workers'), orderBy('name')) : null),
    [firestore]
  );
  const { data: workers, isLoading: isLoadingWorkers } = useCollection<Worker>(workersQuery);

  const resetForm = () => {
    setDate(new Date());
    setDescription('');
    setAmount(0);
    setSelectedWorkerId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !description || amount <= 0 || !selectedWorkerId || !firestore) {
      toast({
        variant: 'destructive',
        title: 'ফর্ম অসম্পূর্ণ',
        description: 'অনুগ্রহ করে সমস্ত ঘর পূরণ করুন।',
      });
      return;
    }
    setIsSubmitting(true);

    const worker = workers?.find(w => w.id === selectedWorkerId);
    if (!worker) {
        toast({ variant: 'destructive', title: 'কর্মী পাওয়া যায়নি' });
        setIsSubmitting(false);
        return;
    }

    const newExpense: Omit<WorkerExpense, 'id'> = {
      date: date.toISOString(),
      description,
      amount,
      workerId: selectedWorkerId,
      workerName: worker.name,
    };

    try {
      const expenseColRef = collection(firestore, 'workers', selectedWorkerId, 'expenses');
      await addDocumentNonBlocking(expenseColRef, newExpense);
      toast({
        title: 'খরচ যোগ হয়েছে',
        description: `${worker.name}-এর জন্য আপনার খরচ সফলভাবে যোগ করা হয়েছে।`,
      });
      resetForm();
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>কর্মীর খরচ যোগ করুন</DialogTitle>
          <DialogDescription>একজন কর্মীর জন্য একটি নতুন খরচ যোগ করুন।</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="worker">কর্মী</Label>
            <Select name="worker" required onValueChange={setSelectedWorkerId} value={selectedWorkerId}>
              <SelectTrigger id="worker">
                <SelectValue placeholder="কর্মী নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingWorkers ? (
                  <SelectItem value="loading" disabled>লোড হচ্ছে...</SelectItem>
                ) : (
                  workers?.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">তারিখ</Label>
            <DatePicker value={date} onSelect={setDate} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">বিবরণ</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., যাতায়াত ভাড়া" required />
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

export default function WorkerExpensesPage() {
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allExpenses, setAllExpenses] = useState<WorkerExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: workers } = useCollection<Worker>(
    useMemoFirebase(() => firestore ? query(collection(firestore, 'workers'), orderBy('name')) : null, [firestore])
  );

  const fetchExpenses = useCallback(async () => {
    if (!firestore || !workers) {
      if (workers !== undefined) setIsLoading(false);
      return;
    };
    setIsLoading(true);
    try {
        const expenses: WorkerExpense[] = [];
        for (const worker of workers) {
            const expenseQuery = query(
                collection(firestore, 'workers', worker.id, 'expenses'),
                orderBy('date', 'desc')
            );
            const querySnapshot = await getDocs(expenseQuery);
            querySnapshot.forEach(doc => {
                const expenseData = { id: doc.id, ...doc.data() } as WorkerExpense;
                expenses.push(expenseData);
            });
        }
        setAllExpenses(expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch(e) {
        console.error("Failed to fetch worker expenses", e);
    } finally {
        setIsLoading(false);
    }
  }, [firestore, workers]);

  useEffect(() => {
    if (workers) {
      fetchExpenses();
    }
  }, [workers, fetchExpenses]);
  
  const grandTotal = useMemo(() => {
    return allExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [allExpenses]);


  return (
    <div className='space-y-6'>
      <AddWorkerExpenseDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onExpenseAdded={fetchExpenses} />

      <Card>
        <CardHeader className="flex-row justify-between items-center">
            <div>
                <CardTitle className="flex items-center gap-2"><TakaIcon /> কর্মীর খরচ</CardTitle>
                <CardDescription>কর্মীদের প্রদান করা সমস্ত খরচের হিসাব দেখুন।</CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                খরচ যোগ করুন
            </Button>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border">
              <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead>তারিখ</TableHead>
                      <TableHead>কর্মী</TableHead>
                      <TableHead>বিবরণ</TableHead>
                      <TableHead className="text-right">পরিমাণ</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {isLoading && Array.from({length: 5}).map((_, i) => (
                      <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                      </TableRow>
                  ))}
                  {!isLoading && allExpenses.length > 0 ? (
                  allExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                          <TableCell className="font-medium">{new Date(expense.date).toLocaleDateString('bn-BD')}</TableCell>
                          <TableCell>{expense.workerName}</TableCell>
                          <TableCell>{expense.description}</TableCell>
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
                    {!isLoading && allExpenses.length > 0 && (
                         <TableRow className='font-bold bg-muted'>
                            <TableCell colSpan={3}>সর্বমোট</TableCell>
                            <TableCell className="text-right text-primary">{formatCurrency(grandTotal)}</TableCell>
                        </TableRow>
                    )}
              </TableBody>
              </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

