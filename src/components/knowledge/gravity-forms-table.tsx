'use client';

import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Skeleton } from '@/components/ui/skeleton';

interface GravityForm {
  id: number;
  name: string;
  description: string;
}

const columns: ColumnDef<GravityForm>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Form Name' },
  { accessorKey: 'description', header: 'Description' },
];

async function fetchForms(): Promise<GravityForm[]> {
  const res = await fetch('/api/knowledge/gravity-forms');
  if (!res.ok) {
throw new Error('Failed to fetch Gravity Forms');
}
  return res.json();
}

export function GravityFormsTable() {
  const { data, isLoading } = useQuery<GravityForm[]>({
    queryKey: ['gravity-forms'],
    queryFn: fetchForms,
  });

  if (isLoading) {
return <Skeleton className="h-64 w-full" />;
}

  return <DataTable columns={columns} data={data || []} />;
}