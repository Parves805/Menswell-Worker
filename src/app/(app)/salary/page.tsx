'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';
import * as React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Download, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SalaryDetails } from '@/lib/types';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);

export const columns: ColumnDef<SalaryDetails>[] = [
  {
    accessorKey: 'workerName',
    header: 'Worker',
  },
  {
    accessorKey: 'month',
    header: 'Month',
  },
  {
    accessorKey: 'basicSalary',
    header: 'Basic',
    cell: ({ row }) => formatCurrency(row.original.basicSalary),
  },
  {
    accessorKey: 'productionPay',
    header: 'Production',
    cell: ({ row }) => formatCurrency(row.original.productionPay),
  },
  {
    accessorKey: 'overtimePay',
    header: 'Overtime',
    cell: ({ row }) => formatCurrency(row.original.overtimePay),
  },
  {
    accessorKey: 'bonus',
    header: 'Bonus',
    cell: ({ row }) => formatCurrency(row.original.bonus),
  },
  {
    accessorKey: 'advanceDeduction',
    header: 'Advance',
    cell: ({ row }) => (
      <span className="text-destructive">
        {formatCurrency(row.original.advanceDeduction)}
      </span>
    ),
  },
  {
    accessorKey: 'absenceDeduction',
    header: 'Absence',
    cell: ({ row }) => (
      <span className="text-destructive">
        {formatCurrency(row.original.absenceDeduction)}
      </span>
    ),
  },
  {
    accessorKey: 'netSalary',
    header: 'Net Salary',
    cell: ({ row }) => (
      <span className="font-bold">
        {formatCurrency(row.original.netSalary)}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Generate Slip (PDF)</DropdownMenuItem>
          <DropdownMenuItem>View Details</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function SalaryPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [columnFilters, setColumnFilters] = React.useState<any[]>([]);

  const salaryQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'workers', user.uid, 'salaries'));
  }, [firestore, user]);

  const { data: salaryDetails, isLoading } = useCollection<SalaryDetails>(salaryQuery);

  const table = useReactTable({
    data: salaryDetails ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

  if (isLoading) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>Salary Management</CardTitle>
                  <CardDescription>Review, manage, and export monthly salary data.</CardDescription>
              </CardHeader>
              <CardContent>
                  <p>Loading salary data...</p>
              </CardContent>
          </Card>
      )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salary Management</CardTitle>
        <CardDescription>
          Review, manage, and export monthly salary data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between py-4">
          <Input
            placeholder="Filter by worker name..."
            value={
              (table.getColumn('workerName')?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn('workerName')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report (Excel)
          </Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
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
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
