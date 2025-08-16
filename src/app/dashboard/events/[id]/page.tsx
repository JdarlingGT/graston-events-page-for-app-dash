"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, User, Users, ShoppingCart, ArrowLeft } from "lucide-react";
import { RosterTable } from "@/components/roster-table";
import { Button } from "@/components/ui/button";

// A placeholder for the detailed components we will build next
const ChartsPlaceholder = () => <Skeleton className="h-80 w-full" />;

const getDangerZoneStatus = (enrolledStudents: number) => {
  if (enrolledStudents < 4) {
    return { text: "At Risk", variant: "destructive" as const };
  }
  if (enrolledStudents < 10) {
    return { text: "Warning", variant: "secondary" as const };
  }
  return { text: "OK", variant: "default" as const };
};

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/events/${params.id}`);
        if (!response.ok) {
          throw new Error("Event not found");
        }
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        setError("Failed to load event data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }

  const dangerZone = getDangerZoneStatus(event.enrolledStudents);

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild className="w-fit">
        <Link href="/dashboard/events">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Events
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <Badge variant={dangerZone.variant} className="mb-2">{dangerZone.text}</Badge>
              <CardTitle className="text-3xl">{event.name}</CardTitle>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-muted-foreground">{event.category}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span>{new Date(event.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <span>{event.venue.name}, {event.venue.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <span>{event.instructor}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span>{event.enrolledStudents} Enrolled</span>
          </div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            <span>{event.instrumentsPurchased} Kits Purchased</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <RosterTable eventId={params.id} />
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Analytics</h2>
        <ChartsPlaceholder />
      </div>
    </div>
  );
}