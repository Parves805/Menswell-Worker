
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/DatePicker';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Category, Worker } from '@/lib/types';

interface AddProductionEntryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEntryAdded: (entry: any) => void;
  workerId?: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
  }).format(amount);

export function AddProductionEntryDialog({
  isOpen,
  onOpenChange,
  onEntryAdded,
  workerId,
}: AddProductionEntryDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedWorkerId, setSelectedWorkerId] = useState(workerId || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [pieces, setPieces] = useState(0);
  const [rate, setRate] = useState(0);
  const [total, setTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const workersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workers') : null),
    [firestore]
  );
  const { data: workers, isLoading: isLoadingWorkers } = useCollection<Worker>(workersQuery);

  const categoriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categories, isLoading: isLoadingCategories } = useCollection<Category>(categoriesQuery);

  useEffect(() => {
    if (workerId) setSelectedWorkerId(workerId);
  }, [workerId]);

  useEffect(() => {
    const calculatedTotal = pieces * rate;
    setTotal(calculatedTotal);
  }, [pieces, rate]);

  useEffect(() => {
    if (selectedCategoryId && categories) {
      const category = categories.find(c => c.id === selectedCategoryId);
      if (category) {
        setRate(category.rate);
      }
    } else {
      setRate(0);
    }
  }, [selectedCategoryId, categories]);

  const resetForm = () => {
    setDate(new Date());
    if (!workerId) setSelectedWorkerId('');
    setSelectedCategoryId('');
    setPieces(0);
    setRate(0);
    setTotal(0);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!date || !selectedWorkerId || !selectedCategoryId || pieces <= 0 || !firestore) {
      toast({
        variant: 'destructive',
        title: 'ফর্ম অসম্পূর্ণ',
        description: 'অনুগ্রহ করে সমস্ত প্রয়োজনীয় তথ্য পূরণ করুন।',
      });
      return;
    }
    setIsSubmitting(true);

    const worker = workers?.find(w => w.id === selectedWorkerId);
    const category = categories?.find(c => c.id === selectedCategoryId);

    if (!worker || !category) {
      toast({ variant: 'destructive', title: 'ডেটা পাওয়া যায়নি', description: 'কর্মী বা ক্যাটাগরি নির্বাচন করা যায়নি।' });
      setIsSubmitting(false);
      return;
    }

    const newEntry = {
      date: date.toISOString(),
      workerId: selectedWorkerId,
      workerName: worker.name,
      categoryId: selectedCategoryId,
      categoryName: category.name,
      pieceCount: pieces,
      rate,
      total,
      categoryImageUrl: category.imageUrl || '',
    };
    
    const entriesColRef = collection(firestore, 'workers', selectedWorkerId, 'productionEntries');

    addDocumentNonBlocking(entriesColRef, newEntry)
        .then(() => {
            onEntryAdded(newEntry);
            toast({
                title: 'এন্ট্রি সফল হয়েছে',
                description: `${worker.name}-এর জন্য ${pieces} পিস এন্ট্রি জমা হয়েছে।`,
            });
            resetForm();
            onOpenChange(false);
        }).catch(err => {
             toast({ variant: 'destructive', title: 'ত্রুটি', description: 'এন্ট্রি জমা দেওয়ার সময় সমস্যা হয়েছে।' });
        }).finally(() => {
            setIsSubmitting(false);
        })
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>নতুন উৎপাদন এন্ট্রি</DialogTitle>
          <DialogDescription>
            একজন কর্মীর জন্য দৈনিক কাজের হিসাব যোগ করুন।
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-2">
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
                <Label htmlFor="date">তারিখ</Label>
                <DatePicker name="date" value={date} onSelect={setDate} />
            </div>

            {!workerId && (
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
            )}
            
            <div className="space-y-2">
                <Label htmlFor="category">ক্যাটাগরি</Label>
                <Select name="category" required onValueChange={setSelectedCategoryId} value={selectedCategoryId}>
                <SelectTrigger id="category">
                    <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                    {isLoadingCategories ? (
                    <SelectItem value="loading" disabled>লোড হচ্ছে...</SelectItem>
                    ) : (
                    categories?.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)
                    )}
                </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="piece-count">পিস</Label>
                <Input
                    id="piece-count"
                    name="piece-count"
                    type="number"
                    placeholder="e.g., 120"
                    required
                    value={pieces || ''}
                    onChange={(e) => setPieces(Number(e.target.value))}
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="rate">দর</Label>
                <Input
                    id="rate"
                    name="rate"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 5.5"
                    required
                    value={rate || ''}
                    onChange={(e) => setRate(Number(e.target.value))}
                    readOnly={!!selectedCategoryId}
                    className={selectedCategoryId ? 'bg-muted' : ''}
                />
                </div>
            </div>
            
            <div className="space-y-2">
                <Label>মোট টাকা</Label>
                <Input
                    id="total"
                    name="total"
                    type="text"
                    value={formatCurrency(total)}
                    readOnly
                    className="font-bold bg-muted"
                />
                </div>

            <DialogFooter className="pt-2 sticky bottom-0 bg-background pb-0 -mb-4">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'জমা হচ্ছে...' : 'জমা দিন'}
                </Button>
            </DialogFooter>
            </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
