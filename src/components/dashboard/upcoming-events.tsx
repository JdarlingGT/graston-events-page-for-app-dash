"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Event {
  id: string;
  name: string;
  city: string;
  enrolledStudents: number;
  capacity: number; // Assuming capacity is part of the event data
}

const getStatus = (enrolled: number, capacity: number) => {
  const percentage = (enrolled / capacity) * 100;
  if (percentage >= 100) {
    return { text: "Sold Out", variant: "destructive" as const };
  }
  if (percentage >= 80) {
    return { text: "Warning", variant: "secondary" as const };
  }
  return { text: "Open", variant: "default" as const };
};

export function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) throw new Error("Failed to fetch events");
        const data = await response.json();
        // Add a mock capacity to each event for status calculation
        const eventsWithCapacity = data.map((event: any) => ({
          ...event,
          capacity: 30, 
        }));
        setEvents(eventsWithCapacity.slice(0, 5)); // Show first 5 events
      } catch (error) {
        console.error(error);
        toast.error("Failed to load upcoming events.");
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
        <CardDescription>A quick look at the next few events.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <ul className="space-y-4">
            {events.map((event) => {
              const status = getStatus(event.enrolledStudents, event.capacity);
              return (
                <li key={event.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{event.name}</p>
                    <p className="text-sm text-muted-foreground">{event.city}</p>
                  </div>
                  <Badge variant={status.variant}>{status.text}</Badge>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}