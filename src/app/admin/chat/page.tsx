'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Worker, ChatMessage } from '@/lib/types';

export default function AdminChatPage() {
  const firestore = useFirestore();
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const workersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'workers'), orderBy('name', 'asc'));
  }, [firestore]);
  const { data: workers, isLoading: isLoadingWorkers } = useCollection<Worker>(workersQuery);

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !selectedWorkerId) return null;
    return query(
      collection(firestore, 'chats', selectedWorkerId, 'messages'),
      orderBy('timestamp', 'asc')
    );
  }, [firestore, selectedWorkerId]);
  const { data: messages, isLoading: isLoadingMessages } = useCollection<ChatMessage>(messagesQuery);
  
  const selectedWorker = workers?.find(w => w.id === selectedWorkerId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    // Select the first worker by default if not already selected
    if (!selectedWorkerId && workers && workers.length > 0) {
      setSelectedWorkerId(workers[0].id);
    }
  }, [workers, selectedWorkerId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !selectedWorkerId || !firestore) return;

    const messageData = {
      text: newMessage,
      senderId: 'admin', // Admin's ID
      timestamp: serverTimestamp(),
      isRead: false,
    };
    
    const messagesCol = collection(firestore, 'chats', selectedWorkerId, 'messages');
    await addDoc(messagesCol, messageData);
    setNewMessage('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 h-[calc(100vh-8rem)] font-sans">
        {/* Worker List */}
        <Card className="col-span-1 flex flex-col">
            <CardHeader>
                <CardTitle>কথোপকথন</CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
                {isLoadingWorkers && <p className="p-4 text-sm text-muted-foreground">কর্মী লোড হচ্ছে...</p>}
                {workers?.map(worker => (
                    <React.Fragment key={worker.id}>
                        <div 
                            className={cn(
                                "flex items-center gap-3 p-3 cursor-pointer hover:bg-accent",
                                selectedWorkerId === worker.id && 'bg-accent'
                            )}
                            onClick={() => setSelectedWorkerId(worker.id)}
                        >
                            <Avatar className="h-10 w-10 border">
                                <AvatarImage src={worker.photo} alt={worker.name} />
                                <AvatarFallback>{worker.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className='flex-1 truncate'>
                                <p className="font-semibold truncate">{worker.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {/* Placeholder for last message */}
                                </p>
                            </div>
                        </div>
                        <Separator />
                    </React.Fragment>
                ))}
                 {!isLoadingWorkers && workers?.length === 0 && <p className="p-4 text-sm text-muted-foreground">কোনো কর্মী পাওয়া যায়নি।</p>}
            </ScrollArea>
        </Card>

        {/* Chat Window */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col">
            {!selectedWorker ? (
                <div className='flex-1 flex items-center justify-center text-muted-foreground'>
                    {isLoadingWorkers ? <p>লোড হচ্ছে...</p> : <p>চ্যাট শুরু করতে একটি কথোপকথন নির্বাচন করুন।</p>}
                </div>
            ) : (
                <>
                    <CardHeader className='border-b'>
                        <div className="flex items-center gap-3">
                             <Avatar className="h-10 w-10 border">
                                <AvatarImage src={selectedWorker.photo} alt={selectedWorker.name} />
                                <AvatarFallback>{selectedWorker.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                             <div>
                                <CardTitle>{selectedWorker.name}</CardTitle>
                                <p className='text-sm text-muted-foreground'>{selectedWorker.designation}</p>
                             </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                        {isLoadingMessages && <p className="text-center text-muted-foreground">বার্তা লোড হচ্ছে...</p>}
                        {messages?.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                            'flex items-end gap-2',
                            msg.senderId === 'admin' ? 'justify-end' : 'justify-start'
                            )}
                        >
                            {msg.senderId !== 'admin' && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={selectedWorker.photo} alt={selectedWorker.name} />
                                <AvatarFallback>{selectedWorker.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            )}
                            <div
                            className={cn(
                                'max-w-xs md:max-w-md rounded-lg px-4 py-2 text-sm',
                                msg.senderId === 'admin'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                            >
                            <p>{msg.text}</p>
                            {msg.timestamp && <p className={cn(
                                "text-xs mt-1 opacity-70",
                                msg.senderId === 'admin' ? 'text-right' : 'text-left'
                                // @ts-ignore
                            )}>{new Date(msg.timestamp?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                            </div>
                            {msg.senderId === 'admin' && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://i.pravatar.cc/40?u=admin`} alt="Admin" />
                                <AvatarFallback>A</AvatarFallback>
                            </Avatar>
                            )}
                        </div>
                        ))}
                        <div ref={messagesEndRef} />
                        {!isLoadingMessages && messages?.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                                <p>এই কথোপকথনে এখনো কোনো বার্তা নেই।</p>
                            </div>
                        )}
                    </CardContent>
                    <div className="p-4 border-t">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <Input
                            type="text"
                            placeholder="আপনার বার্তা লিখুন..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            autoComplete="off"
                            disabled={!selectedWorkerId}
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim() || !selectedWorkerId}>
                            <Send className="h-4 w-4" />
                            <span className="sr-only">বার্তা পাঠান</span>
                        </Button>
                        </form>
                    </div>
                </>
            )}
        </Card>
    </div>
  );
}
