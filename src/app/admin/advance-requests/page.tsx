
'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, PlusCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  updateDocumentNonBlocking,
  addDocumentNonBlocking,
} from '@/firebase';
import { collection, query, doc, orderBy } from 'firebase/firestore';
import type { AdvancePaymentRequest, WorkerExpense, Worker } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
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
import { DatePicker } from '@/components/DatePicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
  }).format(amount);

function AddDirectExpenseDialog({
  isOpen,
  onOpenChange,
  onExpenseAdded,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onExpenseAdded: () => void;
}) {
  const { toast } = useToast();
  const firestore = useFirestore();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const workersQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'workers'), orderBy('name')) : null),
    [firestore]
  );
  const { data: workers, isLoading: isLoadingWorkers } = useCollection<Worker>(workersQuery);

  const resetForm = () => {
    setDate(new Date());
    setDescription('');
    setAmount(0);
    setSelectedWorkerId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !description || amount <= 0 || !selectedWorkerId || !firestore) {
      toast({
        variant: 'destructive',
        title: 'ফর্ম অসম্পূর্ণ',
        description: 'অনুগ্রহ করে সমস্ত ঘর পূরণ করুন।',
      });
      return;
    }
    setIsSubmitting(true);

    const worker = workers?.find(w => w.id === selectedWorkerId);
    if (!worker) {
      toast({ variant: 'destructive', title: 'কর্মী পাওয়া যায়নি' });
      setIsSubmitting(false);
      return;
    }

    const newExpense: Omit<WorkerExpense, 'id'> = {
      date: date.toISOString(),
      description,
      amount,
      workerId: selectedWorkerId,
      workerName: worker.name,
    };

    try {
      const expenseColRef = collection(firestore, 'workers', selectedWorkerId, 'expenses');
      await addDocumentNonBlocking(expenseColRef, newExpense);
      
      const notificationMessage = `${worker.name}-কে ${formatCurrency(amount)} টাকা (${description}) প্রদান করা হয়েছে।`;
      toast({
        title: 'খরচ প্রদান সফল',
        description: notificationMessage,
      });

      const notificationsCol = collection(firestore, 'workers', selectedWorkerId, 'notifications');
      addDocumentNonBlocking(notificationsCol, {
        workerId: selectedWorkerId,
        title: 'খরচ প্রদান করা হয়েছে',
        message: `আপনাকে "${description}" বাবদ ${formatCurrency(amount)} প্রদান করা হয়েছে।`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      resetForm();
      onExpenseAdded();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: 'খরচ যোগ করার সময় একটি সমস্যা হয়েছে।',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>সরাসরি খরচ প্রদান করুন</DialogTitle>
          <DialogDescription>একজন কর্মীর জন্য একটি নতুন খরচ যোগ করুন। এটি সরাসরি কর্মীর হিসাবে যুক্ত হবে।</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="worker">কর্মী</Label>
            <Select name="worker" required onValueChange={setSelectedWorkerId} value={selectedWorkerId}>
              <SelectTrigger id="worker">
                <SelectValue placeholder="কর্মী নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingWorkers ? (
                  <SelectItem value="loading" disabled>লোড হচ্ছে...</SelectItem>
                ) : (
                  workers?.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">তারিখ</Label>
            <DatePicker value={date} onSelect={setDate} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">বিবরণ</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., যাতায়াত ভাড়া" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">পরিমাণ</Label>
            <Input id="amount" type="number" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} required />
          </div>
          <DialogFooter className="pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'জমা হচ্ছে...' : 'খরচ যোগ করুন'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


function RequestsTable({
  requests,
  isLoading,
  onApprove,
  onReject,
  processingId,
}: {
  requests: AdvancePaymentRequest[] | null;
  isLoading: boolean;
  onApprove: (request: AdvancePaymentRequest) => void;
  onReject: (request: AdvancePaymentRequest) => void;
  processingId: string | null;
}) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusInBangla = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'pending':
        return 'বিচারাধীন';
      case 'approved':
        return 'অনুমোদিত';
      case 'rejected':
        return 'বাতিল';
      default:
        return status;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>কর্মী</TableHead>
            <TableHead>তারিখ</TableHead>
            <TableHead>স্ট্যাটাস</TableHead>
            <TableHead className="text-right">পরিমাণ</TableHead>
            <TableHead className="text-center">কার্যকলাপ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-5 w-16 ml-auto" />
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          {!isLoading && requests?.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                এই বিভাগে কোনো অনুরোধ পাওয়া যায়নি।
              </TableCell>
            </TableRow>
          )}
          {!isLoading &&
            requests?.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">
                  {request.workerName}
                </TableCell>
                <TableCell>
                  {new Date(request.date).toLocaleDateString('bn-BD')}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(request.status)}>
                    {getStatusInBangla(request.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(request.amount)}
                </TableCell>
                <TableCell className="text-center">
                  {request.status === 'pending' ? (
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200 hover:border-green-300"
                        onClick={() => onApprove(request)}
                        disabled={processingId === request.id}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 hover:border-red-300"
                        onClick={() => onReject(request)}
                        disabled={processingId === request.id}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function AdvanceRequestsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [activeTab, setActiveTab] =
    useState<'pending' | 'approved' | 'rejected'>('pending');

  const requestsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'advancePaymentRequests'),
            orderBy('requestedAt', 'desc')
          )
        : null,
    [firestore]
  );

  const { data: allRequests, isLoading, forceRefetch } =
    useCollection<AdvancePaymentRequest>(requestsQuery);
    
  const filteredRequests = useMemo(() => {
    if (!allRequests) return null;
    return allRequests.filter(req => req.status === activeTab);
  }, [allRequests, activeTab]);

  const sendNotification = (workerId: string, title: string, message: string) => {
    if (!firestore) return;
    const notificationsCol = collection(firestore, 'workers', workerId, 'notifications');
    addDocumentNonBlocking(notificationsCol, {
      workerId,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  };

  const handleApprove = async (request: AdvancePaymentRequest) => {
    if (!firestore) return;
    setProcessingId(request.id);

    const workerExpense: Omit<WorkerExpense, 'id'> = {
      date: request.date,
      workerId: request.workerId,
      workerName: request.workerName,
      amount: request.amount,
      description: request.description || `অনুমোদিত খরচের অনুরোধ`,
    };

    const workerExpenseColRef = collection(
      firestore,
      'workers',
      request.workerId,
      'expenses'
    );
    const requestDocRef = doc(
      firestore,
      'advancePaymentRequests',
      request.id
    );

    try {
      await addDocumentNonBlocking(workerExpenseColRef, workerExpense);

      updateDocumentNonBlocking(requestDocRef, {
        status: 'approved',
        processedAt: new Date().toISOString(),
      });
      
      sendNotification(
        request.workerId,
        'খরচের অনুরোধ অনুমোদিত',
        `আপনার ${formatCurrency(request.amount)} টাকার খরচের অনুরোধটি অনুমোদিত হয়েছে।`
      );

      toast({
        title: 'অনুরোধ অনুমোদিত হয়েছে',
        description: `${request.workerName}-এর খরচের অনুরোধ সফলভাবে যোগ করা হয়েছে।`,
      });
    } catch (err) {
      console.error('Approval Error:', err);
      toast({
        variant: 'destructive',
        title: 'অনুমোদন ব্যর্থ হয়েছে',
        description: 'খরচের অনুরোধ অনুমোদন করার সময় একটি সমস্যা হয়েছে।',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request: AdvancePaymentRequest) => {
    if (!firestore) return;
    setProcessingId(request.id);

    const requestDocRef = doc(
      firestore,
      'advancePaymentRequests',
      request.id
    );

    try {
      updateDocumentNonBlocking(requestDocRef, {
        status: 'rejected',
        processedAt: new Date().toISOString(),
      });

      sendNotification(
        request.workerId,
        'খরচের অনুরোধ বাতিল হয়েছে',
        `আপনার ${formatCurrency(request.amount)} টাকার খরচের অনুরোধটি বাতিল করা হয়েছে।`
      );

      toast({
        variant: 'destructive',
        title: 'অনুরোধ বাতিল করা হয়েছে',
        description: `${request.workerName}-এর অনুরোধ বাতিল করা হয়েছে।`,
      });
    } catch (err) {
      console.error('Rejection Error:', err);
      toast({
        variant: 'destructive',
        title: 'বাতিল করতে সমস্যা হয়েছে',
        description: 'অনুরোধটি বাতিল করার সময় একটি সমস্যা হয়েছে।',
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
    <AddDirectExpenseDialog
      isOpen={isExpenseDialogOpen}
      onOpenChange={setIsExpenseDialogOpen}
      onExpenseAdded={forceRefetch}
    />
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 md:p-6">
        <div>
          <CardTitle>খরচের অনুরোধ</CardTitle>
          <CardDescription className="mt-1">
            কর্মীদের পাঠানো খরচের অনুরোধগুলো অনুমোদন বা বাতিল করুন।
          </CardDescription>
        </div>
        <Button onClick={() => setIsExpenseDialogOpen(true)} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          নতুন খরচ যোগ করুন
        </Button>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <Tabs
          defaultValue="pending"
          onValueChange={(value) =>
            setActiveTab(value as 'pending' | 'approved' | 'rejected')
          }
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">বিচারাধীন</TabsTrigger>
            <TabsTrigger value="approved">অনুমোদিত</TabsTrigger>
            <TabsTrigger value="rejected">বাতিল</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <RequestsTable
              requests={filteredRequests}
              isLoading={isLoading}
              onApprove={handleApprove}
              onReject={handleReject}
              processingId={processingId}
            />
          </TabsContent>
          <TabsContent value="approved">
            <RequestsTable
              requests={filteredRequests}
              isLoading={isLoading}
              onApprove={handleApprove}
              onReject={handleReject}
              processingId={processingId}
            />
          </TabsContent>
          <TabsContent value="rejected">
            <RequestsTable
              requests={filteredRequests}
              isLoading={isLoading}
              onApprove={handleApprove}
              onReject={handleReject}
              processingId={processingId}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    </>
  );
}
