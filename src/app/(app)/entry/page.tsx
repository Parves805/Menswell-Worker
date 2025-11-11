'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EntryPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>এন্ট্রি</CardTitle>
                <CardDescription>এটি এন্ট্রি পাতা।</CardDescription>
            </CardHeader>
            <CardContent>
                <p>এন্ট্রি পাতার বিষয়বস্তু এখানে থাকবে।</p>
            </CardContent>
        </Card>
    );
}
