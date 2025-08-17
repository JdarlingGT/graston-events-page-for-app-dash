"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventDirectory } from "@/components/events/event-directory";
import { VenuesTable } from "@/components/venues/venues-table";

export default function EventsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Events & Venues</h1>
        <p className="text-muted-foreground">
          Discover, manage, and organize all your events and venues.
        </p>
      </div>
      <Tabs defaultValue="directory">
        <TabsList>
          <TabsTrigger value="directory">Event Directory</TabsTrigger>
          <TabsTrigger value="venues">Venues</TabsTrigger>
        </TabsList>
        <TabsContent value="directory" className="mt-4">
          <EventDirectory />
        </TabsContent>
        <TabsContent value="venues" className="mt-4">
          <VenuesTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}