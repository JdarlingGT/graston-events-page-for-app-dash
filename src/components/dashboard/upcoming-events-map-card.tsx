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
import { EventMap } from "./events/EventMap";
import { differenceInDays, parseISO } from "date-fns";

interface Event {
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

async function fetchUpcomingEvents(): Promise<Event[]> {
  const response = await fetch("/api/events");
  if (!response.ok) throw new Error("Failed to fetch events");
  const events = await response.json();
  
  // Filter to only upcoming events (not completed)
  return events.filter((event: Event) => 
    event.status !== "Completed" && 
    differenceInDays(parseISO(event.startDate), new Date()) >= -1 // Include events from yesterday onwards
  );
}

export function UpcomingEventsMapCard() {
  const { data: events, isLoading } = useQuery<Event[]>({
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