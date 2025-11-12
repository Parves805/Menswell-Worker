
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
import { PlusCircle, Trash2, Image as ImageIcon } from 'lucide-react';
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
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import type { SliderImage } from '@/lib/types';
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
import { Textarea } from '@/components/ui/textarea';

function AddSliderDialog({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title || !imageUrl || !firestore) {
      toast({ variant: 'destructive', title: 'ফর্ম অসম্পূর্ণ', description: 'অনুগ্রহ করে শিরোনাম এবং ছবির URL দিন।' });
      return;
    }
    setIsSubmitting(true);
    
    const newSlider = {
      title,
      description,
      imageUrl,
      link,
      createdAt: serverTimestamp(),
    };

    addDocumentNonBlocking(collection(firestore, 'sliderImages'), newSlider)
      .then(docRef => {
        if (docRef) {
            toast({ title: 'স্লাইড যোগ হয়েছে', description: `স্লাইড "${title}" সফলভাবে যোগ করা হয়েছে।` });
            onOpenChange(false);
            setTitle('');
            setDescription('');
            setImageUrl('');
            setLink('');
        }
      })
      .catch((error) => {
        console.error("Error adding slider: ", error);
        toast({ variant: 'destructive', title: 'ত্রুটি', description: 'স্লাইড যোগ করতে সমস্যা হয়েছে।' });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>নতুন স্লাইড যোগ করুন</DialogTitle>
            <DialogDescription>
              ব্যবহারকারী ড্যাশবোর্ডে দেখানোর জন্য একটি নতুন স্লাইড যোগ করুন।
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">শিরোনাম</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="স্লাইডের শিরোনাম" required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="description">ছোট বর্ণনা</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="স্লাইড সম্পর্কে সংক্ষিপ্ত বর্ণনা" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">ছবির URL</Label>
              <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">লিঙ্ক (ঐচ্ছিক)</Label>
              <Input id="link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://example.com" />
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

export default function SliderPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const sliderImagesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'sliderImages') : null),
    [firestore]
  );
  const { data: sliderImages, isLoading } = useCollection<SliderImage>(sliderImagesQuery);

  const handleDeleteSlider = (sliderId: string) => {
    if (!firestore) return;
    
    const docRef = doc(firestore, 'sliderImages', sliderId);
    deleteDocumentNonBlocking(docRef);

    toast({
        title: 'স্লাইড মুছে ফেলা হয়েছে',
        description: 'স্লাইডটি সফলভাবে মুছে ফেলা হয়েছে।',
        variant: 'destructive'
    });
  }

  return (
    <>
      <AddSliderDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
      <Card>
        <CardHeader className="flex-row justify-between items-center">
            <div>
                <CardTitle>স্লাইডার ম্যানেজমেন্ট</CardTitle>
                <CardDescription>
                    ব্যবহারকারী ড্যাশবোর্ডের স্লাইডার পরিচালনা করুন।
                </CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                নতুন স্লাইড যোগ করুন
            </Button>
        </CardHeader>
        <CardContent>
           <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ছবি</TableHead>
                  <TableHead>শিরোনাম</TableHead>
                  <TableHead>বর্ণনা</TableHead>
                  <TableHead className="text-right">কার্যকলাপ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && Array.from({length: 3}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-12 w-20 rounded-md" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                ))}
                {!isLoading && sliderImages?.map(slider => (
                    <TableRow key={slider.id}>
                        <TableCell>
                            <Avatar className="h-12 w-20 rounded-md">
                                <AvatarImage src={slider.imageUrl} alt={slider.title} className="object-cover" />
                                <AvatarFallback className="rounded-md"><ImageIcon /></AvatarFallback>
                            </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{slider.title}</TableCell>
                        <TableCell className="text-muted-foreground">{slider.description}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSlider(slider.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
                {!isLoading && (!sliderImages || sliderImages.length === 0) && (
                     <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                        কোনো স্লাইড পাওয়া যায়নি।
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
