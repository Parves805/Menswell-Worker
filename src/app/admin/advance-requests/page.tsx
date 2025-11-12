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
import { Check, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  updateDocumentNonBlocking,
  addDocumentNonBlocking,
} from '@/firebase';
import { collection, query, doc, orderBy } from 'firebase/firestore';
import type { AdvancePaymentRequest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
  }).format(amount);

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
                    {request.status}
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

  const { data: allRequests, isLoading } =
    useCollection<AdvancePaymentRequest>(requestsQuery);
    
  const filteredRequests = useMemo(() => {
    if (!allRequests) return null;
    return allRequests.filter(req => req.status === activeTab);
  }, [allRequests, activeTab]);


  const handleApprove = async (request: AdvancePaymentRequest) => {
    if (!firestore) return;
    setProcessingId(request.id);

    const approvedAdvance = {
      date: request.date,
      workerId: request.workerId,
      amount: request.amount,
      deducted: false, // Will be deducted from next salary
    };

    const workerAdvanceColRef = collection(
      firestore,
      'workers',
      request.workerId,
      'advancePayments'
    );
    const requestDocRef = doc(
      firestore,
      'advancePaymentRequests',
      request.id
    );

    try {
      await addDocumentNonBlocking(workerAdvanceColRef, approvedAdvance);

      updateDocumentNonBlocking(requestDocRef, {
        status: 'approved',
        processedAt: new Date().toISOString(),
      });

      toast({
        title: 'অনুরোধ অনুমোদিত হয়েছে',
        description: `${request.workerName}-এর অগ্রিম অনুরোধ সফলভাবে যোগ করা হয়েছে।`,
      });
    } catch (err) {
      console.error('Approval Error:', err);
      toast({
        variant: 'destructive',
        title: 'অনুমোদন ব্যর্থ হয়েছে',
        description: 'অগ্রিম অনুমোদন করার সময় একটি সমস্যা হয়েছে।',
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

      toast({
        variant: 'destructive',
        title: 'অনুরোধ বাতিল করা হয়েছে',
        description: `${request.workerName}-এর অগ্রিম অনুরোধ বাতিল করা হয়েছে।`,
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
    <Card>
      <CardHeader>
        <CardTitle>অগ্রিম টাকার অনুরোধ</CardTitle>
        <CardDescription>
          কর্মীদের পাঠানো অগ্রিম টাকার অনুরোধগুলো অনুমোদন বা বাতিল করুন এবং ইতিহাস
          দেখুন।
        </CardDescription>
      </CardHeader>
      <CardContent>
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
  );
}
