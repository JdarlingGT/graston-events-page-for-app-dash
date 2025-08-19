'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  DollarSign,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
      search: '',
      type: 'all',
      mode: 'all',
      status: 'all',
      dangerZone: 'all',
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
      search: '',
      type: 'all',
      mode: 'all',
      status: 'all',
      dangerZone: 'all',
      dateRange: {},
      enrollmentRange: [0, 100],
      revenueRange: [0, 100000],
      cities: [],
      instructors: [],
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) {
count++;
}
    if (filters.type !== 'all') {
count++;
}
    if (filters.mode !== 'all') {
count++;
}
    if (filters.status !== 'all') {
count++;
}
    if (filters.dangerZone !== 'all') {
count++;
}
    if (filters.dateRange.from || filters.dateRange.to) {
count++;
}
    if (filters.enrollmentRange[0] > 0 || filters.enrollmentRange[1] < 100) {
count++;
}
    if (filters.revenueRange[0] > 0 || filters.revenueRange[1] < 100000) {
count++;
}
    if (filters.cities.length > 0) {
count++;
}
    if (filters.instructors.length > 0) {
count++;
}
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
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
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

          <Select value={filters.mode} onValueChange={(value) => updateFilter('mode', value)}>
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
                      {format(filters.dateRange.from, 'LLL dd')} -{' '}
                      {format(filters.dateRange.to, 'LLL dd')}
                    </>
                  ) : (
                    format(filters.dateRange.from, 'LLL dd, y')
                  )
                ) : (
                  'Date Range'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange.from}
                selected={getDateRange()}
                onSelect={(range) => updateFilter('dateRange', range || {})}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Sheet open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="mr-2 h-4 w-4" />
                Advanced Filters
                {activeFiltersCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Advanced Filters</SheetTitle>
              </SheetHeader>
              <div className="grid gap-6 py-4">
                {/* Status Filter */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Event Status</h4>
                  <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Danger Zone Filter */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Danger Zone</h4>
                  <Select value={filters.dangerZone} onValueChange={(value) => updateFilter('dangerZone', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="at-risk">At Risk (Low Enrollment)</SelectItem>
                      <SelectItem value="almost-full">Almost Full</SelectItem>
                      <SelectItem value="healthy">Healthy Enrollment</SelectItem>
                      <SelectItem value="building">Enrollment Building</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Enrollment Range */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Enrollment Range: {filters.enrollmentRange[0]} - {filters.enrollmentRange[1]}
                  </h4>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={filters.enrollmentRange}
                    onValueChange={(value: number[]) => updateFilter('enrollmentRange', value as [number, number])}
                    className="w-full"
                  />
                </div>

                {/* Revenue Range (Mocked, adjust max as needed) */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Revenue Range: ${filters.revenueRange[0].toLocaleString()} - ${filters.revenueRange[1].toLocaleString()}
                  </h4>
                  <Slider
                    min={0}
                    max={100000}
                    step={1000}
                    value={filters.revenueRange}
                    onValueChange={(value: number[]) => updateFilter('revenueRange', value as [number, number])}
                    className="w-full"
                  />
                </div>

                {/* Cities Filter */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Cities</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {availableOptions.cities.map((city) => (
                      <div key={city} className="flex items-center space-x-2">
                        <Checkbox
                          id={`city-${city}`}
                          checked={filters.cities.includes(city)}
                          onCheckedChange={(checked) => {
                            const newCities = checked
                              ? [...filters.cities, city]
                              : filters.cities.filter((c) => c !== city);
                            updateFilter('cities', newCities);
                          }}
                        />
                        <label
                          htmlFor={`city-${city}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {city}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructors Filter */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Instructors</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {availableOptions.instructors.map((instructor) => (
                      <div key={instructor} className="flex items-center space-x-2">
                        <Checkbox
                          id={`instructor-${instructor}`}
                          checked={filters.instructors.includes(instructor)}
                          onCheckedChange={(checked) => {
                            const newInstructors = checked
                              ? [...filters.instructors, instructor]
                              : filters.instructors.filter((i) => i !== instructor);
                            updateFilter('instructors', newInstructors);
                          }}
                        />
                        <label
                          htmlFor={`instructor-${instructor}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {instructor}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <Button variant="outline" onClick={clearAllFilters} className="mt-4">
                    <X className="mr-2 h-4 w-4" />
                    Clear All Filters
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{filters.search}"
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => clearFilter('search')} aria-label="Clear search filter">
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.type !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type: {filters.type}
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => clearFilter('type')} aria-label="Clear type filter">
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.mode !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Mode: {filters.mode}
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => clearFilter('mode')} aria-label="Clear mode filter">
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {filters.status}
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => clearFilter('status')} aria-label="Clear status filter">
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.dangerZone !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Risk: {filters.dangerZone}
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => clearFilter('dangerZone')} aria-label="Clear risk filter">
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {(filters.dateRange.from || filters.dateRange.to) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Date: {filters.dateRange.from && format(filters.dateRange.from, 'MMM dd')}
              {filters.dateRange.to && ` - ${format(filters.dateRange.to, 'MMM dd')}`}
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => clearFilter('dateRange')} aria-label="Clear date range filter">
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {(filters.enrollmentRange[0] > 0 || filters.enrollmentRange[1] < 100) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Enrollment: {filters.enrollmentRange[0]} - {filters.enrollmentRange[1]}
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => clearFilter('enrollmentRange')} aria-label="Clear enrollment range filter">
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {(filters.revenueRange[0] > 0 || filters.revenueRange[1] < 100000) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Revenue: ${filters.revenueRange[0].toLocaleString()} - ${filters.revenueRange[1].toLocaleString()}
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => clearFilter('revenueRange')} aria-label="Clear revenue range filter">
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.cities.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Cities: {filters.cities.join(', ')}
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => clearFilter('cities')} aria-label="Clear cities filter">
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.instructors.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Instructors: {filters.instructors.join(', ')}
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => clearFilter('instructors')} aria-label="Clear instructors filter">
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}