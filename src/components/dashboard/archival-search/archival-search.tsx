"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchFilters } from "./search-filters";
import { SearchResultsTable } from "./search-results-table";
import { SearchDetailDrawer } from "./search-detail-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  date: string;
  snippet: string;
  raw_data: any;
}

export interface Filters {
  q: string;
  type: string;
  start?: Date;
  end?: Date;
  page: number;
  pageSize: number;
}

export function ArchivalSearch() {
  const [filters, setFilters] = useState<Filters>({
    q: "",
    type: "all",
    page: 1,
    pageSize: 25,
  });
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["archival-search", filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: filters.q,
        type: filters.type,
        page: filters.page.toString(),
        pageSize: filters.pageSize.toString(),
      });
      if (filters.start) params.append("start", filters.start.toISOString().split('T')[0]);
      if (filters.end) params.append("end", filters.end.toISOString().split('T')[0]);

      const response = await fetch(`/api/archival/search?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch search results.");
      }
      return response.json();
    },
  });

  if (isError) {
    toast.error("Search failed. Please check the connection and try again.");
  }

  return (
    <div className="space-y-4">
      <SearchFilters filters={filters} onFiltersChange={setFilters} />
      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <SearchResultsTable
          data={data?.data || []}
          pagination={data?.pagination}
          onViewDetails={setSelectedResult}
          onPageChange={(page) => setFilters(f => ({ ...f, page }))}
        />
      )}
      <SearchDetailDrawer
        result={selectedResult}
        isOpen={!!selectedResult}
        onClose={() => setSelectedResult(null)}
      />
    </div>
  );
}