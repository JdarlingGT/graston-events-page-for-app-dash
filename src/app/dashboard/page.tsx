"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Building, CalendarDays, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { SalesOverviewChart } from "@/components/dashboard/sales-overview-chart";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";
import { DashboardCalendar } from "@/components/dashboard/dashboard-calendar";
import { EventEnrollmentChart } from "@/components/dashboard/event-enrollment-chart";

interface Event {
  id: string;
  name: string;
  enrolledStudents: number;
}

interface Venue {
  id: string;
}

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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading ? <Skeleton className="h-[434px]" /> : <SalesOverviewChart />}
        </div>
        <div className="lg:col-span-1">
          {loading ? <Skeleton className="h-[434px]" /> : <UpcomingEvents />}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          {loading ? <Skeleton className="h-[400px]" /> : <DashboardCalendar />}
        </div>
        <div className="lg:col-span-2">
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