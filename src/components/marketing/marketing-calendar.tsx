'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface CampaignEvent {
  id: string;
  title: string;
  type: 'email' | 'social' | 'webinar' | 'ad' | 'other';
  status: 'planned' | 'in_progress' | 'scheduled' | 'sent' | 'paused';
  owner: string;
  startDate: string;
  endDate: string;
  description?: string;
  channels: string[];
  tags?: string[];
  contentLink?: string;
  createdAt: string;
  updatedAt: string;
}

export function MarketingCalendar() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['marketing-calendar'],
    queryFn: async (): Promise<{ events: CampaignEvent[] }> => {
      const res = await fetch('/api/marketing/calendar');
      if (!res.ok) {
throw new Error('Failed to fetch calendar');
}
      return res.json();
    },
  });

  const getStatusColor = (status: CampaignEvent['status']) => {
    switch (status) {
      case 'planned': return 'secondary';
      case 'in_progress': return 'default';
      case 'scheduled': return 'outline';
      case 'sent': return 'secondary';
      case 'paused': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Marketing Calendar</h1>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <Loader2 className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          data?.events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{event.title}</span>
                  <Badge variant={getStatusColor(event.status)}>{event.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {format(new Date(event.startDate), 'MMM d')} - {format(new Date(event.endDate), 'MMM d')}
                </div>
                <div className="text-sm">{event.description}</div>
                <div className="text-xs text-muted-foreground">Owner: {event.owner}</div>
                <div className="flex flex-wrap gap-1">
                  {event.channels.map((ch, i) => (
                    <Badge key={i} variant="outline">{ch}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}