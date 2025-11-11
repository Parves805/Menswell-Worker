'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChatPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Chat</CardTitle>
                <CardDescription>This is the chat page.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Content for the chat page goes here.</p>
            </CardContent>
        </Card>
    );
}
