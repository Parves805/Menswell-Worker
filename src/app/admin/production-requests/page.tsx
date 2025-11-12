'use client';

import React, { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  updateDocumentNonBlocking,
  addDocumentNonBlocking,
} from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import type { ProductionEntryRequest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
  }).format(amount);

export default function ProductionRequestsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const requestsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'productionEntryRequests'),
            where('status', '==', 'pending')
          )
        : null,
    [firestore]
  );

  const {
    data: requests,
    isLoading,
    error,
  } = useCollection<ProductionEntryRequest>(requestsQuery);

  const handleApprove = async (request: ProductionEntryRequest) => {
    if (!firestore) return;
    setProcessingId(request.id);

    const approvedEntry = {
      date: request.date,
      workerId: request.workerId,
      workerName: request.workerName,
      categoryId: request.categoryId,
      categoryName: request.categoryName,
      pieceCount: request.pieceCount,
      rate: request.rate,
      total: request.total,
    };

    const workerEntriesRef = collection(
      firestore,
      'workers',
      request.workerId,
      'productionEntries'
    );
    const requestDocRef = doc(
      firestore,
      'productionEntryRequests',
      request.id
    );

    try {
      // Add the approved entry to the worker's production entries
      await addDocumentNonBlocking(workerEntriesRef, approvedEntry);

      // Update the request status to 'approved'
      updateDocumentNonBlocking(requestDocRef, {
        status: 'approved',
        processedAt: new Date().toISOString(),
      });

      toast({
        title: 'অনুরোধ অনুমোদিত হয়েছে',
        description: `${request.workerName}-এর এন্ট্রি সফলভাবে যোগ করা হয়েছে।`,
      });
    } catch (err) {
      console.error('Approval Error:', err);
      toast({
        variant: 'destructive',
        title: 'অনুমোদন ব্যর্থ হয়েছে',
        description: 'এন্ট্রি অনুমোদন করার সময় একটি সমস্যা হয়েছে।',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request: ProductionEntryRequest) => {
    if (!firestore) return;
    setProcessingId(request.id);

    const requestDocRef = doc(
      firestore,
      'productionEntryRequests',
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
        description: `${request.workerName}-এর এন্ট্রি বাতিল করা হয়েছে।`,
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
        <CardTitle>উৎপাদন এন্ট্রি অনুরোধ</CardTitle>
        <CardDescription>
          কর্মীদের পাঠানো কাজের অনুরোধগুলো অনুমোদন বা বাতিল করুন।
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>কর্মী</TableHead>
                <TableHead>তারিখ</TableHead>
                <TableHead>ক্যাটাগরি</TableHead>
                <TableHead className="text-center">পিস</TableHead>
                <TableHead className="text-right">মোট টাকা</TableHead>
                <TableHead className="text-center">কার্যকলাপ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    অনুরোধ লোড হচ্ছে...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && requests?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    কোনো বিচারাধীন অনুরোধ পাওয়া যায়নি।
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
                      <Badge variant="outline">{request.categoryName}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {request.pieceCount}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(request.total)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200 hover:border-green-300"
                          onClick={() => handleApprove(request)}
                          disabled={processingId === request.id}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 hover:border-red-300"
                          onClick={() => handleReject(request)}
                          disabled={processingId === request.id}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
