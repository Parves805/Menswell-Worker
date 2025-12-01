
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
import { MoreHorizontal, Calendar, Phone, Briefcase, PlusCircle, Trash2, Edit, UserCheck, UserX } from 'lucide-react';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { Worker } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddWorkerDialog } from '@/components/admin/AddWorkerDialog';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function WorkersPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedWorker, setSelectedWorker] = React.useState<Worker | null>(null);

  const workersQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'workers'), orderBy('name')) : null),
    [firestore]
  );
  const { data: workers, isLoading, forceRefetch } = useCollection<Worker>(workersQuery);

  const handleStatusChange = (worker: Worker) => {
    if (!firestore) return;
    const newStatus = worker.status === 'active' ? 'blocked' : 'active';
    const workerDocRef = doc(firestore, 'workers', worker.id);
    updateDocumentNonBlocking(workerDocRef, { status: newStatus });
    toast({
      title: `কর্মী ${newStatus === 'active' ? 'সক্রিয়' : 'ব্লক'} হয়েছে`,
      description: `${worker.name}-এর স্ট্যাটাস পরিবর্তন করা হয়েছে।`,
    });
  };
  
  const prepareToDelete = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsDeleteDialogOpen(true);
  }

  const handleDeleteWorker = () => {
    if (!firestore || !selectedWorker) return;
    const workerDocRef = doc(firestore, 'workers', selectedWorker.id);
    deleteDocumentNonBlocking(workerDocRef);
    toast({
      variant: 'destructive',
      title: 'কর্মী মুছে ফেলা হয়েছে',
      description: `${selectedWorker.name}-কে সিস্টেম থেকে সরিয়ে দেওয়া হয়েছে।`,
    });
    setIsDeleteDialogOpen(false);
    setSelectedWorker(null);
  };
  
  const handleOpenEditDialog = (worker: Worker) => {
      setSelectedWorker(worker);
      setIsEditDialogOpen(true);
  }

  const getStatusVariant = (status: 'active' | 'blocked') => {
      return status === 'active' ? 'default' : 'destructive';
  }


  return (
    <div>
      <AddWorkerDialog isOpen={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onWorkerAdded={forceRefetch}/>
      
      <AddWorkerDialog isOpen={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} onWorkerAdded={forceRefetch} workerToEdit={selectedWorker ?? undefined} />

       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
            <AlertDialogDescription>
              এই পদক্ষেপটি необрати। এটি স্থায়ীভাবে কর্মীকে সিস্টেম থেকে মুছে ফেলবে।
               আপনি কি "{selectedWorker?.name}"-কে মুছে ফেলতে চান?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল করুন</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWorker} className="bg-destructive hover:bg-destructive/90">
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">কর্মী পরিচালনা</h1>
            <p className="text-muted-foreground">
            আপনার ফ্যাক্টরির সকল কর্মীদের তালিকা এবং তথ্য দেখুন।
            </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            নতুন কর্মী যোগ করুন
        </Button>
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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenEditDialog(worker)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>সম্পাদনা</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(worker)}>
                                    {worker.status === 'active' ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                                    <span>{worker.status === 'active' ? 'ব্লক করুন' : 'সক্রিয় করুন'}</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                 <DropdownMenuItem className="text-red-500 focus:bg-red-50 focus:text-red-600" onClick={() => prepareToDelete(worker)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>মুছে ফেলুন</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                        <AvatarImage src={worker.photo} alt={worker.name} />
                        <AvatarFallback>{worker.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className='mt-2'>
                        <CardTitle className="text-lg">{worker.name}</CardTitle>
                        <CardDescription>{worker.designation}</CardDescription>
                         <Badge variant={getStatusVariant(worker.status)} className="mt-2">
                            {worker.status === 'active' ? 'সক্রিয়' : 'ব্লকড'}
                        </Badge>
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
                    <Button variant="default" className="w-full" asChild>
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
