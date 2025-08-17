"use client";

import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchResult } from "./archival-search";

interface SearchResultsTableProps {
  data: SearchResult[];
  pagination?: { page: number; pageSize: number; total: number; totalPages: number };
  onViewDetails: (result: SearchResult) => void;
  onPageChange: (page: number) => void;
}

export function SearchResultsTable({ data, pagination, onViewDetails, onPageChange }: SearchResultsTableProps) {
  const columns: ColumnDef<SearchResult>[] = [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <Badge variant="secondary">{row.original.type}</Badge>,
    },
    { accessorKey: "title", header: "Title" },
    { accessorKey: "subtitle", header: "Subtitle" },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => onViewDetails(row.original)}>
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={data} />
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}