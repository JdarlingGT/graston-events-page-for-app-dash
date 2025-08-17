"use client";

import { EventsTable } from "@/components/events/events-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ColumnFiltersState } from "@tanstack/react-table";

export default function EventsPage() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nameFilter = columnFilters.find(f => f.id === 'name');
    const newFilterValue = event.target.value;

    if (newFilterValue) {
      if (nameFilter) {
        setColumnFilters(columnFilters.map(f => f.id === 'name' ? { ...f, value: newFilterValue } : f));
      } else {
        setColumnFilters(prev => [...prev, { id: 'name', value: newFilterValue }]);
      }
    } else {
      setColumnFilters(columnFilters.filter(f => f.id !== 'name'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Events</h1>
          <p className="text-muted-foreground">
            Manage all company events from this command center.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/events/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center py-4">
            <Input
              placeholder="Search events by name..."
              value={(columnFilters.find(f => f.id === 'name')?.value as string) ?? ''}
              onChange={handleFilterChange}
              className="max-w-sm"
            />
          </div>
          <EventsTable columnFilters={columnFilters} setColumnFilters={setColumnFilters} />
        </CardContent>
      </Card>
    </div>
  );
}