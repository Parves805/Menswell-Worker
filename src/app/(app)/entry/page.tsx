
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Category } from '@/lib/types';


export default function EntryPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const [pieces, setPieces] = useState(0);
  const [rate, setRate] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [date, setDate] = useState<Date|undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categories, isLoading: isLoadingCategories } = useCollection<Category>(categoriesQuery);

  useEffect(() => {
    const calculatedTotal = pieces * rate;
    setTotal(calculatedTotal);
  }, [pieces, rate]);
  
  useEffect(() => {
    if (selectedCategoryId) {
        const category = categories?.find(c => c.id === selectedCategoryId);
        if (category) {
            setRate(category.rate);
        }
    } else {
        setRate(0);
    }
  }, [selectedCategoryId, categories]);


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!date || !user || !selectedCategoryId || pieces <= 0 || !firestore) {
      toast({
        variant: 'destructive',
        title: 'ফর্ম অসম্পূর্ণ',
        description: 'অনুগ্রহ করে তারিখ, ক্যাটাগরি এবং পিসের সংখ্যা পূরণ করুন।',
      });
      return;
    }
    setIsSubmitting(true);

    const category = categories?.find(c => c.id === selectedCategoryId);
    if (!category) {
        toast({ variant: 'destructive', title: 'ক্যাটাগরি পাওয়া যায়নি', description: 'অনুগ্রহ করে একটি সঠিক ক্যাটাগরি নির্বাচন করুন।' });
        setIsSubmitting(false);
        return;
    }

    const newRequest = {
      date: date.toISOString(),
      workerId: user.uid,
      workerName: user.displayName,
      categoryId: selectedCategoryId,
      categoryName: category.name,
      pieceCount: pieces,
      rate,
      total,
      status: 'pending', // Add status for the request
      requestedAt: new Date().toISOString(),
    };
    
    const requestsColRef = collection(firestore, 'productionEntryRequests');

    addDocumentNonBlocking(requestsColRef, newRequest)
        .then(() => {
            toast({
              title: 'অনুরোধ সফল হয়েছে',
              description: `আপনার এন্ট্রির অনুরোধ সফলভাবে পাঠানো হয়েছে।`,
            });
            // Reset form
            setSelectedCategoryId('');
            setPieces(0);
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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="flex justify-center items-start pt-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>দৈনিক কাজের এন্ট্রি</CardTitle>
          <CardDescription>
            আপনার দৈনন্দিন কাজের হিসাব জমা দিন। অ্যাডমিন অনুমোদন করলে এটি চূড়ান্ত হবে।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="date">তারিখ</Label>
              <DatePicker name="date" value={date} onSelect={setDate} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <Label htmlFor="category">ক্যাটাগরি</Label>
                <Select name="category" required onValueChange={setSelectedCategoryId} value={selectedCategoryId}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingCategories ? (
                        <SelectItem value="loading" disabled>লোড হচ্ছে...</SelectItem>
                    ) : (
                        categories?.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                            </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate">দর (প্রতি পিস)</Label>
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
