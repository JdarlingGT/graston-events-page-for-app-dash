'use client';

import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Skeleton } from '@/components/ui/skeleton';

interface CrmTag {
  id: number;
  name: string;
  description: string;
}

const columns: ColumnDef<CrmTag>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Tag Name' },
  { accessorKey: 'description', header: 'Description' },
];

async function fetchCrmTags(): Promise<CrmTag[]> {
  const res = await fetch('/api/knowledge/crm-tags');
  if (!res.ok) {
throw new Error('Failed to fetch CRM tags');
}
  return res.json();
}

export function CrmTagsTable() {
  const { data, isLoading } = useQuery<CrmTag[]>({
    queryKey: ['crm-tags'],
    queryFn: fetchCrmTags,
  });

  if (isLoading) {
return <Skeleton className="h-64 w-full" />;
}

  return <DataTable columns={columns} data={data || []} />;
}