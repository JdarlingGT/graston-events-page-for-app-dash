"use client";

import { PanelLeft, Search } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { MobileSidebar } from './mobile-sidebar';
import { ThemeToggle } from '../theme-toggle';
import { useCommandPalette } from '@/hooks/use-command-palette';

export default function Header() {
  const { setIsOpen } = useCommandPalette();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs bg-background/80 backdrop-blur-xl">
          <MobileSidebar />
        </SheetContent>
      </Sheet>
      
      <div className="relative flex-1 md:grow-0">
        <Button
          variant="outline"
          className="w-full justify-start rounded-lg bg-background pl-8 text-sm font-normal text-muted-foreground shadow-none md:w-[200px] lg:w-[336px]"
          onClick={() => setIsOpen(true)}
        >
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          Search...
          <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>

      <div className="flex-1" />
      <ThemeToggle />
    </header>
  );
}