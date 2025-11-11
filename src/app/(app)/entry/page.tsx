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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Category } from '@/lib/types';


export default function EntryPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [pieces, setPieces] = useState(0);
  const [rate, setRate] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

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
    if (selectedCategory) {
        setRate(selectedCategory.rate);
    }
  }, [selectedCategory]);

  const handleCategoryChange = (categoryId: string) => {
    const category = categories?.find(c => c.id === categoryId) || null;
    setSelectedCategory(category);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const pieceCount = formData.get('piece-count');
    const categoryId = formData.get('category');
    const categoryName = categories?.find(c => c.id === categoryId)?.name || '';
    const rate = formData.get('rate');
    const date = formData.get('date');

    console.log({ date, pieceCount, category: categoryName, rate, total });

    toast({
      title: 'এন্ট্রি সফল হয়েছে',
      description: `আপনার ${pieceCount} পিস (${categoryName}) এন্ট্রি সফলভাবে জমা হয়েছে। মোট টাকা: ${total}`,
    });

    event.currentTarget.reset();
    setPieces(0);
    setRate(0);
    setSelectedCategory(null);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
    }).format(amount);

  return (
    <div className="flex justify-center items-start pt-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>দৈনিক কাজের এন্ট্রি</CardTitle>
          <CardDescription>
            আপনার দৈনন্দিন কাজের হিসাব জমা দিন।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="date">তারিখ</Label>
              <DatePicker name="date" />
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
                  onChange={(e) => setPieces(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">ক্যাটাগরি</Label>
                <Select name="category" required onValueChange={handleCategoryChange}>
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
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  readOnly={!!selectedCategory}
                  className={selectedCategory ? 'bg-muted' : ''}
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

            <Button type="submit" className="w-full">
              জমা দিন
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
