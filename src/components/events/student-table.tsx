'use client';

import { DataTable } from '@/components/ui/data-table';
import { Check, X } from 'lucide-react';

interface StudentTableProps {
  eventId: string;
  eventDate: string;
  showInstrumentColumn?: boolean;
}

export function StudentTable({ eventId, eventDate, showInstrumentColumn = false }: StudentTableProps) {
  // TODO: Replace mock with fetch(`/api/events/${eventId}/students`)
  const students = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      evaluationStatus: 'Completed',
      instrumentPurchase: true,
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      evaluationStatus: 'Pending',
      instrumentPurchase: false,
    },
  ];

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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Enrolled Students</h3>
      <DataTable data={students} columns={columns} />
    </div>
  );
}
