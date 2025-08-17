"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchResult } from "./archival-search";

interface SearchDetailDrawerProps {
  result: SearchResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDetailDrawer({ result, isOpen, onClose }: SearchDetailDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Archival Record Details</SheetTitle>
          <SheetDescription>
            Full raw data for record ID: {result?.id}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          <pre className="text-sm bg-muted p-4 rounded-md overflow-x-auto">
            {JSON.stringify(result?.raw_data, null, 2)}
          </pre>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}