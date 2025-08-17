"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventDirectory } from "@/components/events/event-directory";
import { EventsTable } from "@/components/events/events-table";
import { List, Map } from "lucide-react";

export default function EventsPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events Command Center</h1>
          <p className="text-muted-foreground">
            Proactively manage and monitor all events.
          </p>
        </div>
      </div>
      <Tabs defaultValue="map" className="mt-4 sm:mt-0">
        <TabsList>
          <TabsTrigger value="directory">
            <List className="mr-2 h-4 w-4" />
            Directory
          </TabsTrigger>
          <TabsTrigger value="map">
            <Map className="mr-2 h-4 w-4" />
            Map View
          </TabsTrigger>
        </TabsList>
        <TabsContent value="directory" className="mt-4">
          <EventsTable />
        </TabsContent>
        <TabsContent value="map" className="mt-4">
          <EventDirectory />
        </TabsContent>
      </Tabs>
    </div>
  );
}