'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/DatePicker';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function RequestAdvancePage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState<Date|undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!date || !user || amount <= 0 || !firestore) {
      toast({
        variant: 'destructive',
        title: 'ফর্ম অসম্পূর্ণ',
        description: 'অনুগ্রহ করে তারিখ এবং টাকার পরিমাণ পূরণ করুন।',
      });
      return;
    }
    setIsSubmitting(true);

    const newRequest = {
      date: date.toISOString(),
      workerId: user.uid,
      workerName: user.displayName,
      amount: amount,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };
    
    const requestsColRef = collection(firestore, 'advancePaymentRequests');

    addDocumentNonBlocking(requestsColRef, newRequest)
        .then(() => {
            toast({
              title: 'অনুরোধ সফল হয়েছে',
              description: `আপনার অগ্রিম টাকার অনুরোধ সফলভাবে পাঠানো হয়েছে।`,
            });
            // Reset form
            setAmount(0);
            setDate(new Date());
        })
        .catch(err => {
            console.error("Error adding document: ", err);
            toast({ variant: 'destructive', title: 'ত্রুটি', description: 'আপনার অনুরোধ পাঠানোর সময় একটি সমস্যা হয়েছে।' });
        })
        .finally(() => {
            setIsSubmitting(false);
        });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(value);

  return (
    <div className="flex justify-center items-start pt-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>অগ্রিম টাকার জন্য অনুরোধ</CardTitle>
          <CardDescription>
            আপনার প্রয়োজনীয় অগ্রিম টাকার পরিমাণ এবং তারিখ উল্লেখ করুন।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="date">তারিখ</Label>
              <DatePicker name="date" value={date} onSelect={setDate} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">টাকার পরিমাণ</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="e.g., 5000"
                required
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
            
            <div className="p-4 bg-muted rounded-md text-center">
                <p className="text-sm text-muted-foreground">অনুরোধকৃত পরিমাণ</p>
                <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'অনুরোধ পাঠানো হচ্ছে...' : 'অনুরোধ পাঠান'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

    