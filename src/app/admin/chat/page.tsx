
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, User, MessageSquare, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ChatMessage, Worker } from '@/lib/types';
import { cn } from '@/lib/utils';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AdminChatPage() {
  const { user: adminUser } = useUser();
  const firestore = useFirestore();
  const [newMessage, setNewMessage] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const workersQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'workers'), orderBy('name', 'asc')) : null,
    [firestore]
  );
  const { data: workers, isLoading: isLoadingWorkers } = useCollection<Worker>(workersQuery);

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !selectedWorker) return null;
    return query(
      collection(firestore, 'chats', selectedWorker.id, 'messages'),
      orderBy('timestamp', 'asc')
    );
  }, [firestore, selectedWorker]);

  const { data: messages, isLoading: isLoadingMessages } = useCollection<ChatMessage>(messagesQuery);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !adminUser || !firestore || !selectedWorker) return;

    const messageData = {
      text: newMessage,
      senderId: 'admin', // Special ID for admin
      timestamp: serverTimestamp(),
      isRead: false,
    };
    
    const messagesCol = collection(firestore, 'chats', selectedWorker.id, 'messages');
    addDocumentNonBlocking(messagesCol, messageData);
    setNewMessage('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-8rem)]">
        {/* Workers List */}
        <Card className={cn(
            "lg:col-span-1 flex flex-col transition-all duration-300",
            selectedWorker && "hidden lg:flex"
        )}>
            <CardHeader>
                <CardTitle>কর্মীদের চ্যাট</CardTitle>
                <CardDescription>যেকোনো কর্মীর সাথে চ্যাট করুন।</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-y-auto">
                <ScrollArea className="h-full">
                {isLoadingWorkers && <p className='p-4 text-center'>কর্মী তালিকা লোড হচ্ছে...</p>}
                {!isLoadingWorkers && workers?.map(worker => (
                    <button
                        key={worker.id}
                        onClick={() => setSelectedWorker(worker)}
                        className={cn(
                            "flex items-center gap-3 w-full text-left p-3 hover:bg-muted/50",
                            selectedWorker?.id === worker.id && "bg-muted"
                        )}
                    >
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={worker.photo} alt={worker.name} />
                            <AvatarFallback>{worker.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{worker.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{worker.designation}</p>
                        </div>
                    </button>
                ))}
                </ScrollArea>
            </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className={cn(
            "lg:col-span-2 flex flex-col h-full transition-all duration-300",
            !selectedWorker && "hidden lg:flex"
        )}>
            {!selectedWorker ? (
                 <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mb-4"/>
                    <p className="text-lg">একজন কর্মীকে নির্বাচন করুন</p>
                    <p className="text-sm">বাম পাশ থেকে একজন কর্মীকে নির্বাচন করে চ্যাট শুরু করুন।</p>
                </div>
            ) : (
                <>
                <CardHeader className="border-b flex-row items-center gap-3">
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSelectedWorker(null)}>
                        <ArrowLeft />
                    </Button>
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedWorker.photo} alt={selectedWorker.name} />
                        <AvatarFallback>{selectedWorker.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{selectedWorker.name}</CardTitle>
                        <p className="text-sm font-normal text-muted-foreground">{selectedWorker.designation}</p>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoadingMessages && <p className="text-center text-muted-foreground">বার্তা লোড হচ্ছে...</p>}
                    {!isLoadingMessages && messages?.map((msg) => (
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
                        </div>
                        {msg.senderId === 'admin' && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={adminUser?.photoURL ?? 'https://picsum.photos/seed/admin/40/40'} alt="Admin" />
                            <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                        )}
                    </div>
                    ))}
                    <div ref={messagesEndRef} />
                    {!isLoadingMessages && messages?.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                            <p>কোনো বার্তা পাওয়া যায়নি।</p>
                            <p className="text-xs">আপনার বার্তা দিয়ে চ্যাট শুরু করুন।</p>
                        </div>
                    )}
                </CardContent>
                <div className="p-4 border-t bg-background">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input
                        type="text"
                        placeholder="বার্তা লিখুন..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        autoComplete="off"
                        disabled={!selectedWorker}
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim() || !selectedWorker}>
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
