"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, MoreHorizontal, FilePenLine, Trash2, ArrowUpDown, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

interface Event {
  id: string;
  name: string;
  city: string;
  state: string;
  instructor: string;
  enrolledStudents: number;
  instrumentsPurchased: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  async function fetchEvents() {
    setLoading(true);
    try {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async () => {
    if (!selectedEvent) return;
    try {
      const response = await fetch(`/api/events/${selectedEvent.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete event');
      toast.success('Event deleted successfully!');
      fetchEvents(); // Refresh the list
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete event.');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  const columns: ColumnDef<Event>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Event Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "instructor",
      header: "Instructor",
    },
    {
      accessorKey: "city",
      header: "City",
    },
    {
      accessorKey: "enrolledStudents",
      header: "Enrolled",
    },
    {
      accessorKey: "instrumentsPurchased",
      header: "Kits Purchased",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/events/${event.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/events/${event.id}/edit`}>
                    <FilePenLine className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    setSelectedEvent(event);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground">
              Manage your events here.
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
          <CardHeader>
            <CardTitle>Events List</CardTitle>
            <CardDescription>A list of all available events.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              <DataTable columns={columns} data={events} searchPlaceholder="Search events..." />
            )}
          </CardContent>
        </Card>
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              "{selectedEvent?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}