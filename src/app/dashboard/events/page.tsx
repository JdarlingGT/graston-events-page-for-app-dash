'use client';

import { EventDirectory } from '@/components/events/event-directory';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function EventsPage() {
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
      <EventDirectory />
    </div>
  );
}