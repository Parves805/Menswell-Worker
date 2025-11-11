'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChatPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>চ্যাট</CardTitle>
                <CardDescription>এটি চ্যাট পাতা।</CardDescription>
            </CardHeader>
            <CardContent>
                <p>চ্যাট পাতার বিষয়বস্তু এখানে থাকবে।</p>
            </CardContent>
        </Card>
    );
}
