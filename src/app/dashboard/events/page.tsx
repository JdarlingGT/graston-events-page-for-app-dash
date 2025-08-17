"use client";

import { EventsTable } from "@/components/events/events-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function EventsPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events Hub</h1>
          <p className="text-muted-foreground">
            Your master view for managing all events.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/events/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>
      <EventsTable />
    </div>
  );
}