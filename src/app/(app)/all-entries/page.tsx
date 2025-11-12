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
    minimumFractionDigits: 2,
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

    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
    });
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

    allEntries.forEach((entry) => {
      let summary = summaryMap.get(entry.categoryId);
      if (!summary) {
        summary = {
          categoryId: entry.categoryId,
          categoryName: entry.categoryName,
          categoryImageUrl: entry.categoryImageUrl,
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
    <div ref={printRef}>
        <Card className="mb-6 bg-primary text-primary-foreground border-none">
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2"><Scissors /> সকল কাজের হিসাব</CardTitle>
                    <CardDescription className="text-primary-foreground/80">
                        আপনার সমস্ত কাজ ক্যাটাগরি অনুযায়ী বিভক্ত করে দেখানো হলো।
                    </CardDescription>
                </div>
                 <Button onClick={handleDownloadPdf} variant="secondary">
                    <Download className="mr-2 h-4 w-4" />
                    PDF ডাউনলোড করুন
                </Button>
            </CardHeader>
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
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // prevents looping
                        target.src = 'https://picsum.photos/seed/placeholder/64/64';
                      }}
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
