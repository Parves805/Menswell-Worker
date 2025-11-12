'use client';

import React from 'react';
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
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import type { Worker } from '@/lib/types';
import { AddProductionEntryDialog } from '@/components/admin/AddProductionEntryDialog';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
  }).format(amount);

interface ProductionEntry {
  id: string;
  date: string;
  workerId: string;
  workerName: string;
  category: string;
  pieceCount: number;
  rate: number;
  total: number;
}

export default function ProductionPage() {
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [productionEntries, setProductionEntries] = React.useState<ProductionEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const workersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workers') : null),
    [firestore]
  );
  const { data: workers } = useCollection<Worker>(workersQuery);

  const fetchProductionEntries = React.useCallback(async () => {
    if (!firestore || !workers) return;

    setIsLoading(true);
    const allEntries: ProductionEntry[] = [];
    for (const worker of workers) {
      const entriesQuery = query(collection(firestore, 'workers', worker.id, 'productionEntries'));
      const querySnapshot = await getDocs(entriesQuery);
      querySnapshot.forEach(doc => {
        const data = doc.data();
        allEntries.push({
          id: doc.id,
          workerId: worker.id,
          workerName: worker.name,
          date: new Date(data.date).toLocaleDateString('bn-BD'),
          category: data.categoryName || 'N/A',
          pieceCount: data.pieceCount,
          rate: data.rate,
          total: data.total,
        });
      });
    }
    setProductionEntries(allEntries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsLoading(false);
  }, [firestore, workers]);


  React.useEffect(() => {
    fetchProductionEntries();
  }, [fetchProductionEntries]);

  const handleEntryAdded = (newEntry: any) => {
    // Optimistically update the UI
    setProductionEntries(prev => [
        {
            ...newEntry,
            id: 'temp-' + Date.now(), // temporary id
            date: new Date(newEntry.date).toLocaleDateString('bn-BD'),
        },
        ...prev
    ]);
    // Optionally refetch all data to ensure consistency
    fetchProductionEntries();
  };

  return (
    <>
      <AddProductionEntryDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onEntryAdded={handleEntryAdded}
      />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>উৎপাদন এন্ট্রি</CardTitle>
            <CardDescription>
              সকল কর্মীর কাজের হিসাব দেখুন এবং নতুন এন্ট্রি যোগ করুন।
            </CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            এন্ট্রি যোগ করুন
          </Button>
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
                  <TableHead className="text-center">দর</TableHead>
                  <TableHead className="text-right">মোট টাকা</TableHead>
                  <TableHead className="text-right">פעולה</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      এন্ট্রি লোড হচ্ছে...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && productionEntries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      কোনো উৎপাদন এন্ট্রি পাওয়া যায়নি।
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && productionEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.workerName}</TableCell>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>
                          <Badge variant="outline">{entry.category}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{entry.pieceCount}</TableCell>
                      <TableCell className="text-center">{formatCurrency(entry.rate)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(entry.total)}</TableCell>
                      <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                          </Button>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
