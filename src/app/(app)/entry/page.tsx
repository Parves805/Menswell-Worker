'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EntryPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Entry</CardTitle>
                <CardDescription>This is the entry page.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Content for the entry page goes here.</p>
            </CardContent>
        </Card>
    );
}
