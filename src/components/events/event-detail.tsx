"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentTable } from "./student-table";
import { TaskBoard } from "./task-board";
import { MarketingRescueCopilotModal } from "./marketing-rescue-copilot-modal";
import { LogisticsTab } from "./logistics-tab";
import { PostMortemTab } from "./post-mortem-tab";
import { InternalNotesPanel } from "./internal-notes-panel";
import { BulkEmailPanel } from "./bulk-email-panel";
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  Mail,
  Phone,
  Edit,
  Share2
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface EventDetailProps {
  eventId: string;
}

interface EventDetailData {
  id: string;
  title: string;
  description: string;
  featuredImage: string;
  instructor: {
    name: string;
    email: string;
    phone: string;
    avatar: string;
    bio: string;
  };
  venue: {
    name: string;
    address: string;
    city: string;
    state: string;
    capacity: number;
  };
  schedule: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  enrollment: {
    current: number;
    capacity: number;
    minViable: number;
    waitlist: number;
  };
  pricing: {
    basePrice: number;
    earlyBirdPrice: number;
    revenue: number;
    projectedRevenue: number;
  };
  type: "Essential" | "Advanced";
  mode: "In-Person" | "Virtual";
  status: "draft" | "published" | "cancelled";
  tags: string[];
}

export function EventDetail({ eventId }: EventDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const { data: event, isLoading, error } = useQuery<EventDetailData>({
    queryKey: ["event-detail", eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/detail`);
      if (!response.ok) {
        throw new Error("Failed to fetch event details");
      }
      return response.json();
    },
  });

  const handleShare = async () => {
    try {
      await navigator.share({
        title: event?.title,
        text: `Check out this event: ${event?.title}`,
        url: window.location.href,
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load event details</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-6">
            {event.featuredImage && (
              <div className="lg:w-1/3">
                <img
                  src={event.featuredImage}
                  alt={event.title}
                  className="w-full h-48 lg:h-64 object-cover rounded-lg"
                />
              </div>
            )}
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <h1 className="text-3xl font-bold">{event.title}</h1>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/events/${event.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-muted-foreground" /><div><div className="font-medium">{new Date(event.schedule.startDate).toLocaleDateString()}</div><div className="text-sm text-muted-foreground">{event.schedule.startTime} - {event.schedule.endTime}</div></div></div>
                <div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-muted-foreground" /><div><div className="font-medium">{event.venue.name}</div><div className="text-sm text-muted-foreground">{event.venue.city}, {event.venue.state}</div></div></div>
                <div className="flex items-center gap-2"><Users className="h-5 w-5 text-muted-foreground" /><div><div className="font-medium">{event.enrollment.current} / {event.enrollment.capacity}</div><div className="text-sm text-muted-foreground">Enrolled</div></div></div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendees">Attendees</TabsTrigger>
          <TabsTrigger value="logistics">Logistics</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="post-mortem">Post-Mortem</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <InternalNotesPanel />
        </TabsContent>
        
        <TabsContent value="attendees" className="mt-6">
          <StudentTable eventId={eventId} eventDate={event.schedule.startDate} />
        </TabsContent>

        <TabsContent value="logistics" className="mt-6">
          <LogisticsTab venue={event.venue} instructor={event.instructor} />
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-6">
          <TaskBoard eventId={eventId} />
        </TabsContent>
        
        <TabsContent value="communications" className="mt-6">
          <BulkEmailPanel attendeeCount={event.enrollment.current} />
        </TabsContent>

        <TabsContent value="post-mortem" className="mt-6">
          <PostMortemTab />
        </TabsContent>
      </Tabs>

      <MarketingRescueCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        eventName={event.title}
      />
    </div>
  );
}