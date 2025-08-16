"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building, LayoutDashboard, Calendar, BarChart3 } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/events', label: 'Events', icon: Calendar },
  { href: '/dashboard/venues', label: 'Venues', icon: Building },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
      <div className="border-b p-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Home className="h-6 w-6" />
          <span className="">Command Center</span>
        </Link>
      </div>
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard' 
              ? pathname === item.href 
              : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    isActive && 'bg-muted text-primary'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  );
}