"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building, LayoutDashboard, Calendar, BarChart3, LineChart, Map } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/events', label: 'Events', icon: Calendar },
  { href: '/dashboard/events/directory', label: 'Event Directory', icon: Map },
  { href: '/dashboard/venues', label: 'Venues', icon: Building },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
  { href: '/dashboard/crm-insights', label: 'CRM Insights', icon: LineChart },
];

export function MobileSidebar() {
  const pathname = usePathname();

  return (
    <nav className="grid gap-6 text-lg font-medium">
      <Link
        href="/dashboard"
        className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
      >
        <Home className="h-5 w-5 transition-all group-hover:scale-110" />
        <span className="sr-only">Command Center</span>
      </Link>
      {navItems.map((item) => {
        const isActive = item.href === '/dashboard' 
          ? pathname === item.href 
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
              isActive && "text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  );
}