'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell /> নোটিফিকেশন
                </CardTitle>
                <CardDescription>আপনার সাম্প্রতিক নোটিফিকেশনগুলো এখানে দেখুন।</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-4 rounded-lg border p-4">
                        <div className="flex-1">
                            <p className="font-medium">বেতন প্রক্রিয়া সম্পন্ন</p>
                            <p className="text-sm text-muted-foreground">জুন ২০২৪ এর বেতন সকল কর্মীর জন্য সফলভাবে প্রক্রিয়া করা হয়েছে।</p>
                            <p className="text-xs text-muted-foreground mt-1">২ দিন আগে</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 rounded-lg border p-4">
                         <div className="flex-1">
                            <p className="font-medium">নতুন কর্মী যোগ হয়েছে</p>
                            <p className="text-sm text-muted-foreground">একজন নতুন কর্মী, কামাল হাসান, সেলাই বিভাগে যোগ দিয়েছেন।</p>                            <p className="text-xs text-muted-foreground mt-1">৫ দিন আগে</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
