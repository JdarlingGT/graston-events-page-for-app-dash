'use client';

import { VenuesTable } from '@/components/directory/venues/venues-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function VenuesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Venues Directory</h1>
          <p className="text-muted-foreground">
            Browse, add, and manage all event venues.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/directory/venues/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Venue
          </Link>
        </Button>
      </div>
      <VenuesTable />
    </div>
  );
}