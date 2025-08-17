"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import React from "react";

interface Venue {
  id: string;
  name: string;
  type: string;
  city: string;
  capacity: number;
}

async function fetchVenues(): Promise<Venue[]> {
  const response = await fetch("/api/venues");
  if (!response.ok) throw new Error("Failed to fetch venues");
  return response.json();
}

export function VenuesTable() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: venues = [], isLoading } = useQuery<Venue[]>({
    queryKey: ["venues"],
    queryFn: fetchVenues,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  const deleteMutation = useMutation({
    mutationFn: async (venueId: string) => {
      const response = await fetch(`/api/venues/${venueId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete venue");
      }
    },
    onSuccess: () => {
      toast.success("Venue deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["venues"] });
    },
    onError: () => {
      toast.error("Failed to delete venue.");
    },
  });

  const columns: ColumnDef<Venue>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "city", header: "City" },
    { accessorKey: "capacity", header: "Capacity" },
    {
      id: "actions",
      cell: ({ row }) => {
        const venue = row.original;
        return (
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => router.push(`/dashboard/directory/venues/${venue.id}/edit`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the venue "{venue.name}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate(venue.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      },
    },
  ];

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return <DataTable columns={columns} data={venues} />;
}