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
import { workers } from '@/lib/data'; // Assuming you have worker data
import { Separator } from '@/components/ui/separator';

// Dummy chat data for demonstration
const dummyMessages = {
  'WRK-001': [
    { id: 'msg1', text: 'আমার জুন মাসের বেতন নিয়ে একটি প্রশ্ন ছিল।', senderId: 'WRK-001', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: 'msg2', text: 'অবশ্যই, বলুন আপনার প্রশ্নটি। আমরা দেখছি।', senderId: 'admin', timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000) },
  ],
  'WRK-003': [
      { id: 'msg3', text: 'আমি কি একটি অগ্রিম পেমেন্টের জন্য অনুরোধ করতে পারি?', senderId: 'WRK-003', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  ],
   'WRK-005': [],
};

type Message = { id: string; text: string; senderId: string; timestamp: Date };


export default function AdminChatPage() {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>('WRK-001');
  const [messages, setMessages] = useState<Record<string, Message[]>>(dummyMessages);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedWorker = workers.find(w => w.id === selectedWorkerId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedWorkerId, messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !selectedWorkerId) return;

    const messageData: Message = {
      id: `msg-${Date.now()}`,
      text: newMessage,
      senderId: 'admin',
      timestamp: new Date(),
    };

    setMessages(prev => ({
        ...prev,
        [selectedWorkerId]: [...(prev[selectedWorkerId] || []), messageData]
    }));
    setNewMessage('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 h-[calc(100vh-8rem)]">
        {/* Worker List */}
        <Card className="col-span-1 flex flex-col">
            <CardHeader>
                <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
                {workers.map(worker => (
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
                                    {messages[worker.id]?.slice(-1)[0]?.text || 'No messages yet'}
                                </p>
                            </div>
                        </div>
                        <Separator />
                    </React.Fragment>
                ))}
            </ScrollArea>
        </Card>

        {/* Chat Window */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col">
            {!selectedWorker ? (
                <div className='flex-1 flex items-center justify-center text-muted-foreground'>
                    <p>Select a conversation to start chatting.</p>
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
                        {(messages[selectedWorkerId] || []).map((msg) => (
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
                            <p className={cn(
                                "text-xs mt-1 opacity-70",
                                msg.senderId === 'admin' ? 'text-right' : 'text-left'
                            )}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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
                        {(messages[selectedWorkerId] || []).length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                                <p>No messages in this conversation yet.</p>
                            </div>
                        )}
                    </CardContent>
                    <div className="p-4 border-t">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <Input
                            type="text"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            autoComplete="off"
                            disabled={!selectedWorkerId}
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim() || !selectedWorkerId}>
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send Message</span>
                        </Button>
                        </form>
                    </div>
                </>
            )}
        </Card>
    </div>
  );
}
