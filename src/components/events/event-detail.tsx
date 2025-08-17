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
import { DangerZonePanel } from "./danger-zone-panel";
import { TaskBoard } from "./task-board";
import { EventAnalytics } from "./event-analytics";
import { EventNotifications } from "./event-notifications";
import { 
  Calendar, 
  MapPin, 
  User, 
  Users, 
  Clock,
  DollarSign,
  Mail,
  Phone,
  ExternalLink,
  Edit,
  Share2,
  Bell,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

interface EventDetailProps {
  eventId: string;
}

interface EventDetail {
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

  const { data: event, isLoading, error } = useQuery({
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
      // Fallback to clipboard
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

  const getDangerZoneStatus = () => {
    if (event.enrollment.current < event.enrollment.minViable) {
      return { text: "At Risk", variant: "destructive" as const };
    }
    if (event.enrollment.current / event.enrollment.capacity >= 0.9) {
      return { text: "Almost Full", variant: "secondary" as const };
    }
    return { text: "Healthy", variant: "default" as const };
  };

  const status = getDangerZoneStatus();

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
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={status.variant}>{status.text}</Badge>
                    <Badge variant="outline">{event.type}</Badge>
                    <Badge variant="outline">{event.mode}</Badge>
                  </div>
                  <h1 className="text-3xl font-bold">{event.title}</h1>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {new Date(event.schedule.startDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {event.schedule.startTime} - {event.schedule.endTime}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{event.venue.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {event.venue.city}, {event.venue.state}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {event.enrollment.current} / {event.enrollment.capacity}
                    </div>
                    <div className="text-sm text-muted-foreground">Enrolled</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      ${event.pricing.revenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Revenue</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={event.instructor.avatar} />
                  <AvatarFallback>
                    {event.instructor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{event.instructor.name}</div>
                  <div className="text-sm text-muted-foreground">Instructor</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Danger Zone Panel */}
      <DangerZonePanel 
        event={{
          id: event.id,
          title: event.title,
          enrolledStudents: event.enrollment.current,
          capacity: event.enrollment.capacity,
          minViableEnrollment: event.enrollment.minViable,
          registrationDeadline: event.schedule.startDate,
          revenue: event.pricing.revenue,
          projectedRevenue: event.pricing.projectedRevenue,
        }}
      />

      {/* Notifications */}
      <EventNotifications eventId={eventId} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Alerts
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>{event.description}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Instructor Bio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{event.instructor.bio}</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="students">
          <StudentTable eventId={eventId} />
        </TabsContent>
        
        <TabsContent value="tasks">
          <TaskBoard eventId={eventId} />
        </TabsContent>
        
        <TabsContent value="analytics">
          <EventAnalytics eventId={eventId} />
        </TabsContent>
        
        <TabsContent value="notifications">
          <EventNotifications eventId={eventId} showAll={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}