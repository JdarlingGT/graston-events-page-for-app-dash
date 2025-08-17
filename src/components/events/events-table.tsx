"use client";

import { useQuery } from "@tanstack/react-query";
import { ColumnDef, ColumnFiltersState } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { DANGER_ZONE_CONFIG } from "@/lib/config";
import { differenceInDays, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";
import React from "react";

interface Event {
  id: string;
  name: string;
  date: string;
  instructor: string;
  city: string;
  enrolledStudents: number;
  instrumentsPurchased: number;
  mode: "In-Person" | "Virtual";
}

async function fetchEvents(): Promise<Event[]> {
  const response = await fetch("/api/events");
  if (!response.ok) throw new Error("Failed to fetch events");
  return response.json();
}

const getDangerZoneStatus = (event: Event) => {
  const threshold = DANGER_ZONE_CONFIG.THRESHOLDS[event.mode] || 0;
  const totalSignups = event.enrolledStudents + event.instrumentsPurchased;
  const isAtRisk = totalSignups < threshold;

  if (!isAtRisk) {
    return { level: "safe", text: "Safe" };
  }

  const daysAway = differenceInDays(parseISO(event.date), new Date());

  if (daysAway < 0) {
    return { level: "past", text: "Past Event" };
  }
  if (daysAway < DANGER_ZONE_CONFIG.URGENCY_DAYS.URGENT) {
    return { level: "urgent", text: `At Risk (<${DANGER_ZONE_CONFIG.URGENCY_DAYS.URGENT} days)` };
  }
  if (daysAway <= DANGER_ZONE_CONFIG.URGENCY_DAYS.WARNING) {
    return { level: "warning", text: `At Risk (7-10 days)` };
  }
  
  return { level: "at-risk", text: "At Risk" };
};

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "name",
    header: "Event Name",
    cell: ({ row }) => (
      <Link href={`/dashboard/events/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
  },
  { accessorKey: "instructor", header: "Instructor" },
  { accessorKey: "city", header: "City" },
  { accessorKey: "enrolledStudents", header: "Enrolled" },
  { accessorKey: "instrumentsPurchased", header: "Kits" },
  {
    id: "dangerZone",
    header: "Danger Zone Status",
    cell: ({ row }) => {
      const status = getDangerZoneStatus(row.original);
      const classes = cn({
        "text-yellow-600": status.level === "warning",
        "text-red-600 font-bold": status.level === "urgent",
        "text-orange-500": status.level === "at-risk",
      });
      return <span className={classes}>{status.text}</span>;
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

  const upcomingEvents = isLoading ? [] : events.filter(event => differenceInDays(parseISO(event.date), new Date()) >= 0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return <DataTable columns={columns} data={upcomingEvents} columnFilters={columnFilters} setColumnFilters={setColumnFilters} />;
}