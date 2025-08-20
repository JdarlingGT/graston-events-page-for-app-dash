'use client';

import { VenuesTable } from '@/components/directory/venues/venues-table';
import { VenueForm } from '@/components/directory/venues/venue-form';

export default function VenuesPage() {
  return (
    <div>
      <h1>Venues Management</h1>
      <VenueForm />
      <VenuesTable />
    </div>
  );
}