"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  DollarSign,
  X
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type DateRange = { from: Date; to?: Date };

interface EventFiltersProps {
  filters: {
    search: string;
    type: string;
    mode: string;
    status: string;
    dangerZone: string;
    dateRange: { from?: Date; to?: Date };
    enrollmentRange: [number, number];
    revenueRange: [number, number];
    cities: string[];
    instructors: string[];
  };
  onFiltersChange: (filters: any) => void;
  availableOptions: {
    cities: string[];
    instructors: string[];
    types: string[];
    modes: string[];
  };
}

export function EventFilters({ filters, onFiltersChange, availableOptions }: EventFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilter = (key: string) => {
    const defaultValues: any = {
      search: "",
      type: "all",
      mode: "all",
      status: "all",
      dangerZone: "all",
      dateRange: {},
      enrollmentRange: [0, 100],
      revenueRange: [0, 100000],
      cities: [],
      instructors: [],
    };
    updateFilter(key, defaultValues[key]);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      type: "all",
      mode: "all",
      status: "all",
      dangerZone: "all",
      dateRange: {},
      enrollmentRange: [0, 100],
      revenueRange: [0, 100000],
      cities: [],
      instructors: [],
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.type !== "all") count++;
    if (filters.mode !== "all") count++;
    if (filters.status !== "all") count++;
    if (filters.dangerZone !== "all") count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.enrollmentRange[0] > 0 || filters.enrollmentRange[1] < 100) count++;
    if (filters.revenueRange[0] > 0 || filters.revenueRange[1] < 100000) count++;
    if (filters.cities.length > 0) count++;
    if (filters.instructors.length > 0) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Helper to cast dateRange to DateRange | undefined for Calendar
  const getDateRange = (): DateRange | undefined => {
    if (filters.dateRange && filters.dateRange.from) {
      return { from: filters.dateRange.from, to: filters.dateRange.to };
    }
    return undefined;
  };

  return (
    <div className="space-y-4">
      {/* Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events, instructors, or cities..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filters.type} onValueChange={(value) => updateFilter("type", value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {availableOptions.types.map((type: string) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.mode} onValueChange={(value) => updateFilter("mode", value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              {availableOptions.modes.map((mode: string) => (
                <SelectItem key={mode} value={mode}>{mode}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-fit">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "LLL dd")} -{" "}
                      {format(filters.dateRange.to, "LLL dd")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "LLL dd, y")
                  )
                ) : (
                  "Date Range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange.from}
                selected={getDateRange()}
                onSelect={(range) => updateFilter("dateRange", range || {})}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {/* ...rest of the component remains unchanged... */}
        </div>
      </div>
      {/* ...rest of the component remains unchanged... */}
    </div>
  );
}