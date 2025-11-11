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
import { PlusCircle } from 'lucide-react';
import type { ProductionEntry } from '@/lib/types';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';

export const columns: ColumnDef<ProductionEntry>[] = [
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
  },
  {
    accessorKey: 'workerName',
    header: 'Worker Name',
  },
  {
    accessorKey: 'pieceCount',
    header: 'Piece Count',
  },
  {
    accessorKey: 'overtimeHours',
    header: 'Overtime (Hours)',
  },
];

export default function ProductionPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [columnFilters, setColumnFilters] = React.useState<any[]>([]);

  const productionQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'workers', user.uid, 'productionEntries'));
  }, [firestore, user]);

  const { data: productionEntries, isLoading } =
    useCollection<ProductionEntry>(productionQuery);

  const table = useReactTable({
    data: productionEntries ?? [],
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
                <CardTitle>Production & Overtime</CardTitle>
                <CardDescription>Log daily production and overtime hours for workers.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Loading production data...</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Production & Overtime</CardTitle>
        <CardDescription>
          Log daily production and overtime hours for workers.
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
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Entry
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
