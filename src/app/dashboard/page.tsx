"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Event {
  id: string;
  name: string;
  city: string;
  state: string;
  instructor: string;
  enrolledStudents: number;
  instrumentsPurchased: number;
}

const getDangerZoneStatus = (enrolledStudents: number) => {
  if (enrolledStudents < 4) {
    return { text: "At Risk", variant: "destructive" as const };
  }
  if (enrolledStudents < 10) {
    return { text: "Warning", variant: "secondary" as const };
  }
  return { text: "OK", variant: "default" as const };
};

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load event data.");
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const columns: ColumnDef<Event>[] = [
    {
      accessorKey: "name",
      header: "Event Name",
    },
    {
      accessorKey: "city",
      header: "City",
    },
    {
      accessorKey: "state",
      header: "State",
    },
    {
      accessorKey: "instructor",
      header: "Instructor",
    },
    {
      accessorKey: "enrolledStudents",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Enrolled
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="text-center">{row.original.enrolledStudents}</div>
    },
    {
      accessorKey: "instrumentsPurchased",
      header: "Kits Purchased",
       cell: ({ row }) => <div className="text-center">{row.original.instrumentsPurchased}</div>
    },
    {
      id: "dangerZone",
      header: "Danger Zone",
      cell: ({ row }) => {
        const status = getDangerZoneStatus(row.original.enrolledStudents);
        return <Badge variant={status.variant}>{status.text}</Badge>;
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Dashboard</CardTitle>
        <CardDescription>
          An overview of all upcoming events and their status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <DataTable columns={columns} data={events} />
        )}
      </CardContent>
    </Card>
  );
}