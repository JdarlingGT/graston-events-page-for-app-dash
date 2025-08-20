'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Phone, Building, Users } from 'lucide-react';
import { VenueMap } from '@/components/directory/venues/venue-map';
import { Breadcrumb } from '@/components/ui/breadcrumb';

interface Venue {
  id: string;
  name: string;
  type: string;
  city: string;
  state: string;
  contactPerson: string;
  capacity: number;
  address?: string;
  phone?: string;
}

export default function VenueDetailPage({ params }: { params: { id: string } }) {
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
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!venue) {
    return <p>Venue not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Venues', href: '/dashboard/directory/venues' },
          { label: venue.name, active: true }
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{venue.name}</CardTitle>
          <CardDescription className="text-lg">{venue.type}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p>{venue.address || `${venue.city}, ${venue.state}`}</p>
              </div>
            </div>
            {venue.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <p>{venue.phone}</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-muted-foreground" />
              <p>{venue.capacity} capacity</p>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <p>Contact: {venue.contactPerson}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      {venue.city && venue.state && (
        <VenueMap address={venue.address || ''} city={venue.city} state={venue.state} />
      )}
    </div>
  );
}