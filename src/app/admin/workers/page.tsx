'use client';

import React from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Worker } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

export default function WorkersPage() {
  const firestore = useFirestore();

  const workersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workers') : null),
    [firestore]
  );

  const { data: workers, isLoading } = useCollection<Worker>(workersQuery);

  return (
    <Card className="font-sans">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>কর্মী পরিচালনা</CardTitle>
            <CardDescription>
              আপনার কারখানার কর্মীদের প্রোফাইল দেখুন, যোগ করুন বা পরিচালনা করুন।
            </CardDescription>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            নতুন কর্মী যোগ করুন
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>কর্মী</TableHead>
                <TableHead>বিভাগ</TableHead>
                <TableHead>যোগাযোগ</TableHead>
                <TableHead>যোগদানের তারিখ</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    কর্মী লোড হচ্ছে...
                  </TableCell>
                </TableRow>
              ) : workers && workers.length > 0 ? (
                workers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={worker.photo} alt={worker.name} />
                          <AvatarFallback>
                            {worker.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid gap-0.5">
                          <span className="font-semibold">{worker.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {worker.designation}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{worker.department}</Badge>
                    </TableCell>
                    <TableCell>{worker.contact}</TableCell>
                    <TableCell>
                      {new Date(worker.joinDate).toLocaleDateString('bn-BD')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">মেনু খুলুন</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>অ্যাকশন</DropdownMenuLabel>
                          <DropdownMenuItem>প্রোফাইল সম্পাদনা</DropdownMenuItem>
                          <DropdownMenuItem>বিস্তারিত দেখুন</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            কর্মী মুছুন
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    কোনো কর্মী পাওয়া যায়নি।
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
