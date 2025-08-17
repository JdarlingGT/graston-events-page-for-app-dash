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
              {availableOptions.types.map((type) => (
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
              {availableOptions.modes.map((mode) => (
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
                selected={filters.dateRange}
                onSelect={(range) => updateFilter("dateRange", range || {})}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Sheet open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Advanced
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-96">
              <SheetHeader>
                <SheetTitle>Advanced Filters</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                {/* Danger Zone */}
                <div>
                  <label className="text-sm font-medium">Risk Level</label>
                  <Select value={filters.dangerZone} onValueChange={(value) => updateFilter("dangerZone", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="at-risk">At Risk (< 4 students)</SelectItem>
                      <SelectItem value="healthy">Healthy (10+ students)</SelectItem>
                      <SelectItem value="almost-full">Almost Full (90%+ capacity)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Enrollment Range */}
                <div>
                  <label className="text-sm font-medium">Enrollment Range</label>
                  <div className="mt-2">
                    <Slider
                      value={filters.enrollmentRange}
                      onValueChange={(value) => updateFilter("enrollmentRange", value)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{filters.enrollmentRange[0]} students</span>
                      <span>{filters.enrollmentRange[1]} students</span>
                    </div>
                  </div>
                </div>

                {/* Revenue Range */}
                <div>
                  <label className="text-sm font-medium">Revenue Range</label>
                  <div className="mt-2">
                    <Slider
                      value={filters.revenueRange}
                      onValueChange={(value) => updateFilter("revenueRange", value)}
                      max={100000}
                      step={1000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>${filters.revenueRange[0].toLocaleString()}</span>
                      <span>${filters.revenueRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Cities */}
                <div>
                  <label className="text-sm font-medium">Cities</label>
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                    {availableOptions.cities.map((city) => (
                      <div key={city} className="flex items-center space-x-2">
                        <Checkbox
                          id={`city-${city}`}
                          checked={filters.cities.includes(city)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFilter("cities", [...filters.cities, city]);
                            } else {
                              updateFilter("cities", filters.cities.filter(c => c !== city));
                            }
                          }}
                        />
                        <label htmlFor={`city-${city}`} className="text-sm">
                          {city}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructors */}
                <div>
                  <label className="text-sm font-medium">Instructors</label>
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                    {availableOptions.instructors.map((instructor) => (
                      <div key={instructor} className="flex items-center space-x-2">
                        <Checkbox
                          id={`instructor-${instructor}`}
                          checked={filters.instructors.includes(instructor)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFilter("instructors", [...filters.instructors, instructor]);
                            } else {
                              updateFilter("instructors", filters.instructors.filter(i => i !== instructor));
                            }
                          }}
                        />
                        <label htmlFor={`instructor-${instructor}`} className="text-sm">
                          {instructor}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clear All */}
                <div className="pt-4 border-t">
                  <Button variant="outline" onClick={clearAllFilters} className="w-full">
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter("search")} />
            </Badge>
          )}
          {filters.type !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Type: {filters.type}
              <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter("type")} />
            </Badge>
          )}
          {filters.mode !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Mode: {filters.mode}
              <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter("mode")} />
            </Badge>
          )}
          {filters.dangerZone !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Risk: {filters.dangerZone}
              <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter("dangerZone")} />
            </Badge>
          )}
          {(filters.dateRange.from || filters.dateRange.to) && (
            <Badge variant="secondary" className="gap-1">
              Date Range
              <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter("dateRange")} />
            </Badge>
          )}
          {filters.cities.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Cities: {filters.cities.length}
              <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter("cities")} />
            </Badge>
          )}
          {filters.instructors.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Instructors: {filters.instructors.length}
              <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter("instructors")} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}