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
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
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
          Name
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
    header: 'Designation',
    cell: ({ row }) => <Badge variant="outline">{row.original.designation}</Badge>,
  },
  {
    accessorKey: 'department',
    header: 'Department',
  },
  {
    accessorKey: 'basicSalary',
    header: () => <div className="text-right">Basic Salary</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('basicSalary'));
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 0,
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'joinDate',
    header: 'Joining Date',
    cell: ({ row }) => new Date(row.original.joinDate).toLocaleDateString(),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const worker = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(worker.id)}>
              Copy worker ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit Worker</DropdownMenuItem>
            <DropdownMenuItem>View QR Code</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
              Delete Worker
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
