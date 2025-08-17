"use client";

import { EventForm } from "@/components/dashboard/events/event-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

interface Event {
  id: string;
  name: string;
  city: string;
  state: string;
  instructor: string;
  enrolledStudents: number;
  instrumentsPurchased: number;
  type: "Essential" | "Advanced";
  mode: "In-Person" | "Virtual";
}

export default function EditEventPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {    
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/events/${params.id}`);
        if (!response.ok) {
          throw new Error("Event not found");
        }
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        setError("Failed to load event data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-8 w-1/2" />
        <div className="space-y-8 pt-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }

  return <EventForm initialData={event} />;
}