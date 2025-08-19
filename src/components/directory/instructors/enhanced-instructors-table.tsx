'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { 
  MoreHorizontal, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  MapPin, 
  Calendar,
  Users,
  Award,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { Instructor, InstructorFilters, InstructorStats } from '@/types/instructor';
import { InstructorFiltersData } from '@/lib/schemas/instructor';

interface EnhancedInstructorsTableProps {
  showBulkActions?: boolean;
  showFilters?: boolean;
  showStats?: boolean;
  compactMode?: boolean;
}

export function EnhancedInstructorsTable({ 
  showBulkActions = true, 
  showFilters = true, 
  showStats = true,
  compactMode = false 
}: EnhancedInstructorsTableProps) {
  const queryClient = useQueryClient();
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
  const [filters, setFilters] = useState<InstructorFiltersData>({
    search: '',
    specialties: [],
    status: [],
    availability: undefined,
    location: '',
    certifications: [],
    rating: undefined,
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: 20,
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [instructorToDelete, setInstructorToDelete] = useState<string | null>(null);

  // Fetch instructors with filters
  const { data: instructorsData, isLoading, error } = useQuery({
    queryKey: ['instructors', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });
      
      const response = await fetch(`/api/instructors?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch instructors');
      }
      return response.json();
    },
  });

  // Fetch instructor stats
  const { data: stats } = useQuery({
    queryKey: ['instructor-stats'],
    queryFn: async () => {
      const response = await fetch('/api/instructors/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch instructor stats');
      }
      return response.json();
    },
    enabled: showStats,
  });

  // Delete instructor mutation
  const deleteInstructorMutation = useMutation({
    mutationFn: async (instructorId: string) => {
      const response = await fetch(`/api/instructors/${instructorId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete instructor');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-stats'] });
      toast.success('Instructor deleted successfully');
      setShowDeleteDialog(false);
      setInstructorToDelete(null);
    },
    onError: (error) => {
      toast.error('Failed to delete instructor');
      console.error('Delete error:', error);
    },
  });

  // Bulk operations mutation
  const bulkOperationMutation = useMutation({
    mutationFn: async ({ operation, instructorIds, data }: { operation: string; instructorIds: string[]; data?: any }) => {
      const response = await fetch('/api/instructors/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, instructorIds, data }),
      });
      if (!response.ok) {
        throw new Error('Failed to perform bulk operation');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-stats'] });
      toast.success(`Bulk ${variables.operation} completed successfully`);
      setSelectedInstructors([]);
    },
    onError: (error) => {
      toast.error('Failed to perform bulk operation');
      console.error('Bulk operation error:', error);
    },
  });

  const columns: ColumnDef<Instructor>[] = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: 'Instructor',
      cell: ({ row }) => {
        const instructor = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={instructor.avatar} alt={instructor.name} />
              <AvatarFallback>
                {instructor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <Link 
                href={`/dashboard/directory/instructors/${instructor.id}`}
                className="font-medium text-primary hover:underline"
              >
                {instructor.name}
              </Link>
              <div className="text-sm text-muted-foreground truncate">
                {instructor.email}
              </div>
              {!compactMode && instructor.phone && (
                <div className="text-xs text-muted-foreground">
                  {instructor.phone}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'specialties',
      header: 'Specialties',
      cell: ({ row }) => {
        const specialties = row.original.specialties;
        return (
          <div className="flex flex-wrap gap-1">
            {specialties.slice(0, 2).map((specialty, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {specialties.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{specialties.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const statusConfig = {
          active: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          inactive: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
          pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        };
        const config = statusConfig[status];
        const Icon = config.icon;
        
        return (
          <Badge variant="outline" className={`${config.bg} ${config.color} border-current`}>
            <Icon className="w-3 h-3 mr-1" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'performanceMetrics',
      header: 'Performance',
      cell: ({ row }) => {
        const metrics = row.original.performanceMetrics;
        if (!metrics) return <span className="text-muted-foreground">No data</span>;
        
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 text-yellow-500" />
              <span className="text-sm font-medium">
                {metrics.averageStudentRating.toFixed(1)}
              </span>
            </div>
            {!compactMode && (
              <>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>{metrics.totalStudentsTrained} students</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{metrics.totalEventsInstructed} events</span>
                </div>
              </>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'certifications',
      header: 'Certifications',
      cell: ({ row }) => {
        const certifications = row.original.certifications;
        const activeCerts = certifications.filter(cert => cert.verified);
        
        return (
          <div className="flex items-center space-x-1">
            <Award className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">{activeCerts.length}</span>
            {!compactMode && (
              <span className="text-xs text-muted-foreground">
                / {certifications.length} total
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const instructor = row.original;
        
        return (
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
                <Link href={`/dashboard/directory/instructors/${instructor.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/directory/instructors/${instructor.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setInstructorToDelete(instructor.id);
                  setShowDeleteDialog(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [compactMode]);

  const handleBulkOperation = (operation: string, data?: any) => {
    if (selectedInstructors.length === 0) {
      toast.error('Please select instructors first');
      return;
    }
    
    bulkOperationMutation.mutate({
      operation,
      instructorIds: selectedInstructors,
      data,
    });
  };

  const handleFilterChange = (key: keyof InstructorFiltersData, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      specialties: [],
      status: [],
      availability: undefined,
      location: '',
      certifications: [],
      rating: undefined,
      sortBy: 'name',
      sortOrder: 'asc',
      page: 1,
      limit: 20,
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load instructors</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['instructors'] })}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {showStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Instructors</p>
                <p className="text-2xl font-bold">{stats.totalInstructors}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeInstructors}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalSessionsThisMonth}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          {showFilters && (
            <>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search instructors..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={filters.status?.[0] || ''}
                onValueChange={(value) => handleFilterChange('status', value ? [value] : [])}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {showBulkActions && selectedInstructors.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedInstructors.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkOperation('activate')}
              >
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkOperation('deactivate')}
              >
                Deactivate
              </Button>
            </div>
          )}
          
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button asChild>
            <Link href="/dashboard/directory/instructors/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Instructor
            </Link>
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={instructorsData?.instructors || []}
            getRowClassName={(row) => {
              const status = row.original.status;
              if (status === 'inactive') return 'opacity-60';
              if (status === 'pending') return 'bg-yellow-50';
              return '';
            }}
          />
        )}
        
        {/* Custom Pagination */}
        {instructorsData && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {((filters.page - 1) * filters.limit) + 1} to{' '}
              {Math.min(filters.page * filters.limit, instructorsData.total)} of{' '}
              {instructorsData.total} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange('page', filters.page - 1)}
                disabled={filters.page <= 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {filters.page} of {Math.ceil(instructorsData.total / filters.limit)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange('page', filters.page + 1)}
                disabled={!instructorsData.hasMore}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the instructor
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (instructorToDelete) {
                  deleteInstructorMutation.mutate(instructorToDelete);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}