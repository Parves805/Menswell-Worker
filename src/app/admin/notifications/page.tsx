'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bell, Send } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import React from 'react';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Worker } from '@/lib/types';


export default function AdminNotificationsPage() {
    const { toast } = useToast();
    const [title, setTitle] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [target, setTarget] = React.useState('all');
    const [selectedWorker, setSelectedWorker] = React.useState('');
    const firestore = useFirestore();

    const workersQuery = useMemoFirebase(
      () => (firestore ? collection(firestore, 'workers') : null),
      [firestore]
    );
    const { data: workers, isLoading } = useCollection<Worker>(workersQuery);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message || !firestore) {
            toast({ variant: 'destructive', title: 'ফর্ম অসম্পূর্ণ', description: 'অনুগ্রহ করে একটি শিরোনাম এবং বার্তা লিখুন।' });
            return;
        }
        
        if (target === 'worker' && !selectedWorker) {
            toast({ variant: 'destructive', title: 'কর্মী নির্বাচন করুন', description: 'অনুগ্রহ করে একজন কর্মীকে নির্বাচন করুন।' });
            return;
        }

        const notificationData = {
          title,
          message,
          createdAt: new Date().toISOString(),
          isRead: false,
        };

        if (target === 'all') {
            // Send to all workers
             if (!workers) return;
             workers.forEach(worker => {
                addDocumentNonBlocking(collection(firestore, 'notifications'), {
                    ...notificationData,
                    workerId: worker.id
                });
             });
        } else {
            // Send to a specific worker
            addDocumentNonBlocking(collection(firestore, 'notifications'), {
                ...notificationData,
                workerId: selectedWorker
            });
        }


        toast({
            title: "বিজ্ঞপ্তি পাঠানো হয়েছে",
            description: "আপনার বিজ্ঞপ্তি সফলভাবে পাঠানো হয়েছে।",
        });

        setTitle('');
        setMessage('');
        setTarget('all');
        setSelectedWorker('');
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Send /> নতুন বিজ্ঞপ্তি পাঠান
                    </CardTitle>
                    <CardDescription>সকল বা নির্দিষ্ট কর্মীকে বিজ্ঞপ্তি পাঠান।</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">শিরোনাম</Label>
                            <Input
                                id="title"
                                placeholder="বিজ্ঞপ্তির শিরোনাম"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">বার্তা</Label>
                            <Textarea
                                id="message"
                                placeholder="আপনার বিজ্ঞপ্তি এখানে লিখুন..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={5}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="target">কাকে পাঠাবেন?</Label>
                                <Select value={target} onValueChange={setTarget}>
                                    <SelectTrigger id="target">
                                        <SelectValue placeholder="নির্বাচন করুন" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">সবাইকে</SelectItem>
                                        <SelectItem value="worker">নির্দিষ্ট কর্মী</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {target === 'worker' && (
                                <div className="space-y-2">
                                    <Label htmlFor="worker">কর্মী নির্বাচন করুন</Label>
                                     <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                                        <SelectTrigger id="worker">
                                            <SelectValue placeholder="কর্মী নির্বাচন করুন" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {isLoading ? <SelectItem value="loading" disabled>লোড হচ্ছে...</SelectItem> : 
                                            workers?.map(worker => (
                                                <SelectItem key={worker.id} value={worker.id}>{worker.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        <Button type="submit" className="w-full">
                            <Send className="mr-2 h-4 w-4" />
                            বিজ্ঞপ্তি পাঠান
                        </Button>
                    </form>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell /> পাঠানো বিজ্ঞপ্তি
                    </CardTitle>
                    <CardDescription>আপনার পাঠানো সাম্প্রতিক বিজ্ঞপ্তিগুলো।</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        {/* Placeholder for sent notifications */}
                        <div className="flex items-start gap-4 rounded-lg border p-4">
                            <div className="flex-1">
                                <p className="font-medium">বেতন প্রক্রিয়া সম্পন্ন</p>
                                <p className="text-sm text-muted-foreground">জুন ২০২৪ এর বেতন সকল কর্মীর জন্য সফলভাবে প্রক্রিয়া করা হয়েছে।</p>
                                <p className="text-xs text-muted-foreground mt-1">২ দিন আগে</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 rounded-lg border p-4">
                            <div className="flex-1">
                                <p className="font-medium">নতুন কর্মী যোগ হয়েছে</p>
                                <p className="text-sm text-muted-foreground">একজন নতুন কর্মী, কামাল হাসান, সেলাই বিভাগে যোগ দিয়েছেন।</p>
                                <p className="text-xs text-muted-foreground mt-1">৫ দিন আগে</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
