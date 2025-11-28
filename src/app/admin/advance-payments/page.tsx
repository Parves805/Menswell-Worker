
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
import type { Worker, AdvancePayment } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Landmark } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase';


const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
  }).format(amount);

function GiveAdvanceDialog({
  isOpen,
  onOpenChange,
  onAdvanceGiven,
  worker,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdvanceGiven: () => void;
  worker: Worker | null;
}) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: adminUser } = useUser();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [amount, setAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAmount(0);
      setDate(new Date());
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || amount <= 0 || !worker || !firestore) {
      toast({
        variant: 'destructive',
        title: 'ফর্ম অসম্পূর্ণ',
        description: 'অনুগ্রহ করে তারিখ এবং টাকার পরিমাণ পূরণ করুন।',
      });
      return;
    }
    setIsSubmitting(true);

    const newAdvance: Omit<AdvancePayment, 'id'> = {
      date: date.toISOString(),
      amount,
      workerId: worker.id,
      deducted: false,
    };

    try {
      const advanceColRef = collection(firestore, 'workers', worker.id, 'advancePayments');
      await addDocumentNonBlocking(advanceColRef, newAdvance);
      toast({
        title: 'অগ্রিম প্রদান সফল হয়েছে',
        description: `${worker.name}-কে ${formatCurrency(amount)} সফলভাবে প্রদান করা হয়েছে।`,
      });
      
      onAdvanceGiven();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: 'অগ্রিম প্রদান করার সময় একটি সমস্যা হয়েছে।',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>অগ্রিম প্রদান করুন</DialogTitle>
          <DialogDescription>
            {worker?.name}-কে অগ্রিম টাকা প্রদান করুন।
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">তারিখ</Label>
            <DatePicker value={date} onSelect={setDate} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">পরিমাণ</Label>
            <Input id="amount" type="number" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} required />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'জমা হচ্ছে...' : 'জমা দিন'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdvancePaymentsPage() {
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allAdvances, setAllAdvances] = useState<AdvancePayment[]>([]);
  const [workerAdvances, setWorkerAdvances] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  const { data: workers, isLoading: isLoadingWorkers } = useCollection<Worker>(
    useMemoFirebase(() => firestore ? query(collection(firestore, 'workers'), orderBy('name')) : null, [firestore])
  );

  const fetchAdvances = useCallback(async () => {
    if (!firestore || !workers) {
      if (workers !== undefined) setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const advances: AdvancePayment[] = [];
      const workerAdvanceMap = new Map<string, number>();
      
      for (const worker of workers) {
        let totalAdvance = 0;
        const advanceQuery = query(
          collection(firestore, 'workers', worker.id, 'advancePayments'),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(advanceQuery);
        querySnapshot.forEach(doc => {
          const data = doc.data();
          advances.push({ id: doc.id, workerName: worker.name, ...data } as AdvancePayment);
          totalAdvance += data.amount || 0;
        });
        workerAdvanceMap.set(worker.id, totalAdvance);
      }
      setAllAdvances(advances.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setWorkerAdvances(workerAdvanceMap);
    } catch (e) {
      console.error("Failed to fetch advance payments", e);
    } finally {
      setIsLoading(false);
    }
  }, [firestore, workers]);

  useEffect(() => {
    fetchAdvances();
  }, [fetchAdvances]);

  const handleOpenDialog = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsDialogOpen(true);
  }

  return (
    <div className='space-y-6'>
      <GiveAdvanceDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onAdvanceGiven={fetchAdvances}
        worker={selectedWorker} 
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Landmark /> অগ্রিম প্রদান</CardTitle>
          <CardDescription>কর্মীদের অগ্রিম টাকা প্রদান করুন এবং সকল হিসাব দেখুন।</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>কর্মী</TableHead>
                  <TableHead>পদবি</TableHead>
                  <TableHead className="text-right">মোট অগ্রিম</TableHead>
                  <TableHead className="text-right">কার্যকলাপ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(isLoading || isLoadingWorkers) && Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-9 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))}
                {!isLoading && !isLoadingWorkers && workers?.map(worker => (
                  <TableRow key={worker.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={worker.photo} alt={worker.name} />
                          <AvatarFallback>{worker.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{worker.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{worker.designation}</TableCell>
                    <TableCell className="text-right">{formatCurrency(workerAdvances.get(worker.id) || 0)}</TableCell>
                    <TableCell className="text-right">
                      <Button onClick={() => handleOpenDialog(worker)}>অগ্রিম দিন</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <CardTitle className="text-lg mb-2 mt-8">সকল অগ্রিম প্রদানের তালিকা</CardTitle>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>তারিখ</TableHead>
                  <TableHead>কর্মী</TableHead>
                  <TableHead className="text-right">পরিমাণ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))}
                {!isLoading && allAdvances.length > 0 ? (
                  allAdvances.map((advance) => (
                    <TableRow key={advance.id}>
                      <TableCell className="font-medium">{new Date(advance.date).toLocaleDateString('bn-BD')}</TableCell>
                      <TableCell>{advance.workerName}</TableCell>
                      <TableCell className="text-right">{formatCurrency(advance.amount)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  !isLoading && (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        কোনো অগ্রিম প্রদানের রেকর্ড পাওয়া যায়নি।
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
