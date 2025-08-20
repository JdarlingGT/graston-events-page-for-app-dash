'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  ColumnDef,
  SortingState,
  PaginationState,
  Row,
  Cell,
  Header,
  HeaderGroup,
  CellContext,
} from '@tanstack/react-table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../ui/sheet';
import { Progress } from '../../ui/progress';
import { Button } from '../../ui/button';
import { Plus, Filter } from 'lucide-react';
import Link from 'next/link';

type EventStatus = 'upcoming' | 'in_progress' | 'completed' | 'cancelled';

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  enrolled: number;
  capacity: number;
  status: EventStatus;
}

type EnrollmentInfo = {
  enrolled: number;
  capacity: number;
};

type StatusStyles = Record<EventStatus, string>;

const columnHelper = createColumnHelper<Event>();

const columns: ColumnDef<Event, any>[] = [
  columnHelper.accessor('name', {
    header: 'Event Name',
    cell: (info: CellContext<Event, string>) => (
      <Link 
        href={`/dashboard/events/${info.row.original.id}`}
        className="text-blue-600 hover:text-blue-800"
      >
        {info.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor('date', {
    header: 'Date',
    cell: (info: CellContext<Event, string>) => new Date(info.getValue()).toLocaleDateString(),
  }),
  columnHelper.accessor('location', {
    header: 'Location',
  }),
  columnHelper.accessor((row: Event) => ({ enrolled: row.enrolled, capacity: row.capacity }), {
    id: 'enrollment',
    header: 'Enrolled / Capacity',
    cell: (info: CellContext<Event, EnrollmentInfo>) => {
      const { enrolled, capacity } = info.getValue();
      const percentage = (enrolled / capacity) * 100;
      return (
        <div className="w-full">
          <div className="flex justify-between mb-1 text-sm">
            <span>{enrolled} / {capacity}</span>
            <span>{Math.round(percentage)}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
      );
    },
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info: CellContext<Event, EventStatus>) => {
      const status = info.getValue();
      const styles: StatusStyles = {
        upcoming: 'bg-blue-100 text-blue-800',
        in_progress: 'bg-green-100 text-green-800',
        completed: 'bg-gray-100 text-gray-800',
        cancelled: 'bg-red-100 text-red-800',
      };
      return (
        <span className={`px-2 py-1 rounded-full text-sm ${styles[status as EventStatus]}`}>
          {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  }),
];

const EventsHubClient: React.FC = () => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [filtering, setFiltering] = React.useState('');
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: events = [], isLoading, error } = useQuery<Event[]>({
    queryKey: ['events', pagination, sorting, filtering],
    queryFn: async () => {
      const response = await fetch('/api/events');
      if (!response.ok) {
throw new Error('Failed to fetch events');
}
      return response.json();
    },
  });

  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter: filtering,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFiltering,
    onPaginationChange: setPagination,
  });

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Error loading events</p>
        <Button 
          onClick={() => table.resetGlobalFilter()}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Control Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Events Hub</h1>
        <div className="flex gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Events</SheetTitle>
              </SheetHeader>
              {/* Filter controls will go here */}
            </SheetContent>
          </Sheet>
          <Link href="/dashboard/events/create">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<Event>) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header: Header<Event, unknown>) => (
                  <th 
                    key={header.id}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : 
                      typeof header.column.columnDef.header === 'function'
                        ? header.column.columnDef.header(header.getContext())
                        : header.column.columnDef.header
                    }
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row: Row<Event>) => (
              <tr key={row.id} className="border-t border-gray-200 hover:bg-gray-50">
                {row.getVisibleCells().map((cell: Cell<Event, unknown>) => (
                  <td key={cell.id} className="px-6 py-4 text-sm text-gray-500">
                    {typeof cell.column.columnDef.cell === 'function'
                      ? cell.column.columnDef.cell(cell.getContext())
                      : cell.column.columnDef.cell || cell.getValue()
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </Button>
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </Button>
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </Button>
          <Button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </Button>
        </div>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </strong>
        </span>
      </div>
    </div>
  );
};

export default EventsHubClient;