'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell /> Notifications
                </CardTitle>
                <CardDescription>View your recent notifications here.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-4 rounded-lg border p-4">
                        <div className="flex-1">
                            <p className="font-medium">Salary Processed</p>
                            <p className="text-sm text-muted-foreground">June 2024 salary has been successfully processed for all workers.</p>
                            <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 rounded-lg border p-4">
                         <div className="flex-1">
                            <p className="font-medium">New Worker Added</p>
                            <p className="text-sm text-muted-foreground">A new worker, Kamal Hasan, has joined the sewing department.</p>
                            <p className="text-xs text-muted-foreground mt-1">5 days ago</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
