"use client";

import type { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Worker } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';

export const columns: ColumnDef<Worker>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="সবাইকে নির্বাচন করুন"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="সারি নির্বাচন করুন"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          নাম
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const worker = row.original;
      return (
        <div className="flex items-center gap-3">
          <Image
            src={worker.photoUrl}
            alt={worker.name}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="flex flex-col">
            <span className="font-medium">{worker.name}</span>
            <span className="text-sm text-muted-foreground">{worker.id}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'designation',
    header: 'পদবি',
    cell: ({ row }) => <Badge variant="outline">{row.original.designation}</Badge>,
  },
  {
    accessorKey: 'department',
    header: 'বিভাগ',
  },
  {
    accessorKey: 'basicSalary',
    header: () => <div className="text-right">মূল বেতন</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('basicSalary'));
      const formatted = new Intl.NumberFormat('bn-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 0,
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'joinDate',
    header: 'যোগদানের তারিখ',
    cell: ({ row }) => new Date(row.original.joinDate).toLocaleDateString('bn-BD'),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const worker = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">মেনু খুলুন</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>কার্যক্রম</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(worker.id)}>
              কর্মী আইডি কপি করুন
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>কর্মী সম্পাদনা করুন</DropdownMenuItem>
            <DropdownMenuItem>কিউআর কোড দেখুন</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
              কর্মী মুছে ফেলুন
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
