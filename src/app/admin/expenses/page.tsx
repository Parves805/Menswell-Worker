
'use client';

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
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
import { Wallet2, PlusCircle, Download } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
  }).format(amount);

function AddWorkerExpenseDialog({ open, onOpenChange, onExpenseAdded }: { open: boolean, onOpenChange: (open: boolean) => void, onExpenseAdded: () => void }) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [amount, setAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const workersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workers') : null),
    [firestore]
  );
  const { data: workers, isLoading: isLoadingWorkers } = useCollection<Worker>(workersQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !description || !selectedWorkerId || amount <= 0 || !firestore) {
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
      setDescription('');
      setAmount(0);
      setDate(new Date());
      setSelectedWorkerId('');
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
          <DialogTitle>কর্মীর খরচ যোগ করুন</DialogTitle>
          <DialogDescription>একজন কর্মীর জন্য একটি নতুন খরচ যোগ করুন।</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">তারিখ</Label>
            <DatePicker value={date} onSelect={setDate} />
          </div>
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
            <Label htmlFor="description">বিবরণ</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
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
  const [key, setKey] = useState(0); // Key to force re-fetch
  const printRef = useRef<HTMLDivElement>(null);
  
  const [allExpenses, setAllExpenses] = useState<WorkerExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: workers } = useCollection<Worker>(
    useMemoFirebase(() => firestore ? collection(firestore, 'workers') : null, [firestore])
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
                expenses.push({ id: doc.id, ...doc.data() } as WorkerExpense);
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
    fetchExpenses();
  }, [fetchExpenses, key]);
  
  const grandTotal = useMemo(() => {
    return allExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [allExpenses]);


  const handleExpenseAdded = () => {
    setKey(prev => prev + 1); // Increment key to trigger refetch
  }

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;
    
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.opacity = '1';
    element.style.width = '800px';


    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false, 
    });

    element.style.position = 'absolute';
    element.style.left = '0';
    element.style.opacity = '0';
    element.style.width = 'auto';


    const data = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    pdf.addImage(data, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save('খরচের-হিসাব.pdf');
  };

  return (
    <div className='space-y-6'>
      <div ref={printRef} className="p-4 bg-white absolute left-0 top-0 opacity-0 -z-50">
            <div className='text-center mb-2'>
                <h1 className='text-2xl font-bold'>গার্মেন্টফ্লো</h1>
                <p className='text-sm'>১২৩, প্রধান সড়ক, ঢাকা-১২১৬</p>
                <h2 className='text-xl font-bold mt-2'>কর্মীদের খরচের বিস্তারিত হিসাব</h2>
                <p className='text-sm'>রিপোর্টের তারিখ: {new Date().toLocaleDateString('bn-BD')}</p>
            </div>
            
            <Table>
                <TableHeader>
                    <TableRow className='bg-primary text-primary-foreground'>
                        <TableHead className='text-primary-foreground'>তারিখ</TableHead>
                        <TableHead className='text-primary-foreground'>কর্মী</TableHead>
                        <TableHead className='text-primary-foreground'>বিবরণ</TableHead>
                        <TableHead className="text-right text-primary-foreground">পরিমাণ</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allExpenses?.map(expense => (
                        <TableRow key={expense.id}>
                            <TableCell>{new Date(expense.date).toLocaleDateString('bn-BD')}</TableCell>
                            <TableCell>{expense.workerName}</TableCell>
                            <TableCell>{expense.description}</TableCell>
                            <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                        </TableRow>
                    ))}
                    <TableRow className='font-bold bg-muted'>
                        <TableCell colSpan={3}>সর্বমোট</TableCell>
                        <TableCell className="text-right text-primary">{formatCurrency(grandTotal)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
       </div>
      <AddWorkerExpenseDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onExpenseAdded={handleExpenseAdded} />

       <Card>
          <CardHeader className="flex-row justify-between items-center">
              <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2"><Wallet2 /> কর্মীদের খরচ</CardTitle>
                  <CardDescription>
                  কর্মীদের প্রদান করা খরচের বিস্তারিত হিসাব দেখুন এবং নতুন খরচ যোগ করুন।
                  </CardDescription>
              </div>
              <div className='flex gap-2'>
                <Button onClick={() => setIsDialogOpen(true)} variant="default">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    নতুন খরচ
                </Button>
                <Button onClick={handleDownloadPdf} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    PDF ডাউনলোড
                </Button>
              </div>
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
                      {!isLoading && allExpenses && allExpenses.length > 0 ? (
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
