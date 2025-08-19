'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, Calendar, BarChart3, CheckSquare, Settings, BookOpen, Target, Megaphone, Building, Users, Archive, UserCheck, FolderKanban } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/instructor', label: 'Instructor Workspace', icon: UserCheck },
  { href: '/dashboard/events', label: 'Events', icon: Calendar },
  { href: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
  { href: '/dashboard/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/dashboard/marketing', label: 'Marketing', icon: Megaphone },
  { href: '/dashboard/sales', label: 'Sales', icon: Target },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
  { 
    label: 'Directory', 
    icon: BookOpen,
    children: [
      { href: '/dashboard/directory/venues', label: 'Venues', icon: Building },
      { href: '/dashboard/directory/instructors', label: 'Instructors', icon: Users },
      { href: '/dashboard/directory/clinicians', label: 'Clinicians', icon: Users },
    ],
  },
  { href: '/dashboard/archival-search', label: 'Archival Search', icon: Archive },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isDirectoryActive = ['/dashboard/directory/venues', '/dashboard/directory/instructors', '/dashboard/directory/clinicians'].some(path => pathname.startsWith(path));

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background/80 backdrop-blur-xl sm:flex">
      <div className="border-b p-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Home className="h-6 w-6" />
          <span className="">Command Center</span>
        </Link>
      </div>
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            if (item.children) {
              return (
                <Accordion key={item.label} type="single" collapsible defaultValue={isDirectoryActive ? 'item-1' : ''}>
                  <AccordionItem value="item-1" className="border-b-0">
                    <AccordionTrigger className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:no-underline',
                      isDirectoryActive && 'bg-muted text-primary',
                    )}>
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </AccordionTrigger>
                    <AccordionContent className="pl-8 pt-1">
                      <ul className="space-y-1">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              aria-current={pathname.startsWith(child.href) ? 'page' : undefined}
                              className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                                pathname.startsWith(child.href) && 'bg-muted text-primary',
                              )}
                            >
                              <child.icon className="h-4 w-4" />
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              );
            }
            const isActive = item.href === '/dashboard' 
              ? pathname === item.href 
              : pathname.startsWith(item.href!);
            return (
              <li key={item.href}>
                <Link
                  href={item.href!}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    isActive && 'bg-muted text-primary',
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}