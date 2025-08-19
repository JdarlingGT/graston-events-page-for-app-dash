'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef, ColumnFiltersState } from '@tanstack/react-table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Input } from './ui/input';

interface Attendee {
  id: string;
  name: string;
  email: string;
  registrationDate: string;
  instrumentSetPurchased: boolean;
}

const columns: ColumnDef<Attendee>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'registrationDate',
    header: 'Registered On',
    cell: ({ row }) => new Date(row.original.registrationDate).toLocaleDateString(),
  },
  {
    accessorKey: 'instrumentSetPurchased',
    header: 'Instrument Set Purchased',
    cell: ({ row }) => {
      const purchased = row.original.instrumentSetPurchased;
      return <Badge variant={purchased ? 'default' : 'secondary'}>{purchased ? 'Yes' : 'No'}</Badge>;
    },
  },
];

export function RosterTable({ eventId }: { eventId: string }) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => {
    async function fetchAttendees() {
      setLoading(true);
      try {
        const response = await fetch(`/api/events/${eventId}/attendees`);
        if (!response.ok) {
throw new Error('Failed to fetch attendees');
}
        const data = await response.json();
        setAttendees(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load event roster.');
      } finally {
        setLoading(false);
      }
    }
    if (eventId) {
      fetchAttendees();
    }
  }, [eventId]);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search attendees by name..."
          value={(columnFilters.find(f => f.id === 'name')?.value as string) ?? ''}
          onChange={(event) =>
            setColumnFilters([{ id: 'name', value: event.target.value }])
          }
          className="max-w-sm"
        />
      </div>
      <DataTable 
        columns={columns} 
        data={attendees} 
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
      />
    </div>
  );
}