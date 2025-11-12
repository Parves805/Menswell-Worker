'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Image as ImageIcon, Trash2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Category } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
  }).format(amount);

function AddCategoryDialog({
  isOpen,
  onOpenChange,
  onCategoryAdded,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryAdded: (category: Category) => void;
}) {
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || !rate || !firestore) {
      toast({ variant: 'destructive', title: 'ফর্ম অসম্পূর্ণ', description: 'অনুগ্রহ করে সমস্ত ঘর পূরণ করুন।' });
      return;
    }
    setIsSubmitting(true);
    
    const newCategory = {
      name,
      rate: parseFloat(rate),
      imageUrl: imageUrl || `https://picsum.photos/seed/${name}/400/300`,
    };

    addDocumentNonBlocking(collection(firestore, 'categories'), newCategory)
      .then(docRef => {
        if (docRef) {
            onCategoryAdded({ id: docRef.id, ...newCategory });
            toast({ title: 'ক্যাটাগরি যোগ হয়েছে', description: `"${name}" সফলভাবে যোগ করা হয়েছে।` });
            onOpenChange(false);
            setName('');
            setRate('');
            setImageUrl('');
        }
      })
      .catch((error) => {
        console.error("Error adding category: ", error);
        toast({ variant: 'destructive', title: 'ত্রুটি', description: 'ক্যাটাগরি যোগ করতে সমস্যা হয়েছে।' });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>নতুন ক্যাটাগরি যোগ করুন</DialogTitle>
            <DialogDescription>
              একটি নতুন উৎপাদন ক্যাটাগরি এবং তার প্রতি পিসের দর যোগ করুন।
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">নাম</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="e.g., টি-শার্ট" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rate" className="text-right">দর (প্রতি পিস)</Label>
              <Input id="rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="col-span-3" placeholder="e.g., 5.50" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right">ছবির URL</Label>
              <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="col-span-3" placeholder="ঐচ্ছিক" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'জমা হচ্ছে...' : 'জমা দিন'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const categoriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categories, isLoading, error } = useCollection<Category>(categoriesQuery);
  const [localCategories, setLocalCategories] = useState<Category[] | null>(null);

  React.useEffect(() => {
      if(categories) {
          setLocalCategories(categories);
      }
  }, [categories]);

  const handleCategoryAdded = (newCategory: Category) => {
    setLocalCategories(prev => (prev ? [newCategory, ...prev] : [newCategory]));
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!firestore) return;
    
    const docRef = doc(firestore, 'categories', categoryId);
    deleteDocumentNonBlocking(docRef);

    setLocalCategories(prev => prev?.filter(cat => cat.id !== categoryId) || null);
    toast({
        title: 'ক্যাটাগরি মুছে ফেলা হয়েছে',
        description: 'ক্যাটাগরিটি সফলভাবে মুছে ফেলা হয়েছে।',
    });
  }

  return (
    <>
      <AddCategoryDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCategoryAdded={handleCategoryAdded}
      />
      <Card>
        <CardHeader className="flex-row justify-between items-center">
            <div>
                <CardTitle>উৎপাদন ক্যাটাগরি</CardTitle>
                <CardDescription>
                    নতুন ক্যাটাগরি যোগ করুন এবং বর্তমানগুলো পরিচালনা করুন।
                </CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                নতুন ক্যাটাগরি যোগ করুন
            </Button>
        </CardHeader>
        <CardContent>
           <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ছবি</TableHead>
                  <TableHead>নাম</TableHead>
                  <TableHead>দর (প্রতি পিস)</TableHead>
                  <TableHead className="text-right">פעולה</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && Array.from({length: 3}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                ))}
                {!isLoading && localCategories?.map(cat => (
                    <TableRow key={cat.id}>
                        <TableCell>
                            <Avatar className="h-12 w-12 rounded-md">
                                <AvatarImage src={cat.imageUrl} alt={cat.name} className="object-cover" />
                                <AvatarFallback><ImageIcon /></AvatarFallback>
                            </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{cat.name}</TableCell>
                        <TableCell>{formatCurrency(cat.rate)}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
                {!isLoading && (!localCategories || localCategories.length === 0) && (
                     <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                        কোনো ক্যাটাগরি পাওয়া যায়নি।
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
           </div>
        </CardContent>
      </Card>
    </>
  );
}
