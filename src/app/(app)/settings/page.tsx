'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";

export default function SettingsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings /> সেটিংস
                </CardTitle>
                <CardDescription>আপনার অ্যাপ্লিকেশনের পছন্দগুলো পরিচালনা করুন।</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="dark-mode" className="text-base">ডার্ক মোড</Label>
                        <p className="text-sm text-muted-foreground">
                            অ্যাপের ডার্ক থিম সক্রিয় করুন।
                        </p>
                    </div>
                    <Switch
                        id="dark-mode"
                        aria-label="Toggle dark mode"
                    />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="notifications" className="text-base">ইমেইল নোটিফিকেশন</Label>
                        <p className="text-sm text-muted-foreground">
                            গুরুত্বপূর্ণ আপডেটের জন্য ইমেইল গ্রহণ করুন।
                        </p>
                    </div>
                    <Switch
                        id="notifications"
                        aria-label="Toggle email notifications"
                        defaultChecked
                    />
                </div>
            </CardContent>
        </Card>
    );
}
