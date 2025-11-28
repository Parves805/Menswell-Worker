'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/DatePicker';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import type { Worker } from '@/lib/types';

interface AddWorkerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkerAdded: () => void;
  workerToEdit?: Worker;
}

export function AddWorkerDialog({
  isOpen,
  onOpenChange,
  onWorkerAdded,
  workerToEdit,
}: AddWorkerDialogProps) {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [contact, setContact] = useState('');
  const [joinDate, setJoinDate] = useState<Date | undefined>(new Date());
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!workerToEdit;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setDesignation('');
    setDepartment('');
    setContact('');
    setJoinDate(new Date());
  }

  useEffect(() => {
    if (isEditMode && workerToEdit) {
      setName(workerToEdit.name);
      setEmail(workerToEdit.email);
      setDesignation(workerToEdit.designation);
      setDepartment(workerToEdit.department);
      setContact(workerToEdit.contact);
      setJoinDate(new Date(workerToEdit.joinDate));
      setPassword(''); // Password field is not for editing
    } else {
      resetForm();
    }
  }, [workerToEdit, isEditMode, isOpen]);
  

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore || !auth) {
        toast({ variant: 'destructive', title: 'ত্রুটি', description: 'ডাটাবেস সংযোগ পাওয়া যায়নি।' });
        return;
    }
     if (!name || !email || !designation || !department || !contact || !joinDate) {
      toast({ variant: 'destructive', title: 'ফর্ম অসম্পূর্ণ', description: 'অনুগ্রহ করে সমস্ত ঘর পূরণ করুন।' });
      return;
    }
    if (!isEditMode && !password) {
        toast({ variant: 'destructive', title: 'পাসওয়ার্ড প্রয়োজন', description: 'নতুন কর্মীর জন্য একটি পাসওয়ার্ড দিন।' });
        return;
    }
    
    setIsSubmitting(true);

    try {
        if (isEditMode && workerToEdit) {
            // Update existing worker
            const workerDocRef = doc(firestore, 'workers', workerToEdit.id);
            const updatedData = {
                name,
                email,
                designation,
                department,
                contact,
                joinDate: joinDate.toISOString(),
            };
            await updateDocumentNonBlocking(workerDocRef, updatedData);
            // NOTE: Updating email/password in Firebase Auth requires re-authentication and is not handled here.
            toast({ title: 'কর্মী আপডেট হয়েছে', description: `${name}-এর তথ্য সফলভাবে আপডেট করা হয়েছে।` });
        } else {
            // Create new worker
            // We can't create auth user and firestore doc in a transaction without admin SDK.
            // So, we create the auth user first.
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;

            await updateProfile(newUser, { displayName: name });
            
            const workerDocRef = doc(firestore, 'workers', newUser.uid);
            const workerData = {
                id: newUser.uid,
                name,
                email,
                designation,
                department,
                contact,
                joinDate: joinDate.toISOString(),
                status: 'active',
                photo: `https://picsum.photos/seed/${newUser.uid}/400/400`,
                basicSalary: 0, // Defaulting to 0 as it's removed from form
            };

            await setDocumentNonBlocking(workerDocRef, workerData, { merge: false });
            toast({ title: 'কর্মী যোগ হয়েছে', description: `${name} সফলভাবে যোগ হয়েছে এবং একটি অ্যাকাউন্ট তৈরি করা হয়েছে।` });
        }
        onWorkerAdded();
        onOpenChange(false);
        resetForm();

    } catch(error: any) {
        console.error("Worker creation/update error:", error);
        let description = 'একটি অজানা ত্রুটি ঘটেছে।';
        if (error.code === 'auth/email-already-in-use') {
            description = 'এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হচ্ছে।';
        } else if (error.code === 'auth/weak-password') {
            description = 'পাসওয়ার্ডটি কমপক্ষে ৬ অক্ষরের হতে হবে।';
        }
        toast({ variant: 'destructive', title: 'ত্রুটি', description });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          onOpenChange(false);
        }
      }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'কর্মীর তথ্য সম্পাদনা' : 'নতুন কর্মী যোগ করুন'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'কর্মীর তথ্য পরিবর্তন করুন।' : 'একজন নতুন কর্মীর জন্য একটি প্রোফাইল এবং লগইন তৈরি করুন।'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto pr-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="name">পুরো নাম</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="email">ইমেইল</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isEditMode} />
            </div>
          </div>

           {!isEditMode && (
            <div className="space-y-2">
                <Label htmlFor="password">পাসওয়ার্ড</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
           )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="designation">পদবি</Label>
                <Input id="designation" value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g., সুইং অপারেটর" required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="department">বিভাগ</Label>
                <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g., সেলাই" required />
            </div>
          </div>
          
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="contact">যোগাযোগ নম্বর</Label>
                <Input id="contact" type="tel" value={contact} onChange={(e) => setContact(e.target.value)} required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="joinDate">যোগদানের তারিখ</Label>
                <DatePicker value={joinDate} onSelect={setJoinDate} />
            </div>
          </div>
          
          <DialogFooter className="pt-4 sticky bottom-0 bg-background pb-0 -mb-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>বাতিল করুন</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'প্রসেসিং...' : (isEditMode ? 'সংরক্ষণ করুন' : 'কর্মী যোগ করুন')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
