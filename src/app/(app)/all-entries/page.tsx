
'use client';

import React, { useMemo, useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { ProductionEntry } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Scissors, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);

interface CategorySummary {
  categoryId: string;
  categoryName: string;
  categoryImageUrl?: string;
  totalPieces: number;
  totalAmount: number;
  entries: ProductionEntry[];
}

export default function AllEntriesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const printRef = useRef<HTMLDivElement>(null);

  const entriesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'workers', user.uid, 'productionEntries'),
      orderBy('date', 'desc')
    );
  }, [user, firestore]);

  const { data: allEntries, isLoading } = useCollection<ProductionEntry>(entriesQuery);
  
  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;
    
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.opacity = '1';
    element.style.width = '800px';


    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false, 
    });

    element.style.position = 'absolute';
    element.style.left = '0';
    element.style.opacity = '0';
    element.style.width = 'auto';


    const data = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    pdf.addImage(data, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save('সকল-কাজের-হিসাব.pdf');
  };

  const categorySummaries = useMemo((): CategorySummary[] | null => {
    if (!allEntries) return null;
  
    const summaryMap = new Map<string, CategorySummary>();
    
    const isValidImageUrl = (url: string | undefined): boolean => {
      if (!url) return false;
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      try {
        const path = new URL(url).pathname.toLowerCase();
        if (validExtensions.some(ext => path.endsWith(ext))) {
          return true;
        }
        if (url.startsWith('http') && (url.includes('images.unsplash.com') || url.includes('picsum.photos'))) {
            return true;
        }
      } catch (e) {
        return false;
      }
      return false;
    };
  
    allEntries.forEach((entry) => {
      let summary = summaryMap.get(entry.categoryId);
      if (!summary) {
        summary = {
          categoryId: entry.categoryId,
          categoryName: entry.categoryName,
          categoryImageUrl: isValidImageUrl(entry.categoryImageUrl) 
            ? entry.categoryImageUrl 
            : 'https://picsum.photos/seed/placeholder/64/64',
          totalPieces: 0,
          totalAmount: 0,
          entries: [],
        };
      }
      summary.totalPieces += entry.pieceCount;
      summary.totalAmount += entry.total;
      summary.entries.push(entry);
      summaryMap.set(entry.categoryId, summary);
    });
  
    return Array.from(summaryMap.values());
  }, [allEntries]);
  
  const totalAllPieces = useMemo(() => {
    if (!allEntries) return 0;
    return allEntries.reduce((acc, entry) => acc + entry.pieceCount, 0);
  }, [allEntries]);

  const totalAllEarnings = useMemo(() => {
    if (!allEntries) return 0;
    return allEntries.reduce((acc, entry) => acc + entry.total, 0);
  }, [allEntries]);


  if (isLoading) {
    return (
        <div className="space-y-4">
            {Array.from({length: 3}).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div>
                            <Skeleton className="h-4 w-1/3 mb-2" />
                            <Skeleton className="h-7 w-2/3" />
                        </div>
                        <div>
                             <Skeleton className="h-4 w-1/3 mb-2" />
                             <Skeleton className="h-7 w-2/3" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
  }

  return (
    <div className="space-y-6">
       <div ref={printRef} className="p-4 bg-white absolute left-0 top-0 opacity-0 -z-50">
            <div className='text-center mb-4'>
                <h1 className='text-2xl font-bold'>গার্মেন্টফ্লো</h1>
                <p className='text-sm'>১২৩, প্রধান সড়ক, ঢাকা-১২১৬</p>
                <h2 className='text-xl font-bold mt-2'>সকল কাজের বিস্তারিত হিসাব</h2>
                <p className='text-sm'>কর্মী: {user?.displayName}</p>
                <p className='text-sm'>রিপোর্টের তারিখ: {new Date().toLocaleDateString('bn-BD')}</p>
            </div>
            
            <Table>
                <TableHeader>
                    <TableRow className='bg-primary text-primary-foreground'>
                        <TableHead className='text-primary-foreground'>তারিখ</TableHead>
                        <TableHead className='text-primary-foreground'>ক্যাটাগরি</TableHead>
                        <TableHead className='text-center text-primary-foreground'>পিস</TableHead>
                        <TableHead className='text-center text-primary-foreground'>দর</TableHead>
                        <TableHead className="text-right text-primary-foreground">মোট</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allEntries?.map(entry => (
                        <TableRow key={entry.id}>
                            <TableCell>{new Date(entry.date).toLocaleDateString('bn-BD')}</TableCell>
                            <TableCell>{entry.categoryName}</TableCell>
                            <TableCell className="text-center">{entry.pieceCount.toLocaleString('bn-BD')}</TableCell>
                            <TableCell className="text-center">{formatCurrency(entry.rate)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(entry.total)}</TableCell>
                        </TableRow>
                    ))}
                    <TableRow className='font-bold bg-muted'>
                        <TableCell colSpan={2}>সর্বমোট</TableCell>
                        <TableCell className="text-center">{totalAllPieces.toLocaleString('bn-BD')}</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right text-primary">{formatCurrency(totalAllEarnings)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
       </div>

        <Card className="w-full bg-primary text-primary-foreground border-none">
            <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4 text-center">
                    <h1 className="text-2xl font-bold flex items-center gap-2"><Scissors /> সকল কাজের হিসাব</h1>
                    <p className="text-primary-foreground/80 max-w-prose">
                    আপনার সমস্ত কাজ ক্যাটাগরি অনুযায়ী বিভক্ত করে দেখানো হলো।
                    </p>
                    <Button onClick={handleDownloadPdf} variant="secondary" className='shadow-lg'>
                        <Download className="mr-2 h-4 w-4" />
                        PDF ডাউনলোড করুন
                    </Button>
                </div>
            </CardContent>
        </Card>
      
      {!categorySummaries || categorySummaries.length === 0 ? (
        <Card>
            <CardContent className="h-48 flex flex-col items-center justify-center text-center">
                <Scissors className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">কোনো কাজের এন্ট্রি পাওয়া যায়নি</h3>
                <p className="text-muted-foreground text-sm">আপনি নতুন কাজের এন্ট্রি যোগ করলে তা এখানে দেখা যাবে।</p>
            </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorySummaries.map((summary) => (
            <Card key={summary.categoryId} className="flex flex-col">
              <CardHeader className="flex-grow">
                <div className="flex items-center gap-4">
                  {summary.categoryImageUrl && (
                    <Image 
                      src={summary.categoryImageUrl} 
                      alt={summary.categoryName} 
                      width={64} 
                      height={64} 
                      className="rounded-md object-cover h-16 w-16" 
                      unoptimized
                      onError={(e) => { e.currentTarget.src = 'https://picsum.photos/seed/placeholder/64/64'; }}
                    />
                  )}
                  <div>
                    <CardTitle>{summary.categoryName}</CardTitle>
                    <CardDescription>কাজের সারসংক্ষেপ</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className='flex justify-between items-center bg-muted p-3 rounded-md'>
                    <span className="text-sm text-muted-foreground">মোট পিস</span>
                    <span className="font-bold text-lg">{summary.totalPieces.toLocaleString('bn-BD')}</span>
                </div>
                 <div className='flex justify-between items-center bg-muted p-3 rounded-md'>
                    <span className="text-sm text-muted-foreground">মোট আয়</span>
                    <span className="font-bold text-lg text-primary">{formatCurrency(summary.totalAmount)}</span>
                </div>
                
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full mt-2">
                           <Eye className="mr-2 h-4 w-4" /> বিস্তারিত দেখুন
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                        <DialogTitle>{summary.categoryName} - বিস্তারিত এন্ট্রি</DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[60vh] overflow-y-auto mt-4 pr-4">
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>তারিখ</TableHead>
                                    <TableHead className="text-center">পিস</TableHead>
                                    <TableHead className="text-right">মোট টাকা</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {summary.entries.map(entry => (
                                    <TableRow key={entry.id}>
                                    <TableCell>{new Date(entry.date).toLocaleDateString('bn-BD')}</TableCell>
                                    <TableCell className="text-center">{entry.pieceCount.toLocaleString('bn-BD')}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(entry.total)}</TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </div>
                    </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

    
