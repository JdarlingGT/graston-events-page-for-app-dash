'use client';

import React, { useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Eye } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  startDate: string;
  location: {
    city: string;
    state: string;
  };
  enrolledCount: number;
  capacity: number;
  status: 'Go' | 'At Risk' | 'Completed';
}

interface EventMapProps {
  events: Event[];
  selectedEventId?: string | null;
  onEventSelect?: (eventId: string) => void;
  className?: string;
}

// City coordinates mapping
const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
  'San Francisco': { lat: 37.7749, lng: -122.4194 },
  'Austin': { lat: 30.2672, lng: -97.7431 },
  'New York': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Chicago': { lat: 41.8781, lng: -87.6298 },
  'Seattle': { lat: 47.6062, lng: -122.3321 },
  'Miami': { lat: 25.7617, lng: -80.1918 },
  'Denver': { lat: 39.7392, lng: -104.9903 },
  'Boston': { lat: 42.3601, lng: -71.0589 },
  'Dallas': { lat: 32.7767, lng: -96.7970 },
  'Phoenix': { lat: 33.4484, lng: -112.0740 },
  'Portland': { lat: 45.5152, lng: -122.6784 },
  'Atlanta': { lat: 33.7490, lng: -84.3880 },
  'Las Vegas': { lat: 36.1699, lng: -115.1398 },
  'Nashville': { lat: 36.1627, lng: -86.7816 },
};

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export function EventMap({ events, selectedEventId, onEventSelect, className }: EventMapProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [openInfoWindowId, setOpenInfoWindowId] = React.useState<string | null>(null);

  // Filter events to only include those with valid coordinates
  const eventsWithCoordinates = useMemo(() => {
    return events
      .filter(event => {
        const coordinates = cityCoordinates[event.location.city];
        return coordinates && coordinates.lat && coordinates.lng;
      })
      .map(event => ({
        ...event,
        coordinates: cityCoordinates[event.location.city],
      }));
  }, [events]);

  // Calculate map center based on events
  const mapCenter = useMemo(() => {
    if (eventsWithCoordinates.length === 0) {
      return { lat: 39.8283, lng: -98.5795 }; // Center of US
    }
    
    if (eventsWithCoordinates.length === 1) {
      return eventsWithCoordinates[0].coordinates;
    }

    // Calculate center of all events
    const avgLat = eventsWithCoordinates.reduce((sum, event) => sum + event.coordinates.lat, 0) / eventsWithCoordinates.length;
    const avgLng = eventsWithCoordinates.reduce((sum, event) => sum + event.coordinates.lng, 0) / eventsWithCoordinates.length;
    
    return { lat: avgLat, lng: avgLng };
  }, [eventsWithCoordinates]);

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'Go': return 'bg-green-500 border-green-600';
      case 'At Risk': return 'bg-yellow-500 border-yellow-600';
      case 'Completed': return 'bg-gray-500 border-gray-600';
      default: return 'bg-blue-500 border-blue-600';
    }
  };

  const getStatusBadgeVariant = (status: Event['status']) => {
    switch (status) {
      case 'Go': return 'default';
      case 'At Risk': return 'secondary';
      case 'Completed': return 'outline';
      default: return 'default';
    }
  };

  const handleMarkerClick = (eventId: string) => {
    setOpenInfoWindowId(eventId);
    onEventSelect?.(eventId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className={cn('flex items-center justify-center h-96 bg-muted rounded-lg', className)}>
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Google Maps API key not configured</p>
        </div>
      </div>
    );
  }

  if (eventsWithCoordinates.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-96 bg-muted rounded-lg', className)}>
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No events with valid locations to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('h-96 w-full rounded-lg overflow-hidden border', className)}>
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          defaultZoom={4}
          defaultCenter={mapCenter}
          mapId="event_map"
          gestureHandling="greedy"
          disableDefaultUI={true}
          zoomControl={true}
          className="w-full h-full"
        >
          {eventsWithCoordinates.map((event) => {
            const isSelected = selectedEventId === event.id;
            
            return (
              <AdvancedMarker
                key={event.id}
                position={event.coordinates}
                onClick={() => handleMarkerClick(event.id)}
                ref={isSelected ? markerRef : null}
              >
                <div
                  className={cn(
                    'relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 cursor-pointer',
                    getStatusColor(event.status),
                    isSelected && 'scale-125 ring-4 ring-primary/50',
                  )}
                  role="button"
                  aria-label={`View event ${event.title}`}
                >
                  <MapPin className="h-4 w-4 text-white" />
                </div>
              </AdvancedMarker>
            );
          })}

          {openInfoWindowId && (
            <InfoWindow
              position={eventsWithCoordinates.find(e => e.id === openInfoWindowId)?.coordinates}
              onCloseClick={() => setOpenInfoWindowId(null)}
              pixelOffset={[0, -30]}
            >
              {eventsWithCoordinates.find(e => e.id === openInfoWindowId) && (() => {
                const event = eventsWithCoordinates.find(e => e.id === openInfoWindowId)!;
                const enrollmentPercentage = (event.enrolledCount / event.capacity) * 100;

                return (
                  <div className="p-4 max-w-xs w-64 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location.city}, {event.location.state}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(event.startDate)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant={getStatusBadgeVariant(event.status)}>
                        {event.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{event.enrolledCount}/{event.capacity}</span>
                      </div>
                    </div>

                    <Button asChild size="sm" className="w-full mt-3">
                      <Link href={`/dashboard/events/${event.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                );
              })()}
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}