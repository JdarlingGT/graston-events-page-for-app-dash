"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Eye, 
  Edit, 
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: {
    id: string;
    name: string; // Changed from title to name for consistency with API
    instructor: {
      name: string;
      avatar?: string;
    };
    city: string;
    state: string;
    date: string;
    endDate?: string;
    enrolledStudents: number;
    capacity: number;
    minViableEnrollment: number; // Added for danger zone logic
    type: "Essential" | "Advanced";
    mode: "In-Person" | "Virtual";
    status: "upcoming" | "ongoing" | "completed";
    featuredImage?: string;
  };
  isHovered?: boolean;
  onHover?: (eventId: string | null) => void;
  className?: string;
}

export function EventCard({ event, isHovered, onHover, className }: EventCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const enrollmentPercentage = (event.enrolledStudents / event.capacity) * 100;
  
  const getDangerZoneStatus = () => {
    if (event.enrolledStudents < event.minViableEnrollment) {
      return { 
        text: "At Risk", 
        variant: "destructive" as const, 
        icon: AlertTriangle,
        description: `Below minimum viable enrollment of ${event.minViableEnrollment} students`
      };
    }
    if (enrollmentPercentage >= 90) {
      return { 
        text: "Almost Full", 
        variant: "secondary" as const, 
        icon: Clock,
        description: "Limited spots remaining"
      };
    }
    if (event.enrolledStudents >= event.minViableEnrollment) { // Healthy if above min viable
      return { 
        text: "Healthy", 
        variant: "default" as const, 
        icon: CheckCircle,
        description: "Good enrollment numbers"
      };
    }
    return { 
      text: "Building", 
      variant: "outline" as const, 
      icon: Users,
      description: "Enrollment in progress"
    };
  };

  const status = getDangerZoneStatus();
  const StatusIcon = status.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        isHovered && "ring-2 ring-primary shadow-lg -translate-y-1",
        className
      )}
      onMouseEnter={() => onHover?.(event.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {event.featuredImage && (
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img
            src={event.featuredImage}
            alt={event.name}
            className={cn(
              "h-full w-full object-cover transition-all duration-300 group-hover:scale-105",
              !imageLoaded && "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="bg-white/90 text-black">
              {event.type}
            </Badge>
            <Badge variant="outline" className="bg-white/90 border-white/50">
              {event.mode}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant={status.variant} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {status.text}
            </Badge>
          </div>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {event.name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={event.instructor?.avatar} />
                <AvatarFallback className="text-xs">
                  {event.instructor?.name?.split(' ').map((n: string) => n[0]).join('') || 'N/A'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {event.instructor?.name || 'Unassigned'}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(event.date)}</span>
            {event.endDate && event.endDate !== event.date && (
              <span>- {formatDate(event.endDate)}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{event.city}, {event.state}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Enrollment</span>
            </div>
            <span className="font-medium">
              {event.enrolledStudents} / {event.capacity}
            </span>
          </div>
          <Progress 
            value={enrollmentPercentage} 
            className="h-2"
          />
          <p className="text-xs text-muted-foreground">
            {status.description}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/dashboard/events/${event.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Event
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/dashboard/events/${event.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}