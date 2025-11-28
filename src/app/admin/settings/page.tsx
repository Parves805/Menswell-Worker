
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React, { useEffect } from 'react';
import { TwitterPicker } from 'react-color';
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { doc } from 'firebase/firestore';
import type { AppSettings } from "@/lib/types";

export default function SettingsPage() {
    const { toast } = useToast();
    const firestore = useFirestore();

    const settingsDocRef = useMemoFirebase(() => 
        firestore ? doc(firestore, 'settings', 'global') : null,
        [firestore]
    );
    const { data: savedSettings, isLoading } = useDoc<AppSettings>(settingsDocRef);

    const [companyName, setCompanyName] = React.useState('গার্মেন্টফ্লো');
    const [logoUrl, setLogoUrl] = React.useState('');
    const [themeColor, setThemeColor] = React.useState('#16A34A'); // Default green

    useEffect(() => {
        if (savedSettings) {
            setCompanyName(savedSettings.companyName || 'গার্মেন্টফ্লো');
            setLogoUrl(savedSettings.logoUrl || '');
            setThemeColor(savedSettings.themeColor || '#16A34A');
        }
    }, [savedSettings]);

    useEffect(() => {
        // Apply theme color when component mounts or themeColor changes
        const root = document.documentElement;
        if (themeColor) {
            const hsl = hexToHsl(themeColor);
            if (hsl) {
                root.style.setProperty('--primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
            }
        }
    }, [themeColor]);

    const handleSaveSettings = () => {
        if (!firestore || !settingsDocRef) {
            toast({ variant: 'destructive', title: "ত্রুটি", description: "ডাটাবেস সংযোগ পাওয়া যায়নি।" });
            return;
        }

        const newSettings = {
            companyName,
            logoUrl,
            themeColor,
        };

        setDocumentNonBlocking(settingsDocRef, newSettings, { merge: true });

        // Also save to local storage for instant theme application across reloads
        localStorage.setItem('garmentflow-theme-color', themeColor);
        
        toast({
            title: "সেটিংস সংরক্ষিত হয়েছে",
            description: "আপনার পরিবর্তনগুলো সফলভাবে সংরক্ষণ করা হয়েছে।",
        });
    }

    const hexToHsl = (hex: string) => {
        if (!hex.startsWith('#') || (hex.length !== 4 && hex.length !== 7)) return null;

        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return null;

        let r = parseInt(result[1], 16) / 255;
        let g = parseInt(result[2], 16) / 255;
        let b = parseInt(result[3], 16) / 255;
        
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
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
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="logoUrl">লোগো URL</Label>
                        <Input 
                            id="logoUrl" 
                            placeholder="আপনার লোগোর ছবির লিঙ্ক দিন"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            disabled={isLoading}
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

                    <Button onClick={handleSaveSettings} disabled={isLoading}>সংরক্ষণ করুন</Button>
                </CardContent>
            </Card>
        </div>
    );
}

    