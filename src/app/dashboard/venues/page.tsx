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
import { PlusCircle, MoreHorizontal, FilePenLine, Trash2, ArrowUpDown, Building } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

interface Venue {
  id: string;
  name: string;
  type: string;
  city: string;
  capacity: number;
}

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  async function fetchVenues() {
    setLoading(true);
    try {
      const response = await fetch('/api/venues');
      if (!response.ok) throw new Error('Failed to fetch venues');
      const data = await response.json();
      setVenues(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load venues.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleDelete = async () => {
    if (!selectedVenue) return;
    try {
      const response = await fetch(`/api/venues/${selectedVenue.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete venue');
      toast.success('Venue deleted successfully!');
      fetchVenues(); // Refresh the list
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete venue.');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedVenue(null);
    }
  };

  const columns: ColumnDef<Venue>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Venue Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "type",
      header: "Venue Type",
    },
    {
      accessorKey: "city",
      header: "City",
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const venue = row.original;
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
                  <Link href={`/dashboard/venues/${venue.id}/edit`}>
                    <FilePenLine className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    setSelectedVenue(venue);
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
            <h1 className="text-2xl font-bold tracking-tight">Venues</h1>
            <p className="text-muted-foreground">
              Manage your event locations here.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/venues/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Venue
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Venues List</CardTitle>
            <CardDescription>A list of all available venues.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : venues.length > 0 ? (
              <DataTable columns={columns} data={venues} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Building className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Venues Found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You haven't added any venues yet.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/venues/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Venue
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the venue
              "{selectedVenue?.name}".
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