'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CalendarIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Filters } from './archival-search';

interface SearchFiltersProps {
  filters: Filters;
  onFiltersChange: React.Dispatch<React.SetStateAction<Filters>>;
  onSearch: () => void;
}

export function SearchFilters({ filters, onFiltersChange, onSearch }: SearchFiltersProps) {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange(prev => ({ ...prev, q: e.target.value, page: 1 }));
  };

  const handleTypeChange = (type: string) => {
    onFiltersChange(prev => ({ ...prev, type, page: 1 }));
  };

  const handleDateChange = (range: { from?: Date; to?: Date } | undefined) => {
    onFiltersChange(prev => ({ ...prev, start: range?.from, end: range?.to, page: 1 }));
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search all historical records..."
          value={filters.q}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          className="pl-12 h-12 text-lg"
        />
      </div>
      <Accordion type="single" collapsible>
        <AccordionItem value="advanced-filters">
          <AccordionTrigger>Advanced Filters</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
              <Select value={filters.type} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="attendee">Attendee</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.start ? (
                      filters.end ? (
                        `${format(filters.start, 'LLL dd, y')} - ${format(filters.end, 'LLL dd, y')}`
                      ) : (
                        format(filters.start, 'LLL dd, y')
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
              <Button onClick={onSearch} className="w-full sm:w-auto">
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}