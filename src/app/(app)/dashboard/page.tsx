'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, SewingPin, CircleDollarSign, Hourglass } from 'lucide-react';
import Link from 'next/link';

// Dummy data for worker dashboard
const workerData = {
  name: 'আয়েশা খানম',
  designation: 'সুইং অপারেটর',
  todayProduction: 112, // pieces
  todayOvertime: 2, // hours
  pieceRate: 5.5, // BDT per piece
  overtimeRate: 50, // BDT per hour
  advanceBalance: 2500, // BDT
};

const todayEarnings =
  workerData.todayProduction * workerData.pieceRate +
  workerData.todayOvertime * workerData.overtimeRate;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
  }).format(amount);

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="w-full bg-primary text-primary-foreground border-none">
        <CardHeader>
          <CardTitle>স্বাগতম, {workerData.name}!</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            আপনার আজকের কাজের সারসংক্ষেপ নিচে দেওয়া হলো।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">আজকের মোট আয়</p>
              <p className="text-3xl font-bold">
                {formatCurrency(todayEarnings)}
              </p>
            </div>
            <Link href="/entry">
              <Button variant="secondary">নতুন এন্ট্রি করুন</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">আজকের উৎপাদন</CardTitle>
            <SewingPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workerData.todayProduction} পিস</div>
            <p className="text-xs text-muted-foreground">প্রতি পিস রেট: {formatCurrency(workerData.pieceRate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">আজকের ওভারটাইম</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workerData.todayOvertime} ঘণ্টা</div>
             <p className="text-xs text-muted-foreground">প্রতি ঘণ্টা রেট: {formatCurrency(workerData.overtimeRate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">বকেয়া অগ্রিম</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(workerData.advanceBalance)}
            </div>
            <p className="text-xs text-muted-foreground">পরবর্তী বেতন থেকে কর্তনযোগ্য</p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>দ্রুত অ্যাক্সেস</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
           <Link href="/transactions">
              <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent">
                <p className="font-medium">লেনদেন দেখুন</p>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
           </Link>
           <Link href="/salary">
              <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent">
                <p className="font-medium">বেতন স্লিপ দেখুন</p>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
           </Link>
        </CardContent>
      </Card>
    </div>
  );
}
