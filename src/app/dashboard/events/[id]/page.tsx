"use client";

import { EventDetail } from "@/components/events/event-detail";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type EventDetailPageProps = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function EventDetailPage({ params }: EventDetailPageProps) {
  return (
    <div className="space-y-6">
      <Button variant="outline" asChild className="w-fit">
        <Link href="/dashboard/events">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Link>
      </Button>
      
      <EventDetail eventId={params.id} />
    </div>
  );
}