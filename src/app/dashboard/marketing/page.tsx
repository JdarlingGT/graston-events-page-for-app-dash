"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Sparkles, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { differenceInDays, parseISO } from "date-fns";
import { CampaignManagement } from "@/components/dashboard/marketing/campaign-management";
import { UtmLinkBuilder } from "@/components/dashboard/marketing/utm-link-builder";
import { ContentIdeationCopilot } from "@/components/dashboard/marketing/content-ideation-copilot";

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

function MarketingActionCards() {
  const { data: atRiskEvents, isLoading } = useQuery<AtRiskEvent[]>({
    queryKey: ["at-risk-events-marketing"],
    queryFn: fetchAtRiskEvents,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            Danger Zone Rescue
          </CardTitle>
          <CardDescription>
            Proactively manage events that are below enrollment targets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : atRiskEvents && atRiskEvents.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold">
                {atRiskEvents.length} event(s) require attention:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {atRiskEvents.slice(0, 2).map(event => (
                  <li key={event.id}>{event.name}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No events are currently at risk.</p>
          )}
          <Button asChild className="mt-4 w-full">
            <Link href={`/dashboard/events/${atRiskEvents?.[0]?.id ?? ''}`}>
              Consult Rescue Co-Pilot <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target />
            Intelligent Sales Targeting
          </CardTitle>
          <CardDescription>
            Generate targeted lead lists for upcoming events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use the AI Outreach Co-Pilot to find high-potential providers and generate personalized emails to drive registrations.
          </p>
          <Button asChild className="mt-4 w-full">
            <Link href="/dashboard/sales/targeting">
              Open Sales Targeting <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle />
            New Campaign Automation
          </CardTitle>
          <CardDescription>
            Launch a new event with AI-powered marketing support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use the event creation wizard to automatically schedule announcement emails and generate social media content with the AI Co-Pilot.
          </p>
          <Button asChild className="mt-4 w-full">
            <Link href="/dashboard/events/create">
              Create New Event <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MarketingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Marketing Command Center</h1>
        <p className="text-muted-foreground">
          Your central hub for AI-powered marketing intelligence and campaign execution.
        </p>
      </div>
      <MarketingActionCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UtmLinkBuilder />
        </div>
        <div className="lg:col-span-1">
          <ContentIdeationCopilot />
        </div>
      </div>

      <CampaignManagement />
    </div>
  );
}