'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface CommandPaletteContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextType | undefined>(undefined);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <CommandPaletteContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (context === undefined) {
    throw new Error('useCommandPalette must be used within a CommandPaletteProvider');
  }
  return context;
}