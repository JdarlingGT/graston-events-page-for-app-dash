'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Phone, User, MapPin, BookOpen } from 'lucide-react';
import { VoucherManagement } from '@/components/directory/clinicians/voucher-management';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';

interface Clinician {
  id: string;
  name: string;
  email: string;
  specialty: string;
  location: string;
}

interface TrainingHistory {
  eventId: string;
  eventName: string;
  date: string;
  status: string;
}

const historyColumns: ColumnDef<TrainingHistory>[] = [
  {
    accessorKey: 'eventName',
    header: 'Event',
    cell: ({ row }) => (
      <Link href={`/dashboard/events/${row.original.eventId}`} className="font-medium text-primary hover:underline">
        {row.original.eventName}
      </Link>
    ),
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
];

function TrainingHistoryTab({ clinicianId }: { clinicianId: string }) {
  const { data: history, isLoading } = useQuery<TrainingHistory[]>({
    queryKey: ['clinician-history', clinicianId],
    queryFn: async () => {
      const res = await fetch(`/api/clinicians/${clinicianId}/history`);
      if (!res.ok) {
throw new Error('Failed to fetch training history');
}
      return res.json();
    },
  });

  if (isLoading) {
return <Skeleton className="h-64 w-full" />;
}

  return <DataTable columns={historyColumns} data={history || []} />;
}

export default function ClinicianDetailPage({ params }: { params: { id: string } }) {
  const { data: clinician, isLoading } = useQuery<Clinician>({
    queryKey: ['clinician', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/clinicians/${params.id}`);
      if (!res.ok) {
throw new Error('Failed to fetch clinician details');
}
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!clinician) {
    return <p>Clinician not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{clinician.name}</CardTitle>
          <CardDescription>{clinician.specialty}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> {clinician.email}</div>
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {clinician.location}</div>
        </CardContent>
      </Card>

      <Tabs defaultValue="vouchers">
        <TabsList>
          <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
          <TabsTrigger value="history">Training History</TabsTrigger>
        </TabsList>
        <TabsContent value="vouchers" className="mt-4">
          <VoucherManagement clinicianId={clinician.id} />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Training History
              </CardTitle>
              <CardDescription>
                A log of all past and upcoming events for this clinician.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrainingHistoryTab clinicianId={clinician.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}