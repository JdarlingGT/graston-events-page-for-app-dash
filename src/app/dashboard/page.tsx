"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Building, CalendarDays, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { DangerZoneCard } from "@/components/dashboard/danger-zone-card";
import { UpcomingTasksCard } from "@/components/dashboard/upcoming-tasks-card";
import { RecentNotificationsCard } from "@/components/dashboard/recent-notifications-card";

interface Event {
  id: string;
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
      } catch (error)
      {
        console.error(error);
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    async function runProactiveCheck() {
      try {
        const response = await fetch('/api/events/check-danger-zone', { method: 'POST' });
        const data = await response.json();
        if (data.atRiskCount > 0) {
          toast.warning(`Proactive check complete: ${data.atRiskCount} event(s) require attention.`);
        } else {
          toast.success("Proactive check complete: All events are on track.");
        }
      } catch (error) {
        console.error("Proactive check failed:", error);
        toast.error("Could not run proactive event check.");
      }
    }

    fetchData();
    runProactiveCheck();
  }, []);

  const totalEnrolled = events.reduce(
    (sum, event) => sum + event.enrolledStudents,
    0
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <Skeleton className="h-28" />
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
             <StatCard
              title="Projected Revenue"
              value="$1.2M"
              icon={Users}
            />
          </>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DangerZoneCard />
        <div className="space-y-6">
          <UpcomingTasksCard />
          <RecentNotificationsCard />
        </div>
      </div>
    </div>
  );
}