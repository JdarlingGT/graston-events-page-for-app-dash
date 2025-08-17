"use client";

import { useState, useCallback, useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Eye } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  instructor: {
    name: string;
  };
  city: string;
  state: string;
  date: string;
  enrolledStudents: number;
  capacity: number;
  type: "Essential" | "Advanced";
  mode: "In-Person" | "Virtual";
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface EventMapProps {
  events: Event[];
  hoveredEventId?: string | null;
  onEventHover?: (eventId: string | null) => void;
  onEventClick?: (eventId: string) => void;
  className?: string;
}

const defaultCenter = { lat: 39.8283, lng: -98.5795 }; // Center of US

export function EventMap({ 
  events, 
  hoveredEventId, 
  onEventHover, 
  onEventClick,
  className 
}: EventMapProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  // Mock coordinates for demo - in real app, these would come from geocoding
  const eventsWithCoordinates = useMemo(() => {
    return events.map((event, index) => ({
      ...event,
      coordinates: event.coordinates || {
        lat: 39.8283 + (Math.random() - 0.5) * 20,
        lng: -98.5795 + (Math.random() - 0.5) * 40,
      }
    }));
  }, [events]);

  const selectedEvent = selectedEventId 
    ? eventsWithCoordinates.find(e => e.id === selectedEventId)
    : null;

  const getDangerZoneStatus = (event: Event) => {
    if (event.enrolledStudents < 4) {
      return { text: "At Risk", variant: "destructive" as const };
    }
    if ((event.enrolledStudents / event.capacity) >= 0.9) {
      return { text: "Almost Full", variant: "secondary" as const };
    }
    return { text: "Healthy", variant: "default" as const };
  };

  const getMarkerIcon = (event: Event, isHovered: boolean, isSelected: boolean) => {
    const status = getDangerZoneStatus(event);
    let color = "#3b82f6"; // blue default
    
    if (status.variant === "destructive") color = "#ef4444"; // red
    else if (status.variant === "secondary") color = "#f59e0b"; // amber
    
    const scale = isHovered || isSelected ? 1.2 : 1;
    
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 0.8,
      strokeColor: "#ffffff",
      strokeWeight: 2,
      scale: 8 * scale,
    };
  };

  const handleMarkerClick = useCallback((event: Event) => {
    setSelectedEventId(event.id);
    onEventClick?.(event.id);
  }, [onEventClick]);

  const handleMarkerMouseOver = useCallback((event: Event) => {
    onEventHover?.(event.id);
  }, [onEventHover]);

  const handleMarkerMouseOut = useCallback(() => {
    onEventHover?.(null);
  }, [onEventHover]);

  if (!isLoaded) {
    return (
      <div className={cn("h-full bg-muted animate-pulse rounded-lg", className)}>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full rounded-lg overflow-hidden", className)}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={defaultCenter}
        zoom={5}
        onLoad={setMapInstance}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {eventsWithCoordinates.map((event) => (
          <Marker
            key={event.id}
            position={event.coordinates!}
            icon={getMarkerIcon(
              event, 
              hoveredEventId === event.id,
              selectedEventId === event.id
            )}
            onClick={() => handleMarkerClick(event)}
            onMouseOver={() => handleMarkerMouseOver(event)}
            onMouseOut={handleMarkerMouseOut}
          />
        ))}

        {selectedEvent && (
          <InfoWindow
            position={selectedEvent.coordinates!}
            onCloseClick={() => setSelectedEventId(null)}
          >
            <Card className="w-80 border-0 shadow-none">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                      {selectedEvent.title}
                    </h3>
                    <Badge variant={getDangerZoneStatus(selectedEvent).variant} className="text-xs">
                      {getDangerZoneStatus(selectedEvent).text}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(selectedEvent.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span>{selectedEvent.city}, {selectedEvent.state}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      <span>{selectedEvent.enrolledStudents} / {selectedEvent.capacity} enrolled</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button asChild size="sm" className="flex-1 h-8 text-xs">
                      <Link href={`/dashboard/events/${selectedEvent.id}`}>
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}