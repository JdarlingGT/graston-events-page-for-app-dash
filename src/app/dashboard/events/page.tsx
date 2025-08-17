"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EventsTable } from "@/components/events/events-table";
import { EventMap } from "@/components/dashboard/events/EventMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PlusCircle, List, MapPin } from "lucide-react";
import Link from "next/link";
import { ColumnFiltersState } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  startDate: string;
  location: { city: string; state: string };
  enrolledCount: number;
  capacity: number;
  status: "Go" | "At Risk" | "Completed";
  instructorIds: string[];
}

async function fetchEvents(): Promise<Event[]> {
  const response = await fetch("/api/events");
  if (!response.ok) throw new Error("Failed to fetch events");
  return response.json();
}

export default function EventsPage() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const { data: allEvents = [], isLoading, error } = useQuery<Event[]>({
    queryKey: ["events-page"],
    queryFn: fetchEvents,
  });

  if (error) {
    toast.error("Failed to load events data.");
  }

  // Filter events based on search and other filters
  const filteredEvents = allEvents.filter(event => {
    // Apply search filter
    const searchFilter = columnFilters.find(f => f.id === 'title');
    if (searchFilter && searchFilter.value) {
      const searchTerm = (searchFilter.value as string).toLowerCase();
      if (!event.title.toLowerCase().includes(searchTerm)) {
        return false;
      }
    }

    // Only show non-completed events by default
    return event.status !== "Completed";
  });

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nameFilter = columnFilters.find(f => f.id === 'title');
    const newFilterValue = event.target.value;

    if (newFilterValue) {
      if (nameFilter) {
        setColumnFilters(columnFilters.map(f => f.id === 'title' ? { ...f, value: newFilterValue } : f));
      } else {
        setColumnFilters(prev => [...prev, { id: 'title', value: newFilterValue }]);
      }
    } else {
      setColumnFilters(columnFilters.filter(f => f.id !== 'title'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Events</h1>
          <p className="text-muted-foreground">
            Manage all company events from this command center.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/events/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
            <Input
              placeholder="Search events by name..."
              value={(columnFilters.find(f => f.id === 'title')?.value as string) ?? ''}
              onChange={handleFilterChange}
              className="max-w-sm"
            />
            
            <ToggleGroup 
              type="single" 
              value={viewMode} 
              onValueChange={(value) => value && setViewMode(value as "list" | "map")}
              className="border rounded-lg p-1"
            >
              <ToggleGroupItem value="list" aria-label="List view" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List
              </ToggleGroupItem>
              <ToggleGroupItem value="map" aria-label="Map view" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Map
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
            </div>
          ) : viewMode === "list" ? (
            <EventsTable columnFilters={columnFilters} setColumnFilters={setColumnFilters} />
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredEvents.length} events on the map
              </div>
              <EventMap 
                events={filteredEvents}
                selectedEventId={selectedEventId}
                onEventSelect={setSelectedEventId}
                className="h-[600px]"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}