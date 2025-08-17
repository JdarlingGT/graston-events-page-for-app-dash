"use client";

import React, { useState, useMemo, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Eye, MapPin } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  name: string;
  city: string;
  state: string;
  enrolledStudents: number;
  capacity: number;
  minViableEnrollment: number;
  coordinates: { lat: number; lng: number };
}

interface EventMapProps {
  events: Event[];
  hoveredEventId: string | null;
  selectedEventId: string | null;
  onPinClick: (eventId: string) => void;
}

// IMPORTANT: Replace with your actual Google Maps API Key
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";

export function EventMap({ events, hoveredEventId, selectedEventId, onPinClick }: EventMapProps) {
  const [openInfoWindowId, setOpenInfoWindowId] = useState<string | null>(null);
  const [markerRef, marker] = useAdvancedMarkerRef();

  // Set initial map center to the first event's coordinates or a default
  const defaultCenter = useMemo(() => {
    if (events.length > 0 && events[0].coordinates.lat && events[0].coordinates.lng) {
      return events[0].coordinates;
    }
    return { lat: 39.8283, lng: -98.5795 }; // Center of US
  }, [events]);

  // Open info window when a card is selected/clicked
  useEffect(() => {
    if (selectedEventId) {
      setOpenInfoWindowId(selectedEventId);
    }
  }, [selectedEventId]);

  const getDangerZoneStatus = (event: Event) => {
    if (event.enrolledStudents < event.minViableEnrollment) {
      return { text: "At Risk", variant: "destructive" as const };
    }
    if ((event.enrolledStudents / event.capacity) * 100 >= 90) {
      return { text: "Almost Full", variant: "secondary" as const };
    }
    return { text: "Healthy", variant: "default" as const };
  };

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <Map
        defaultZoom={4}
        defaultCenter={defaultCenter}
        mapId={"event_directory_map"}
        className="w-full h-full rounded-lg shadow-md"
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        zoomControl={true}
      >
        {events.map((event) => {
          const status = getDangerZoneStatus(event);
          const isHighlighted = hoveredEventId === event.id || selectedEventId === event.id;

          return (
            <AdvancedMarker
              key={event.id}
              position={event.coordinates}
              onClick={() => onPinClick(event.id)}
              ref={selectedEventId === event.id ? markerRef : null}
            >
              <div
                className={cn(
                  "relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200",
                  "bg-primary text-primary-foreground border-primary-foreground",
                  isHighlighted && "scale-125 ring-4 ring-primary/50",
                  status.variant === "destructive" && "bg-destructive border-destructive-foreground",
                  status.variant === "secondary" && "bg-secondary border-secondary-foreground"
                )}
              >
                <MapPin className="h-4 w-4" />
              </div>
            </AdvancedMarker>
          );
        })}

        {openInfoWindowId && (
          <InfoWindow
            position={events.find(e => e.id === openInfoWindowId)?.coordinates}
            onCloseClick={() => setOpenInfoWindowId(null)}
            pixelOffset={{ width: 0, height: -30 }} // Adjust to position above marker
          >
            {events.find(e => e.id === openInfoWindowId) && (() => {
              const event = events.find(e => e.id === openInfoWindowId)!;
              const status = getDangerZoneStatus(event);
              const enrollmentPercentage = (event.enrolledStudents / event.capacity) * 100;

              return (
                <div className="p-4 max-w-xs w-64 space-y-3">
                  <h3 className="font-semibold text-lg leading-tight">{event.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.city}, {event.state}</span>
                  </div>
                  <Badge variant={status.variant}>{status.text}</Badge>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>Enrollment</span>
                      </div>
                      <span className="font-medium">
                        {event.enrolledStudents} / {event.capacity}
                      </span>
                    </div>
                    <Progress value={enrollmentPercentage} className="h-2" />
                  </div>

                  <Button asChild size="sm" className="w-full mt-3">
                    <Link href={`/dashboard/events/${event.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Event
                    </Link>
                  </Button>
                </div>
              );
            })()}
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}