"use client";

import * as React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Calendar, CheckSquare, Building, Users, LayoutDashboard } from "lucide-react";
import { useCommandPalette } from "@/hooks/use-command-palette";

// Simplified types for search results
interface SearchResult {
  id: string;
  name: string;
}

export function CommandPalette() {
  const { isOpen, setIsOpen } = useCommandPalette();
  const router = useRouter();

  // Fetch data for search
  const { data: events = [] } = useQuery<SearchResult[]>({
    queryKey: ["search-events"],
    queryFn: async () => {
      const res = await fetch("/api/events");
      return res.json();
    },
  });

  const { data: tasks = [] } = useQuery<SearchResult[]>({
    queryKey: ["search-tasks"],
    queryFn: async () => {
      const res = await fetch("/api/tasks");
      const tasksData = await res.json();
      // The task API returns 'title', not 'name'
      return tasksData.map((task: any) => ({ id: task.id, name: task.title }));
    },
  });
  
  const { data: venues = [] } = useQuery<SearchResult[]>({
    queryKey: ["search-venues"],
    queryFn: async () => {
      const res = await fetch("/api/venues");
      return res.json();
    },
  });

  const { data: instructors = [] } = useQuery<SearchResult[]>({
    queryKey: ["search-instructors"],
    queryFn: async () => {
      const res = await fetch("/api/instructors");
      return res.json();
    },
  });

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, setIsOpen]);

  const runCommand = (command: () => unknown) => {
    setIsOpen(false);
    command();
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTitle className="sr-only">Command Palette</DialogTitle>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />

        {events.length > 0 && (
          <CommandGroup heading="Events">
            {events.map((event) => (
              <CommandItem
                key={event.id}
                onSelect={() => runCommand(() => router.push(`/dashboard/events/${event.id}`))}
              >
                <Calendar className="mr-2 h-4 w-4" />
                <span>{event.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {tasks.length > 0 && (
          <CommandGroup heading="Tasks">
            {tasks.map((task) => (
              <CommandItem
                key={task.id}
                onSelect={() => runCommand(() => router.push(`/dashboard/tasks`))}
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                <span>{task.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {venues.length > 0 && (
          <CommandGroup heading="Venues">
            {venues.map((venue) => (
              <CommandItem
                key={venue.id}
                onSelect={() => runCommand(() => router.push(`/dashboard/directory/venues`))}
              >
                <Building className="mr-2 h-4 w-4" />
                <span>{venue.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {instructors.length > 0 && (
          <CommandGroup heading="Instructors">
            {instructors.map((instructor) => (
              <CommandItem
                key={instructor.id}
                onSelect={() => runCommand(() => router.push(`/dashboard/directory/instructors`))}
              >
                <Users className="mr-2 h-4 w-4" />
                <span>{instructor.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}