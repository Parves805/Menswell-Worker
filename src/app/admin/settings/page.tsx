
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React, { useEffect } from 'react';
import { TwitterPicker } from 'react-color';
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, useUser, useAuth } from "@/firebase";
import { doc } from 'firebase/firestore';
import { updateProfile } from "firebase/auth";
import type { AppSettings } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const auth = useAuth();
    const { user: adminUser } = useUser();

    const settingsDocRef = useMemoFirebase(() => 
        firestore ? doc(firestore, 'settings', 'global') : null,
        [firestore]
    );
    const { data: savedSettings, isLoading } = useDoc<AppSettings>(settingsDocRef);

    const [companyName, setCompanyName] = React.useState('মেনসওয়েল');
    const [logoUrl, setLogoUrl] = React.useState('');
    const [address, setAddress] = React.useState('');
    const [themeColor, setThemeColor] = React.useState('#16A34A'); // Default green
    const [adminPhotoUrl, setAdminPhotoUrl] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);


    useEffect(() => {
        if (savedSettings) {
            setCompanyName(savedSettings.companyName || 'মেনসওয়েল');
            setLogoUrl(savedSettings.logoUrl || '');
            setAddress(savedSettings.address || '');
            setThemeColor(savedSettings.themeColor || '#16A34A');
        }
        if (adminUser?.photoURL) {
            setAdminPhotoUrl(adminUser.photoURL);
        }
    }, [savedSettings, adminUser]);

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

    const handleSaveSettings = async () => {
        if (!firestore || !settingsDocRef || !auth?.currentUser) {
            toast({ variant: 'destructive', title: "ত্রুটি", description: "ডাটাবেস বা প্রমাণীকরণ সংযোগ পাওয়া যায়নি।" });
            return;
        }
        setIsSaving(true);

        try {
            // Update general settings in Firestore
            const newSettings = {
                companyName,
                logoUrl,
                address,
                themeColor,
            };
            setDocumentNonBlocking(settingsDocRef, newSettings, { merge: true });

            // Update admin profile photo in Firebase Auth if it has changed
            if (adminUser?.photoURL !== adminPhotoUrl) {
                await updateProfile(auth.currentUser, { photoURL: adminPhotoUrl });
            }

            // Also save to local storage for instant theme application across reloads
            localStorage.setItem('garmentflow-theme-color', themeColor);
            
            toast({
                title: "সেটিংস সংরক্ষিত হয়েছে",
                description: "আপনার পরিবর্তনগুলো সফলভাবে সংরক্ষণ করা হয়েছে।",
            });
        } catch (error) {
            console.error("Error saving settings:", error);
            toast({ variant: 'destructive', title: "ত্রুটি", description: "সেটিংস সংরক্ষণ করার সময় একটি সমস্যা হয়েছে।" });
        } finally {
            setIsSaving(false);
        }
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
                   {isLoading ? <Skeleton className="w-full h-40" /> : (
                    <>
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
                        <div className="space-y-2">
                            <Label htmlFor="address">কোম্পানির ঠিকানা</Label>
                            <Input 
                                id="address" 
                                placeholder="আপনার কোম্পানির ঠিকানা দিন"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
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
                    </>
                   )}
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User /> অ্যাডমিন প্রোফাইল
                    </CardTitle>
                    <CardDescription>
                        আপনার অ্যাডমিন প্রোফাইল তথ্য পরিবর্তন করুন।
                    </CardDescription>
                </CardHeader>
                 <CardContent className="space-y-6">
                     {isLoading ? <Skeleton className="w-full h-20" /> : (
                        <div className="space-y-2">
                            <Label htmlFor="adminPhotoUrl">প্রোফাইল ছবির URL</Label>
                            <Input 
                                id="adminPhotoUrl" 
                                placeholder="আপনার প্রোফাইল ছবির লিঙ্ক দিন"
                                value={adminPhotoUrl}
                                onChange={(e) => setAdminPhotoUrl(e.target.value)}
                            />
                        </div>
                     )}
                 </CardContent>
            </Card>

            <div className="flex justify-end">
                 <Button onClick={handleSaveSettings} disabled={isLoading || isSaving}>
                    {isSaving ? 'সংরক্ষণ করা হচ্ছে...' : 'সব সেটিংস সংরক্ষণ করুন'}
                </Button>
            </div>
        </div>
    );
}
