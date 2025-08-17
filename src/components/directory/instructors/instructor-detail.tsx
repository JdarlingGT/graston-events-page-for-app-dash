"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, BookOpen } from "lucide-react";
import Link from "next/link";

interface Instructor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio: string;
  specialties: string;
  avatar?: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  city: string;
}

const eventColumns: ColumnDef<Event>[] = [
  {
    accessorKey: "name",
    header: "Event",
    cell: ({ row }) => (
      <Link href={`/dashboard/events/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
  },
  { accessorKey: "city", header: "Location" },
];

export function InstructorDetail({ instructorId }: { instructorId: string }) {
  const { data: instructor, isLoading: instructorLoading } = useQuery<Instructor>({
    queryKey: ["instructor", instructorId],
    queryFn: async () => {
      const res = await fetch(`/api/instructors/${instructorId}`);
      if (!res.ok) throw new Error("Failed to fetch instructor");
      return res.json();
    },
  });

  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["instructor-events", instructorId],
    queryFn: async () => {
      const res = await fetch(`/api/instructors/${instructorId}/events`);
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
  });

  if (instructorLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!instructor) return <p>Instructor not found.</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={instructor.avatar} />
            <AvatarFallback className="text-3xl">
              {instructor.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-3xl">{instructor.name}</CardTitle>
            <CardDescription className="text-lg">{instructor.specialties}</CardDescription>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> {instructor.email}</div>
              {instructor.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {instructor.phone}</div>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{instructor.bio}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Teaching History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {eventsLoading ? <Skeleton className="h-64 w-full" /> : <DataTable columns={eventColumns} data={events || []} />}
        </CardContent>
      </Card>
    </div>
  );
}