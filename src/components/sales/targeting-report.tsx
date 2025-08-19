'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Sparkles, History } from 'lucide-react';
import { toast } from 'sonner';
import { Provider } from '@/lib/mock-data';
import { OutreachCopilotModal } from './outreach-copilot-modal';

interface EventOption {
  id: string;
  name: string;
}

export function TargetingReport() {
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; name: string } | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: events = [], isLoading: eventsLoading } = useQuery<EventOption[]>({
    queryKey: ['events-list'],
    queryFn: async () => {
      const response = await fetch('/api/events');
      if (!response.ok) {
throw new Error('Failed to fetch events');
}
      return response.json();
    },
  });

  const { data: providers = [], isLoading: providersLoading, refetch } = useQuery<Provider[]>({
    queryKey: ['targeted-providers', selectedEvent?.id],
    queryFn: async () => {
      if (!selectedEvent) {
return [];
}
      const response = await fetch(`/api/sales/targeting?eventId=${selectedEvent.id}`);
      if (!response.ok) {
throw new Error('Failed to fetch targeted providers');
}
      return response.json();
    },
    enabled: !!selectedEvent,
  });

  const handleEventChange = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent({ id: event.id, name: event.name });
    }
  };

  const handleOpenCopilot = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsModalOpen(true);
  };

  const columns: ColumnDef<Provider>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'providerType', header: 'Provider Type' },
    {
      accessorKey: 'trainingHistory',
      header: 'Last Course Attended',
      cell: ({ row }) => {
        const history = row.original.trainingHistory;
        return history.length > 0 ? history[history.length - 1].eventName : 'N/A';
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button size="sm" onClick={() => handleOpenCopilot(row.original)}>
          <Sparkles className="mr-2 h-4 w-4" />
          AI Outreach Co-Pilot
        </Button>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Intelligent Sales Targeting</CardTitle>
          <CardDescription>
            Select an event to generate a targeted list of providers for outreach.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-sm">
            <Select onValueChange={handleEventChange} disabled={eventsLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select an upcoming event..." />
              </SelectTrigger>
              <SelectContent>
                {events.map(event => (
                  <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {providersLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : selectedEvent && (
            <DataTable columns={columns} data={providers} />
          )}
        </CardContent>
      </Card>
      <OutreachCopilotModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        provider={selectedProvider}
        event={selectedEvent}
      />
    </>
  );
}