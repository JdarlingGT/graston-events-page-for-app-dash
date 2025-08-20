'use client';

import { VenuesTable } from '@/components/directory/venues/venues-table';
import { VenueForm } from '@/components/directory/venues/venue-form';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export default function VenuesPage() {
  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Directory', href: '/dashboard/directory' },
          { label: 'Venues', active: true },
        ]}
      />
      <h1>Venues Management</h1>
      <VenueForm />
      <VenuesTable />
    </div>
  );
}