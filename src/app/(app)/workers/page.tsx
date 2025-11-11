import { workers } from '@/lib/data';
import { columns } from './columns';
import { DataTable } from './data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function WorkersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Worker Management</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={workers} />
      </CardContent>
    </Card>
  );
}
