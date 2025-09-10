'use client';

import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { Check, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StudentTableProps {
  eventId: string;
  eventDate: string;
  showInstrumentColumn?: boolean;
}

interface StudentRow {
  id: string;
  name: string;
  email: string;
  evaluationStatus: string;
  instrumentPurchase?: boolean;
}

export function StudentTable({ eventId, eventDate, showInstrumentColumn = false }: StudentTableProps) {
  const { data: students, isLoading, error } = useQuery<StudentRow[]>({
    queryKey: ['students', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/students`);
      if (!res.ok) throw new Error('Failed to fetch students');
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const columns: any[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'evaluationStatus', label: 'Evaluation Status' },
  ];

  if (showInstrumentColumn) {
    columns.push({
      key: 'instrumentPurchase',
      label: 'Instrument Purchase',
      render: (row: any) =>
        row.instrumentPurchase ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <X className="h-4 w-4 text-red-600" />
        ),
    });
  }

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (error || !students) {
    return <p className="text-red-500">Failed to load students</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Enrolled Students</h3>
      <DataTable data={students} columns={columns} />
    </div>
  );
}
