'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Extend the Window interface to include the initMap function
declare global {
  interface Window {
    initMap?: () => void;
  }
}

interface VenueMapProps {
  address: string;
  city: string;
  state: string;
}

export function VenueMap({ address, city, state }: VenueMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    const loadMapScript = () => {
      const script = document.createElement('script');
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
      script.async = true;
      document.body.appendChild(script);

      // Clean up the script when the component unmounts
      return () => {
        document.body.removeChild(script);
      };
    };

    const initMap = () => {
      if (!mapRef.current) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
        zoom: 12,
      });

      // Geocode the address to get the correct location
      const geocoder = new window.google.maps.Geocoder();
      const fullAddress = `${address || ''} ${city}, ${state}`;

      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          map.setCenter(results[0].geometry.location);
          new window.google.maps.Marker({
            map,
            position: results[0].geometry.location,
          });
        } else {
          console.error('Geocode was not successful for the following reason: ' + status);
        }
      });

      setMapLoaded(true);
    };

    if (window.google && window.google.maps) {
      initMap();
    } else {
      const scriptCleanup = loadMapScript();
      window.initMap = initMap;

      return () => {
        delete window.initMap;
        scriptCleanup();
      };
    }
  }, [address, city, state]);

  if (!mapLoaded) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={mapRef} className="h-64 w-full" />
      </CardContent>
    </Card>
  );
}