"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

interface Training {
  id: string;
  name: string;
  date: string;
  city: string;
  status: "upcoming" | "ongoing" | "completed";
}

// Hardcoding the instructor for demonstration purposes
const CURRENT_INSTRUCTOR_NAME = "Sarah Johnson";

async function fetchInstructorTrainings(): Promise<Training[]> {
  const res = await fetch('/api/events');
  if (!res.ok) throw new Error('Failed to fetch trainings');
  const allEvents = await res.json();
  // The mock data has instructor as a string, not an object. Adjusting filter.
  return allEvents.filter((event: any) => event.instructor === CURRENT_INSTRUCTOR_NAME);
}

const columns: ColumnDef<Training>[] = [
  {
    accessorKey: "name",
    header: "Event Name",
    cell: ({ row }) => (
      <Link href={`/dashboard/trainings/${row.original.id}/workspace`} className="font-medium text-primary hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
  },
  { accessorKey: "city", header: "Location" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge className="capitalize">{row.original.status}</Badge>,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button asChild variant="outline" size="sm">
        <Link href={`/dashboard/trainings/${row.original.id}/workspace`}>
          Open Workspace <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    ),
  },
];

export function InstructorDashboard() {
  const { data: trainings, isLoading } = useQuery<Training[]>({
    queryKey: ["instructor-trainings", CURRENT_INSTRUCTOR_NAME],
    queryFn: fetchInstructorTrainings,
  });

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return <DataTable columns={columns} data={trainings || []} />;
}