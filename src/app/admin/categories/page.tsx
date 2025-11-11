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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shapes, PlusCircle, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Category } from '@/lib/types';


const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
  }).format(amount);


function AddCategoryDialog({ onCategoryAdded }: { onCategoryAdded: (cat: Category) => void }) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [rate, setRate] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !rate || !firestore) {
            toast({ variant: 'destructive', title: 'ফর্ম অসম্পূর্ণ', description: 'অনুগ্রহ করে নাম এবং দর পূরণ করুন।' });
            return;
        }

        const newCategory = {
            name,
            rate: parseFloat(rate),
            imageUrl: imageUrl || `https://picsum.photos/seed/${name}/100/100`,
        };
        
        addDocumentNonBlocking(collection(firestore, 'categories'), newCategory)
        .then((docRef) => {
            if (docRef) {
                onCategoryAdded({ id: docRef.id, ...newCategory });
                toast({ title: 'ক্যাটাগরি যোগ হয়েছে', description: `"${name}" সফলভাবে যোগ করা হয়েছে।` });
                setOpen(false);
                setName('');
                setRate('');
                setImageUrl('');
            }
        })
        .catch((error) => {
            console.error("Error adding category:", error);
            toast({ variant: 'destructive', title: 'ত্রুটি', description: 'ক্যাটাগরি যোগ করার সময় একটি সমস্যা হয়েছে।' });
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    নতুন ক্যাটাগরি যোগ করুন
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>নতুন ক্যাটাগরি যোগ করুন</DialogTitle>
                    <DialogDescription>
                        একটি নতুন উৎপাদন ক্যাটাগরির ছবি, নাম এবং দর যোগ করুন।
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">নাম</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="ক্যাটাগরির নাম" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="rate" className="text-right">দর (প্রতি পিস)</Label>
                            <Input id="rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="col-span-3" placeholder="e.g., 5.50" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="imageUrl" className="text-right">ছবির URL</Label>
                            <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="col-span-3" placeholder="https://example.com/image.png" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">সংরক্ষণ করুন</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminCategoriesPage() {
  const firestore = useFirestore();
  const categoriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categories, isLoading, error } = useCollection<Category>(categoriesQuery);
  const [liveCategories, setLiveCategories] = useState<Category[]>([]);
  
  React.useEffect(() => {
    if (categories) {
        setLiveCategories(categories);
    }
  }, [categories]);

  const handleCategoryAdded = (newCategory: Category) => {
    setLiveCategories(prev => [...prev, newCategory]);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className='flex items-center gap-2'>
            <Shapes />
            উৎপাদন ক্যাটাগরি
          </CardTitle>
          <CardDescription>
            কর্মীদের জন্য উপলব্ধ উৎপাদন আইটেম ক্যাটাগরি তালিকা পরিচালনা করুন।
          </CardDescription>
        </div>
        <AddCategoryDialog onCategoryAdded={handleCategoryAdded} />
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ছবি</TableHead>
                <TableHead>নাম</TableHead>
                <TableHead>দর (প্রতি পিস)</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    ক্যাটাগরি লোড হচ্ছে...
                  </TableCell>
                </TableRow>
              ) : liveCategories.length > 0 ? (
                liveCategories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={cat.imageUrl} alt={cat.name} />
                        <AvatarFallback>{cat.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell>{formatCurrency(cat.rate)}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">মেনু খুলুন</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>সম্পাদনা করুন</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                মুছে ফেলুন
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
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
  );
}
