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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function ChatPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'chats', user.uid, 'messages'),
      orderBy('timestamp', 'asc')
    );
  }, [firestore, user]);

  const { data: messages, isLoading } = useCollection<ChatMessage>(messagesQuery);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user || !firestore) return;

    const messageData = {
      text: newMessage,
      senderId: user.uid,
      timestamp: serverTimestamp(),
      isRead: false,
    };
    
    const messagesCol = collection(firestore, 'chats', user.uid, 'messages');
    addDocumentNonBlocking(messagesCol, messageData);
    setNewMessage('');
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)]">
      <CardHeader>
        <CardTitle>অ্যাডমিনের সাথে চ্যাট করুন</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && <p className="text-center text-muted-foreground">বার্তা লোড হচ্ছে...</p>}
        {!isLoading && messages?.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex items-end gap-2',
              msg.senderId === user?.uid ? 'justify-end' : 'justify-start'
            )}
          >
            {msg.senderId !== user?.uid && (
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://picsum.photos/seed/admin/40/40" alt="Admin" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                'max-w-xs rounded-lg px-4 py-2 text-sm',
                msg.senderId === user?.uid
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              <p>{msg.text}</p>
            </div>
             {msg.senderId === user?.uid && (
               <Avatar className="h-8 w-8">
                 <AvatarImage src={user.photoURL ?? 'https://picsum.photos/seed/99/40/40'} alt={user.displayName ?? 'User'} />
                <AvatarFallback>{user.displayName?.charAt(0) ?? 'ক'}</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
         <div ref={messagesEndRef} />
         {!isLoading && messages?.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <p>কোনো বার্তা পাওয়া যায়নি।</p>
                <p className="text-xs">আপনার প্রশ্ন দিয়ে চ্যাট শুরু করুন।</p>
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
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">বার্তা পাঠান</span>
          </Button>
        </form>
      </div>
    </Card>
  );
}
