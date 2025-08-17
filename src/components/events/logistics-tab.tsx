"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MapPin, User, Mail, Phone } from "lucide-react";

interface LogisticsTabProps {
  venue: { name: string; address: string; city: string; state: string; };
  instructor: { name: string; email: string; phone: string; };
}

const shippingItems = [
  "Training Manuals (50x)",
  "Instrument Kits (25x)",
  "Welcome Packets & Swag",
  "AV Kit (Projector, Cables)",
  "Sign-in Sheets & Pens",
];

export function LogisticsTab({ venue, instructor }: LogisticsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin /> Venue Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-lg">{venue.name}</p>
            <p className="text-muted-foreground">{venue.address}, {venue.city}, {venue.state}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User /> Instructor Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-lg">{instructor.name}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-muted-foreground"><Mail className="h-4 w-4" /> {instructor.email}</div>
              <div className="flex items-center gap-1 text-muted-foreground"><Phone className="h-4 w-4" /> {instructor.phone}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Shipping Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {shippingItems.map(item => (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox id={item} />
              <Label htmlFor={item} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {item}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}