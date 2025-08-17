"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

interface Event {
  id: string;
  name: string;
  date: string;
  mode: "In-Person" | "Virtual";
  type: "Essential" | "Advanced";
}

async function fetchAllEvents(): Promise<Event[]> {
  const response = await fetch("/api/events");
  if (!response.ok) throw new Error("Failed to fetch events");
  return response.json();
}

export function EventCalendarCard() {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["all-events-calendar"],
    queryFn: fetchAllEvents,
  });

  const modifiers = {
    inPersonEssential: events
      ?.filter(e => e.mode === "In-Person" && e.type === "Essential")
      .map(e => parseISO(e.date)) || [],
    inPersonAdvanced: events
      ?.filter(e => e.mode === "In-Person" && e.type === "Advanced")
      .map(e => parseISO(e.date)) || [],
    virtualEssential: events
      ?.filter(e => e.mode === "Virtual" && e.type === "Essential")
      .map(e => parseISO(e.date)) || [],
    virtualAdvanced: events
      ?.filter(e => e.mode === "Virtual" && e.type === "Advanced")
      .map(e => parseISO(e.date)) || [],
  };

  const modifiersClassNames = {
    inPersonEssential: "day-in-person-essential",
    inPersonAdvanced: "day-in-person-advanced",
    virtualEssential: "day-virtual-essential",
    virtualAdvanced: "day-virtual-advanced",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <CardTitle>Event Calendar</CardTitle>
        </div>
        <CardDescription>
          At-a-glance view of all scheduled events.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[280px] w-full" />
        ) : (
          <>
            <Calendar
              mode="single"
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              className="p-0"
            />
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold">Legend:</p>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-sm bg-primary/10" />
                <span>In-Person (Essential)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-sm bg-primary/30" />
                <span>In-Person (Advanced)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-sm bg-[hsl(var(--chart-2)/0.2)]" />
                <span>Virtual (Essential)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-sm bg-[hsl(var(--chart-2)/0.4)]" />
                <span>Virtual (Advanced)</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}