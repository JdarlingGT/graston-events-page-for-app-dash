"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { EventMap } from "./event-map";
import { EventCard } from "./event-card";
import { EventFilters } from "./event-filters";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  name: string;
  city: string;
  state: string;
  instructor: {
    name: string;
    avatar?: string;
  };
  enrolledStudents: number;
  instrumentsPurchased: number;
  capacity: number;
  minViableEnrollment: number;
  type: "Essential" | "Advanced";
  mode: "In-Person" | "Virtual";
  status: "upcoming" | "ongoing" | "completed";
  featuredImage?: string;
  date: string; // Assuming a single date for simplicity in list view
  endDate?: string;
}

interface EventFiltersState {
  search: string;
  type: string;
  mode: string;
  status: string;
  dangerZone: string;
  dateRange: { from?: Date; to?: Date };
  enrollmentRange: [number, number];
  revenueRange: [number, number];
  cities: string[];
  instructors: string[];
}

// Hardcoded coordinates for common cities for demo purposes
const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
  "San Francisco": { lat: 37.7749, lng: -122.4194 },
  "Austin": { lat: 30.2672, lng: -97.7431 },
  "New York": { lat: 40.7128, lng: -74.0060 },
  "Los Angeles": { lat: 34.0522, lng: -118.2437 },
  "Chicago": { lat: 41.8781, lng: -87.6298 },
  "Seattle": { lat: 47.6062, lng: -122.3321 },
  "Miami": { lat: 25.7617, lng: -80.1918 },
  "Denver": { lat: 39.7392, lng: -104.9903 },
  "Boston": { lat: 42.3601, lng: -71.0589 },
  "Dallas": { lat: 32.7767, lng: -96.7970 },
};

export function EventMapCardView() {
  const [filters, setFilters] = useState<EventFiltersState>({
    search: "",
    type: "all",
    mode: "all",
    status: "all",
    dangerZone: "all",
    dateRange: {},
    enrollmentRange: [0, 100],
    revenueRange: [0, 100000],
    cities: [],
    instructors: [],
  });
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading, error } = useQuery<Event[]>({
    queryKey: ["events", filters], // Add filters to query key for re-fetching
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.mode !== 'all') params.append('mode', filters.mode);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.dangerZone !== 'all') params.append('dangerZone', filters.dangerZone);
      if (filters.dateRange.from) params.append('fromDate', filters.dateRange.from.toISOString().split('T')[0]);
      if (filters.dateRange.to) params.append('toDate', filters.dateRange.to.toISOString().split('T')[0]);
      if (filters.enrollmentRange[0] !== 0) params.append('enrollmentMin', filters.enrollmentRange[0].toString());
      if (filters.enrollmentRange[1] !== 100) params.append('enrollmentMax', filters.enrollmentRange[1].toString());
      filters.cities.forEach(city => params.append('cities', city));
      filters.instructors.forEach(instructor => params.append('instructors', instructor));

      const queryString = params.toString();
      const url = `/api/events${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      // Client-side mapping for instructor object and default values
      return data.map((event: any) => ({
        ...event,
        instructor: event.instructor ? { name: event.instructor, avatar: `https://i.pravatar.cc/150?u=${event.instructor}` } : { name: "N/A" },
        capacity: event.capacity || 50,
        minViableEnrollment: event.minViableEnrollment || 10,
        type: event.type || "Essential",
        mode: event.mode || "In-Person",
        status: event.status || "upcoming",
        featuredImage: event.featuredImage || `https://picsum.photos/seed/${event.id}/800/400`,
        date: event.date || new Date().toISOString().split('T')[0],
      }));
    },
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to load events for the directory.");
    }
  }, [error]);

  // Map events to include coordinates for the map component
  const eventsWithCoordinates = events.map((event: Event) => ({
    ...event,
    coordinates: cityCoordinates[event.city] || { lat: 0, lng: 0 } // Fallback for unknown cities
  }));

  const availableOptions = {
    cities: Array.from(new Set(events.map((e: Event) => e.city))),
    instructors: Array.from(new Set(events.map((e: Event) => e.instructor.name))),
    types: Array.from(new Set(events.map((e: Event) => e.type))),
    modes: Array.from(new Set(events.map((e: Event) => e.mode))),
  };

  const handleCardHover = (eventId: string | null) => {
    setHoveredEventId(eventId);
  };

  const handleCardClick = (eventId: string) => {
    setSelectedEventId(eventId);
    // On mobile, close the sheet after clicking a card to show the map
    if (isMobile) {
      // This would typically be handled by the Sheet component's state
      // For now, we'll just set the selected ID.
    }
  };

  const handlePinClick = (eventId: string) => {
    setSelectedEventId(eventId);
    const cardElement = cardRefs.current[eventId];
    if (cardElement) {
      cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleCardMouseEnter = (eventId: string) => {
    handleCardHover(eventId);
    // Preload event details on hover
    queryClient.prefetchQuery({
      queryKey: ["event-detail", eventId],
      queryFn: async () => {
        const response = await fetch(`/api/events/${eventId}/detail`);
        if (!response.ok) throw new Error("Failed to fetch event details");
        return response.json();
      },
    });
  };

  const renderContent = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {isLoading ? (
        Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[350px] w-full rounded-lg" />
        ))
      ) : eventsWithCoordinates.length === 0 ? (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          No events found matching your criteria.
        </div>
      ) : (
        eventsWithCoordinates.map((event) => (
          <div
            key={event.id}
            ref={(el) => { cardRefs.current[event.id] = el; }}
            onClick={() => handleCardClick(event.id)}
            onMouseEnter={() => handleCardMouseEnter(event.id)}
            onMouseLeave={() => handleCardHover(null)}
          >
            <EventCard
              event={event}
              isHovered={hoveredEventId === event.id || selectedEventId === event.id}
            />
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-full w-full">
      {/* Filters and Cards Section */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Event Directory</h1>
        <EventFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableOptions={availableOptions}
        />
        <div className="mt-8">
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button className="w-full mb-4">
                  <Map className="mr-2 h-4 w-4" /> View Map
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[70vh] p-0">
                <EventMap
                  events={eventsWithCoordinates}
                  hoveredEventId={hoveredEventId}
                  selectedEventId={selectedEventId}
                  onPinClick={handlePinClick}
                />
              </SheetContent>
              {renderContent()}
            </Sheet>
          ) : (
            renderContent()
          )}
        </div>
      </div>

      {/* Map Section (Desktop) */}
      {!isMobile && (
        <div className="lg:w-2/5 xl:w-1/2 lg:h-auto h-[50vh] lg:sticky lg:top-0">
          <EventMap
            events={eventsWithCoordinates}
            hoveredEventId={hoveredEventId}
            selectedEventId={selectedEventId}
            onPinClick={handlePinClick}
          />
        </div>
      )}
    </div>
  );
}