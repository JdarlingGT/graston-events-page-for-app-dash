'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import React, { useState } from 'react';

interface Venue {
  id: string;
  name: string;
  type: string;
  city: string;
  capacity: number;
}

async function fetchVenues(): Promise<Venue[]> {
  const response = await fetch('/api/venues');
  if (!response.ok) {
throw new Error('Failed to fetch venues');
}
  return response.json();
}

export function VenuesTable() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  interface VenuesResponse {
    venues: Venue[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }

  const { data, isLoading } = useQuery<VenuesResponse>({
    queryKey: ['venues', searchTerm, filter, page, pageSize],
    queryFn: async () => {
      let url = '/api/venues';

      // Add search parameter if searchTerm exists
      if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`;
      }

      // Add filter parameter if filter exists
      if (filter) {
        url += searchTerm ? `&filter=${encodeURIComponent(filter)}` : `?filter=${encodeURIComponent(filter)}`;
      }

      // Add pagination parameters
      url += `${searchTerm || filter ? '&' : '?'}page=${page}&pageSize=${pageSize}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch venues');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  const venues = data?.venues || [];

  const deleteMutation = useMutation({
    mutationFn: async (venueId: string) => {
      const response = await fetch(`/api/venues/${venueId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete venue');
      }
    },
    onSuccess: () => {
      toast.success('Venue deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
    onError: () => {
      toast.error('Failed to delete venue.');
    },
  });

  const columns: ColumnDef<Venue>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'city', header: 'City' },
    { accessorKey: 'capacity', header: 'Capacity' },
    {
      id: 'actions',
      cell: ({ row }) => {
        const venue = row.original;
        return (
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" aria-label={`Actions for ${venue.name}`}>
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Search venues..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset to first page on new search
            }}
            className="h-8 w-auto"
          />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="Conference Center">Conference Center</SelectItem>
              <SelectItem value="Hotel Ballroom">Hotel Ballroom</SelectItem>
              <SelectItem value="Outdoor Venue">Outdoor Venue</SelectItem>
              <SelectItem value="Sports Stadium">Sports Stadium</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          Page {page} of {data?.totalPages || 1}
        </div>
      </div>
      <DataTable columns={columns} data={venues} />
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setPage(page > 1 ? page - 1 : 1)}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => setPage(page + 1)}
          disabled={page >= (data?.totalPages || 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}