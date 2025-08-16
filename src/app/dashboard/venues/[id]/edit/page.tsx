"use client";

import { VenueForm } from "../../venue-form";
import { Skeleton } from "../../../../../components/ui/skeleton";
import { useEffect, useState } from "react";

interface Venue {
  id: string;
  name: string;
  type: string;
  city: string;
  capacity: number;
}

export default function EditVenuePage({ params }: { params: { id: string } }) {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {    
    async function fetchVenue() {
      try {
        const response = await fetch(`/api/venues/${params.id}`);
        if (!response.ok) {
          throw new Error("Venue not found");
        }
        const data = await response.json();
        setVenue(data);
      } catch (err) {
        setError("Failed to load venue data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchVenue();
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-8 w-1/2" />
        <div className="space-y-8 pt-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }

  return <VenueForm initialData={venue} />;
}