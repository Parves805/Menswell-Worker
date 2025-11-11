'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, PlusCircle, Trash2, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

// Dummy data for past notifications
const pastNotifications = [
    { id: 1, title: "ঈদ বোনাস ঘোষণা", message: "সকল কর্মীকে জানানো যাচ্ছে যে, আগামী ৫ জুলাই ঈদ বোনাস প্রদান করা হবে।", sentAt: "2024-07-01" },
    { id: 2, title: "জরুরী ফ্যাক্টরি মিটিং", message: "আগামীকাল সকাল ৯টায় সকল সুপারভাইজারদের নিয়ে একটি জরুরী মিটিং অনুষ্ঠিত হবে।", sentAt: "2024-06-28" },
    { id: 3, title: "ওভারটাইম সংক্রান্ত নোটিশ", message: "এই সপ্তাহে ওভারটাইম শনিবার এবং রবিবার চালু থাকবে।", sentAt: "2024-06-25" },
];

export default function AdminNotificationsPage() {
    const { toast } = useToast();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');

    const handleSendNotification = () => {
        if (!title || !message) {
            toast({
                variant: 'destructive',
                title: 'ফর্ম অসম্পূর্ণ',
                description: 'অনুগ্রহ করে শিরোনাম এবং বার্তা উভয়ই পূরণ করুন।',
            });
            return;
        }

        console.log("Sending notification:", { title, message });

        toast({
            title: 'বিজ্ঞপ্তি পাঠানো হয়েছে',
            description: 'আপনার বিজ্ঞপ্তিটি সকল কর্মীর কাছে সফলভাবে পাঠানো হয়েছে।',
        });
        
        // Reset form
        setTitle('');
        setMessage('');
    }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle /> নতুন বিজ্ঞপ্তি পাঠান
          </CardTitle>
          <CardDescription>
            সকল কর্মী বা নির্দিষ্ট গ্রুপকে নতুন নোটিশ বা বিজ্ঞপ্তি পাঠান।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">শিরোনাম</Label>
            <Input id="title" placeholder="বিজ্ঞপ্তির শিরোনাম লিখুন" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="message">বার্তা</Label>
            <Textarea id="message" placeholder="আপনার বার্তাটি এখানে লিখুন..." className="min-h-[120px]" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <Button onClick={handleSendNotification} className='w-full'>
              <Send className='mr-2' />
              বিজ্ঞপ্তি পাঠান
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell /> পূর্ববর্তী বিজ্ঞপ্তি
          </CardTitle>
          <CardDescription>
            আগে পাঠানো সকল বিজ্ঞপ্তির তালিকা দেখুন।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {pastNotifications.map((notification) => (
                 <div key={notification.id} className="flex items-start gap-4 rounded-lg border p-4">
                    <div className="flex-1">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(notification.sentAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <Button variant="ghost" size="icon" className='text-destructive/70 hover:text-destructive'>
                        <Trash2 className='h-4 w-4' />
                    </Button>
                 </div>
            ))}
             {pastNotifications.length === 0 && (
                <p className='text-center text-muted-foreground py-8'>কোনো বিজ্ঞপ্তি পাওয়া যায়নি।</p>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
