'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { parseISO } from 'date-fns';

interface UpcomingEvent {
  id: string;
  name: string;
  date: string;
  city: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

async function fetchUpcomingEvents(): Promise<UpcomingEvent[]> {
  const response = await fetch('/api/events');
  if (!response.ok) {
throw new Error('Failed to fetch events');
}
  const events = await response.json();
  return events
    .filter((event: UpcomingEvent) => event.status !== 'completed')
    .sort((a: UpcomingEvent, b: UpcomingEvent) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);
}

export function UpcomingEventsCard() {
  const { data: events, isLoading } = useQuery<UpcomingEvent[]>({
    queryKey: ['upcoming-events'],
    queryFn: fetchUpcomingEvents,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>Upcoming Events</CardTitle>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/events">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <CardDescription>
          A look at the next 5 events on the calendar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : events && events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event) => (
              <Link key={event.id} href={`/dashboard/events/${event.id}`} className="block">
                <div className="flex items-center justify-between rounded-lg border bg-background p-3 hover:bg-muted transition-colors">
                  <div>
                    <p className="font-medium text-sm">{event.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {event.city}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No upcoming events scheduled.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}