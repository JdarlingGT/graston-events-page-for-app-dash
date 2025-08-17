"use client";

import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";

interface AcfFieldGroup {
  id: string;
  name: string;
  description: string;
}

const columns: ColumnDef<AcfFieldGroup>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Group Name" },
  { accessorKey: "description", header: "Description" },
];

async function fetchAcfFields(): Promise<AcfFieldGroup[]> {
  const res = await fetch('/api/knowledge/acf-fields');
  if (!res.ok) throw new Error('Failed to fetch ACF Fields');
  return res.json();
}

export function AcfFieldsTable() {
  const { data, isLoading } = useQuery<AcfFieldGroup[]>({
    queryKey: ['acf-fields'],
    queryFn: fetchAcfFields,
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return <DataTable columns={columns} data={data || []} />;
}