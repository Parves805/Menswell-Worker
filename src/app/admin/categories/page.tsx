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
import { X, PlusCircle, Shapes } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data, in a real app this would come from Firestore
const initialCategories = ['টি-শার্ট', 'পোলো শার্ট', 'প্যান্ট', 'শার্ট'];

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState(initialCategories);
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
      toast({ title: 'ক্যাটাগরি যোগ হয়েছে', description: `"${newCategory}" সফলভাবে যোগ করা হয়েছে।` });
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setCategories(categories.filter((cat) => cat !== categoryToRemove));
    toast({
      variant: 'destructive',
      title: 'ক্যাটাগরি মুছে ফেলা হয়েছে',
      description: `"${categoryToRemove}" তালিকা থেকে মুছে ফেলা হয়েছে।`,
    });
  };

  return (
    <div className="space-y-6 font-sans">
       <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shapes />
            উৎপাদন ক্যাটাগরি
            </CardTitle>
          <CardDescription>
            কর্মীদের জন্য উপলব্ধ উৎপাদন আইটেম ক্যাটাগরি তালিকা পরিচালনা করুন।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat} className="flex items-center justify-between gap-2 rounded-md border p-2 pl-4">
                <span className="font-medium">{cat}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveCategory(cat)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
             {categories.length === 0 && (
                <div className='text-center text-muted-foreground py-8'>
                    <p>কোনো ক্যাটাগরি পাওয়া যায়নি।</p>
                    <p className='text-sm'>নতুন ক্যাটাগরি যোগ করুন।</p>
                </div>
             )}
          </div>
          <div className="flex items-center gap-2 pt-4">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="নতুন ক্যাটাগরির নাম"
            />
            <Button onClick={handleAddCategory}>
                <PlusCircle className='mr-2 h-4 w-4' />
                যোগ করুন
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
