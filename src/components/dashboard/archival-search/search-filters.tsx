"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Search, X } from "lucide-react";
import { format } from "date-fns";
import { Filters } from "./archival-search";

interface SearchFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, q: e.target.value, page: 1 });
  };

  const handleTypeChange = (type: string) => {
    onFiltersChange({ ...filters, type, page: 1 });
  };

  const handleDateChange = (range: { from?: Date; to?: Date } | undefined) => {
    onFiltersChange({ ...filters, start: range?.from, end: range?.to, page: 1 });
  };

  const clearFilters = () => {
    onFiltersChange({ q: "", type: "all", page: 1, pageSize: 25 });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, event title..."
          value={filters.q}
          onChange={handleInputChange}
          className="pl-10"
        />
      </div>
      <Select value={filters.type} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="event">Event</SelectItem>
          <SelectItem value="order">Order</SelectItem>
          <SelectItem value="attendee">Attendee</SelectItem>
          <SelectItem value="contact">Contact</SelectItem>
          <SelectItem value="evaluation">Evaluation</SelectItem>
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.start ? (
              filters.end ? (
                `${format(filters.start, "LLL dd, y")} - ${format(filters.end, "LLL dd, y")}`
              ) : (
                format(filters.start, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            selected={{ from: filters.start, to: filters.end }}
            onSelect={handleDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      <Button variant="ghost" onClick={clearFilters}>
        <X className="mr-2 h-4 w-4" /> Clear
      </Button>
    </div>
  );
}