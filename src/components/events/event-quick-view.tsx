'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, MapPin, Users, Eye, Edit, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

type Mode = 'In-Person' | 'Virtual' | 'Hybrid';
type Status = 'upcoming' | 'cancelled' | 'completed' | 'ongoing';

interface QuickViewEvent {
  id: string;
  title: string;
  instructor?: { name: string; avatar?: string } | { name?: string } | any;
  location: { city: string; state: string };
  schedule: { startDate: string; endDate?: string };
  enrollment: { current: number; capacity: number; minViable: number };
  type: 'Essential' | 'Advanced' | 'Upper Quadrant';
  mode: Mode;
  status: Status;
  featuredImage?: string;
}

export function EventQuickView() {
  const [open, setOpen] = useState(false);
  const [event, setEvent] = useState<QuickViewEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent;
      if (ce.detail) {
        setEvent(ce.detail as QuickViewEvent);
        setOpen(true);
      }
    };
    window.addEventListener('event-quick-view', handler as EventListener);
    return () => window.removeEventListener('event-quick-view', handler as EventListener);
  }, []);

  const enrollmentPct = useMemo(() => {
    if (!event) {
return 0;
}
    return (event.enrollment.current / Math.max(event.enrollment.capacity, 1)) * 100;
  }, [event]);

  const risk = useMemo(() => {
    if (!event) {
return null;
}
    const enrolled = event.enrollment.current ?? 0;
    const minViable = event.enrollment.minViable ?? 0;
    const pct = enrollmentPct;

    if (enrolled < minViable) {
      return { text: 'At Risk', variant: 'destructive' as const, icon: AlertTriangle, description: `Below minimum viable enrollment of ${minViable}` };
    }
    if (pct >= 90) {
      return { text: 'Almost Full', variant: 'secondary' as const, icon: Clock, description: 'Limited spots remaining' };
    }
    if (enrolled >= minViable) {
      return { text: 'Healthy', variant: 'default' as const, icon: CheckCircle, description: 'Good enrollment numbers' };
    }
    return { text: 'Building', variant: 'outline' as const, icon: Users, description: 'Enrollment in progress' };
  }, [event, enrollmentPct]);

  const RiskIcon = risk?.icon ?? Users;

  const formatDate = (dateString?: string) => {
    if (!dateString) {
return '';
}
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Event Quick View</DialogTitle>
          <DialogDescription>A concise snapshot to speed up decision-making.</DialogDescription>
        </DialogHeader>

        {event && (
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{event.type}</Badge>
                      <Badge variant="outline">{event.mode}</Badge>
                      {risk && (
                        <Badge variant={risk.variant} className="flex items-center gap-1">
                          <RiskIcon className="h-3 w-3" />
                          {risk.text}
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold truncate">{event.title}</h2>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(event.schedule.startDate)}
                          {event.schedule.endDate && event.schedule.endDate !== event.schedule.startDate
                            ? ` - ${formatDate(event.schedule.endDate)}`
                            : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location.city}, {event.location.state}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/events/${event.id}`}>
                        <Eye className="h-4 w-4 mr-2" /> View
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/events/${event.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Enrollment</span>
                    </div>
                    <span className="font-medium">
                      {event.enrollment.current} / {event.enrollment.capacity}
                    </span>
                  </div>
                  <Progress value={enrollmentPct} className="h-2" />
                  {risk && (
                    <p className="text-xs text-muted-foreground">{risk.description}</p>
                  )}</div>
              </CardContent>
            </Card>

            {event.featuredImage && (
              <Card>
                <CardContent className="p-0">
                  <img
                    src={event.featuredImage}
                    alt={`Featured image for ${event.title}`}
                    className="w-full h-48 object-cover rounded-md"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default EventQuickView;