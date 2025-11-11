'use client';

import React, { useState, useEffect } from 'react';
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
import { PlusCircle, Download } from 'lucide-react';
import { DatePicker } from '@/components/DatePicker';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Worker, ProductionEntry } from '@/lib/types';

// This component fetches production entries for a single worker
const WorkerProductionEntries: React.FC<{ worker: Worker, onEntriesLoad: (entries: (ProductionEntry & { workerName: string })[]) => void }> = ({ worker, onEntriesLoad }) => {
  const firestore = useFirestore();
  const entriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, `workers/${worker.id}/productionEntries`) : null),
    [firestore, worker.id]
  );
  const { data: entries, isLoading } = useCollection<ProductionEntry>(entriesQuery);

  useEffect(() => {
    if (entries) {
      const entriesWithWorkerName = entries.map(entry => ({ ...entry, workerName: worker.name }));
      onEntriesLoad(entriesWithWorkerName);
    }
  }, [entries, onEntriesLoad, worker.name]);

  return null; // This component does not render anything itself
};


export default function ProductionPage() {
    const firestore = useFirestore();
    const [allProductionEntries, setAllProductionEntries] = useState<(ProductionEntry & { workerName: string })[]>([]);
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

    const workersQuery = useMemoFirebase(
        () => (firestore ? query(collection(firestore, 'workers')) : null),
        [firestore]
    );
    const { data: workers, isLoading: isLoadingWorkers } = useCollection<Worker>(workersQuery);

    const handleEntriesLoad = React.useCallback((newEntries: (ProductionEntry & { workerName: string })[]) => {
        setAllProductionEntries(prevEntries => {
            const newEntriesMap = new Map(newEntries.map(e => [e.id, e]));
            const filteredPrev = prevEntries.filter(pe => pe.workerId !== newEntries[0]?.workerId);
            return [...filteredPrev, ...Array.from(newEntriesMap.values())].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
    }, []);

  return (
    <>
      {/* Helper components to fetch data */}
      {!isLoadingWorkers && workers?.map(worker => (
          <WorkerProductionEntries key={worker.id} worker={worker} onEntriesLoad={handleEntriesLoad} />
      ))}
    <Card className="font-sans">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>উৎপাদন এন্ট্রি</CardTitle>
            <CardDescription>
              সকল কর্মীর উৎপাদন এন্ট্রি দেখুন এবং পরিচালনা করুন।
            </CardDescription>
          </div>
           <div className='flex items-center gap-2'>
            <div className='w-full max-w-sm'>
              <DatePicker />
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              এন্ট্রি যোগ করুন
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              রিপোর্ট এক্সপোর্ট
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>তারিখ</TableHead>
                <TableHead>কর্মীর নাম</TableHead>
                <TableHead>কর্মী আইডি</TableHead>
                <TableHead className="text-center">পিস সংখ্যা</TableHead>
                <TableHead className="text-center">ওভারটাইম (ঘণ্টা)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingWorkers ? (
                 <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    কর্মী লোড হচ্ছে...
                  </TableCell>
                </TableRow>
              ) : allProductionEntries && allProductionEntries.length > 0 ? (
                allProductionEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.date).toLocaleDateString('bn-BD')}</TableCell>
                    <TableCell className="font-medium">{entry.workerName}</TableCell>
                    <TableCell>{entry.workerId}</TableCell>
                    <TableCell className="text-center">{entry.pieceCount}</TableCell>
                    <TableCell className="text-center">{entry.overtimeHours || 0}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    কোনো উৎপাদন এন্ট্রি পাওয়া যায়নি।
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
