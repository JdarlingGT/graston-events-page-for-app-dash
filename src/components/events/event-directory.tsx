"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { EventCard } from "./event-card";
import { EventMap } from "./event-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Map, 
  Grid3X3, 
  Search, 
  Filter,
  MapPin,
  Calendar,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  instructor: {
    name: string;
    avatar?: string;
  };
  city: string;
  state: string;
  date: string;
  endDate?: string;
  enrolledStudents: number;
  capacity: number;
  type: "Essential" | "Advanced";
  mode: "In-Person" | "Virtual";
  status: "upcoming" | "ongoing" | "completed";
  featuredImage?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface Filters {
  search: string;
  type: string;
  mode: string;
  status: string;
  dangerZone: string;
}

export function EventDirectory() {
  const [view, setView] = useState<"cards" | "map">("cards");
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    type: "all",
    mode: "all",
    status: "all",
    dangerZone: "all",
  });

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const response = await fetch("/api/events");
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await response.json();
      
      // Transform the data to match our interface
      return data.map((event: any) => ({
        id: event.id,
        title: event.name,
        instructor: {
          name: event.instructor,
          avatar: undefined, // Would come from user profile
        },
        city: event.city,
        state: event.state,
        date: new Date().toISOString(), // Mock date
        enrolledStudents: event.enrolledStudents,
        capacity: Math.max(event.enrolledStudents + 10, 50), // Mock capacity
        type: Math.random() > 0.5 ? "Essential" : "Advanced",
        mode: Math.random() > 0.5 ? "In-Person" : "Virtual",
        status: "upcoming",
        featuredImage: `https://picsum.photos/400/300?random=${event.id}`,
      }));
    },
  });

  const filteredEvents = events.filter((event: Event) => {
    const matchesSearch = event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         event.instructor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         event.city.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesType = filters.type === "all" || event.type === filters.type;
    const matchesMode = filters.mode === "all" || event.mode === filters.mode;
    const matchesStatus = filters.status === "all" || event.status === filters.status;
    
    const matchesDangerZone = filters.dangerZone === "all" || 
      (filters.dangerZone === "at-risk" && event.enrolledStudents < 4) ||
      (filters.dangerZone === "healthy" && event.enrolledStudents >= 10);

    return matchesSearch && matchesType && matchesMode && matchesStatus && matchesDangerZone;
  });

  const handleEventClick = (eventId: string) => {
    // Scroll to card if in cards view
    if (view === "cards") {
      const element = document.getElementById(`event-card-${eventId}`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== "all" && value !== "").length;

  if (error) {
    toast.error("Failed to load events");
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Event Directory</h1>
          <p className="text-muted-foreground">
            {filteredEvents.length} events found
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center rounded-lg border p-1">
            <Button
              variant={view === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("cards")}
              className="h-8"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "map" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("map")}
              className="h-8"
            >
              <Map className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events, instructors, or cities..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filters.type} onValueChange={(value: string) => setFilters(prev => ({ ...prev, type: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Essential">Essential</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.mode} onValueChange={(value: string) => setFilters(prev => ({ ...prev, mode: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="In-Person">In-Person</SelectItem>
              <SelectItem value="Virtual">Virtual</SelectItem>
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Events</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div>
                  <label className="text-sm font-medium">Danger Zone</label>
                  <Select value={filters.dangerZone} onValueChange={(value: string) => setFilters(prev => ({ ...prev, dangerZone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="at-risk">At Risk (&lt; 4 students)</SelectItem>
                      <SelectItem value="healthy">Healthy (10+ students)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={filters.status} onValueChange={(value: string) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[600px]">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        ) : view === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event: Event) => (
              <EventCard
                key={event.id}
                event={event}
                isHovered={hoveredEventId === event.id}
                onHover={setHoveredEventId}
                className="h-fit"
              />
            ))}
          </div>
        ) : (
          <div className="h-[600px] rounded-lg overflow-hidden border">
            <EventMap
              events={filteredEvents}
              hoveredEventId={hoveredEventId}
              onEventHover={setHoveredEventId}
              onEventClick={handleEventClick}
            />
          </div>
        )}
      </div>

      {filteredEvents.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search terms.
          </p>
        </div>
      )}
    </div>
  );
}