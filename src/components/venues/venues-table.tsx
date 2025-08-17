"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowUpDown, MoreHorizontal, PlusCircle } from "lucide-react";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Venue {
  id: string;
  name: string;
  type: string;
  city: string;
  capacity: number;
}

async function fetchVenues(): Promise<Venue[]> {
  const response = await fetch("/api/venues");
  if (!response.ok) {
    throw new Error("Failed to fetch venues");
  }
  return response.json();
}

async function deleteVenue(venueId: string) {
  const response = await fetch(`/api/venues/${venueId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete venue");
  }
}

export function VenuesTable() {
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  const { data: venues = [], isLoading, error } = useQuery({
    queryKey: ["venues"],
    queryFn: fetchVenues,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVenue,
    onSuccess: () => {
      toast.success("Venue deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      setIsDeleteDialogOpen(false);
      setSelectedVenue(null);
    },
    onError: () => {
      toast.error("Failed to delete venue");
    },
  });

  const handleDeleteClick = (venue: Venue) => {
    setSelectedVenue(venue);
    setIsDeleteDialogOpen(true);
  };

  const columns: ColumnDef<Venue>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
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
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/venues/${venue.id}/edit`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDeleteClick(venue)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  if (error) {
    toast.error("Failed to load venues.");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Venues</CardTitle>
            <CardDescription>Manage your event venues.</CardDescription>
          </div>
          <Button asChild>
            <Link href="/dashboard/venues/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Venue
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <DataTable columns={columns} data={venues} />
        )}
      </CardContent>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the venue "{selectedVenue?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedVenue && deleteMutation.mutate(selectedVenue.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}