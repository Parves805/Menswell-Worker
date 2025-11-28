
'use client';

import React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Calendar, Phone, Briefcase } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Worker } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function WorkersPage() {
  const firestore = useFirestore();

  const workersQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'workers'), orderBy('name')) : null),
    [firestore]
  );
  const { data: workers, isLoading } = useCollection<Worker>(workersQuery);

  return (
    <div>
       <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">কর্মী পরিচালনা</h1>
        <p className="text-muted-foreground">
          আপনার ফ্যাক্টরির সকল কর্মীদের তালিকা এবং তথ্য দেখুন।
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="flex flex-col">
                <CardHeader className="items-center text-center">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className='w-full space-y-2 mt-2'>
                        <Skeleton className="h-6 w-3/4 mx-auto" />
                        <Skeleton className="h-4 w-1/2 mx-auto" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && workers && workers.length > 0 && (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {workers.map((worker) => (
            <Card key={worker.id} className="flex flex-col overflow-hidden">
                <CardHeader className="items-center text-center bg-muted/30 p-6 relative">
                     <div className="absolute top-2 right-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                    <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                        <AvatarImage src={worker.photo} alt={worker.name} />
                        <AvatarFallback>{worker.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className='mt-2'>
                        <CardTitle className="text-lg">{worker.name}</CardTitle>
                        <CardDescription>{worker.designation}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow p-6 space-y-3 text-sm">
                   <div className="flex items-center gap-3 text-muted-foreground">
                        <Briefcase className="h-4 w-4 text-primary"/>
                        <span>বিভাগ: <span className="font-medium text-foreground">{worker.department}</span></span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Calendar className="h-4 w-4 text-primary"/>
                        <span>যোগদান: <span className="font-medium text-foreground">{new Date(worker.joinDate).toLocaleDateString('bn-BD')}</span></span>
                    </div>
                     <div className="flex items-center gap-3 text-muted-foreground">
                        <Phone className="h-4 w-4 text-primary"/>
                        <span>যোগাযোগ: <span className="font-medium text-foreground">{worker.contact}</span></span>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/30 p-3">
                    <Button variant="secondary" className="w-full" asChild>
                        <Link href={`/admin/workers/${worker.id}`}>প্রোফাইল দেখুন</Link>
                    </Button>
                </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && (!workers || workers.length === 0) && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed h-96">
            <h3 className="text-xl font-semibold text-muted-foreground">কোনো কর্মীর তথ্য পাওয়া যায়নি</h3>
            <p className="text-sm text-muted-foreground mt-2">আপনি নতুন কর্মী যোগ করলে তা এখানে দেখা যাবে।</p>
        </div>
      )}
    </div>
  );
}
