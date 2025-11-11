'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { useState, useEffect, type ReactNode } from 'react';
import type { Worker, ProductionEntry } from '@/lib/types';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

interface AddProductionEntryDialogProps {
    children: ReactNode;
    workers: Worker[];
    onEntryAdded: (entry: ProductionEntry & { workerName: string }) => void;
}

export function AddProductionEntryDialog({ children, workers, onEntryAdded }: AddProductionEntryDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);
  
  const [workerId, setWorkerId] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [pieceCount, setPieceCount] = useState(0);
  const [overtimeHours, setOvertimeHours] = useState(0);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore || !workerId || !date) {
        toast({
            variant: 'destructive',
            title: 'ফর্ম অসম্পূর্ণ',
            description: 'অনুগ্রহ করে কর্মী এবং তারিখ নির্বাচন করুন।',
        });
        return;
    }

    const selectedWorker = workers.find(w => w.id === workerId);
    if (!selectedWorker) return;

    const entryData = {
      workerId: workerId,
      date: date.toISOString(),
      pieceCount: pieceCount,
      overtimeHours: overtimeHours,
    };

    try {
        const productionEntriesRef = collection(firestore, `workers/${workerId}/productionEntries`);
        const docRef = await addDocumentNonBlocking(productionEntriesRef, entryData);

        const newEntry = {
            id: docRef.id,
            workerName: selectedWorker.name,
            ...entryData,
        };

        onEntryAdded(newEntry);
        
        toast({
            title: 'এন্ট্রি সফল হয়েছে',
            description: `${selectedWorker.name}-এর জন্য ${pieceCount} পিস এন্ট্রি সফলভাবে জমা হয়েছে।`,
        });

        // Reset form and close dialog
        setWorkerId('');
        setDate(new Date());
        setPieceCount(0);
        setOvertimeHours(0);
        setOpen(false);

    } catch (error) {
       console.error("Error adding production entry: ", error);
       toast({
            variant: 'destructive',
            title: 'ত্রুটি',
            description: 'এন্ট্রি জমা দেওয়ার সময় একটি সমস্যা হয়েছে।',
       });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>নতুন উৎপাদন এন্ট্রি</DialogTitle>
          <DialogDescription>
            কর্মীর দৈনিক কাজের হিসাব এখানে যোগ করুন।
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="worker">কর্মী নির্বাচন করুন</Label>
              <Select name="worker" required onValueChange={setWorkerId} value={workerId}>
                <SelectTrigger id="worker">
                    <SelectValue placeholder="একজন কর্মী নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                    {workers.map(worker => (
                        <SelectItem key={worker.id} value={worker.id}>
                            {worker.name} ({worker.designation})
                        </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">তারিখ</Label>
              <DatePicker name="date" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="piece-count">পিস সংখ্যা</Label>
                <Input
                  id="piece-count"
                  name="piece-count"
                  type="number"
                  placeholder="e.g., 120"
                  required
                  value={pieceCount}
                  onChange={(e) => setPieceCount(Number(e.target.value))}
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="overtime-hours">ওভারটাইম (ঘণ্টা)</Label>
                <Input
                  id="overtime-hours"
                  name="overtime-hours"
                  type="number"
                  placeholder="e.g., 2"
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(Number(e.target.value))}
                />
              </div>
            </div>
             <DialogFooter>
                <Button type="submit" className="w-full">
                জমা দিন
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
