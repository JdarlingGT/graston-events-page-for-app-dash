'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { EventCard } from './event-card';
import { EventFilters } from './event-filters';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const EventMap = dynamic(() => import('./event-map').then((mod) => mod.EventMap), {
  loading: () => <Skeleton className="h-[450px] w-full rounded-lg border" />,
  ssr: false,
});

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
  capacity: number;
  minViableEnrollment: number;
  type: 'Essential' | 'Advanced';
  mode: 'In-Person' | 'Virtual';
  status: 'upcoming' | 'ongoing' | 'completed';
  featuredImage?: string;
  date: string;
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

const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
  'San Francisco': { lat: 37.7749, lng: -122.4194 },
  'Austin': { lat: 30.2672, lng: -97.7431 },
  'New York': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Chicago': { lat: 41.8781, lng: -87.6298 },
  'Seattle': { lat: 47.6062, lng: -122.3321 },
  'Miami': { lat: 25.7617, lng: -80.1918 },
  'Denver': { lat: 39.7392, lng: -104.9903 },
  'Boston': { lat: 42.3601, lng: -71.0589 },
  'Dallas': { lat: 32.7767, lng: -96.7970 },
  'Phoenix': { lat: 33.4484, lng: -112.0740 },
  'Portland': { lat: 45.5152, lng: -122.6784 },
  'Atlanta': { lat: 33.7490, lng: -84.3880 },
  'Las Vegas': { lat: 36.1699, lng: -115.1398 },
  'Nashville': { lat: 36.1627, lng: -86.7816 },
};

export function EventDirectory() {
  const [filters, setFilters] = useState<EventFiltersState>({
    search: '', type: 'all', mode: 'all', status: 'all', dangerZone: 'all',
    dateRange: {}, enrollmentRange: [0, 100], revenueRange: [0, 100000],
    cities: [], instructors: [],
  });
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { data: events = [], isLoading, error } = useQuery<Event[]>({
    queryKey: ['events', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) {
params.append('search', filters.search);
}
      if (filters.type !== 'all') {
params.append('type', filters.type);
}
      if (filters.mode !== 'all') {
params.append('mode', filters.mode);
}
      if (filters.status !== 'all') {
params.append('status', filters.status);
}
      if (filters.dangerZone !== 'all') {
params.append('dangerZone', filters.dangerZone);
}
      if (filters.dateRange.from) {
params.append('fromDate', filters.dateRange.from.toISOString().split('T')[0]);
}
      if (filters.dateRange.to) {
params.append('toDate', filters.dateRange.to.toISOString().split('T')[0]);
}
      
      const response = await fetch(`/api/events?${params.toString()}`);
      if (!response.ok) {
throw new Error('Failed to fetch events');
}
      const data = await response.json();

      // De-duplicate events to prevent React key errors
      const uniqueEvents = [];
      const seenIds = new Set();
      for (const event of data) {
        if (!seenIds.has(event.id)) {
          seenIds.add(event.id);
          uniqueEvents.push(event);
        }
      }

      return uniqueEvents.map((event: any) => ({
        ...event,
        instructor: { name: event.instructor, avatar: `https://i.pravatar.cc/150?u=${event.instructor}` },
      }));
    },
  });

  useEffect(() => {
 if (error) {
toast.error('Failed to load events.');
} 
}, [error]);

  const eventsWithCoordinates = events.map(event => ({
    ...event,
    coordinates: cityCoordinates[event.city] || { lat: 0, lng: 0 },
  }));

  const availableOptions = {
    cities: Array.from(new Set(events.map(e => e.city))),
    instructors: Array.from(new Set(events.map(e => e.instructor.name))),
    types: ['Essential', 'Advanced'],
    modes: ['In-Person', 'Virtual'],
  };

  const handlePinClick = (eventId: string) => {
    setSelectedEventId(eventId);
    cardRefs.current[eventId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="space-y-8">
      <EventFilters filters={filters} onFiltersChange={setFilters} availableOptions={availableOptions} />
      
      <div className="h-[450px] w-full rounded-lg overflow-hidden shadow-lg border">
        <EventMap
          events={eventsWithCoordinates}
          hoveredEventId={hoveredEventId}
          selectedEventId={selectedEventId}
          onPinClick={handlePinClick}
        />
      </div>

      <div>
        <AnimatePresence>
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[420px] w-full rounded-lg" />
              ))
            ) : eventsWithCoordinates.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <h3 className="text-lg font-semibold">No Events Found</h3>
                <p>Try adjusting your search filters.</p>
              </div>
            ) : (
              eventsWithCoordinates.map((event) => {
                const eventForCard = {
                  id: event.id,
                  title: event.name,
                  instructor: event.instructor,
                  location: { city: event.city, state: event.state },
                  schedule: { startDate: event.date, endDate: event.endDate },
                  enrollment: {
                    current: event.enrolledStudents,
                    capacity: event.capacity,
                    minViable: event.minViableEnrollment,
                  },
                  type: event.type,
                  mode: event.mode,
                  status: event.status,
                  featuredImage: event.featuredImage,
                };
                return (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    ref={el => {
 cardRefs.current[event.id] = el; 
}}
                  >
                    <EventCard
                      event={eventForCard}
                      isHovered={hoveredEventId === event.id || selectedEventId === event.id}
                      onHover={setHoveredEventId}
                    />
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}