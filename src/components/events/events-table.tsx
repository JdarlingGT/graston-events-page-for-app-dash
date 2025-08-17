"use client";

import { useQuery } from "@tanstack/react-query";
import { ColumnDef, ColumnFiltersState } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";
import React from "react";
import { Progress } from "../ui/progress";

interface Event {
  id: string;
  title: string;
  startDate: string;
  location: { city: string };
  enrolledCount: number;
  capacity: number;
  status: "Go" | "At Risk" | "Completed";
  instructorIds: string[];
}

async function fetchEvents(): Promise<Event[]> {
  const response = await fetch("/api/events");
  if (!response.ok) throw new Error("Failed to fetch events");
  return response.json();
}

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "title",
    header: "Event Name",
    cell: ({ row }) => (
      <Link href={`/dashboard/events/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => new Date(row.original.startDate).toLocaleDateString(),
  },
  {
    accessorKey: "location",
    header: "City",
    cell: ({ row }) => row.original.location.city,
  },
  {
    id: "enrollment",
    header: "Enrollment",
    cell: ({ row }) => {
      const { enrolledCount, capacity } = row.original;
      const percentage = capacity > 0 ? (enrolledCount / capacity) * 100 : 0;
      return (
        <div className="flex items-center gap-2">
          <Progress value={percentage} className="h-2 w-20" />
          <span className="text-sm text-muted-foreground">
            {enrolledCount} / {capacity}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const classes = cn({
        "text-yellow-600": status === "At Risk",
        "text-green-600": status === "Go",
        "text-gray-500": status === "Completed",
      });
      return <span className={classes}>{status}</span>;
    },
  },
];

interface EventsTableProps {
  columnFilters: ColumnFiltersState;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
}

export function EventsTable({ columnFilters, setColumnFilters }: EventsTableProps) {
  const { data: events = [], isLoading, error } = useQuery<Event[]>({
    queryKey: ["events-table"],
    queryFn: fetchEvents,
  });

  if (error) {
    toast.error("Failed to load events data.");
  }

  const upcomingEvents = isLoading ? [] : events.filter(event => event.status !== "Completed");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return <DataTable columns={columns} data={upcomingEvents} columnFilters={columnFilters} setColumnFilters={setColumnFilters} />;
}