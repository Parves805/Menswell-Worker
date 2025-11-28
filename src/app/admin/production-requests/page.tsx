
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  updateDocumentNonBlocking,
  addDocumentNonBlocking,
} from '@/firebase';
import { collection, query, doc, orderBy, getDoc } from 'firebase/firestore';
import type { ProductionEntryRequest, Category } from '@/lib/types';
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
  requests: ProductionEntryRequest[] | null;
  isLoading: boolean;
  onApprove: (request: ProductionEntryRequest) => void;
  onReject: (request: ProductionEntryRequest) => void;
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
            <TableHead>ক্যাটাগরি</TableHead>
            <TableHead>স্ট্যাটাস</TableHead>
            <TableHead className="text-center">পিস</TableHead>
            <TableHead className="text-right">মোট টাকা</TableHead>
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
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-10 mx-auto" />
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
              <TableCell colSpan={7} className="h-24 text-center">
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
                  <Badge variant="outline">{request.categoryName}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(request.status)}>
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {request.pieceCount}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(request.total)}
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

export default function ProductionRequestsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] =
    useState<'pending' | 'approved' | 'rejected'>('pending');

  const requestsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'productionEntryRequests'),
            orderBy('requestedAt', 'desc')
          )
        : null,
    [firestore]
  );

  const { data: allRequests, isLoading } =
    useCollection<ProductionEntryRequest>(requestsQuery);

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

  const handleApprove = async (request: ProductionEntryRequest) => {
    if (!firestore) return;
    setProcessingId(request.id);

    try {
      const categoryDocRef = doc(firestore, 'categories', request.categoryId);
      const categoryDoc = await getDoc(categoryDocRef);
      const categoryData = categoryDoc.data() as Category | undefined;

      const approvedEntry = {
        date: request.date,
        workerId: request.workerId,
        workerName: request.workerName,
        categoryId: request.categoryId,
        categoryName: request.categoryName,
        pieceCount: request.pieceCount,
        rate: request.rate,
        total: request.total,
        categoryImageUrl: categoryData?.imageUrl || 'https://picsum.photos/seed/placeholder/400/300',
      };
      
      const workerEntriesRef = collection(
        firestore,
        'workers',
        request.workerId,
        'productionEntries'
      );
      await addDocumentNonBlocking(workerEntriesRef, approvedEntry);

      const requestDocRef = doc(
        firestore,
        'productionEntryRequests',
        request.id
      );
      updateDocumentNonBlocking(requestDocRef, {
        status: 'approved',
        processedAt: new Date().toISOString(),
      });
      
      sendNotification(
        request.workerId,
        'কাজের অনুরোধ অনুমোদিত',
        `আপনার ${request.pieceCount} পিস ${request.categoryName}-এর কাজের অনুরোধটি অনুমোদিত হয়েছে।`
      );

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
      
      sendNotification(
        request.workerId,
        'কাজের অনুরোধ বাতিল হয়েছে',
        `আপনার ${request.pieceCount} পিস ${request.categoryName}-এর কাজের অনুরোধটি বাতিল করা হয়েছে।`
      );

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
          কর্মীদের পাঠানো কাজের অনুরোধগুলো অনুমোদন বা বাতিল করুন এবং ইতিহাস দেখুন।
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
