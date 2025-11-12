
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Wallet } from 'lucide-react';


export default function ExpensesPage() {

  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Wallet />
                খরচের বিবরণ
            </CardTitle>
            <CardDescription>
                আপনার মাসিক খরচের সারসংক্ষেপ এখানে দেখানো হবে।
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="h-60 flex items-center justify-center border-2 border-dashed rounded-md">
                <p className="text-muted-foreground">খরচের ডেটা দেখানোর জন্য কোনো কার্যকারিতা এখনো যোগ করা হয়নি।</p>
            </div>
        </CardContent>
    </Card>
  );
}
