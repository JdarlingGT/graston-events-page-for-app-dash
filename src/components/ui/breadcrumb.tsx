'use client';

import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface BreadcrumbProps {
  items: {
    label: string;
    href?: string;
    active?: boolean;
  }[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className={cn(index !== items.length - 1 && 'flex items-center')}>
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  'text-sm font-medium text-muted-foreground hover:text-foreground',
                  item.active && 'text-foreground',
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'text-sm font-medium',
                  item.active ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {item.label}
              </span>
            )}
            {index !== items.length - 1 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}