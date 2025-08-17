"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Share2,
  Clock,
  Tag,
  Briefcase,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Progress } from "../ui/progress";

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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
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

  const enrollmentPercentage = (event.enrollment.current / event.enrollment.capacity) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      {/* Left Column */}
      <div className="lg:col-span-3 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-6">
              {event.featuredImage && (
                <div className="md:w-1/3">
                  <img src={event.featuredImage} alt={event.title} className="w-full h-48 object-cover rounded-lg" />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <h1 className="text-3xl font-bold">{event.title}</h1>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handleShare}><Share2 className="h-4 w-4" /></Button>
                    <Button asChild variant="outline"><Link href={`/dashboard/events/${event.id}/edit`}><Edit className="h-4 w-4 mr-2" />Edit</Link></Button>
                  </div>
                </div>
                <p className="text-muted-foreground">{event.description}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {event.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

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
      </div>

      {/* Right Column */}
      <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-20">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status & Capacity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="font-medium capitalize">{event.status}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{event.enrollment.current} / {event.enrollment.capacity} Enrolled</span>
                <span>{enrollmentPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={enrollmentPercentage} />
            </div>
            <div className="text-sm text-muted-foreground">
              {event.enrollment.waitlist} on waitlist
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Key Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span>{new Date(event.schedule.startDate).toLocaleDateString()}</span></div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span>{event.schedule.startTime} - {event.schedule.endTime} ({event.schedule.timezone})</span></div>
            <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /><span>${event.pricing.basePrice}</span></div>
            <div className="flex items-center gap-2"><Tag className="h-4 w-4 text-muted-foreground" /><span>{event.type}</span></div>
            <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" /><span>{event.mode}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Instructor</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Avatar><AvatarImage src={event.instructor.avatar} /><AvatarFallback>{event.instructor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
              <span className="font-semibold">{event.instructor.name}</span>
            </div>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span>{event.instructor.email}</span></div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{event.instructor.phone}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Venue</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-semibold">{event.venue.name}</p>
            <p className="text-muted-foreground">{event.venue.address}<br/>{event.venue.city}, {event.venue.state}</p>
          </CardContent>
        </Card>
      </div>

      <MarketingRescueCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        eventName={event.title}
      />
    </div>
  );
}