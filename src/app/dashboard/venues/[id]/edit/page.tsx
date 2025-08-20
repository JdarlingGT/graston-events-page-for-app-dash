'use client';

import { useQuery } from '@tanstack/react-query';
import { VenueForm } from '@/components/directory/venues/venue-form';
import { Skeleton } from '@/components/ui/skeleton';

interface Venue {
  id: string;
  name: string;
  type: string;
  city: string;
  state: string;
  contactPerson: string;
  capacity: number;
}

export default function VenueEditPage({ params }: { params: { id: string } }) {
  const { data: venue, isLoading } = useQuery<Venue>({
    queryKey: ['venue', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/venues/${params.id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch venue');
      }
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!venue) {
    return <p>Venue not found.</p>;
  }

  return (
    <div>
      <h1>Edit Venue</h1>
      <VenueForm initialData={venue} />
    </div>
  );
}