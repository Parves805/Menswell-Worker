'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { X, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data, in a real app this would come from Firestore
const initialCategories = ['টি-শার্ট', 'পোলো শার্ট', 'প্যান্ট', 'শার্ট'];

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState(initialCategories);
  const [newCategory, setNewCategory] = useState('');
  const [allowProfilePictureChange, setAllowProfilePictureChange] = useState(true);

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
      toast({ title: 'Category Added', description: `"${newCategory}" has been added.` });
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setCategories(categories.filter((cat) => cat !== categoryToRemove));
    toast({
      variant: 'destructive',
      title: 'Category Removed',
      description: `"${categoryToRemove}" has been removed.`,
    });
  };

  const handleSaveChanges = () => {
    // In a real app, you would save all these settings to Firestore
    console.log({
      categories,
      allowProfilePictureChange,
    });
    toast({
      title: 'Settings Saved',
      description: 'Your changes have been successfully saved.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your factory and application settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Production Categories</CardTitle>
          <CardDescription>
            Manage the list of production item categories available to workers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat} className="flex items-center justify-between gap-2 rounded-md border p-2 pl-4">
                <span className="font-medium">{cat}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveCategory(cat)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
            />
            <Button onClick={handleAddCategory} size="icon">
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>
            Configure general settings for the worker-facing application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="allow-profile-pic-change" className="text-base">Allow Profile Picture Change</Label>
                    <p className="text-sm text-muted-foreground">
                        Allow workers to change their own profile picture from the app.
                    </p>
                </div>
                <Switch
                    id="allow-profile-pic-change"
                    checked={allowProfilePictureChange}
                    onCheckedChange={setAllowProfilePictureChange}
                />
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Admin Profile</CardTitle>
          <CardDescription>Manage your personal administrator account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="admin-name">Name</Label>
                <Input id="admin-name" defaultValue="Admin User" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input id="admin-email" defaultValue="admin@example.com" disabled />
            </div>
             <Separator />
             <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" placeholder="Enter new password" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" placeholder="Confirm new password" />
            </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveChanges}>Save All Changes</Button>
      </div>

    </div>
  );
}
