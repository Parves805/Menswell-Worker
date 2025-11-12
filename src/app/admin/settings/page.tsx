'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React from 'react';
import { TwitterPicker } from 'react-color';

export default function SettingsPage() {
    const { toast } = useToast();
    const [companyName, setCompanyName] = React.useState('গার্মেন্টফ্লো');
    const [logoUrl, setLogoUrl] = React.useState('');
    const [themeColor, setThemeColor] = React.useState('#16A34A'); // Default green

    const handleSaveSettings = () => {
        // In a real app, you would save these settings to Firestore
        // For example, in a 'settings' collection with a 'global' document
        console.log({
            companyName,
            logoUrl,
            themeColor
        });
        
        // This is a CSS variable from globals.css
        document.documentElement.style.setProperty('--primary', themeColor);

        toast({
            title: "সেটিংস সংরক্ষিত হয়েছে",
            description: "আপনার পরিবর্তনগুলো সফলভাবে সংরক্ষণ করা হয়েছে।",
        });
    }

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings /> সাধারণ সেটিংস
                    </CardTitle>
                    <CardDescription>
                        অ্যাপ্লিকেশনের সাধারণ তথ্য এবং ব্র্যান্ডিং পরিবর্তন করুন।
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="companyName">কোম্পানির নাম</Label>
                        <Input 
                            id="companyName" 
                            value={companyName} 
                            onChange={(e) => setCompanyName(e.target.value)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="logoUrl">লোগো URL</Label>
                        <Input 
                            id="logoUrl" 
                            placeholder="আপনার লোগোর ছবির লিঙ্ক দিন"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                        />
                    </div>
                    
                    <div className="space-y-4">
                        <Label>ব্যবহারকারী প্যানেলের থিম রঙ</Label>
                         <TwitterPicker
                            color={themeColor}
                            onChangeComplete={(color) => setThemeColor(color.hex)}
                            colors={['#16A34A', '#2563EB', '#D97706', '#DC2626', '#6D28D9', '#DB2777']}
                         />
                         <p className="text-sm text-muted-foreground">এই রঙটি ব্যবহারকারী প্যানেলের প্রধান রঙ হিসেবে ব্যবহৃত হবে।</p>
                    </div>

                    <Button onClick={handleSaveSettings}>সংরক্ষণ করুন</Button>
                </CardContent>
            </Card>
        </div>
    );
}
