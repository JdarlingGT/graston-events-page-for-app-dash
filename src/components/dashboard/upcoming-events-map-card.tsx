"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { differenceInDays, parseISO } from "date-fns";
import dynamic from "next/dynamic";

const EventMap = dynamic(() => import("./events/EventMap").then((mod) => mod.EventMap), {
  loading: () => <Skeleton className="h-96 w-full rounded-lg" />,
  ssr: false,
});

// Raw type from API
interface RawEvent {
  id: string;
  name: string;
  date: string;
  city: string;
  state: string;
  enrolledStudents: number;
  capacity: number;
  status: "upcoming" | "ongoing" | "completed";
  minViableEnrollment: number;
}

// Target type for the EventMap component
interface MappedEvent {
  id: string;
  title: string;
  startDate: string;
  location: {
    city: string;
    state: string;
  };
  enrolledCount: number;
  capacity: number;
  status: "Go" | "At Risk" | "Completed";
}

async function fetchUpcomingEvents(): Promise<MappedEvent[]> {
  const response = await fetch("/api/events");
  if (!response.ok) throw new Error("Failed to fetch events");
  const rawEvents: RawEvent[] = await response.json();
  
  // Filter to only upcoming events (not completed)
  const upcomingRawEvents = rawEvents.filter((event) => 
    event.status !== "completed" && 
    differenceInDays(parseISO(event.date), new Date()) >= -1
  );

  // Map to the structure expected by EventMap
  return upcomingRawEvents.map(event => {
    let status: "Go" | "At Risk" | "Completed" = "Go";
    if (event.enrolledStudents < event.minViableEnrollment) {
      status = "At Risk";
    }
    if (event.status === "completed") {
      status = "Completed";
    }

    return {
      id: event.id,
      title: event.name,
      startDate: event.date,
      location: {
        city: event.city,
        state: event.state,
      },
      enrolledCount: event.enrolledStudents,
      capacity: event.capacity,
      status: status,
    };
  });
}

export function UpcomingEventsMapCard() {
  const { data: events, isLoading } = useQuery<MappedEvent[]>({
    queryKey: ["upcoming-events-map"],
    queryFn: fetchUpcomingEvents,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <CardTitle>Upcoming Events Map</CardTitle>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/events">
              View All Events <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <CardDescription>
          Geographic overview of all upcoming training events.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-96 w-full rounded-lg" />
        ) : events && events.length > 0 ? (
          <EventMap events={events} />
        ) : (
          <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No upcoming events to display</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}