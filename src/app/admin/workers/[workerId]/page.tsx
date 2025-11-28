
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { Briefcase, Calendar, Phone, Scissors, Hourglass, CircleDollarSign } from 'lucide-react';
import { TakaIcon } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import { doc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import type { Worker } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
  }).format(amount);

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border bg-background p-4">
      {icon}
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}

export default function WorkerProfilePage() {
  const firestore = useFirestore();
  const params = useParams();
  const workerId = params.workerId as string;

  const workerDocRef = useMemoFirebase(() => {
    if (!firestore || !workerId) return null;
    return doc(firestore, 'workers', workerId);
  }, [firestore, workerId]);

  const { data: workerData, isLoading: isLoadingWorker } = useDoc<Worker>(workerDocRef);

  if (isLoadingWorker) {
    return (
        <Card>
            <CardHeader className="flex flex-col items-center gap-4 text-center">
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className='space-y-2'>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-5 w-32" />
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <Skeleton className="h-px w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Skeleton className="h-20 w-full" />
                   <Skeleton className="h-20 w-full" />
                   <Skeleton className="h-20 w-full" />
                   <Skeleton className="h-20 w-full" />
                </div>
            </CardContent>
        </Card>
    );
  }
  
  if (!workerData) {
      return <p>কর্মী খুঁজে পাওয়া যায়নি।</p>
  }


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col items-center gap-4 text-center">
            <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-lg">
                <AvatarImage src={workerData.photo} alt={workerData.name} />
                <AvatarFallback className="text-4xl">{workerData.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <CardTitle className="text-3xl">{workerData.name}</CardTitle>
                <CardDescription className="text-base">{workerData.designation}</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <StatCard 
                icon={<Briefcase className="h-8 w-8 text-primary" />}
                label="বিভাগ"
                value={workerData.department}
             />
             <StatCard 
                icon={<Calendar className="h-8 w-8 text-primary" />}
                label="যোগদানের তারিখ"
                value={new Date(workerData.joinDate).toLocaleDateString('bn-BD')}
             />
             <StatCard 
                icon={<Phone className="h-8 w-8 text-primary" />}
                label="মোবাইল নম্বর"
                value={workerData.contact}
             />
             <StatCard 
                icon={<TakaIcon className="h-8 w-8 text-primary" />}
                label="মূল বেতন"
                value={formatCurrency(workerData.basicSalary)}
             />
          </div>

        </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle>কাজের সারসংক্ষেপ</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                    icon={<Scissors className="h-8 w-8 text-green-500" />}
                    label="মোট পিস"
                    value="১২,৩৪৫"
                />
                <StatCard 
                    icon={<Hourglass className="h-8 w-8 text-orange-500" />}
                    label="মোট ওভারটাইম"
                    value="১২০ ঘণ্টা"
                />
                <StatCard 
                    icon={<CircleDollarSign className="h-8 w-8 text-red-500" />}
                    label="মোট অগ্রিম"
                    value={formatCurrency(5000)}
                />
          </CardContent>
      </Card>

    </div>
  );
}
