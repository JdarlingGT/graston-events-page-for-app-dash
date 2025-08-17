"use client";

import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Clinician {
  id: string;
  name: string;
  email: string;
  specialty: string;
  location: string;
}

async function fetchClinicians(): Promise<Clinician[]> {
  const response = await fetch("/api/clinicians");
  if (!response.ok) throw new Error("Failed to fetch clinicians");
  return response.json();
}

export const columns: ColumnDef<Clinician>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link href={`/dashboard/directory/clinicians/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "specialty", header: "Specialty" },
  { accessorKey: "location", header: "Location" },
];

export function CliniciansTable() {
  const { data: clinicians = [], isLoading } = useQuery<Clinician[]>({
    queryKey: ["clinicians"],
    queryFn: fetchClinicians,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return <DataTable columns={columns} data={clinicians} />;
}