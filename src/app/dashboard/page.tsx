"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Building, CalendarDays, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Event {
  id: string;
  name: string;
  city: string;
  state: string;
  instructor: string;
  enrolledStudents: number;
  instrumentsPurchased: number;
}

interface Venue {
  id: string;
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
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventsResponse, venuesResponse] = await Promise.all([
          fetch("/api/events"),
          fetch("/api/venues"),
        ]);

        if (!eventsResponse.ok || !venuesResponse.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const eventsData = await eventsResponse.json();
        const venuesData = await venuesResponse.json();

        setEvents(eventsData);
        setVenues(venuesData);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalEnrolled = events.reduce(
    (sum, event) => sum + event.enrolledStudents,
    0
  );

  const columns: ColumnDef<Event>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Event Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "instructor",
      header: "Instructor",
    },
    {
      accessorKey: "city",
      header: "City",
    },
    {
      accessorKey: "enrolledStudents",
      header: ({ column }) => {
        return (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Enrolled
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="text-center">{row.original.enrolledStudents}</div>
      ),
    },
    {
      accessorKey: "instrumentsPurchased",
      header: "Kits Purchased",
       cell: ({ row }) => (
        <div className="text-center">{row.original.instrumentsPurchased}</div>
      ),
    },
    {
      id: "dangerZone",
      header: "Danger Zone",
      cell: ({ row }) => {
        const status = getDangerZoneStatus(row.original.enrolledStudents);
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant={status.variant}>{status.text}</Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>At Risk: &lt; 4 students</p>
                <p>Warning: 4-9 students</p>
                <p>OK: 10+ students</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatCard
              title="Total Events"
              value={events.length.toString()}
              icon={CalendarDays}
            />
            <StatCard
              title="Total Venues"
              value={venues.length.toString()}
              icon={Building}
            />
            <StatCard
              title="Total Students Enrolled"
              value={totalEnrolled.toString()}
              icon={Users}
            />
          </>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>
            A complete overview of all scheduled events.
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
    </div>
  );
}