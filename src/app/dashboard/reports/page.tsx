"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { SalesOverviewChart } from "@/components/dashboard/sales-overview-chart";
import { EventEnrollmentChart } from "@/components/dashboard/event-enrollment-chart";
import { InstrumentSalesChart } from "@/components/dashboard/instrument-sales-chart";

interface Event {
  id: string;
  name: string;
  enrolledStudents: number;
  instrumentsPurchased: number;
}

export default function ReportsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) {
          throw new Error("Failed to fetch report data");
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load report data.");
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <div className="space-y-4">
       <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Analytical overview of events and sales.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          {loading ? <Skeleton className="h-[434px]" /> : <SalesOverviewChart />}
        </div>
        <div>
          {loading ? <Skeleton className="h-[485px]" /> : <EventEnrollmentChart data={events} />}
        </div>
        <div>
          {loading ? <Skeleton className="h-[485px]" /> : <InstrumentSalesChart data={events} />}
        </div>
      </div>
    </div>
  );
}