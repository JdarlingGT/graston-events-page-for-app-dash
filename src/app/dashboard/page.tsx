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
import { ArrowUpDown, Building, CalendarDays, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { EventEnrollmentChart } from "@/components/dashboard/event-enrollment-chart";

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
  name: string;
  type: string;
  city: string;
  capacity: number;
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
        return <Badge variant={status.variant}>{status.text}</Badge>;
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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Summary</CardTitle>
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
        </div>
        <div className="lg:col-span-3">
          {loading ? (
            <Skeleton className="h-[485px]" />
          ) : (
            <EventEnrollmentChart data={events} />
          )}
        </div>
      </div>
    </div>
  );
}