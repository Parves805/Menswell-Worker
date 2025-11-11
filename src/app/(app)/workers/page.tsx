'use client';

import { columns } from './columns';
import { DataTable } from './data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Worker } from '@/lib/types';
import { useMemo } from 'react';

export default function WorkersPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const workersRef = useMemo(
    () => (firestore ? collection(firestore, 'workers') : null),
    [firestore]
  );
  
  // The type parameter for useCollection should match the entity, not WithId<T>
  const { data: workers, isLoading } = useCollection<Omit<Worker, 'id'>>(workersRef);

  const workersWithPhoto = useMemo(() => {
    return workers?.map((worker, index) => ({
      ...worker,
      photoUrl: worker.photo || `https://picsum.photos/seed/${101 + index}/200/200`,
    })) || [];
  }, [workers]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>কর্মী ব্যবস্থাপনা</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>কর্মী লোড হচ্ছে...</p>
        ) : (
          <DataTable columns={columns} data={workersWithPhoto} />
        )}
      </CardContent>
    </Card>
  );
}
