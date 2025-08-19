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
import { MoreHorizontal, Edit, Trash, Eye } from 'lucide-react';
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
import React from 'react';
import Link from 'next/link';

interface Instructor {
  id: string;
  name: string;
  email: string;
  specialties: string;
}

async function fetchInstructors(): Promise<Instructor[]> {
  const response = await fetch('/api/instructors');
  if (!response.ok) {
throw new Error('Failed to fetch instructors');
}
  return response.json();
}

export function InstructorsTable() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: instructors = [], isLoading } = useQuery<Instructor[]>({
    queryKey: ['instructors'],
    queryFn: fetchInstructors,
  });

  const deleteMutation = useMutation({
    mutationFn: async (instructorId: string) => {
      const response = await fetch(`/api/instructors/${instructorId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete instructor');
      }
    },
    onSuccess: () => {
      toast.success('Instructor deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
    },
    onError: () => {
      toast.error('Failed to delete instructor.');
    },
  });

  const columns: ColumnDef<Instructor>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <Link href={`/dashboard/instructors/${row.original.id}`} className="font-medium text-primary hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'specialties', header: 'Specialties' },
    {
      id: 'actions',
      cell: ({ row }) => {
        const instructor = row.original;
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
                  onClick={() => router.push(`/dashboard/instructors/${instructor.id}`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`/dashboard/instructors/${instructor.id}/edit`)}
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
                  This action cannot be undone. This will permanently delete the instructor "{instructor.name}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate(instructor.id)}
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

  return <DataTable columns={columns} data={instructors} />;
}