"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchFilters } from "./search-filters";
import { SearchResultCard } from "./search-result-card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
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
    pageSize: 10,
  });
  
  // This state is triggered by the search button to actually run the query
  const [activeFilters, setActiveFilters] = useState<Filters>(filters);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["archival-search", activeFilters],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: activeFilters.q,
        type: activeFilters.type,
        page: activeFilters.page.toString(),
        pageSize: activeFilters.pageSize.toString(),
      });
      if (activeFilters.start) params.append("start", activeFilters.start.toISOString().split('T')[0]);
      if (activeFilters.end) params.append("end", activeFilters.end.toISOString().split('T')[0]);

      const response = await fetch(`/api/archival/search?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch search results.");
      }
      return response.json();
    },
    enabled: !!activeFilters.q, // Only run query if there's a search term
  });

  if (isError) {
    toast.error("Search failed. Please check the connection and try again.");
  }

  const handleSearch = () => {
    setActiveFilters(filters);
  };

  const handlePageChange = (newPage: number) => {
    const updatedFilters = { ...filters, page: newPage };
    setFilters(updatedFilters);
    setActiveFilters(updatedFilters);
  };

  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <SearchFilters filters={filters} onFiltersChange={setFilters} onSearch={handleSearch} />
      
      {isFetching ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : !activeFilters.q ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle>Search the Archives</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Enter a search term above to begin.</p>
          </CardContent>
        </Card>
      ) : data?.data?.length > 0 ? (
        <div className="space-y-4">
          {data.data.map((result: SearchResult) => (
            <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
          ))}
          {pagination && pagination.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); handlePageChange(pagination.page - 1); }}
                    className={pagination.page <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); handlePageChange(pagination.page + 1); }}
                    className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle>No Results Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Try adjusting your search filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}