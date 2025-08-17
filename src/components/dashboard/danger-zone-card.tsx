"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { differenceInDays, parseISO } from "date-fns";
import { Progress } from "../ui/progress";

interface AtRiskEvent {
  id: string;
  name: string;
  enrolledStudents: number;
  minViableEnrollment: number;
  date: string;
}

async function fetchAtRiskEvents(): Promise<AtRiskEvent[]> {
  const response = await fetch("/api/events");
  if (!response.ok) throw new Error("Failed to fetch events");
  const events = await response.json();
  return events.filter(
    (event: AtRiskEvent) =>
      event.enrolledStudents < event.minViableEnrollment &&
      differenceInDays(parseISO(event.date), new Date()) >= 0
  );
}

export function DangerZoneCard() {
  const { data: atRiskEvents, isLoading } = useQuery<AtRiskEvent[]>({
    queryKey: ["at-risk-events"],
    queryFn: fetchAtRiskEvents,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle>Danger Zone Events</CardTitle>
        </div>
        <CardDescription>
          Events below minimum viable enrollment that require attention.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : atRiskEvents && atRiskEvents.length > 0 ? (
          <div className="space-y-4">
            {atRiskEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border bg-background p-4"
              >
                <div className="flex-1">
                  <p className="font-semibold">{event.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {differenceInDays(parseISO(event.date), new Date())} days away
                  </p>
                </div>
                <div className="w-full sm:w-48">
                  <div className="flex justify-between text-sm">
                    <span>{event.enrolledStudents} / {event.minViableEnrollment}</span>
                    <span className="font-medium">
                      {((event.enrolledStudents / event.minViableEnrollment) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress
                    value={(event.enrolledStudents / event.minViableEnrollment) * 100}
                    className="h-2"
                  />
                </div>
                <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                  <Link href={`/dashboard/events/${event.id}`}>
                    View & Rescue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No events are currently at risk. Great job!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}