'use client';

import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { AttendanceRecord, AttendanceStatus } from '@/lib/types';

const getStatusBadgeVariant = (status: AttendanceStatus) => {
  switch (status) {
    case 'Present':
      return 'default';
    case 'Absent':
      return 'destructive';
    case 'Late':
      return 'secondary';
    case 'On Leave':
      return 'outline';
    default:
      return 'default';
  }
};

const getStatusInBangla = (status: AttendanceStatus) => {
    switch (status) {
        case 'Present': return 'উপস্থিত';
        case 'Absent': return 'অনুপস্থিত';
        case 'Late': return 'বিলম্ব';
        case 'On Leave': return 'ছুটিতে';
        default: return status;
    }
}

export const columns: ColumnDef<AttendanceRecord>[] = [
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
    accessorKey: 'workerName',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        কর্মীর নাম
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue('workerName')}</div>,
  },
  {
    accessorKey: 'date',
    header: 'তারিখ',
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString('bn-BD'),
  },
  {
    accessorKey: 'status',
    header: 'অবস্থা',
    cell: ({ row }) => (
      <Badge variant={getStatusBadgeVariant(row.getValue('status'))}>
        {getStatusInBangla(row.getValue('status'))}
      </Badge>
    ),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;

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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              রেকর্ড আইডি কপি করুন
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>রেকর্ড সম্পাদনা করুন</DropdownMenuItem>
            <DropdownMenuItem>কর্মীর প্রোফাইল দেখুন</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function AttendancePage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const attendanceQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'workers', user.uid, 'attendance'));
  }, [firestore, user]);

  const { data: attendanceRecords, isLoading } =
    useCollection<AttendanceRecord>(attendanceQuery);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: attendanceRecords ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>উপস্থিতি ট্র্যাকিং</CardTitle>
          <CardDescription>
            দৈনিক উপস্থিতির রেকর্ড দেখুন এবং পরিচালনা করুন।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>উপস্থিতির ডেটা লোড হচ্ছে...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>উপস্থিতি ট্র্যাকিং</CardTitle>
        <CardDescription>
          দৈনিক উপস্থিতির রেকর্ড দেখুন এবং পরিচালনা করুন।
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center py-4 gap-2">
          <Input
            placeholder="কর্মীর নাম দিয়ে ফিল্টার করুন..."
            value={
              (table.getColumn('workerName')?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn('workerName')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                কলাম <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === 'workerName' ? 'কর্মীর নাম' : column.id === 'date' ? 'তারিখ' : column.id === 'status' ? 'অবস্থা' : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            উপস্থিতি চিহ্নিত করুন
          </Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    কোনো ফলাফল পাওয়া যায়নি।
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} টির মধ্যে{' '}
            {table.getFilteredSelectedRowModel().rows.length} টি নির্বাচিত।
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              পূর্ববর্তী
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              পরবর্তী
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
